"use server";

import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from 'next/cache';

const ADMIN_EMAIL = 'bizleap1@gmail.com';

async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  const isSuperAdmin = Boolean((session?.user as any)?.isSuperAdmin) || session?.user?.email === ADMIN_EMAIL;
  if (!session || !session.user || !isSuperAdmin) {
    throw new Error("Unauthorized: Admin access required.");
  }
}

// ----------------------------------------------------------------------
// 📢 FEATURE 1: GLOBAL ANNOUNCEMENTS
// ----------------------------------------------------------------------

export async function getAnnouncements() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { created_at: 'desc' }
    });

    return {
      success: true,
      announcements: announcements.map(a => ({
        ...a,
        created_at: a.created_at.toISOString()
      }))
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getActiveAnnouncements() {
  try {
    const announcements = await prisma.announcement.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' },
      take: 3
    });

    return {
      success: true,
      announcements: announcements.map(a => ({
        ...a,
        created_at: a.created_at.toISOString()
      }))
    };
  } catch (error: any) {
    return { success: false, announcements: [] };
  }
}

export async function createAnnouncement(data: { title: string; content: string; type: string }) {
  try {
    await verifyAdmin();

    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type || "info",
        is_active: true,
      }
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/admin/announcements');

    return { success: true, announcement };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    await verifyAdmin();

    await prisma.announcement.delete({
      where: { id }
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/admin/announcements');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ----------------------------------------------------------------------
// 🔍 FEATURE 2: REAL-TIME SHOWROOM AUDIT LOGS
// ----------------------------------------------------------------------

export async function getAdminActivityLogs() {
  try {
    await verifyAdmin();

    const [shops, recentProducts, recentLeads, recentBroadcasts] = await Promise.all([
      prisma.shop.findMany({
        select: { id: true, name: true, owner_email: true },
        orderBy: { name: 'asc' }
      }),
      prisma.product.findMany({
        take: 50,
        orderBy: { created_at: 'desc' },
        include: { shop: { select: { id: true, name: true, owner_email: true } } }
      }),
      prisma.lead.findMany({
        take: 50,
        orderBy: { created_at: 'desc' },
        include: { shop: { select: { id: true, name: true, owner_email: true } } }
      }),
      prisma.broadcastCampaign.findMany({
        take: 50,
        orderBy: { created_at: 'desc' },
        include: { shop: { select: { id: true, name: true, owner_email: true } } }
      }),
    ]);

    const activities: Array<{
      id: string;
      shopId: string;
      type: 'product' | 'lead' | 'broadcast';
      shopName: string;
      title: string;
      details: string;
      timestamp: string;
      rawDate: Date;
    }> = [];

    recentProducts.forEach(p => {
      activities.push({
        id: `prod_${p.id}`,
        shopId: p.shop_id,
        type: 'product',
        shopName: p.shop?.name || 'Jewelry Shop',
        title: `Added New Item: "${p.name}"`,
        details: `${p.metal || 'Gold'} ${p.karat || ''} | Weight: ${p.weight_grams ? `${p.weight_grams}g` : 'N/A'} | Price: ₹${p.price ? Number(p.price).toLocaleString('en-IN') : 'N/A'}`,
        timestamp: p.created_at.toISOString(),
        rawDate: p.created_at
      });
    });

    recentLeads.forEach(l => {
      activities.push({
        id: `lead_${l.id}`,
        shopId: l.shop_id,
        type: 'lead',
        shopName: l.shop?.name || 'Jewelry Shop',
        title: `Captured WhatsApp Customer Lead`,
        details: `Customer: ${l.customer_name || 'Anonymous'} (+${l.customer_phone}) | Messages: ${l.message_count}`,
        timestamp: l.created_at.toISOString(),
        rawDate: l.created_at
      });
    });

    recentBroadcasts.forEach(b => {
      activities.push({
        id: `bcast_${b.id}`,
        shopId: b.shop_id,
        type: 'broadcast',
        shopName: b.shop?.name || 'Jewelry Shop',
        title: `Dispatched WhatsApp Campaign`,
        details: `Message: "${b.message_text.slice(0, 60)}..." | Sent to ${b.success_count}/${b.total_recipients} customers`,
        timestamp: b.created_at.toISOString(),
        rawDate: b.created_at
      });
    });

    // Sort combined activities chronologically descending
    activities.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

    return {
      success: true,
      shops,
      activities: activities.slice(0, 100)
    };

  } catch (error: any) {
    return { success: false, error: error.message, shops: [], activities: [] };
  }
}

// ----------------------------------------------------------------------
// 📥 FEATURE 3: MASTER EXPORT CSV REPORTS
// ----------------------------------------------------------------------

export async function exportMasterPlatformData(reportType: 'shops' | 'products' | 'leads' | 'broadcasts') {
  try {
    await verifyAdmin();

    if (reportType === 'shops') {
      const shops = await prisma.shop.findMany({
        include: {
          _count: { select: { products: true, leads: true, broadcasts: true } }
        },
        orderBy: { created_at: 'desc' }
      });

      const csvHeader = "Shop ID,Name,Owner Email,WhatsApp Number,Meta Phone ID,Active,Total Products,Total Leads,Total Broadcasts,Created At\n";
      const csvRows = shops.map(s => 
        `"${s.id}","${s.name}","${s.owner_email || ''}","${s.whatsapp_number || ''}","${s.meta_phone_number_id || ''}","${s.is_active ? 'ACTIVE' : 'SUSPENDED'}","${s._count.products}","${s._count.leads}","${s._count.broadcasts}","${s.created_at.toISOString()}"`
      ).join("\n");

      return { success: true, fileName: `master_shops_report_${Date.now()}.csv`, csvData: csvHeader + csvRows };
    }

    if (reportType === 'products') {
      const products = await prisma.product.findMany({
        include: { shop: { select: { name: true } } },
        orderBy: { created_at: 'desc' }
      });

      const csvHeader = "Product ID,Shop Name,Name,Type,Metal,Karat,Weight Grams,Price INR,Created At\n";
      const csvRows = products.map(p => 
        `"${p.id}","${p.shop?.name || ''}","${p.name}","${p.type || ''}","${p.metal || ''}","${p.karat || ''}","${p.weight_grams || 0}","${p.price || 0}","${p.created_at.toISOString()}"`
      ).join("\n");

      return { success: true, fileName: `master_products_report_${Date.now()}.csv`, csvData: csvHeader + csvRows };
    }

    if (reportType === 'leads') {
      const leads = await prisma.lead.findMany({
        include: { shop: { select: { name: true } } },
        orderBy: { created_at: 'desc' }
      });

      const csvHeader = "Lead ID,Shop Name,Customer Name,Phone Number,Message Count,Active,Last Contacted At,Created At\n";
      const csvRows = leads.map(l => 
        `"${l.id}","${l.shop?.name || ''}","${l.customer_name || ''}","${l.customer_phone}","${l.message_count}","${l.is_active ? 'ACTIVE' : 'INACTIVE'}","${l.last_contacted_at.toISOString()}","${l.created_at.toISOString()}"`
      ).join("\n");

      return { success: true, fileName: `master_customer_leads_report_${Date.now()}.csv`, csvData: csvHeader + csvRows };
    }

    if (reportType === 'broadcasts') {
      const broadcasts = await prisma.broadcastCampaign.findMany({
        include: { shop: { select: { name: true } } },
        orderBy: { created_at: 'desc' }
      });

      const csvHeader = "Broadcast ID,Shop Name,Message Text,Total Recipients,Success Count,Fail Count,Created At\n";
      const csvRows = broadcasts.map(b => 
        `"${b.id}","${b.shop?.name || ''}","${b.message_text.replace(/"/g, '""')}","${b.total_recipients}","${b.success_count}","${b.fail_count}","${b.created_at.toISOString()}"`
      ).join("\n");

      return { success: true, fileName: `master_broadcasts_report_${Date.now()}.csv`, csvData: csvHeader + csvRows };
    }

    throw new Error("Invalid report type");

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
