"use server";

import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function createBulkProducts(products: any[]) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).id) {
    throw new Error("Not authenticated");
  }

  const shopId = (session.user as any).id;

  const rowsToInsert = products.map((row: any) => {
    // Helper to safely read case-insensitive keys
    const getVal = (...keys: string[]) => {
      for (const k of keys) {
        if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
          return String(row[k]).trim();
        }
      }
      return null;
    };

    const name = getVal('Name', 'name', 'Title', 'title') || 'Unnamed Item';
    const type = (getVal('Type', 'type', 'Category', 'category') || 'other').toLowerCase();
    const metal = (getVal('Metal', 'metal') || '').toLowerCase();
    const karat = getVal('Karat', 'karat', 'Purity', 'purity') || null;

    const rawWeight = getVal('WeightGrams', 'weight_grams', 'Weight', 'weight');
    const parsedWeight = rawWeight && !isNaN(parseFloat(rawWeight)) ? parseFloat(rawWeight) : null;

    const rawMaking = getVal('MakingChargePercent', 'making_charge_percent', 'MakingCharge', 'making_charge');
    const parsedMaking = rawMaking && !isNaN(parseFloat(rawMaking)) ? parseFloat(rawMaking) : null;

    const rawPrice = getVal('PriceINR', 'price_inr', 'Price', 'price');
    const parsedPrice = rawPrice && !isNaN(parseFloat(rawPrice)) ? parseFloat(rawPrice) : null;

    const url = getVal('PurchaseURL', 'purchase_url', 'ProductURL', 'product_url', 'url', 'Link', 'link');
    const imageUrl = getVal('ImageURL', 'image_url', 'PhotoURL', 'photo_url', 'Image', 'image');

    return {
      shop_id: shopId,
      name,
      type,
      metal,
      karat,
      weight_grams: parsedWeight,
      making_charge_percent: parsedMaking,
      price: parsedPrice,
      url: url || null,
      image_url: imageUrl || null
    };
  });

  const created = await prisma.product.createMany({
    data: rowsToInsert,
  });

  return { success: true, count: created.count };
}
