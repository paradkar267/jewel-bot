import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { parseStringPromise } from 'xml2js';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Ensure URL has http/https and no trailing slash
    let baseUrl = url.trim();
    if (!baseUrl.startsWith('http')) {
      baseUrl = 'https://' + baseUrl;
    }
    baseUrl = baseUrl.replace(/\/$/, '');

    let productUrls: string[] = [];

    // Try common sitemap locations
    const sitemapUrls = [
      `${baseUrl}/sitemap_products_1.xml`, // Shopify
      `${baseUrl}/sitemap.xml`, // Standard
      `${baseUrl}/product-sitemap.xml` // Yoast/WooCommerce
    ];

    let sitemapFound = false;
    for (const sitemapUrl of sitemapUrls) {
      try {
        const response = await fetch(sitemapUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (response.ok) {
          const xmlData = await response.text();
          const parsed = await parseStringPromise(xmlData);
          
          if (parsed.urlset && parsed.urlset.url) {
            productUrls = parsed.urlset.url
              .map((u: any) => u.loc[0])
              .filter((loc: string) => loc.includes('/product') || loc.includes('/item') || loc.includes('/p/'));
              
            // If it's Shopify, all links in sitemap_products_1.xml are products
            if (sitemapUrl.includes('sitemap_products')) {
              productUrls = parsed.urlset.url.map((u: any) => u.loc[0]);
            }
            sitemapFound = true;
            break;
          } else if (parsed.sitemapindex && parsed.sitemapindex.sitemap) {
            // It's a sitemap index, look for product sitemap
            const subSitemaps = parsed.sitemapindex.sitemap.map((s: any) => s.loc[0]);
            const productSitemap = subSitemaps.find((s: string) => s.includes('product'));
            if (productSitemap) {
              const subResp = await fetch(productSitemap);
              const subXml = await subResp.text();
              const subParsed = await parseStringPromise(subXml);
              if (subParsed.urlset && subParsed.urlset.url) {
                productUrls = subParsed.urlset.url.map((u: any) => u.loc[0]);
                sitemapFound = true;
                break;
              }
            }
          }
        }
      } catch (e) {
        console.log(`Failed to fetch sitemap: ${sitemapUrl}`);
      }
    }

    if (!sitemapFound || productUrls.length === 0) {
      return NextResponse.json({ error: 'Could not find a valid product sitemap on this website. Make sure it is a standard E-commerce site.' }, { status: 400 });
    }

    // Limit to 20 for preview performance
    const urlsToScrape = productUrls.slice(0, 20);
    const scrapedProducts = [];

    for (const prodUrl of urlsToScrape) {
      try {
        const res = await fetch(prodUrl, {
           headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
          }
        });
        const html = await res.text();
        const $ = cheerio.load(html);

        const name = $('meta[property="og:title"]').attr('content') || 
                     $('meta[name="title"]').attr('content') || 
                     $('h1').first().text() || 
                     $('title').text() || 'Unknown Product';
                     
        let image_url = $('meta[property="og:image"]').attr('content') || 
                        $('meta[name="twitter:image"]').attr('content') || '';
                        
        // Fallback for images if meta tags are missing (Client-Side Rendered apps)
        if (!image_url) {
           const firstImg = $('img[src*="product"], img[src*="item"], img').first().attr('src');
           if (firstImg) {
             image_url = firstImg.startsWith('http') ? firstImg : `${baseUrl}${firstImg.startsWith('/') ? '' : '/'}${firstImg}`;
           }
        }
        
        let price = $('meta[property="product:price:amount"]').attr('content') || 
                    $('meta[property="og:price:amount"]').attr('content') || 
                    '';
                    
        // If no meta price, try finding common price classes
        if (!price) {
          const priceText = $('.price, .product-price, [data-price], .offer-price').first().text();
          const match = priceText.match(/[\d,]+/);
          if (match) price = match[0].replace(/,/g, '');
        }

        // Only add if we found at least an image or it's definitely a product
        if (name && image_url) {
          scrapedProducts.push({
            name: name.replace(' - ' + baseUrl.replace('https://', ''), '').trim(),
            url: prodUrl,
            image_url: image_url,
            price_range_min: price ? parseInt(price) : null,
            price_range_max: price ? parseInt(price) : null,
            type: name.toLowerCase().includes('necklace') ? 'necklace' : 
                  name.toLowerCase().includes('ring') ? 'ring' : 
                  name.toLowerCase().includes('earring') ? 'earring' : 'other',
            metal: name.toLowerCase().includes('gold') ? 'gold' : 
                   name.toLowerCase().includes('silver') ? 'silver' : 'unknown',
            keywords: name.toLowerCase().split(' ').filter(w => w.length > 3)
          });
        }
      } catch (e) {
        console.error(`Failed to scrape ${prodUrl}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      total_found: productUrls.length,
      scraped_count: scrapedProducts.length,
      products: scrapedProducts 
    });

  } catch (error: any) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
