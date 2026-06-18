import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const { base64Image, mimeType } = await req.json();

    const prompt = `You are an expert jewelry cataloger. Look at this image and extract details in ONLY valid JSON format.
    {
      "name": "A short descriptive name (e.g. Elegant Gold Kundan Necklace)",
      "type": "ring | necklace | earring | bracelet | pendant | other",
      "metal": "gold | silver | platinum | unknown",
      "price": 10000
    }`;

    // Read Gemini API Key from process.env (Server-side only)
    // We will assume GEMINI_API_KEY is available in the root .env, we should copy it to .env.local
    const apiKey = process.env.GEMINI_API_KEY;

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
      { headers: { 'Content-Type': 'application/json' } }
    );

    let raw = response.data.candidates[0].content.parts[0].text.trim();
    raw = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return NextResponse.json(JSON.parse(raw));

  } catch (error: any) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 });
  }
}
