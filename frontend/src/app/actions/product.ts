"use server";

import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function createProduct(data: {
  name: string;
  type: string;
  metal: string;
  price: number | null;
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
      url: data.url,
      image_url: data.image_base64,
    },
  });

  const serializedProduct = {
    ...product,
    price: product.price ? Number(product.price) : null,
    created_at: product.created_at.toISOString(),
  };

  return { success: true, product: serializedProduct };
}

export async function updateProduct(
  id: string,
  data: {
    name: string;
    type: string;
    metal: string;
    price: number | null;
    url: string;
    image_url: string | null;
  }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).id) {
    throw new Error("Not authenticated");
  }

  const shopId = (session.user as any).id;

  // Verify ownership
  const existingProduct = await prisma.product.findUnique({
    where: { id }
  });

  if (!existingProduct || existingProduct.shop_id !== shopId) {
    throw new Error("Unauthorized to edit this product");
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      type: data.type,
      metal: data.metal,
      price: data.price,
      url: data.url,
      image_url: data.image_url,
    },
  });

  const serializedUpdated = {
    ...updated,
    price: updated.price ? Number(updated.price) : null,
    created_at: updated.created_at.toISOString(),
  };

  return { success: true, product: serializedUpdated };
}

export async function deleteProduct(id: string) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).id) {
    throw new Error("Not authenticated");
  }

  const shopId = (session.user as any).id;

  // Verify ownership
  const existingProduct = await prisma.product.findUnique({
    where: { id }
  });

  if (!existingProduct || existingProduct.shop_id !== shopId) {
    throw new Error("Unauthorized to delete this product");
  }

  await prisma.product.delete({
    where: { id }
  });

  return { success: true };
}
