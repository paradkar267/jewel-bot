"use server";

import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from 'next/cache';

export async function triggerPriceDropWhatsAppBroadcast(data: {
  dropAmountPerGram: number;
  oldRate: number;
  newRate: number;
  customNote?: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      throw new Error("Not authenticated");
    }

    const shopId = (session.user as any).id;

    // Fetch shop credentials & info
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: {
        id: true,
        name: true,
        whatsapp_number: true,
        meta_phone_number_id: true,
        meta_access_token: true,
      }
    });

    if (!shop) {
      throw new Error("Shop record not found.");
    }

    const senderId = shop.meta_phone_number_id || process.env.META_PHONE_NUMBER_ID;
    const accessToken = shop.meta_access_token || process.env.META_ACCESS_TOKEN;

    // Fetch all active customer leads for this shop
    const leads = await prisma.lead.findMany({
      where: { shop_id: shopId, is_active: true }
    });

    if (leads.length === 0) {
      return {
        success: false,
        error: "No active customer leads found in your database. Customers will be logged automatically when they text your WhatsApp Bot!"
      };
    }

    // Construct high-converting WhatsApp message
    const messageText = `🚨 *GOLD RATE PRICE DROP ALERT!* 📉

Namaste! Aaj Jewelry Market me Gold Rate Sasta Hua hai!

✨ *Previous Gold Rate:* ₹${data.oldRate.toLocaleString('en-IN')}/g
⚡ *Today's New Rate:* ₹${data.newRate.toLocaleString('en-IN')}/g
📉 *Price Drop:* ₹${data.dropAmountPerGram.toLocaleString('en-IN')}/gram OFF!

Aapki pasandida Gold Jewelry par aaj ₹2,500 - ₹10,000 tak ki bachat ho rahi hai. Offers valid for TODAY only! ${data.customNote ? `\n\n📢 *Offer:* ${data.customNote}` : ''}

🛍️ *Showroom:* ${shop.name}
📞 *Contact:* +${shop.whatsapp_number || 'Connected'}

*Reply 'CATALOG' or send photo to see live updated prices!*`;

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    if (senderId && accessToken) {
      const url = `https://graph.facebook.com/v20.0/${senderId}/messages`;

      for (const lead of leads) {
        try {
          const formattedPhone = lead.customer_phone.replace(/\D/g, '');
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: formattedPhone,
              type: "text",
              text: { body: messageText }
            })
          });

          const errData = await res.json();

          if (res.ok) {
            successCount++;
          } else {
            failCount++;
            const errMsg = errData?.error?.message || "Meta API delivery error";
            console.error(`Meta API Error for ${formattedPhone}:`, errData);
            errors.push(`${formattedPhone}: ${errMsg}`);
          }
        } catch (e: any) {
          failCount++;
          console.error(`Network Error sending to ${lead.customer_phone}:`, e);
          errors.push(`${lead.customer_phone}: ${e.message}`);
        }
      }
    } else {
      return {
        success: false,
        error: "Meta WhatsApp API configuration is missing. Please configure Meta Phone Number ID and Access Token in Bot Settings."
      };
    }

    // Record Broadcast Campaign in database
    await prisma.broadcastCampaign.create({
      data: {
        shop_id: shopId,
        message_text: `📉 Gold Rate Drop Alert (₹${data.dropAmountPerGram}/g OFF) - Dispatched to ${leads.length} Customers`,
        total_recipients: leads.length,
        success_count: successCount,
        fail_count: failCount,
      }
    });

    revalidatePath('/dashboard/broadcasts');
    revalidatePath('/dashboard');

    if (successCount === 0 && errors.length > 0) {
      return {
        success: false,
        error: `WhatsApp Delivery Failed for ${failCount} recipient(s): ${errors[0]}`
      };
    }

    return {
      success: true,
      totalRecipients: leads.length,
      successCount,
      failCount,
      errors,
      message: `Gold Rate Price Drop Alert dispatched to ${successCount} out of ${leads.length} customer leads!`
    };

  } catch (error: any) {
    console.error("Error triggering price drop broadcast:", error);
    return { success: false, error: error.message || "Failed to send broadcast alert" };
  }
}
