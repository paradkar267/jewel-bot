'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getShopSettings() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!session || !userId) {
      return { success: false, error: "Unauthorized" };
    }

    const shop = await prisma.shop.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        whatsapp_number: true,
        owner_email: true,
        meta_phone_number_id: true,
        meta_access_token: true,
        custom_greeting: true,
        store_address: true,
        promo_banner: true
      }
    });

    if (!shop) {
      return { success: false, error: "Shop not found" };
    }

    return { success: true, shop };
  } catch (error: any) {
    console.error("Error fetching shop settings:", error.message);
    return { success: false, error: "Failed to fetch shop settings" };
  }
}

export async function updateShopSettings(data: {
  name?: string;
  custom_greeting?: string;
  store_address?: string;
  promo_banner?: string;
  meta_phone_number_id?: string;
  meta_access_token?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!session || !userId) {
      return { success: false, error: "Unauthorized" };
    }

    const updatedShop = await prisma.shop.update({
      where: { id: userId },
      data: {
        name: data.name?.trim() || undefined,
        custom_greeting: data.custom_greeting?.trim() || null,
        store_address: data.store_address?.trim() || null,
        promo_banner: data.promo_banner?.trim() || null,
        meta_phone_number_id: data.meta_phone_number_id?.trim() || undefined,
        meta_access_token: data.meta_access_token?.trim() || undefined,
      }
    });

    revalidatePath("/dashboard/settings");
    revalidatePath("/dashboard");

    return { 
      success: true, 
      message: "Shop settings updated successfully!",
      shop: {
        name: updatedShop.name,
        custom_greeting: updatedShop.custom_greeting,
        store_address: updatedShop.store_address,
        promo_banner: updatedShop.promo_banner
      }
    };
  } catch (error: any) {
    console.error("Error updating shop settings:", error.message);
    return { success: false, error: error.message || "Failed to update shop settings" };
  }
}
