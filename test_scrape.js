const axios = require('axios');
const cheerio = require('cheerio');

async function test() {
  const url = 'https://www.joyalukkas.in/'; // I'll just fetch homepage first to find a product URL
  try {
    const sitemap = await axios.get('https://www.joyalukkas.in/sitemap.xml');
    console.log("Sitemap fetched. Length:", sitemap.data.length);
    
    // Just testing a generic fetch approach to see what we get.
  } catch (e) {
    console.log("Error:", e.message);
  }
}

test();
