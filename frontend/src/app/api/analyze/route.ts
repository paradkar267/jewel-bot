import { NextResponse } from 'next/server';
import axios from 'axios';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Concurrency Shield: Maximum 5 concurrent calls to Gemini API
// Queues excess requests to prevent Node.js memory freeze and Gemini 429 rate-limit errors
const MAX_CONCURRENT_CALLS = 5;
let activeRequestsCount = 0;
const waitingQueue: Array<() => void> = [];

async function acquireSlot(): Promise<() => void> {
  if (activeRequestsCount < MAX_CONCURRENT_CALLS) {
    activeRequestsCount++;
    return () => releaseSlot();
  }

  return new Promise((resolve) => {
    waitingQueue.push(() => {
      activeRequestsCount++;
      resolve(() => releaseSlot());
    });
  });
}

function releaseSlot() {
  activeRequestsCount--;
  if (waitingQueue.length > 0) {
    const nextTask = waitingQueue.shift();
    nextTask?.();
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { base64Image, mimeType } = await req.json();

    if (!base64Image || !mimeType) {
      return NextResponse.json({ error: 'Image data is required' }, { status: 400 });
    }

    // Sanity check: prevent massive raw dumps (> 8MB base64)
    if (base64Image.length > 8 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'Image payload is too large. Please use an image smaller than 8MB.' 
      }, { status: 413 });
    }

    const prompt = `You are a world-class AI jewelry cataloging expert. Look at this jewelry photo and extract exact product specifications in ONLY valid JSON format.
    Schema to return:
    {
      "name": "Catchy, professional product name (e.g., Royal Kundan Gold Choker Necklace, Solitaire Diamond Ring 18K, Traditional Floral Jhumka Earrings)",
      "type": "ring | necklace | earring | bracelet | pendant | anklet | bangle | other",
      "metal": "gold | silver | platinum | rose gold | white gold | copper | brass",
      "karat": "22K | 18K | 14K | 24K | 925 Silver | 999 Silver | Fashion",
      "weight_grams": 10.5 or null,
      "price": 125000 or null,
      "design_details": "Brief 1-sentence description of style, gemstones (e.g., emeralds, rubies, diamonds), or hallmark"
    }

    Guidelines:
    - If gold traditional Indian jewelry (kundan, polki, temple, bridal), karat is typically "22K".
    - If diamond studded ring or delicate modern jewelry, karat is typically "18K".
    - If silver jewelry, karat is typically "925 Silver".
    - Type must be lowercase exact match from the enum list above.
    - Return ONLY valid JSON, no markdown, no explanation.`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Server configuration error: Gemini API key is missing' }, { status: 500 });
    }

    // Acquire slot in queue (guarantees max 5 parallel Gemini requests)
    const releaseSlotFn = await acquireSlot();

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: base64Image } }
            ]
          }],
          generationConfig: { responseMimeType: "application/json" }
        },
        { 
          headers: { 'Content-Type': 'application/json' },
          timeout: 25000 // 25s timeout to prevent stuck promises
        }
      );

      let raw = response.data.candidates[0].content.parts[0].text.trim();
      raw = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      return NextResponse.json(JSON.parse(raw));
    } finally {
      // Always release slot so waiting requests in queue proceed
      releaseSlotFn();
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to analyze image: " + (error.message || "Unknown error") }, { status: 500 });
  }
}
