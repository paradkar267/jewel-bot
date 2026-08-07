"use server";

import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = 'bizleap1@gmail.com';

async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  const isSuperAdmin = Boolean((session?.user as any)?.isSuperAdmin) || session?.user?.email === ADMIN_EMAIL;
  if (!session || !session.user || !isSuperAdmin) {
    throw new Error("Unauthorized: Admin access required.");
  }
}

function serializeShop(shop: any) {
  if (!shop) return null;
  return {
    ...shop,
    gold_rate_per_gram: shop.gold_rate_per_gram !== null && shop.gold_rate_per_gram !== undefined ? Number(shop.gold_rate_per_gram) : null,
    silver_rate_per_gram: shop.silver_rate_per_gram !== null && shop.silver_rate_per_gram !== undefined ? Number(shop.silver_rate_per_gram) : null,
    default_making_charge_percent: shop.default_making_charge_percent !== null && shop.default_making_charge_percent !== undefined ? Number(shop.default_making_charge_percent) : null,
    created_at: shop.created_at ? new Date(shop.created_at).toISOString() : null,
  };
}

export async function getAdminStats() {
  try {
    await verifyAdmin();

    const [totalShops, totalProducts, totalLeads, totalCampaigns] = await Promise.all([
      prisma.shop.count(),
      prisma.product.count(),
      prisma.lead.count(),
      prisma.broadcastCampaign.count()
    ]);

    const shops = await prisma.shop.findMany({
      include: {
        _count: {
          select: {
            products: true,
            leads: true,
            broadcasts: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const serializedShops = shops.map(serializeShop);

    return {
      success: true,
      stats: {
        totalShops,
        totalProducts,
        totalLeads,
        totalCampaigns
      },
      shops: serializedShops
    };
  } catch (error: any) {
    console.error("Error in getAdminStats:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch admin stats",
      stats: { totalShops: 0, totalProducts: 0, totalLeads: 0, totalCampaigns: 0 },
      shops: []
    };
  }
}

export async function createShopFromAdmin(data: {
  name: string;
  whatsappNumber: string;
  ownerEmail: string;
  password?: string;
  metaPhoneNumberId?: string;
  metaAccessToken?: string;
  storeAddress?: string;
  customGreeting?: string;
  promoBanner?: string;
}) {
  await verifyAdmin();

  if (!data.name.trim() || !data.ownerEmail.trim() || !data.whatsappNumber.trim()) {
    throw new Error("Brand Name, Email, and WhatsApp number are required.");
  }

  // Check unique constraints
  const existingEmail = await prisma.shop.findFirst({
    where: { owner_email: data.ownerEmail }
  });
  if (existingEmail) {
    throw new Error("Email already registered.");
  }

  const existingPhone = await prisma.shop.findFirst({
    where: { whatsapp_number: data.whatsappNumber }
  });
  if (existingPhone) {
    throw new Error("WhatsApp number already registered.");
  }

  // Hash password
  const defaultPassword = data.password || '12345678';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const shop = await prisma.shop.create({
    data: {
      name: data.name.trim(),
      whatsapp_number: data.whatsappNumber.trim(),
      owner_email: data.ownerEmail.trim(),
      password: hashedPassword,
      meta_phone_number_id: data.metaPhoneNumberId?.trim() || null,
      meta_access_token: data.metaAccessToken?.trim() || null,
      store_address: data.storeAddress?.trim() || null,
      custom_greeting: data.customGreeting?.trim() || null,
      promo_banner: data.promoBanner?.trim() || null,
      is_active: true
    }
  });

  return {
    success: true,
    shop: serializeShop(shop)
  };
}

export async function updateShopMeta(
  shopId: string,
  data: {
    name: string;
    whatsappNumber: string;
    ownerEmail: string;
    metaPhoneNumberId?: string;
    metaAccessToken?: string;
    storeAddress?: string;
    customGreeting?: string;
    promoBanner?: string;
  }
) {
  await verifyAdmin();

  // Validate unique email / phone on other shops
  const duplicateEmail = await prisma.shop.findFirst({
    where: {
      owner_email: data.ownerEmail,
      NOT: { id: shopId }
    }
  });
  if (duplicateEmail) {
    throw new Error("Email already taken by another shop.");
  }

  const duplicatePhone = await prisma.shop.findFirst({
    where: {
      whatsapp_number: data.whatsappNumber,
      NOT: { id: shopId }
    }
  });
  if (duplicatePhone) {
    throw new Error("WhatsApp number already taken by another shop.");
  }

  const updated = await prisma.shop.update({
    where: { id: shopId },
    data: {
      name: data.name.trim(),
      whatsapp_number: data.whatsappNumber.trim(),
      owner_email: data.ownerEmail.trim(),
      meta_phone_number_id: data.metaPhoneNumberId?.trim() || null,
      meta_access_token: data.metaAccessToken?.trim() || null,
      store_address: data.storeAddress?.trim() || null,
      custom_greeting: data.customGreeting?.trim() || null,
      promo_banner: data.promoBanner?.trim() || null,
    }
  });

  return {
    success: true,
    shop: serializeShop(updated)
  };
}

export async function toggleShopStatusByAdmin(shopId: string, isActive: boolean) {
  await verifyAdmin();

  const updated = await prisma.shop.update({
    where: { id: shopId },
    data: { is_active: isActive }
  });

  return { 
    success: true, 
    message: `Shop account status changed to ${isActive ? 'ACTIVE' : 'SUSPENDED'}.`,
    is_active: updated.is_active
  };
}

export async function resetShopPasswordByAdmin(shopId: string, newPassword: string) {
  await verifyAdmin();

  if (!newPassword || newPassword.trim().length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);

  await prisma.shop.update({
    where: { id: shopId },
    data: { password: hashedPassword }
  });

  return { 
    success: true, 
    message: "Shop owner password reset successfully!" 
  };
}

export async function deleteShopFromAdmin(shopId: string) {
  await verifyAdmin();

  // Protect the admin shop account from self-deletion
  const shopToDelete = await prisma.shop.findUnique({
    where: { id: shopId }
  });
  if (shopToDelete?.owner_email === ADMIN_EMAIL) {
    throw new Error("Cannot delete the platform administrator account.");
  }

  await prisma.shop.delete({
    where: { id: shopId }
  });

  return { success: true };
}

export async function checkShopDiagnostics(shopId: string) {
  await verifyAdmin();

  const shop = await prisma.shop.findUnique({
    where: { id: shopId }
  });

  if (!shop) throw new Error("Shop not found");

  const hasPhoneId = Boolean(shop.meta_phone_number_id && shop.meta_phone_number_id.trim());
  const hasToken = Boolean(shop.meta_access_token && shop.meta_access_token.trim());
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);

  let metaStatus: 'HEALTHY' | 'WARNING' | 'CONFIG_NEEDED' = 'CONFIG_NEEDED';

  if (hasPhoneId && hasToken) {
    metaStatus = 'HEALTHY';
  } else if (hasPhoneId || hasToken) {
    metaStatus = 'WARNING';
  }

  return {
    success: true,
    shopId: shop.id,
    shopName: shop.name,
    hasPhoneId,
    hasToken,
    hasGeminiKey,
    metaStatus,
    whatsappNumber: shop.whatsapp_number,
    ownerEmail: shop.owner_email,
    isActive: shop.is_active !== false,
  };
}
