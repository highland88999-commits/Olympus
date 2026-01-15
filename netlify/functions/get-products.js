const fetch = require('node-fetch');

// NEXUS SHIELD MEMORY - Stores data in RAM so it's fast
let productListCache = null;
let lastListFetch = 0;
const detailCache = new Map(); 
const LIST_TTL = 1000 * 60 * 15; // Cache for 15 minutes

exports.handler = async (event) => {
  const API_KEY = process.env.PRINTFUL_API_KEY;
  const { page = 0 } = event.queryStringParameters || {};
  
  // We set the batch size to 24. This fits perfectly on a 2-column mobile grid.
  const limit = 24; 
  const offset = parseInt(page) * limit;

  try {
    const now = Date.now();
    
    // 1. GATHER THE MASTER LIST
    // If we don't have the list or it's old, ask Printful for EVERYTHING (up to 100 items).
    if (!productListCache || (now - lastListFetch > LIST_TTL)) {
      console.log("NEXUS SHIELD: GATHERING MASTER ARCHIVE...");
      
      const res = await fetch(`https://api.printful.com/store/products?limit=100`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      });
      const data = await res.json();
      
      // Printful returns the list in 'data.result'
      productListCache = data.result; 
      lastListFetch = now;
    }

    // 2. SLICE THE BATCH
    // We take only the 24 hoodies needed for the current "page".
    const slice = productListCache.slice(offset, offset + limit);
    
    // If we ask for a page that doesn't exist, return empty
    if (slice.length === 0) {
      return { 
        statusCode: 200, 
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
        body: JSON.stringify({ products: [], total: productListCache.length }) 
      };
    }

    // 3. DEEP HARVEST (Get Images for these 24 hoodies)
    const detailedProducts = await Promise.all(slice.map(async (p) => {
      // Check if we already have the images in the Shield
      if (detailCache.has(p.id)) return detailCache.get(p.id);

      // Otherwise, fetch the individual product details
      const detailRes = await fetch(`https://api.printful.com/store/products/${p.id}`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      });
      const detailData = await detailRes.json();
      
      // Extract only the "Preview" image files
      const variantImages = detailData.result.sync_variants.flatMap(v => 
        v.files.filter(f => f.type === 'preview').map(f => f.preview_url)
      );

      const productInfo = {
        id: p.id,
        name: p.name,
        images: [...new Set(variantImages)], // Remove duplicates
        price: "95.00" 
      };

      // Store in memory so the next click is instant
      detailCache.set(p.id, productInfo);
      return productInfo;
    }));

    // 4. THE RESPONSE
    return {
      statusCode: 200,
      headers: { 
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        products: detailedProducts, 
        total: productListCache.length 
      })
    };
  } catch (e) {
    console.error("NEXUS SHIELD CRITICAL ERROR:", e.message);
    return { 
        statusCode: 500, 
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Nexus Link Interrupted" }) 
    };
  }
};
