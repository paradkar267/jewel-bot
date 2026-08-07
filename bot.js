require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
app.use(express.json());

// In-memory session store (Phone number -> session data)
const userSessions = new Map();

// Session timeout: 30 minutes of inactivity resets state
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

function getSession(phone) {
  const now = Date.now();
  let session = userSessions.get(phone);

  if (!session || (now - session.lastActive > SESSION_TIMEOUT_MS)) {
    session = {
      state: 'idle',
      lastActive: now,
      lastAnalysis: null,
      shopId: null,
      shopName: null,
      metaPhoneNumberId: null,
      metaAccessToken: null,
      customGreeting: null,
      storeAddress: null,
      promoBanner: null,
      isActive: true,
      dailyImageCount: 0,
      lastImageDate: new Date().toDateString()
    };
    userSessions.set(phone, session);
  } else {
    session.lastActive = now;
  }

  // Reset daily count if date has changed
  const today = new Date().toDateString();
  if (session.lastImageDate !== today) {
    session.dailyImageCount = 0;
    session.lastImageDate = today;
  }

  return session;
}

// 1. Fetch shop info by phone number or meta_phone_number_id
async function getShopByPhoneNumber(receivingNumber, metaPhoneNumberId) {
  try {
    if (metaPhoneNumberId) {
      const shopByMeta = await prisma.shop.findFirst({
        where: { meta_phone_number_id: metaPhoneNumberId }
      });
      if (shopByMeta) return shopByMeta;
    }

    if (receivingNumber) {
      const cleanNumber = receivingNumber.replace(/\D/g, '');
      const shopByPhone = await prisma.shop.findFirst({
        where: {
          OR: [
            { whatsapp_number: cleanNumber },
            { whatsapp_number: `+${cleanNumber}` },
            { whatsapp_number: { endsWith: cleanNumber.slice(-10) } }
          ]
        }
      });
      if (shopByPhone) return shopByPhone;
    }

    // Default fallback to first active shop
    return await prisma.shop.findFirst({ where: { is_active: true } });
  } catch (error) {
    console.error("   ❌ Error fetching shop by phone:", error.message);
    return null;
  }
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
      karat: p.karat,
      weight_grams: p.weight_grams ? Number(p.weight_grams) : null,
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
          last_contacted_at: new Date(),
          message_count: { increment: 1 },
          customer_name: (customerName && customerName !== 'there') ? customerName : existing.customer_name
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
  // Strip heavy base64 data URLs from prompt to avoid blowing up JSON payload
  const cleanCatalog = catalog.map(c => ({
    id: c.id,
    name: c.name,
    type: c.type,
    metal: c.metal,
    karat: c.karat,
    price: c.price
  }));

  const catalogJson = JSON.stringify(cleanCatalog, null, 2);

  const prompt = `You are a world-class AI jewelry vision analyst and sales matcher. Analyze this image and return ONLY a valid JSON object.
Below is the shop's JSON product catalog:
<CATALOG>
${catalogJson}
</CATALOG>

CRITICAL 50%-90% SIMILARITY MATCHING INSTRUCTIONS:
1. EXAMINE ALL JEWELRY FEATURES: Look at jewelry type (earrings, dangle, hoop, studs, necklace, ring, bracelet), stones/colors (blue sapphire, crystal, emerald, ruby, diamond, pearl), metal (gold, silver, platinum, oxidised, copper), and style (bridal, modern, antique, statement).
2. IGNORE PROPS/BACKGROUND: Ignore leaves, rocks, white pebbles, shadows, display stands, fabric, or models.
3. IGNORE ALL MOBILE/INSTAGRAM UI OVERLAYS: Ignore like buttons (❤️), comment icons (💬), share arrows, profile handles, captions, or timebars.
4. HIGH-LENIENCY SIMILARITY MANDATE: Even if an item is not a 100% exact replica, if it is 50%-90% SIMILAR in type (e.g. Dangle/Hoop Earrings vs studs, Blue/Crystal stones, Gold/Silver metal, Floral/Geometrical patterns), ALWAYS select the best matching item from <CATALOG> for "exact_match_id" and pick up to 3 similar items for "suggestion_ids".
5. NEVER RETURN NULL FOR MATCHES if <CATALOG> has products in the same category (e.g., earrings, necklaces, rings).

Schema to return:
{
  "type": "earring | ring | necklace | bracelet | pendant | anklet | bangle | other",
  "subtype": "specific style description (e.g. blue sapphire crystal dangle earrings)",
  "metal": "gold | silver | platinum | rose gold | white gold | copper | brass | unknown",
  "metal_purity": "22k or 18k or 925 or null",
  "gemstones": ["list of gemstones or colors e.g. blue sapphire, crystal, diamond"],
  "primary_gemstone": "main gemstone or color e.g. blue sapphire",
  "style": "traditional | modern | antique | fusion | bridal | casual | statement",
  "origin_style": "Mughal | Rajasthani | South Indian | Kundan | Polki | Western | Contemporary | null",
  "occasion": "wedding | daily wear | festival | party | office | null",
  "design_details": "2 sentence description of design",
  "exact_match_id": "uuid of best matching product from catalog, or null",
  "suggestion_ids": ["array of up to 3 uuid strings for similar products from catalog, or empty"],
  "confidence_score": 0.85,
  "is_jewelry": true
}

IMPORTANT: If the image does NOT contain any jewelry item at all, set is_jewelry to false.`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing in server environment variables.");
  }

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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

// ── Step 2.5: Gemini AI Text Catalog Search ───────
async function searchCatalogWithTextGemini(userQuery, catalog) {
  const cleanCatalog = catalog.map(c => ({
    id: c.id,
    name: c.name,
    type: c.type,
    metal: c.metal,
    karat: c.karat,
    price: c.price
  }));

  const catalogJson = JSON.stringify(cleanCatalog, null, 2);

  const prompt = `You are an expert AI jewelry sales assistant. A customer sent this message: "${userQuery}".
Below is our shop's JSON catalog:
<CATALOG>
${catalogJson}
</CATALOG>

Analyze the customer query for jewelry type (ring, necklace, earring, bracelet, etc.), metal (gold, silver, platinum, etc.), origin style (kundan, polki, antique), and price range (e.g., "under 50k", "below 1 lakh", "budget 20000").
Return ONLY a valid JSON object matching this schema:
{
  "is_search_query": true,
  "search_summary": "1-sentence description of search criteria (e.g., Gold rings under ₹50,000)",
  "matching_product_ids": ["array of matching product UUIDs from the catalog, up to 4 items"]
}

If the user message is general chatter or not looking for jewelry products, set is_search_query to false and matching_product_ids to [].`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      contents: [{
        parts: [{ text: prompt }]
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
  const { exactMatch, suggestions } = matchingData;

  if (!analysis.is_jewelry) {
    return `⚠️ *No Jewelry Detected*\n\nHumari AI ko is photo me koi jewelry piece (har, anguthi, jhumka, bracelet) nahi mila. Kripya jewelry ki saaf photo ya screenshot bheinjein! ✨`;
  }

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
    reply += `🛍️ *Best Matching Showroom Item (90%+ Similar)!*\n`;
    reply += `*🏷️ Name:* ${exactMatch.name}\n`;
    const priceStr = exactMatch.price ? `₹${Number(exactMatch.price).toLocaleString('en-IN')}` : 'Price on request';
    reply += `*💰 Price:* ${priceStr}\n`;
    if (exactMatch.url) reply += `*🔗 Buy Here:* ${exactMatch.url}\n`;
    reply += `\n`;
  } else {
    reply += `✨ *Showing Best Matching Designs From Our Catalog:*\n\n`;
  }

  if (suggestions && suggestions.length > 0) {
    reply += `💎 *90% Similar Showroom Collection Items:*\n`;
    suggestions.forEach((item, idx) => {
      const pStr = item.price ? `₹${Number(item.price).toLocaleString('en-IN')}` : 'Price on request';
      reply += `${idx + 1}. *${item.name}* — ${pStr}\n`;
      if (item.url) reply += `   🔗 ${item.url}\n`;
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
  res.sendStatus(200); // Immediate 200 OK to Meta

  try {
    const entry = req.body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) return;

    const messageId = message.id;
    if (processedMessageIds.has(messageId)) {
      console.log(`   🔁 Skipping duplicate message ID: ${messageId}`);
      return;
    }
    processedMessageIds.add(messageId);

    // Limit set size to prevent memory leaks
    if (processedMessageIds.size > 1000) {
      const firstKey = processedMessageIds.values().next().value;
      processedMessageIds.delete(firstKey);
    }

    const phone = message.from;
    const metaPhoneNumberId = value?.metadata?.phone_number_id;
    const receivingNumber = value?.metadata?.display_phone_number;
    const contact = value?.contacts?.[0];
    const userName = contact?.profile?.name || 'there';

    console.log(`\n📩 Incoming WhatsApp message from +${phone} (${userName}) to Meta ID ${metaPhoneNumberId}:`);

    const hasImage = message.type === 'image';
    const mediaId = hasImage ? message.image.id : null;
    const textBody = message.type === 'text' ? message.text.body : '';

    const session = getSession(phone);

    // Assign shop to session if missing
    if (!session.shopId) {
      const shop = await getShopByPhoneNumber(receivingNumber, metaPhoneNumberId);
      if (shop) {
        session.shopId = shop.id;
        session.shopName = shop.name;
        session.metaPhoneNumberId = shop.meta_phone_number_id;
        session.metaAccessToken = shop.meta_access_token;
        session.customGreeting = shop.custom_greeting;
        session.storeAddress = shop.store_address;
        session.promoBanner = shop.promo_banner;
        session.isActive = shop.is_active !== false;
        console.log(`   🛒 Assigned to shop: ${shop.name} (Active: ${session.isActive})`);
      } else {
        console.log(`   ❌ FAILED to assign shop! session.shopId is NULL`);
      }
    }

    // Block processing if shop account is SUSPENDED
    if (session.isActive === false) {
      console.log(`   🛑 Message blocked for SUSPENDED shop account: ${session.shopName || session.shopId}`);
      await sendWhatsAppReply(
        phone,
        `⚠️ *Service Temporarily Suspended*\n\nThis business WhatsApp AI bot is currently suspended. Please contact platform administration to renew your subscription.`,
        session.metaPhoneNumberId,
        session.metaAccessToken
      );
      return;
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

      session.state = 'analyzing';

      console.log(`   🔍 Analyzing image for ${phone} (Completed Scans Today: ${session.dailyImageCount}/${MAX_DAILY_IMAGES})...`);

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

        // Ultra-Smart Hybrid Similarity Scorer (Rank every item in catalog from 0 to 100)
        const detectedType = (analysis.type || '').toLowerCase();
        const detectedSubtype = (analysis.subtype || '').toLowerCase();
        const detectedGemstones = (analysis.gemstones || []).map(g => g.toLowerCase());
        const primaryGemstone = (analysis.primary_gemstone || '').toLowerCase();
        const detectedMetal = (analysis.metal || '').toLowerCase();
        const detectedDetails = (analysis.design_details || '').toLowerCase();

        const synonymMap = {
          earring: ['earring', 'earrings', 'hoop', 'hoops', 'stud', 'studs', 'bali', 'balis', 'jhumka', 'dangle', 'drop', 'crystal', 'sapphire'],
          necklace: ['necklace', 'necklaces', 'haar', 'chain', 'choker', 'pendant', 'mangalsutra', 'locket'],
          ring: ['ring', 'rings', 'anguthi', 'band', 'solitaire'],
          bracelet: ['bracelet', 'bracelets', 'bangle', 'bangles', 'kangan', 'kada', 'cuff']
        };

        const categoryKeywords = synonymMap[detectedType] || [detectedType];

        const rankedCatalog = catalog.map(item => {
          let score = 0;
          const itemName = (item.name || '').toLowerCase();
          const itemType = (item.type || '').toLowerCase();
          const itemMetal = (item.metal || '').toLowerCase();

          // Direct Gemini exact match bonus
          if (analysis.exact_match_id && item.id === analysis.exact_match_id) {
            score += 50;
          }
          // Direct Gemini suggestion bonus
          if (analysis.suggestion_ids && analysis.suggestion_ids.includes(item.id)) {
            score += 35;
          }
          // Category / Synonym match (+30)
          if (categoryKeywords.some(kw => itemType.includes(kw) || itemName.includes(kw))) {
            score += 30;
          }
          // Subtype overlap (+20)
          if (detectedSubtype && itemName.includes(detectedSubtype)) {
            score += 20;
          }
          // Gemstone / Color match e.g. blue, sapphire, crystal, diamond (+15)
          if (primaryGemstone && itemName.includes(primaryGemstone)) {
            score += 15;
          }
          if (detectedGemstones.some(g => itemName.includes(g))) {
            score += 15;
          }
          // Metal match (+10)
          if (detectedMetal && (itemMetal.includes(detectedMetal) || itemName.includes(detectedMetal))) {
            score += 10;
          }

          return { item, score };
        });

        // Sort catalog items by highest similarity score
        rankedCatalog.sort((a, b) => b.score - a.score);

        let exactMatch = rankedCatalog.length > 0 ? rankedCatalog[0].item : null;
        let suggestions = rankedCatalog.slice(1, 4).map(r => r.item);

        const matchingData = { exactMatch, suggestions };

        session.lastAnalysis = analysis;
        session.state = 'idle';

        // Increment count ONLY AFTER successful analysis
        session.dailyImageCount++;

        const replyMessage = formatWhatsAppReply(analysis, matchingData);
        await sendWhatsAppReply(phone, replyMessage, session.metaPhoneNumberId, session.metaAccessToken);
        console.log(`   ✅ Analysis reply sent to ${phone} (Updated Count: ${session.dailyImageCount}/${MAX_DAILY_IMAGES})`);
      } catch (err) {
        const errorDetails = err.response ? JSON.stringify(err.response.data) : err.message;
        console.error("   ❌ Error during image processing (Daily limit NOT deducted):", errorDetails);
        session.state = 'idle';
        await sendWhatsAppReply(
          phone,
          `❌ *Sorry!* We could not process your image at this moment. Please try sending it again.\n\n_Note: Aapka daily search limit count deduct nahi hua hai!_`,
          session.metaPhoneNumberId,
          session.metaAccessToken
        );
      }

    } else if (textBody) {
      const text = textBody.toLowerCase().trim();

      if (text === 'stop') {
        userSessions.delete(phone);
        await sendWhatsAppReply(phone, "Session reset. Type 'hi' to start again.", session.metaPhoneNumberId, session.metaAccessToken);
        return;
      }

      const catalog = await fetchShopCatalog(session.shopId);

      // Check if user is searching catalog via text (e.g. "show gold rings under 50k", "necklace", "bangles")
      try {
        const searchResult = await searchCatalogWithTextGemini(textBody, catalog);
        console.log(`   [DEBUG] Text Search Analysis:`, JSON.stringify(searchResult, null, 2));

        if (searchResult.is_search_query && searchResult.matching_product_ids?.length > 0) {
          const matchedProducts = searchResult.matching_product_ids
            .map(id => catalog.find(p => p.id === id))
            .filter(Boolean);

          if (matchedProducts.length > 0) {
            let reply = `🔍 *${searchResult.search_summary || 'Catalog Search Results'}*\n\n`;
            matchedProducts.forEach((item, idx) => {
              const pStr = item.price ? `₹${Number(item.price).toLocaleString('en-IN')}` : 'Price on request';
              reply += `${idx + 1}. *${item.name}*\n   💰 Price: ${pStr}\n`;
              if (item.url) reply += `   🔗 Link: ${item.url}\n`;
              reply += `\n`;
            });
            reply += `✨ _Showroom Catalog items matched for your query._`;
            await sendWhatsAppReply(phone, reply, session.metaPhoneNumberId, session.metaAccessToken);
            return;
          }
        }
      } catch (err) {
        console.error("   ⚠️ Text catalog search error:", err.message);
      }

      // Default Friendly Greeting / Store Reply
      let greeting = session.customGreeting || `Welcome to *${session.shopName || 'our Jewelry Store'}*! 💎`;
      let reply = `👋 Hello! ${greeting}\n\n`;
      reply += `📸 *Send any Jewelry Image or Instagram Screenshot* to search our live catalog!\n\n`;
      reply += `💬 Or type what you are looking for (e.g. *"Show me gold rings under 50k"* or *"Do you have silver bangles?"*).\n\n`;
      if (session.storeAddress) {
        reply += `📍 *Showroom Address:* ${session.storeAddress}\n`;
      }
      if (session.promoBanner) {
        reply += `🎁 *Special Offer:* ${session.promoBanner}\n`;
      }

      await sendWhatsAppReply(phone, reply, session.metaPhoneNumberId, session.metaAccessToken);
    }
  } catch (err) {
    console.error("   ❌ Webhook processing error:", err.message);
  }
});

// ── Webhook Verification (GET request for Meta verification) ───────
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'jewelbot_secure_token_2026';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully with Meta!');
    res.status(200).send(challenge);
  } else {
    console.error('❌ Webhook verification failed! Invalid token.');
    res.sendStatus(403);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 JewelBot WhatsApp AI Webhook Server running on port ${PORT}`);
});
