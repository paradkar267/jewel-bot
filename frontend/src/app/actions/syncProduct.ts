"use server";

import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function createSyncProducts(products: any[]) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).id) {
    throw new Error("Not authenticated");
  }

  const shopId = (session.user as any).id;

  const rowsToInsert = products.map((row: any) => ({
    shop_id: shopId,
    name: row.name || 'Unnamed Jewelry Item',
    type: row.type || 'other',
    metal: row.metal || 'gold',
    karat: row.karat || '22K',
    weight_grams: row.weight_grams ? parseFloat(row.weight_grams) : null,
    making_charge_percent: row.making_charge_percent ? parseFloat(row.making_charge_percent) : 12,
    price: row.price ? parseFloat(row.price) : null,
    image_url: row.image_url || null,
    url: row.url || null
  }));

  const created = await prisma.product.createMany({
    data: rowsToInsert,
  });

  return { success: true, count: created.count };
}
