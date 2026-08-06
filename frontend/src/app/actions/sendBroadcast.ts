"use server";

import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function uploadMetaMedia(formData: FormData): Promise<{ success: boolean; mediaId?: string; error?: string }> {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return { success: false, error: "Not authenticated" };
    }

    const shopId = (session.user as any).id;

    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { meta_phone_number_id: true, meta_access_token: true }
    });

    if (!shop) {
      return { success: false, error: "Shop not found" };
    }

    const senderId = shop.meta_phone_number_id || process.env.META_PHONE_NUMBER_ID;
    const accessToken = shop.meta_access_token || process.env.META_ACCESS_TOKEN;

    if (!senderId || !accessToken) {
      return { success: false, error: "Meta API configuration is missing. Set META_PHONE_NUMBER_ID and META_ACCESS_TOKEN in Vercel environment variables." };
    }

    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: "No file uploaded" };
    }

    const metaForm = new FormData();
    metaForm.append('file', file);
    metaForm.append('messaging_product', 'whatsapp');

    const response = await fetch(`https://graph.facebook.com/v20.0/${senderId}/media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: metaForm,
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data?.error?.message || "Failed to upload media to WhatsApp" };
    }

    return { success: true, mediaId: data.id as string };
  } catch (error: any) {
    console.error("Error in uploadMetaMedia:", error);
    return { success: false, error: error.message || "Failed to upload media" };
  }
}

export async function sendBroadcast(messageText: string, limit?: number, imageUrl?: string, mediaId?: string) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return { success: false, total: 0, successCount: 0, failCount: 0, errors: ["Not authenticated. Please log in again."] };
    }

    const shopId = (session.user as any).id;

    // 1. Fetch shop Meta configuration
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { meta_phone_number_id: true }
    });

    if (!shop) {
      return { success: false, total: 0, successCount: 0, failCount: 0, errors: ["Shop record not found."] };
    }

    const senderId = shop.meta_phone_number_id || process.env.META_PHONE_NUMBER_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;

    if (!senderId || !accessToken) {
      return { success: false, total: 0, successCount: 0, failCount: 0, errors: ["Meta API configuration is missing. Set META_PHONE_NUMBER_ID and META_ACCESS_TOKEN in Vercel environment variables."] };
    }

    // 2. Fetch all active customers for this shop
    const leads = await prisma.lead.findMany({
      where: { shop_id: shopId, is_active: true },
      select: { id: true, customer_phone: true, customer_name: true },
      orderBy: { last_contacted_at: 'desc' },
      ...(limit ? { take: limit } : {})
    });

    if (leads.length === 0) {
      return { success: false, total: 0, successCount: 0, failCount: 0, errors: ["No active customers found to broadcast to."] };
    }

    console.log(`📢 Starting broadcast of message (hasImage: ${!!imageUrl || !!mediaId}) to ${leads.length} active customers for shop ${shopId}...`);

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    // 3. Loop and send messages using fetch
    for (const lead of leads) {
      try {
        const formattedName = lead.customer_name 
          ? lead.customer_name.charAt(0).toUpperCase() + lead.customer_name.slice(1) 
          : 'there';
        const personalizedMessage = messageText.replace(/{name}/gi, formattedName);

        let payload: any;
        if (mediaId) {
          payload = {
            messaging_product: "whatsapp",
            to: lead.customer_phone,
            type: "image",
            image: {
              id: mediaId,
              caption: personalizedMessage
            }
          };
        } else if (imageUrl) {
          payload = {
            messaging_product: "whatsapp",
            to: lead.customer_phone,
            type: "image",
            image: {
              link: imageUrl,
              caption: personalizedMessage
            }
          };
        } else {
          payload = {
            messaging_product: "whatsapp",
            to: lead.customer_phone,
            type: "text",
            text: { body: personalizedMessage }
          };
        }

        const response = await fetch(
          `https://graph.facebook.com/v20.0/${senderId}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }
        );

        const data = await response.json();

        if (response.ok) {
          successCount++;
        } else {
          failCount++;
          const errorCode = data?.error?.code;
          
          if (errorCode === 131047 || errorCode === 131051 || errorCode === 131030) {
            await prisma.lead.update({
              where: { id: lead.id },
              data: { is_active: false }
            });
            errors.push(`Failed for ${lead.customer_phone} (Disabled/Blocked): ${data?.error?.message}`);
          } else {
            errors.push(`Failed for ${lead.customer_phone}: ${data?.error?.message || response.statusText}`);
          }
        }
      } catch (error: any) {
        failCount++;
        errors.push(`Failed for ${lead.customer_phone}: ${error.message}`);
      }
    }

    console.log(`📢 Broadcast complete. Success: ${successCount}, Failed: ${failCount}`);

    try {
      await prisma.broadcastCampaign.create({
        data: {
          shop_id: shopId,
          message_text: messageText,
          image_url: imageUrl || (mediaId ? `Meta Media ID: ${mediaId}` : null),
          total_recipients: leads.length,
          success_count: successCount,
          fail_count: failCount,
        }
      });
    } catch (dbErr: any) {
      console.error("Failed to log broadcast campaign in DB:", dbErr.message);
    }

    return {
      success: successCount > 0,
      total: leads.length,
      successCount,
      failCount,
      errors: errors.length > 0 ? errors.slice(0, 5) : []
    };
  } catch (error: any) {
    console.error("Error in sendBroadcast:", error);
    return {
      success: false,
      total: 0,
      successCount: 0,
      failCount: 0,
      errors: [error.message || "Broadcast failed"]
    };
  }
}
