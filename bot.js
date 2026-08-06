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
const pool = new Pool({ connectionString });
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
      shopId: null // We'll store which shop they are talking to
    });
  }
  const session = sessions.get(phone);
  checkAndResetDailyLimit(session);
  return session;
}

// ── Database Queries ───────

// 1. Find shop ID by its WhatsApp number
async function getShopByPhoneNumber(phone, metaPhoneNumberId) {
  console.log(`   [DEBUG] Looking up shop for phone: ${phone}, meta_id: ${metaPhoneNumberId}`);
  
  if (metaPhoneNumberId) {
    try {
      const data = await prisma.shop.findFirst({
        where: { meta_phone_number_id: metaPhoneNumberId },
        select: { id: true, name: true, meta_phone_number_id: true }
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
      const data = await prisma.shop.findFirst({
        where: { whatsapp_number: phone },
        select: { id: true, name: true, meta_phone_number_id: true }
      });
      if (data) {
        console.log(`   [DEBUG] Found shop by whatsapp_number!`);
        return data;
      }
    } catch (error) {}
  }

  console.log(`   [DEBUG] Shop not found by ID or Phone. Using fallback...`);
  // Fallback for PoC: If no shop found for the number, get the latest active shop
  try {
    const fallbackData = await prisma.shop.findFirst({
      orderBy: { created_at: 'desc' },
      select: { id: true, name: true, meta_phone_number_id: true }
    });
    console.log(`   [DEBUG] Fallback succeeded! Shop:`, fallbackData?.name);
    return fallbackData;
  } catch (fallbackError) {
    console.log(`   [DEBUG] Fallback Error:`, fallbackError.message);
    return null;
  }
}

// 2. Fetch all products for the shop
async function fetchShopCatalog(shopId) {
  if (!shopId) return [];

  try {
    const catalog = await prisma.product.findMany({
      where: { shop_id: shopId },
      select: { id: true, name: true, type: true, metal: true, price: true, url: true, image_url: true }
    });
    console.log(`   [DEBUG] Fetched ${catalog ? catalog.length : 0} products for shop_id: ${shopId}`);
    return catalog || [];
  } catch (error) {
    console.log(`   [DEBUG] Prisma Error:`, error.message);
    return [];
  }
}

// 3. Track Customer Lead
async function trackLead(shopId, phone, userName) {
  if (!shopId || !phone) return;
  try {
    const existingLead = await prisma.lead.findFirst({
      where: {
        shop_id: shopId,
        customer_phone: phone
      }
    });
      
    if (existingLead) {
      await prisma.lead.update({
        where: { id: existingLead.id },
        data: {
          customer_name: userName || existingLead.customer_name,
          message_count: existingLead.message_count + 1,
          last_contacted_at: new Date()
        }
      });
    } else {
      await prisma.lead.create({
        data: {
          shop_id: shopId,
          customer_phone: phone,
          customer_name: userName || null,
          message_count: 1,
          last_contacted_at: new Date()
        }
      });
    }
  } catch (err) {
    console.error("Failed to track lead:", err.message);
  }
}


// ── Step 1: Download image from Meta ───────
async function downloadImageAsBase64(mediaId) {
  const metaUrlResponse = await axios.get(`https://graph.facebook.com/v20.0/${mediaId}`, {
    headers: { Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}` }
  });
  
  const mediaUrl = metaUrlResponse.data.url;
  const mimeType = metaUrlResponse.data.mime_type || 'image/jpeg';

  const response = await axios.get(mediaUrl, {
    responseType: 'arraybuffer',
    headers: { Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}` }
  });

  const base64 = Buffer.from(response.data, 'binary').toString('base64');
  return { base64, contentType: mimeType };
}

// ── Step 2: Gemini Vision API ───────
async function analyzeJewelryWithGemini(base64Image, mimeType, catalog) {
  // We provide the catalog to Gemini so it can directly evaluate the exact match
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

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

  const metalEmoji = {
    gold: '🥇', silver: '🥈', platinum: '💎',
    'rose gold': '🌸', 'white gold': '⚪', other: '⚙️'
  };

  const emoji = typeEmoji[analysis.type] || '✨';
  const mEmoji = metalEmoji[analysis.metal] || '⚙️';
  
  const gems = Array.isArray(analysis.gemstones) && analysis.gemstones.length > 0
    ? analysis.gemstones.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')
    : 'None';

  const occasion = analysis.occasion
    ? analysis.occasion.charAt(0).toUpperCase() + analysis.occasion.slice(1)
    : '—';

  const origin = analysis.origin_style || 'Contemporary';
  const purity = analysis.metal_purity ? ` · ${analysis.metal_purity}` : '';

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
    reply += `🌟 *Similar Suggestions:*\n`;
    suggestions.forEach(item => {
      const pStr = item.price ? `₹${Number(item.price).toLocaleString('en-IN')}` : 'Price on request';
      reply += `- *${item.name}* (${pStr})\n`;
      reply += `  🔗 ${item.url}\n`;
    });
  }

  return reply.trim();
}

// ── Step 4: Send WhatsApp reply ───────
async function sendWhatsAppReply(to, body, shopPhoneNumberId) {
  // Use the shop's dynamic phone number ID, or fallback to default for testing
  const senderId = shopPhoneNumberId || process.env.META_PHONE_NUMBER_ID;

  await axios.post(
    `https://graph.facebook.com/v20.0/${senderId}/messages`,
    {
      messaging_product: "whatsapp",
      to: to,
      text: { body }
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.META_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );
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
    const metadata = value.metadata; // Contains the receiving phone number

    if (!messages || !messages[0]) return;
    
    const message = messages[0];
    
    // Prevent duplicate processing of the same message (in-memory)
    if (processedMessageIds.has(message.id)) {
      console.log(`   [DEBUG] Ignored duplicate message retry: ${message.id}`);
      return;
    }
    processedMessageIds.add(message.id);

    // Prevent processing old messages (fixes Meta retry loops wasting API tokens)
    if (message.timestamp) {
      const messageAgeSeconds = Math.floor(Date.now() / 1000) - parseInt(message.timestamp, 10);
      if (messageAgeSeconds > 120) { // Ignore if message is older than 2 minutes
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
    console.log(`\n📩 Message from ${phone} (${userName})`);
    session.messageCount++;

    // Resolve which shop this is
    if (!session.shopId) {
      const shop = await getShopByPhoneNumber(receivingNumber, metaPhoneNumberId);
      if (shop) {
        session.shopId = shop.id;
        session.shopName = shop.name;
        session.metaPhoneNumberId = shop.meta_phone_number_id;
        console.log(`   🛒 Assigned to shop: ${shop.name}`);
      } else {
        console.log(`   ❌ FAILED to assign shop! session.shopId is NULL`);
      }
    }

    // Track the lead CRM
    if (session.shopId) {
      await trackLead(session.shopId, phone, userName);
      
      // Send Greeting if it's the very first message
      if (session.messageCount === 1) {
        await sendWhatsAppReply(
          phone, 
          `👋 Hello ${userName}!\n\nWelcome to *${session.shopName}*. 💎\n\nI am your AI Jewelry Assistant. Send me a photo of any jewelry design, and I will find it in our catalog for you! ✨\n\nℹ️ *Daily Limit:* Aap daily maximum *5 images* search ke liye bhej sakte hain.`, 
          session.metaPhoneNumberId
        );
      }
    }

    if (hasImage) {
      const MAX_DAILY_IMAGES = 5;
      if (session.dailyImageCount >= MAX_DAILY_IMAGES) {
        console.log(`   ⚠️ Daily image limit reached for ${phone} (${session.dailyImageCount}/${MAX_DAILY_IMAGES})`);
        await sendWhatsAppReply(
          phone,
          `⚠️ *Daily Limit Reached! (5/5 Images)*\n\nAapki aaj ki *5 images* ki daily search limit poori ho chuki hai. 🛑\n\nKripya kal (tomorrow) naye jewelry designs search karne ke liye dobara image bheinjein! ✨\n\n_Note: Har user ke liye daily 5 images ki limit hai taaki hamara system fast kaam kare aur API waste na ho._`,
          session.metaPhoneNumberId
        );
        return;
      }

      session.dailyImageCount++;
      const remainingImages = MAX_DAILY_IMAGES - session.dailyImageCount;

      await sendWhatsAppReply(
        phone, 
        `🔍 *Analyzing your jewelry...*\n\nPlease wait a moment while I search our catalog. ✨\n\n📊 _(Today's Limit: ${session.dailyImageCount}/${MAX_DAILY_IMAGES} used, ${remainingImages} left for today)_`, 
        session.metaPhoneNumberId
      );

      session.state = 'analyzing';
      try {
        console.log(`   Downloading image...`);
        const { base64, contentType } = await downloadImageAsBase64(mediaId);

        console.log(`   Analyzing with Gemini & matching catalog in Database...`);
        
        const catalog = await fetchShopCatalog(session.shopId);
        const analysis = await analyzeJewelryWithGemini(base64, contentType, catalog);
        console.log(`   [DEBUG] Gemini Analysis:`, JSON.stringify(analysis, null, 2));

        // Build matchingData from Gemini's IDs
        const exactMatch = analysis.exact_match_id ? catalog.find(item => item.id === analysis.exact_match_id) : null;
        let suggestions = (analysis.suggestion_ids || []).map(id => catalog.find(item => item.id === id)).filter(Boolean);
        
        // Prevent showing the exact match in the suggestions list again
        if (analysis.exact_match_id) {
          suggestions = suggestions.filter(item => item.id !== analysis.exact_match_id);
        }

        const matchingData = { exactMatch, suggestions };

        session.lastAnalysis = analysis;
        session.state = 'idle';

        const replyMessage = formatWhatsAppReply(analysis, matchingData);
        await sendWhatsAppReply(phone, replyMessage, session.metaPhoneNumberId);
        console.log(`   ✅ Reply sent to ${phone}`);
      } catch (err) {
        console.error("   ❌ Error during image processing:", err.message);
        session.state = 'idle';
        await sendWhatsAppReply(
          phone,
          `❌ *Sorry!* We could not process your image at this moment. Please try sending it again.`,
          session.metaPhoneNumberId
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
              session.metaPhoneNumberId
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
              session.metaPhoneNumberId
            );
            console.log(`   ✅ Subscribed customer: ${phone}`);
          } catch (err) {
            console.error("Error resubscribing lead:", err.message);
          }
        }
      } else if (['hi', 'hello', 'hey'].some(g => text.includes(g))) {
        await sendWhatsAppReply(phone,
          `👋 *Welcome ${session.shopName ? 'to ' + session.shopName : ''}, ${userName}!*\n\n` +
          `Looking for a specific jewelry piece? Just send us a photo!\n\n` +
          `Our AI will instantly find the exact or similar piece from our catalog and share the price and purchase link.\n\n` +
          `📸 *Send an image to get started!*\n` +
          `ℹ️ *Daily Search Limit:* 5 images per day (Today used: ${session.dailyImageCount}/5)\n\n` +
          `_Note: Reply STOP at any time to unsubscribe from broadcast updates._`, session.metaPhoneNumberId
        );
      } else {
        await sendWhatsAppReply(phone, `📸 *Send me a jewelry image to find it in our catalog!*\n\nℹ️ *Daily Search Limit:* 5 images per day (Today used: ${session.dailyImageCount}/5)\n\n_Note: You can reply STOP at any time to unsubscribe from updates._`, session.metaPhoneNumberId);
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
});

// ── Health & Webhook Verification ───────
app.get('/health', async (req, res) => {
  // Test DB connection
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
