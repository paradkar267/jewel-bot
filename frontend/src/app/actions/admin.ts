"use server";

import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from 'bcryptjs';

const ADMIN_EMAIL = 'bizleap1@gmail.com';

async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.email !== ADMIN_EMAIL) {
    throw new Error("Unauthorized: Admin access required.");
  }
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

    const serializedShops = shops.map(shop => ({
      ...shop,
      created_at: shop.created_at.toISOString()
    }));

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
      name: data.name,
      whatsapp_number: data.whatsappNumber,
      owner_email: data.ownerEmail,
      password: hashedPassword,
      meta_phone_number_id: data.metaPhoneNumberId || null,
      meta_access_token: data.metaAccessToken || null
    }
  });

  return {
    success: true,
    shop: {
      ...shop,
      created_at: shop.created_at.toISOString()
    }
  };
}

export async function updateShopMeta(
  shopId: string,
  data: {
    name: string;
    whatsappNumber: string;
    ownerEmail: string;
    metaPhoneNumberId: string;
    metaAccessToken?: string;
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
      name: data.name,
      whatsapp_number: data.whatsappNumber,
      owner_email: data.ownerEmail,
      meta_phone_number_id: data.metaPhoneNumberId || null,
      meta_access_token: data.metaAccessToken || null
    }
  });

  return {
    success: true,
    shop: {
      ...updated,
      created_at: updated.created_at.toISOString()
    }
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
