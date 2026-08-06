const express = require('express');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PORT = process.env.PORT || 3002;

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ── In-memory session store ───────
const sessions = new Map();

function checkAndResetDailyLimit(session) {
  const today = new Date().toISOString().slice(0, 10);
  if (session.lastImageDate !== today) {
    session.lastImageDate = today;
    session.dailyImageCount = 0;
  }
}

function getSession(phone) {
  if (!sessions.has(phone)) {
    sessions.set(phone, {
      phone,
      state: 'idle',
      lastAnalysis: null,
      messageCount: 0,
      dailyImageCount: 0,
      lastImageDate: new Date().toISOString().slice(0, 10),
      joinedAt: new Date(),
      shopId: null,
      shopName: null,
      metaPhoneNumberId: null,
      metaAccessToken: null
    });
  }
  const session = sessions.get(phone);
  checkAndResetDailyLimit(session);
  return session;
}

// ── Database Queries ───────

// 1. Find shop ID by its WhatsApp number or Meta Phone ID
async function getShopByPhoneNumber(phone, metaPhoneNumberId) {
  console.log(`   [DEBUG] Looking up shop for phone: ${phone}, meta_id: ${metaPhoneNumberId}`);
  
  if (metaPhoneNumberId) {
    try {
      const data = await prisma.shop.findFirst({
        where: { meta_phone_number_id: metaPhoneNumberId },
        select: { id: true, name: true, meta_phone_number_id: true, meta_access_token: true }
      });
      if (data) {
        console.log(`   [DEBUG] Found shop by meta_phone_number_id!`);
        return data;
      }
    } catch (error) {
      console.log(`   [DEBUG] Error looking up by meta_id:`, error.message);
    }
  }

  if (phone) {
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const data = await prisma.shop.findFirst({
        where: {
          whatsapp_number: { contains: cleanPhone }
        },
        select: { id: true, name: true, meta_phone_number_id: true, meta_access_token: true }
      });
      if (data) {
        console.log(`   [DEBUG] Found shop by phone number!`);
        return data;
      }
    } catch (error) {
      console.log(`   [DEBUG] Error looking up by phone:`, error.message);
    }
  }

  // Fallback: If only 1 shop exists in database, auto-assign it
  try {
    const shops = await prisma.shop.findMany({
      take: 2,
      select: { id: true, name: true, meta_phone_number_id: true, meta_access_token: true }
    });
    if (shops.length === 1) {
      console.log(`   [DEBUG] Fallback: Auto-assigning single existing shop: ${shops[0].name}`);
      return shops[0];
    }
  } catch (err) {
    console.log(`   [DEBUG] Fallback shop lookup error:`, err.message);
  }

  return null;
}

// 2. Fetch catalog items for a specific shop
async function fetchShopCatalog(shopId) {
  if (!shopId) return [];
  try {
    const products = await prisma.product.findMany({
      where: { shop_id: shopId },
      orderBy: { created_at: 'desc' }
    });
    return products.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
      metal: p.metal,
      price: p.price ? Number(p.price) : null,
      url: p.url,
      image_url: p.image_url
    }));
  } catch (error) {
    console.error("   ❌ Error fetching shop catalog:", error.message);
    return [];
  }
}

// 3. Register or update lead in CRM
async function trackLead(shopId, phone, customerName) {
  if (!shopId || !phone) return;
  try {
    const existing = await prisma.lead.findFirst({
      where: { shop_id: shopId, customer_phone: phone }
    });

    if (existing) {
      await prisma.lead.update({
        where: { id: existing.id },
        data: {
          message_count: { increment: 1 },
          last_contacted_at: new Date(),
          customer_name: customerName && customerName !== 'there' ? customerName : existing.customer_name
        }
      });
    } else {
      await prisma.lead.create({
        data: {
          shop_id: shopId,
          customer_phone: phone,
          customer_name: customerName && customerName !== 'there' ? customerName : null,
          message_count: 1,
          is_active: true
        }
      });
    }
  } catch (error) {
    console.error("   ❌ Error tracking lead CRM:", error.message);
  }
}

// ── Step 1: Download image from Meta ───────
async function downloadImageAsBase64(mediaId, shopAccessToken) {
  const accessToken = shopAccessToken || process.env.META_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("Meta Access Token is missing in environment or shop config.");
  }

  const metaUrlResponse = await axios.get(`https://graph.facebook.com/v20.0/${mediaId}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  
  const mediaUrl = metaUrlResponse.data.url;
  const mimeType = metaUrlResponse.data.mime_type || 'image/jpeg';

  const response = await axios.get(mediaUrl, {
    responseType: 'arraybuffer',
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  const base64 = Buffer.from(response.data, 'binary').toString('base64');
  return { base64, contentType: mimeType };
}

// ── Step 2: Gemini Vision API ───────
async function analyzeJewelryWithGemini(base64Image, mimeType, catalog) {
  const catalogJson = JSON.stringify(catalog, null, 2);

  const prompt = `You are an expert jewelry analyst. Analyze this jewelry image and return ONLY a valid JSON object. No markdown, no extra text.
Below is the JSON catalog of our shop:
<CATALOG>
${catalogJson}
</CATALOG>

Look at the image and the catalog closely. The user might send a screenshot from an Instagram reel, video, or a blurry photo. Do NOT expect studio-quality images. Since the catalog data is sparse (only name, type, metal, and image_url), be highly lenient. If a catalog item reasonably matches the visual design, type, and metal of the jewelry in the screenshot, assume it is the exact match and set "exact_match_id" to that product's ID. Do not ignore a match just because of image angles or blurriness.
Regardless of whether you find an exact match or not, find up to 2 similar items in the catalog and put their IDs in "suggestion_ids".

{
  "type": "ring | necklace | earring | bracelet | pendant | anklet | bangle | other",
  "subtype": "specific style description",
  "metal": "gold | silver | platinum | rose gold | white gold | copper | brass | unknown",
  "metal_purity": "22k or 18k or 925 or null",
  "gemstones": ["list of gemstones or empty array"],
  "primary_gemstone": "main gemstone or null",
  "style": "traditional | modern | antique | fusion | bridal | casual | statement",
  "origin_style": "Mughal | Rajasthani | South Indian | Kundan | Polki | Western | Contemporary | null",
  "occasion": "wedding | daily wear | festival | party | office | null",
  "design_details": "2 sentence description of design",
  "exact_match_id": "uuid of the exact matching product from the catalog, or null",
  "suggestion_ids": ["array of up to 2 uuid strings for similar products from the catalog, or empty"],
  "confidence_score": 0.9,
  "is_jewelry": true
}

IMPORTANT: If the image does NOT contain jewelry, set is_jewelry to false and fill other fields with null.`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in server environment variables.");
  }

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      contents: [{
        parts: [
          { text: prompt },
          {
            inlineData: { mimeType: mimeType, data: base64Image }
          }
        ]
      }],
      generationConfig: { responseMimeType: "application/json" }
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  let raw = response.data.candidates[0].content.parts[0].text.trim();
  raw = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(raw);
}

// ── Step 3: Format WhatsApp reply ───────
function formatWhatsAppReply(analysis, matchingData) {
  if (!analysis.is_jewelry) {
    return `❌ *Jewelry not detected!*\n\nPlease send a clear image of jewelry (ring, necklace, earring, bracelet, etc.).\n\nTip: Make sure the jewelry is clearly visible and well-lit. 📸`;
  }

  const { exactMatch, suggestions } = matchingData || { exactMatch: null, suggestions: [] };

  const typeEmoji = {
    ring: '💍', necklace: '📿', earring: '👂', bracelet: '⌚',
    pendant: '🔮', anklet: '🦶', bangle: '🔗', other: '✨'
  };

  const emoji = typeEmoji[analysis.type] || '✨';
  const occasion = analysis.occasion
    ? analysis.occasion.charAt(0).toUpperCase() + analysis.occasion.slice(1)
    : '—';

  let reply = `${emoji} *Jewelry Details* ${emoji}\n\n`;
  reply += `📝 *Info:* ${analysis.design_details || 'Beautiful jewelry piece.'}\n`;
  reply += `👗 *Best For:* ${occasion}\n\n`;
  
  if (exactMatch) {
    reply += `🛍️ *Available in our Catalog!*\n`;
    reply += `*🏷️ Name:* ${exactMatch.name}\n`;
    const priceStr = exactMatch.price ? `₹${Number(exactMatch.price).toLocaleString('en-IN')}` : 'Price on request';
    reply += `*💰 Price:* ${priceStr}\n`;
    reply += `*🔗 Buy Here:* ${exactMatch.url}\n\n`;
  } else {
    reply += `😔 *Exact match not found in our current catalog.*\n`;
    reply += `We will notify you when similar items arrive!\n\n`;
  }

  if (suggestions && suggestions.length > 0) {
    reply += `✨ *Similar Designs You Might Like:*\n`;
    suggestions.forEach((item, idx) => {
      const pStr = item.price ? `₹${Number(item.price).toLocaleString('en-IN')}` : 'Price on request';
      reply += `${idx + 1}. *${item.name}* — ${pStr}\n   🔗 ${item.url}\n`;
    });
  }

  return reply;
}

// ── Step 4: Send WhatsApp reply ───────
async function sendWhatsAppReply(to, body, shopPhoneNumberId, shopAccessToken) {
  const senderId = shopPhoneNumberId || process.env.META_PHONE_NUMBER_ID;
  const accessToken = shopAccessToken || process.env.META_ACCESS_TOKEN;

  if (!senderId || !accessToken) {
    console.error(`   ❌ Cannot send reply to ${to}: META_PHONE_NUMBER_ID or META_ACCESS_TOKEN is missing!`);
    return;
  }

  try {
    await axios.post(
      `https://graph.facebook.com/v20.0/${senderId}/messages`,
      {
        messaging_product: "whatsapp",
        to: to,
        text: { body }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`   ✅ WhatsApp reply sent to ${to}`);
  } catch (err) {
    const errorDetails = err.response ? JSON.stringify(err.response.data) : err.message;
    console.error(`   ❌ Failed to send WhatsApp reply to ${to}:`, errorDetails);
  }
}

const processedMessageIds = new Set();

// ── Webhook: Receives incoming WhatsApp messages ───────
app.post('/webhook', async (req, res) => {
  res.status(200).send('EVENT_RECEIVED');

  try {
    const entry = req.body.entry;
    if (!entry || !entry[0] || !entry[0].changes || !entry[0].changes[0].value) return;

    const value = entry[0].changes[0].value;
    const messages = value.messages;
    const metadata = value.metadata;

    if (!messages || !messages[0]) return;
    
    const message = messages[0];
    
    // Prevent duplicate processing of the same message
    if (processedMessageIds.has(message.id)) {
      console.log(`   [DEBUG] Ignored duplicate message retry: ${message.id}`);
      return;
    }
    processedMessageIds.add(message.id);

    // Prevent processing old messages (older than 2 minutes)
    if (message.timestamp) {
      const messageAgeSeconds = Math.floor(Date.now() / 1000) - parseInt(message.timestamp, 10);
      if (messageAgeSeconds > 120) {
        console.log(`   [DEBUG] Ignored old message to prevent retry loop. Age: ${messageAgeSeconds}s`);
        return;
      }
    }

    const phone = message.from;
    const receivingNumber = metadata && metadata.display_phone_number ? metadata.display_phone_number : null;
    const metaPhoneNumberId = metadata && metadata.phone_number_id ? metadata.phone_number_id : null;
    const userName = value.contacts && value.contacts[0] ? value.contacts[0].profile.name : 'there';

    let textBody = '';
    if (message.type === 'text') {
      textBody = message.text.body;
    }

    const hasImage = message.type === 'image' && message.image && message.image.id;
    const mediaId = hasImage ? message.image.id : null;

    const session = getSession(phone);
    console.log(`\n📩 Message from ${phone} (${userName}): "${textBody || (hasImage ? '[IMAGE]' : message.type)}"`);
    session.messageCount++;

    // Resolve which shop this is (retry lookup if null)
    if (!session.shopId) {
      const shop = await getShopByPhoneNumber(receivingNumber, metaPhoneNumberId);
      if (shop) {
        session.shopId = shop.id;
        session.shopName = shop.name;
        session.metaPhoneNumberId = shop.meta_phone_number_id;
        session.metaAccessToken = shop.meta_access_token;
        console.log(`   🛒 Assigned to shop: ${shop.name}`);
      } else {
        console.log(`   ❌ FAILED to assign shop! session.shopId is NULL`);
      }
    }

    // Track the lead CRM
    if (session.shopId) {
      await trackLead(session.shopId, phone, userName);
    }

    if (hasImage) {
      const MAX_DAILY_IMAGES = 5;
      if (session.dailyImageCount >= MAX_DAILY_IMAGES) {
        console.log(`   ⚠️ Daily image limit reached for ${phone} (${session.dailyImageCount}/${MAX_DAILY_IMAGES})`);
        await sendWhatsAppReply(
          phone,
          `⚠️ *Daily Limit Reached! (5/5 Images)*\n\nAapki aaj ki *5 images* ki daily search limit poori ho chuki hai. 🛑\n\nKripya kal (tomorrow) naye jewelry designs search karne ke liye dobara image bheinjein! ✨\n\n_Note: Har user ke liye daily 5 images ki limit hai taaki hamara system fast kaam kare aur API waste na ho._`,
          session.metaPhoneNumberId,
          session.metaAccessToken
        );
        return;
      }

      session.dailyImageCount++;
      session.state = 'analyzing';

      console.log(`   🔍 Analyzing image for ${phone} (Image ${session.dailyImageCount}/${MAX_DAILY_IMAGES})...`);

      await sendWhatsAppReply(
        phone,
        `🔍 *Analyzing your jewelry...*\n\nPlease wait a moment while I search our catalog. ✨\n\n📊 *(Today's Limit: ${session.dailyImageCount}/${MAX_DAILY_IMAGES} used, ${MAX_DAILY_IMAGES - session.dailyImageCount} left for today)*`,
        session.metaPhoneNumberId,
        session.metaAccessToken
      );

      try {
        const { base64, contentType } = await downloadImageAsBase64(mediaId, session.metaAccessToken);
        const catalog = await fetchShopCatalog(session.shopId);
        
        console.log(`   📦 Catalog loaded: ${catalog.length} items for shop ${session.shopName || session.shopId}`);

        const analysis = await analyzeJewelryWithGemini(base64, contentType, catalog);
        console.log(`   [DEBUG] Gemini Analysis:`, JSON.stringify(analysis, null, 2));

        const exactMatch = analysis.exact_match_id ? catalog.find(item => item.id === analysis.exact_match_id) : null;
        let suggestions = (analysis.suggestion_ids || []).map(id => catalog.find(item => item.id === id)).filter(Boolean);
        
        if (analysis.exact_match_id) {
          suggestions = suggestions.filter(item => item.id !== analysis.exact_match_id);
        }

        const matchingData = { exactMatch, suggestions };

        session.lastAnalysis = analysis;
        session.state = 'idle';

        const replyMessage = formatWhatsAppReply(analysis, matchingData);
        await sendWhatsAppReply(phone, replyMessage, session.metaPhoneNumberId, session.metaAccessToken);
        console.log(`   ✅ Analysis reply sent to ${phone}`);
      } catch (err) {
        const errorDetails = err.response ? JSON.stringify(err.response.data) : err.message;
        console.error("   ❌ Error during image processing:", errorDetails);
        session.state = 'idle';
        await sendWhatsAppReply(
          phone,
          `❌ *Sorry!* We could not process your image at this moment. Please try sending it again.`,
          session.metaPhoneNumberId,
          session.metaAccessToken
        );
      }

    } else if (textBody) {
      const text = textBody.toLowerCase().trim();

      if (text === 'stop') {
        if (session.shopId) {
          try {
            await prisma.lead.updateMany({
              where: { shop_id: session.shopId, customer_phone: phone },
              data: { is_active: false }
            });
            await sendWhatsAppReply(phone,
              `⛔ *You have been unsubscribed.*\n\nYou will no longer receive catalog updates or broadcast messages from us. You can reply *START* at any time to resubscribe.`,
              session.metaPhoneNumberId,
              session.metaAccessToken
            );
            console.log(`   ⛔ Unsubscribed customer: ${phone}`);
          } catch (err) {
            console.error("Error unsubscribing lead:", err.message);
          }
        }
      } else if (text === 'start' || text === 'subscribe') {
        if (session.shopId) {
          try {
            await prisma.lead.updateMany({
              where: { shop_id: session.shopId, customer_phone: phone },
              data: { is_active: true }
            });
            await sendWhatsAppReply(phone,
              `✅ *Welcome back!*\n\nYou have successfully resubscribed to updates from *${session.shopName || 'our shop'}*.\n\n📸 Send me a jewelry image anytime to find it in our catalog!`,
              session.metaPhoneNumberId,
              session.metaAccessToken
            );
            console.log(`   ✅ Subscribed customer: ${phone}`);
          } catch (err) {
            console.error("Error resubscribing lead:", err.message);
          }
        }
      } else if (['hi', 'hello', 'hey', 'he'].some(g => text === g || text.startsWith(g + ' ') || text.endsWith(' ' + g))) {
        await sendWhatsAppReply(phone,
          `👋 *Welcome ${session.shopName ? 'to ' + session.shopName : ''}, ${userName}!*\n\n` +
          `Looking for a specific jewelry piece? Just send us a photo!\n\n` +
          `Our AI will instantly find the exact or similar piece from our catalog and share the price and purchase link.\n\n` +
          `📸 *Send an image to get started!*\n` +
          `ℹ️ *Daily Search Limit:* 5 images per day (Today used: ${session.dailyImageCount}/5)\n\n` +
          `_Note: Reply STOP at any time to unsubscribe from broadcast updates._`,
          session.metaPhoneNumberId,
          session.metaAccessToken
        );
      } else {
        await sendWhatsAppReply(
          phone, 
          `📸 *Send me a jewelry image to find it in our catalog!*\n\nℹ️ *Daily Search Limit:* 5 images per day (Today used: ${session.dailyImageCount}/5)\n\n_Note: You can reply STOP at any time to unsubscribe from updates._`, 
          session.metaPhoneNumberId,
          session.metaAccessToken
        );
      }
    }
  } catch (err) {
    console.error('Error in webhook handler:', err.message);
  }
});

// ── Health & Webhook Verification ───────
app.get('/health', async (req, res) => {
  try {
    const count = await prisma.shop.count();
    res.json({ status: 'ok', database_connected: true, count });
  } catch(error) {
    res.status(500).json({ status: 'error', database_connected: false });
  }
});

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.listen(PORT, () => {
  console.log(`\n💎 Shop WhatsApp Bot (SaaS Edition) running on port ${PORT}`);
});
