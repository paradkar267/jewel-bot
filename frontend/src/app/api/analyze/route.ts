import { NextResponse } from 'next/server';
import axios from 'axios';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

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

    const prompt = `You are an expert jewelry cataloger. Look at this image and extract details in ONLY valid JSON format.
    {
      "name": "A short descriptive name (e.g. Elegant Gold Kundan Necklace)",
      "type": "ring | necklace | earring | bracelet | pendant | other",
      "metal": "gold | silver | platinum | unknown",
      "price": 10000
    }`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Server configuration error: Gemini API key is missing' }, { status: 500 });
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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
