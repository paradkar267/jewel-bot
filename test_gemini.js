const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

async function testImageAnalysis() {
  const imagePath = 'test.jpg'; // Aapko ek test.jpg file yahan rakhni hogi
  
  if (!fs.existsSync(imagePath)) {
    console.error(`❌ Error: Mujhe '${imagePath}' file nahi mili. Kripya ek jewelry ki photo is folder mein 'test.jpg' naam se save karein.`);
    return;
  }

  console.log("📸 Image load ho rahi hai...");
  const base64Image = fs.readFileSync(imagePath).toString('base64');

  const prompt = `You are an expert jewelry analyst. Analyze this jewelry image and return ONLY a valid JSON object. No markdown, no extra text.

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
  "estimated_price_range_inr": {
    "min": 0,
    "max": 0,
    "confidence": "low | medium | high"
  },
  "design_details": "2 sentence description of design",
  "care_tips": "one line care tip",
  "search_keywords": ["3-5 keywords for Indian marketplace search"],
  "confidence_score": 0.9,
  "is_jewelry": true
}

IMPORTANT: If the image does NOT contain jewelry, set is_jewelry to false and fill other fields with null.`;

  console.log("✨ AI ko image bheji jaa rahi hai (Gemini 3.5 Flash)...");
  
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [
            { text: prompt },
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
          ]
        }],
        generationConfig: { responseMimeType: "application/json" }
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log("✅ Analysis Complete! Ye raha result:\n");
    let raw = response.data.candidates[0].content.parts[0].text.trim();
    raw = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    console.log(JSON.parse(raw));
  } catch(e) {
    console.error("❌ Error aagaya:", e.message);
    if (e.response && e.response.data) {
      console.error(JSON.stringify(e.response.data, null, 2));
    }
  }
}

testImageAnalysis();
