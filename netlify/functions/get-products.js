const fetch = require('node-fetch');

// NEXUS SHIELD MEMORY
let productListCache = null;
let lastListFetch = 0;
const detailCache = new Map(); // Stores the expensive image data for each product ID
const LIST_TTL = 1000 * 60 * 15; // List refresh: 15 mins (Artemis keeps it warm)

exports.handler = async (event) => {
  const API_KEY = process.env.PRINTFUL_API_KEY;
  const { page = 0 } = event.queryStringParameters || {};
  const limit = 4;
  const offset = parseInt(page) * limit;

  try {
    const now = Date.now();
    
    // 1. MASTER LIST RECOVERY (Recent -> Oldest)
    if (!productListCache || (now - lastListFetch > LIST_TTL)) {
      console.log("NEXUS SHIELD: REFRESHING MASTER ARCHIVE...");
      const res = await fetch(`https://api.printful.com/store/products`, {
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
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ products: [], total: productListCache.length }) 
      };
    }

    // 3. DEEP HARVEST (With Individual Item Shielding)
    const detailedProducts = await Promise.all(slice.map(async (p) => {
      // Check if this specific hoodie is already in the Detail Shield
      if (detailCache.has(p.id)) {
        return detailCache.get(p.id);
      }

      // If not, fetch it (Artemis usually triggers this in the background)
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
        price: "95.00" // Hardcoded as per your AXIOM standard
      };

      // Store in Detail Shield for next time
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
