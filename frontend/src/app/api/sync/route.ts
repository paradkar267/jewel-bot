import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { parseStringPromise } from 'xml2js';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Helper function to extract jewelry metadata from text
function parseJewelryDetails(name: string, description: string = '') {
  const text = `${name} ${description}`.toLowerCase();

  // 1. Metal Detection
  let metal = 'gold';
  if (text.includes('silver') || text.includes('925')) {
    metal = 'silver';
  } else if (text.includes('platinum')) {
    metal = 'platinum';
  } else if (text.includes('diamond')) {
    metal = 'diamond';
  } else if (text.includes('rose gold')) {
    metal = 'rose_gold';
  } else if (text.includes('gold') || text.includes('karat') || text.includes('kt')) {
    metal = 'gold';
  }

  // 2. Karat Purity Detection
  let karat = '22K';
  if (text.includes('24k') || text.includes('24kt') || text.includes('999')) {
    karat = '24K';
  } else if (text.includes('22k') || text.includes('22kt') || text.includes('916')) {
    karat = '22K';
  } else if (text.includes('18k') || text.includes('18kt') || text.includes('750')) {
    karat = '18K';
  } else if (text.includes('14k') || text.includes('14kt') || text.includes('585')) {
    karat = '14K';
  } else if (metal === 'silver') {
    karat = '925 Silver';
  }

  // 3. Category / Type Detection
  let type = 'other';
  if (text.includes('necklace') || text.includes('haar') || text.includes('choker')) {
    type = 'necklace';
  } else if (text.includes('ring') || text.includes('anguthi')) {
    type = 'ring';
  } else if (text.includes('earring') || text.includes('jhumka') || text.includes('stud') || text.includes('bali')) {
    type = 'earring';
  } else if (text.includes('chain')) {
    type = 'chain';
  } else if (text.includes('bangle') || text.includes('kada')) {
    type = 'bangle';
  } else if (text.includes('pendant') || text.includes('locket')) {
    type = 'pendant';
  } else if (text.includes('mangalsutra')) {
    type = 'mangalsutra';
  } else if (text.includes('bracelet')) {
    type = 'bracelet';
  } else if (text.includes('coin') || text.includes('bar')) {
    type = text.includes('bar') ? 'bar' : 'coin';
  }

  // 4. Weight in Grams Detection (e.g. 4.5g, 12.8 grams, 5.2 gm)
  let weight_grams: number | null = null;
  const weightMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:g|gram|grams|gm|gms)\b/);
  if (weightMatch && weightMatch[1]) {
    const parsedWeight = parseFloat(weightMatch[1]);
    if (!isNaN(parsedWeight) && parsedWeight > 0 && parsedWeight < 5000) {
      weight_grams = parsedWeight;
    }
  }

  return { metal, karat, type, weight_grams, making_charge_percent: 12 };
}

// Ensure clean absolute URLs
function makeAbsoluteUrl(baseUrl: string, relativeOrAbsolute: string): string {
  if (!relativeOrAbsolute) return '';
  if (relativeOrAbsolute.startsWith('http://') || relativeOrAbsolute.startsWith('https://')) {
    return relativeOrAbsolute;
  }
  if (relativeOrAbsolute.startsWith('//')) {
    return 'https:' + relativeOrAbsolute;
  }
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanPath = relativeOrAbsolute.startsWith('/') ? relativeOrAbsolute : '/' + relativeOrAbsolute;
  return cleanBase + cleanPath;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    let baseUrl = url.trim();
    if (!baseUrl.startsWith('http')) {
      baseUrl = 'https://' + baseUrl;
    }
    const parsedUrlObj = new URL(baseUrl);
    const domainOrigin = parsedUrlObj.origin;

    let scrapedProducts: any[] = [];
    let engineUsed = '';

    // ==========================================
    // STRATEGY 1: SHOPIFY JSON API SCRAPER
    // ==========================================
    try {
      const shopifyApiUrl = `${domainOrigin}/products.json?limit=30`;
      const shopifyRes = await fetch(shopifyApiUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        cache: 'no-store'
      });

      if (shopifyRes.ok) {
        const data = await shopifyRes.json();
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          engineUsed = 'Shopify Instant Engine';
          for (const prod of data.products) {
            const name = prod.title || 'Jewelry Item';
            const handle = prod.handle || '';
            const prodUrl = `${domainOrigin}/products/${handle}`;
            const image_url = prod.images && prod.images.length > 0 ? prod.images[0].src : '';
            const firstVariant = prod.variants && prod.variants.length > 0 ? prod.variants[0] : null;
            const price = firstVariant && firstVariant.price ? Math.round(parseFloat(firstVariant.price)) : null;
            const rawWeight = firstVariant && firstVariant.grams ? firstVariant.grams / 1000 : null;
            
            const bodyHtml = prod.body_html || '';
            const jewelryMeta = parseJewelryDetails(name, bodyHtml);

            scrapedProducts.push({
              name,
              url: prodUrl,
              image_url,
              price,
              metal: jewelryMeta.metal,
              karat: jewelryMeta.karat,
              type: jewelryMeta.type,
              weight_grams: jewelryMeta.weight_grams || rawWeight,
              making_charge_percent: jewelryMeta.making_charge_percent
            });
          }
        }
      }
    } catch (e) {
      console.log('Shopify JSON endpoint not available, falling back to sitemap/Cheerio...');
    }

    // ==========================================
    // STRATEGY 2: SITEMAP XML SCRAPER
    // ==========================================
    if (scrapedProducts.length === 0) {
      const sitemapUrls = [
        `${domainOrigin}/sitemap_products_1.xml`,
        `${domainOrigin}/sitemap.xml`,
        `${domainOrigin}/product-sitemap.xml`
      ];

      let productUrls: string[] = [];

      for (const sitemapUrl of sitemapUrls) {
        try {
          const response = await fetch(sitemapUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            cache: 'no-store'
          });

          if (response.ok) {
            const xmlData = await response.text();
            const parsed = await parseStringPromise(xmlData);

            if (parsed.urlset && parsed.urlset.url) {
              productUrls = parsed.urlset.url
                .map((u: any) => u.loc[0])
                .filter((loc: string) => loc.includes('/product') || loc.includes('/item') || loc.includes('/p/'));
                
              if (sitemapUrl.includes('sitemap_products')) {
                productUrls = parsed.urlset.url.map((u: any) => u.loc[0]);
              }
              if (productUrls.length > 0) {
                engineUsed = 'Sitemap XML Engine';
                break;
              }
            } else if (parsed.sitemapindex && parsed.sitemapindex.sitemap) {
              const subSitemaps = parsed.sitemapindex.sitemap.map((s: any) => s.loc[0]);
              const productSitemap = subSitemaps.find((s: string) => s.includes('product'));
              if (productSitemap) {
                const subResp = await fetch(productSitemap);
                const subXml = await subResp.text();
                const subParsed = await parseStringPromise(subXml);
                if (subParsed.urlset && subParsed.urlset.url) {
                  productUrls = subParsed.urlset.url.map((u: any) => u.loc[0]);
                  engineUsed = 'Sitemap Index Engine';
                  break;
                }
              }
            }
          }
        } catch (e) {
          console.log(`Failed to fetch sitemap: ${sitemapUrl}`);
        }
      }

      // Fetch individual product URLs from sitemap
      if (productUrls.length > 0) {
        const urlsToScrape = productUrls.slice(0, 20);
        for (const prodUrl of urlsToScrape) {
          try {
            const res = await fetch(prodUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
              cache: 'no-store'
            });
            const html = await res.text();
            const $ = cheerio.load(html);

            const name = $('meta[property="og:title"]').attr('content') || 
                         $('meta[name="title"]').attr('content') || 
                         $('h1').first().text().trim() || 
                         'Jewelry Item';

            let image_url = $('meta[property="og:image"]').attr('content') || 
                            $('meta[name="twitter:image"]').attr('content') || '';
            image_url = makeAbsoluteUrl(domainOrigin, image_url);

            let priceStr = $('meta[property="product:price:amount"]').attr('content') || 
                           $('meta[property="og:price:amount"]').attr('content') || '';

            if (!priceStr) {
              const priceText = $('.price, .product-price, [data-price], .offer-price, .amount').first().text();
              const match = priceText.match(/[\d,]+/);
              if (match) priceStr = match[0].replace(/,/g, '');
            }

            const price = priceStr ? Math.round(parseFloat(priceStr)) : null;
            const description = $('meta[property="og:description"]').attr('content') || $('body').text();
            const jewelryMeta = parseJewelryDetails(name, description);

            if (name && (image_url || price)) {
              scrapedProducts.push({
                name,
                url: prodUrl,
                image_url,
                price,
                metal: jewelryMeta.metal,
                karat: jewelryMeta.karat,
                type: jewelryMeta.type,
                weight_grams: jewelryMeta.weight_grams,
                making_charge_percent: jewelryMeta.making_charge_percent
              });
            }
          } catch (e) {
            console.error(`Failed to scrape product page: ${prodUrl}`);
          }
        }
      }
    }

    // ==========================================
    // STRATEGY 3: DIRECT HTML & JSON-LD SCRAPER
    // ==========================================
    if (scrapedProducts.length === 0) {
      try {
        engineUsed = 'Direct Webpage AI Scraper';
        const res = await fetch(baseUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          cache: 'no-store'
        });
        const html = await res.text();
        const $ = cheerio.load(html);

        // 1. Look for Schema.org JSON-LD scripts
        $('script[type="application/ld+json"]').each((_, el) => {
          try {
            const jsonText = $(el).html();
            if (!jsonText) return;
            const json = JSON.parse(jsonText);
            const items = Array.isArray(json) ? json : [json];

            for (const item of items) {
              if (item['@type'] === 'Product') {
                const name = item.name || 'Jewelry Product';
                const image_url = makeAbsoluteUrl(domainOrigin, Array.isArray(item.image) ? item.image[0] : (item.image || ''));
                const offers = item.offers;
                let price: number | null = null;
                if (offers) {
                  const offerObj = Array.isArray(offers) ? offers[0] : offers;
                  if (offerObj && offerObj.price) price = Math.round(parseFloat(offerObj.price));
                }
                const jewelryMeta = parseJewelryDetails(name, item.description || '');
                scrapedProducts.push({
                  name,
                  url: item.url ? makeAbsoluteUrl(domainOrigin, item.url) : baseUrl,
                  image_url,
                  price,
                  metal: jewelryMeta.metal,
                  karat: jewelryMeta.karat,
                  type: jewelryMeta.type,
                  weight_grams: jewelryMeta.weight_grams,
                  making_charge_percent: jewelryMeta.making_charge_percent
                });
              }
            }
          } catch (err) {}
        });

        // 2. Scrape Product Cards from Page DOM if JSON-LD wasn't enough
        if (scrapedProducts.length === 0) {
          $('[class*="product"], [class*="item"], [class*="card"], article').each((_, el) => {
            const card = $(el);
            const name = card.find('h1, h2, h3, h4, [class*="title"], [class*="name"]').first().text().trim();
            const relativeImg = card.find('img').first().attr('src') || card.find('img').first().attr('data-src') || '';
            const image_url = makeAbsoluteUrl(domainOrigin, relativeImg);
            const priceText = card.find('[class*="price"], .amount').first().text();
            const priceMatch = priceText.match(/[\d,]+/);
            const price = priceMatch ? parseInt(priceMatch[0].replace(/,/g, '')) : null;
            const linkHref = card.find('a').first().attr('href') || baseUrl;
            const prodUrl = makeAbsoluteUrl(domainOrigin, linkHref);

            if (name && name.length > 3 && (image_url || price)) {
              const jewelryMeta = parseJewelryDetails(name, '');
              scrapedProducts.push({
                name,
                url: prodUrl,
                image_url,
                price,
                metal: jewelryMeta.metal,
                karat: jewelryMeta.karat,
                type: jewelryMeta.type,
                weight_grams: jewelryMeta.weight_grams,
                making_charge_percent: jewelryMeta.making_charge_percent
              });
            }
          });
        }
      } catch (e) {
        console.error('Direct scraper error:', e);
      }
    }

    // Deduplicate products by title
    const uniqueProductsMap = new Map();
    for (const prod of scrapedProducts) {
      if (!uniqueProductsMap.has(prod.name.toLowerCase())) {
        uniqueProductsMap.set(prod.name.toLowerCase(), prod);
      }
    }
    const finalProducts = Array.from(uniqueProductsMap.values()).slice(0, 30);

    if (finalProducts.length === 0) {
      return NextResponse.json({ 
        error: 'Could not extract products automatically from this URL. Make sure the website URL is active and contains jewelry products.' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      engine: engineUsed,
      total_found: finalProducts.length,
      scraped_count: finalProducts.length,
      products: finalProducts 
    });

  } catch (error: any) {
    console.error('Website auto-sync error:', error);
    return NextResponse.json({ error: error.message || 'Failed to scan website' }, { status: 500 });
  }
}
