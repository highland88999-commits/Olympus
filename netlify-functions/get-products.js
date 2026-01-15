const fetch = require('node-fetch');

// --- THE NEXUS SHIELD (Global Cache) ---
let cachedStore = null;
let lastUpdate = 0;
const CACHE_LIFESPAN = 1000 * 60 * 60; // 1 Hour

exports.handler = async (event, context) => {
  const API_KEY = process.env.PRINTFUL_API_KEY;
  const STORE_ID = '17419146';
  const now = Date.now();

  // 1. If we have a fresh cache, serve it instantly (Speed: ~50ms)
  if (cachedStore && (now - lastUpdate < CACHE_LIFESPAN)) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(cachedStore),
    };
  }

  try {
    let allSyncProducts = [];
    let offset = 0;
    const limit = 100;
    let hasMore = true;

    // 2. Fetch products list
    while (hasMore) {
      const response = await fetch(
        `https://api.printful.com/store/products?store_id=${STORE_ID}&offset=${offset}&limit=${limit}`, 
        { headers: { 'Authorization': `Bearer ${API_KEY}` } }
      );
      const data = await response.json();
      const products = data.result || [];
      allSyncProducts = [...allSyncProducts, ...products];
      hasMore = (products.length === limit);
      offset += limit;
    }

    // 3. Parallel fetch detail for mockups (This is the heavy part)
    const productsWithMockups = await Promise.all(allSyncProducts.map(async (p) => {
      try {
        const detailRes = await fetch(`https://api.printful.com/store/products/${p.id}`, {
          headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        const detailData = await detailRes.json();
        
        // Get unique multi-angle previews
        const variantImages = detailData.result.sync_variants.flatMap(v => 
          v.files.filter(f => f.type === 'preview').map(f => f.preview_url)
        );

        return {
          id: p.id,
          name: p.name,
          images: variantImages.length > 0 ? [...new Set(variantImages)] : [p.thumbnail_url],
          price: "95.00"
        };
      } catch (err) {
        return { id: p.id, name: p.name, images: [p.thumbnail_url], price: "95.00" };
      }
    }));

    // 4. Update the Nexus Cache
    cachedStore = productsWithMockups;
    lastUpdate = now;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(productsWithMockups),
    };
  } catch (error) {
    // 5. Emergency Fallback: If Printful is down, serve the last known cache if it exists
    if (cachedStore) {
        return { statusCode: 200, body: JSON.stringify(cachedStore) };
    }
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
