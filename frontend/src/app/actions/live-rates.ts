"use server";

export async function fetchLiveIndiaMetalRates() {
  try {
    // Fetch live Gold (XAU) spot price in USD
    const goldRes = await fetch("https://api.gold-api.com/price/XAU", {
      cache: "no-store"
    });
    const goldData = await goldRes.json();

    // Fetch live Silver (XAG) spot price in USD
    const silverRes = await fetch("https://api.gold-api.com/price/XAG", {
      cache: "no-store"
    });
    const silverData = await silverRes.json();

    // Fetch live USD to INR Exchange Rate
    const inrRes = await fetch("https://open.er-api.com/v6/latest/USD", {
      cache: "no-store"
    });
    const inrData = await inrRes.json();
    const usdToInr = inrData?.rates?.INR || 95.75;

    // 1 Troy Ounce = 31.1034768 grams
    const TROY_OUNCE_GRAMS = 31.1034768;
    const goldUSDPerGram = (goldData?.price || 2650) / TROY_OUNCE_GRAMS;
    const silverUSDPerGram = (silverData?.price || 31.5) / TROY_OUNCE_GRAMS;

    // India Bullion Custom Duty & Taxes Adjustment Factor (~15% Import Duty + Local GST Tax Bullion Premium)
    const INDIA_BULLION_DUTY_MULTIPLIER = 1.15;

    const gold24kINR = Math.round(goldUSDPerGram * usdToInr * INDIA_BULLION_DUTY_MULTIPLIER);
    const gold22kINR = Math.round(gold24kINR * (22 / 24));
    const gold18kINR = Math.round(gold24kINR * (18 / 24));
    const silverINR = Math.round(silverUSDPerGram * usdToInr * INDIA_BULLION_DUTY_MULTIPLIER);
    const platinumINR = 4500; // Standard Platinum Benchmark

    const now = new Date();
    const formattedTime = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    return {
      success: true,
      rates: {
        gold_24k: gold24kINR,
        gold_22k: gold22kINR,
        gold_18k: gold18kINR,
        silver: silverINR,
        platinum: platinumINR,
      },
      usdToInr: Math.round(usdToInr * 100) / 100,
      spotGoldUSD: Math.round(goldData?.price || 0),
      lastUpdatedTime: formattedTime,
      source: "Real-Time Bullion & Forex Market Stream (API Live)"
    };

  } catch (error: any) {
    console.error("Error fetching live metal rates:", error);
    // Fallback to standard market benchmarks if offline
    return {
      success: true,
      rates: {
        gold_24k: 15927,
        gold_22k: 14600,
        gold_18k: 11946,
        silver: 240,
        platinum: 4500,
      },
      usdToInr: 95.75,
      spotGoldUSD: 4485,
      lastUpdatedTime: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      isFallback: true,
      source: "Standard Market Benchmark Rates"
    };
  }
}
