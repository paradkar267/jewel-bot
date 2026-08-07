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
      throw new Error("Shop not found");
    }

    // Fetch all active customer leads for this shop
    const leads = await prisma.lead.findMany({
      where: { shop_id: shopId, is_active: true }
    });

    if (leads.length === 0) {
      return {
        success: false,
        error: "No active customer leads found to broadcast to. Customers will be logged automatically when they text your WhatsApp Bot!"
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

    // If Meta Credentials exist, send real WhatsApp messages
    if (shop.meta_phone_number_id && shop.meta_access_token) {
      const url = `https://graph.facebook.com/v18.0/${shop.meta_phone_number_id}/messages`;

      for (const lead of leads) {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${shop.meta_access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: lead.customer_phone,
              type: "text",
              text: { body: messageText }
            })
          });

          if (res.ok) {
            successCount++;
          } else {
            const errData = await res.json();
            console.error(`Failed to send WhatsApp alert to ${lead.customer_phone}:`, errData);
            failCount++;
          }
        } catch (e) {
          console.error(`Meta API Error sending to ${lead.customer_phone}:`, e);
          failCount++;
        }
      }
    } else {
      // Simulation mode if credentials not yet configured
      successCount = leads.length;
      failCount = 0;
    }

    // Record Broadcast Campaign in database
    await prisma.broadcastCampaign.create({
      data: {
        shop_id: shopId,
        message_text: `📉 Gold Rate Drop Alert (₹${data.dropAmountPerGram}/g OFF) - Sent to ${leads.length} Customers`,
        total_recipients: leads.length,
        success_count: successCount,
        fail_count: failCount,
      }
    });

    revalidatePath('/dashboard/broadcasts');
    revalidatePath('/dashboard');

    return {
      success: true,
      totalRecipients: leads.length,
      successCount,
      failCount,
      isSimulated: !shop.meta_phone_number_id || !shop.meta_access_token,
      message: `Gold Rate Price Drop Alert broadcasted to ${leads.length} active customer leads!`
    };

  } catch (error: any) {
    console.error("Error triggering price drop broadcast:", error);
    return { success: false, error: error.message || "Failed to send broadcast alert" };
  }
}
