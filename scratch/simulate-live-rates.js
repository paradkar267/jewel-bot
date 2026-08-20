const axios = require('axios');
const TROY_OUNCE_GRAMS = 31.1034768;
const INDIA_BULLION_DUTY_MULTIPLIER = 1.15;

async function test() {
  try {
    const goldRes = await axios.get("https://api.gold-api.com/price/XAU");
    const goldData = goldRes.data;

    const silverRes = await axios.get("https://api.gold-api.com/price/XAG");
    const silverData = silverRes.data;

    const inrRes = await axios.get("https://open.er-api.com/v6/latest/USD");
    const inrData = inrRes.data;
    const usdToInr = inrData?.rates?.INR || 86.5;

    const goldUSDPerGram = (goldData?.price || 2650) / TROY_OUNCE_GRAMS;
    const silverUSDPerGram = (silverData?.price || 31.5) / TROY_OUNCE_GRAMS;

    const gold24kINR = Math.round(goldUSDPerGram * usdToInr * INDIA_BULLION_DUTY_MULTIPLIER);
    const gold22kINR = Math.round(gold24kINR * (22 / 24));
    const gold18kINR = Math.round(gold24kINR * (18 / 24));
    const silverINR = Math.round(silverUSDPerGram * usdToInr * INDIA_BULLION_DUTY_MULTIPLIER);

    console.log("USD to INR:", usdToInr);
    console.log("Gold Spot Price USD/oz:", goldData?.price);
    console.log("Silver Spot Price USD/oz:", silverData?.price);
    console.log("Calculated Rates:");
    console.log("Gold 24K:", gold24kINR);
    console.log("Gold 22K:", gold22kINR);
    console.log("Gold 18K:", gold18kINR);
    console.log("Silver:", silverINR);
  } catch (e) {
    console.error(e);
  }
}
test();
