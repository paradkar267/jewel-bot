"use server";

import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from 'next/cache';

export async function createProduct(data: {
  name: string;
  type: string;
  metal: string;
  price: number | null;
  weight_grams?: number | null;
  making_charge_percent?: number | null;
  url: string;
  image_base64: string | null;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).id) {
    throw new Error("Not authenticated");
  }

  const shopId = (session.user as any).id;

  const product = await prisma.product.create({
    data: {
      shop_id: shopId,
      name: data.name,
      type: data.type,
      metal: data.metal,
      price: data.price,
      weight_grams: data.weight_grams ?? null,
      making_charge_percent: data.making_charge_percent ?? null,
      url: data.url,
      image_url: data.image_base64,
    },
  });

  revalidatePath('/dashboard/catalog');

  return {
    success: true,
    ...product,
    price: product.price ? Number(product.price) : null,
    weight_grams: product.weight_grams ? Number(product.weight_grams) : null,
    making_charge_percent: product.making_charge_percent ? Number(product.making_charge_percent) : null,
    created_at: product.created_at.toISOString(),
  };
}

export async function updateProduct(
  productId: string,
  data: {
    name: string;
    type: string;
    metal: string;
    price: number | null;
    weight_grams?: number | null;
    making_charge_percent?: number | null;
    url: string;
    image_url?: string | null;
  }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    throw new Error("Not authenticated");
  }

  const shopId = (session.user as any).id;

  await prisma.product.updateMany({
    where: {
      id: productId,
      shop_id: shopId,
    },
    data: {
      name: data.name,
      type: data.type,
      metal: data.metal,
      price: data.price,
      weight_grams: data.weight_grams ?? null,
      making_charge_percent: data.making_charge_percent ?? null,
      url: data.url,
      image_url: data.image_url,
    },
  });

  const updatedProduct = await prisma.product.findUnique({
    where: { id: productId }
  });

  revalidatePath('/dashboard/catalog');
  return { 
    success: true,
    product: updatedProduct ? {
      ...updatedProduct,
      price: updatedProduct.price ? Number(updatedProduct.price) : null,
      weight_grams: updatedProduct.weight_grams ? Number(updatedProduct.weight_grams) : null,
      making_charge_percent: updatedProduct.making_charge_percent ? Number(updatedProduct.making_charge_percent) : null,
      created_at: updatedProduct.created_at.toISOString(),
    } : null
  };
}

export async function deleteProduct(productId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !(session.user as any).id) {
    throw new Error("Not authenticated");
  }

  const shopId = (session.user as any).id;

  await prisma.product.deleteMany({
    where: {
      id: productId,
      shop_id: shopId,
    },
  });

  revalidatePath('/dashboard/catalog');
  return { success: true };
}

export async function getShopMetalRates() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return { success: false, error: "Not authenticated" };
    }

    const shopId = (session.user as any).id;
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: {
        gold_rate_per_gram: true,
        silver_rate_per_gram: true,
        default_making_charge_percent: true,
      }
    });

    if (!shop) return { success: false, error: "Shop not found" };

    return {
      success: true,
      gold_rate: shop.gold_rate_per_gram ? Number(shop.gold_rate_per_gram) : 7450,
      silver_rate: shop.silver_rate_per_gram ? Number(shop.silver_rate_per_gram) : 92,
      making_charge_percent: shop.default_making_charge_percent ? Number(shop.default_making_charge_percent) : 12,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateShopMetalRatesAndRecalculate(data: {
  gold_rate: number;
  silver_rate: number;
  making_charge_percent: number;
  recalculateAll: boolean;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      throw new Error("Not authenticated");
    }

    const shopId = (session.user as any).id;

    // Update shop rates
    await prisma.shop.update({
      where: { id: shopId },
      data: {
        gold_rate_per_gram: data.gold_rate,
        silver_rate_per_gram: data.silver_rate,
        default_making_charge_percent: data.making_charge_percent,
      }
    });

    let recalculatedCount = 0;

    if (data.recalculateAll) {
      const products = await prisma.product.findMany({
        where: { shop_id: shopId }
      });

      for (const prod of products) {
        if (prod.weight_grams && Number(prod.weight_grams) > 0) {
          const weight = Number(prod.weight_grams);
          const makingPct = prod.making_charge_percent ? Number(prod.making_charge_percent) : data.making_charge_percent;
          
          let ratePerGram = data.gold_rate;
          const metalLower = (prod.metal || '').toLowerCase();
          if (metalLower.includes('silver')) {
            ratePerGram = data.silver_rate;
          }

          // Formula: (Weight * Metal Rate) * (1 + MakingCharge%)
          const rawPrice = weight * ratePerGram;
          const calculatedPrice = Math.round(rawPrice * (1 + makingPct / 100));

          await prisma.product.update({
            where: { id: prod.id },
            data: { price: calculatedPrice }
          });
          recalculatedCount++;
        }
      }
    }

    revalidatePath('/dashboard/catalog');

    return {
      success: true,
      message: `Metal rates updated! ${recalculatedCount > 0 ? `Recalculated prices for ${recalculatedCount} weighted items.` : ''}`,
      recalculatedCount
    };
  } catch (error: any) {
    console.error("Error updating metal rates:", error);
    return { success: false, error: error.message || "Failed to update rates" };
  }
}
