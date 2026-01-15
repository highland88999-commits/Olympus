const fetch = require('node-fetch');

// NEXUS SHIELD MEMORY
let productListCache = null;
let lastListFetch = 0;
const detailCache = new Map(); 
const LIST_TTL = 1000 * 60 * 15; 

exports.handler = async (event) => {
  const API_KEY = process.env.PRINTFUL_API_KEY;
  const { page = 0 } = event.queryStringParameters || {};
  
  // FIX: Increased limit to 20 so your scroll bar shows more items at once
  const limit = 20; 
  const offset = parseInt(page) * limit;

  try {
    const now = Date.now();
    
    // 1. MASTER LIST RECOVERY
    if (!productListCache || (now - lastListFetch > LIST_TTL)) {
      console.log("NEXUS SHIELD: REFRESHING MASTER ARCHIVE...");
      
      // FIX: Added limit=100 here so the API actually "sees" all 20 of your hoodies
      const res = await fetch(`https://api.printful.com/store/products?limit=100`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      });
      const data = await res.json();
      productListCache = data.result; 
      lastListFetch = now;
    }

    // 2. IDENTIFY THE BATCH
    const slice = productListCache.slice(offset, offset + limit);
    
    if (slice.length === 0) {
      return { 
        statusCode: 200, 
        headers: { 
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({ products: [], total: productListCache.length }) 
      };
    }

    // 3. DEEP HARVEST
    const detailedProducts = await Promise.all(slice.map(async (p) => {
      if (detailCache.has(p.id)) {
        return detailCache.get(p.id);
      }

      const detailRes = await fetch(`https://api.printful.com/store/products/${p.id}`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      });
      const detailData = await detailRes.json();
      
      const variantImages = detailData.result.sync_variants.flatMap(v => 
        v.files.filter(f => f.type === 'preview').map(f => f.preview_url)
      );

      const productInfo = {
        id: p.id,
        name: p.name,
        images: [...new Set(variantImages)],
        price: "95.00" 
      };

      detailCache.set(p.id, productInfo);
      return productInfo;
    }));

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
