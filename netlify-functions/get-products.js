const fetch = require('node-fetch');

let productListCache = null;
let lastListFetch = 0;
const LIST_TTL = 1000 * 60 * 5; // Refresh list every 5 mins

exports.handler = async (event) => {
  const API_KEY = process.env.PRINTFUL_API_KEY;
  const { page = 0 } = event.queryStringParameters || {};
  const limit = 4; // Your requested batch size
  const offset = parseInt(page) * limit;

  try {
    const now = Date.now();
    
    // 1. Get/Refresh the Master List (Sorted Recent -> Oldest)
    if (!productListCache || (now - lastListFetch > LIST_TTL)) {
      const res = await fetch(`https://api.printful.com/store/products`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      });
      const data = await res.json();
      // Printful returns recent items first by default, but we ensure it here
      productListCache = data.result; 
      lastListFetch = now;
    }

    // 2. Identify the 4-item slice
    const slice = productListCache.slice(offset, offset + limit);
    
    if (slice.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ products: [], total: productListCache.length }) };
    }

    // 3. Deep Harvest for these 4 specific items
    const detailedProducts = await Promise.all(slice.map(async (p) => {
      const detailRes = await fetch(`https://api.printful.com/store/products/${p.id}`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      });
      const detailData = await detailRes.json();
      const variantImages = detailData.result.sync_variants.flatMap(v => 
        v.files.filter(f => f.type === 'preview').map(f => f.preview_url)
      );

      return {
        id: p.id,
        name: p.name,
        images: [...new Set(variantImages)],
        price: "95.00"
      };
    }));

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ 
        products: detailedProducts, 
        total: productListCache.length 
      })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
