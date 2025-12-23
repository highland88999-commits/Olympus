const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const API_KEY = process.env.PRINTFUL_API_KEY;
  const STORE_ID = '17419146';

  try {
    let allSyncProducts = [];
    let offset = 0;
    const limit = 100; // Max allowed per request
    let hasMore = true;

    // 1. Fetch ALL products using pagination
    while (hasMore) {
      const response = await fetch(
        `https://api.printful.com/store/products?store_id=${STORE_ID}&offset=${offset}&limit=${limit}`, 
        { headers: { 'Authorization': `Bearer ${API_KEY}` } }
      );
      
      const data = await response.json();
      const products = data.result || [];
      allSyncProducts = [...allSyncProducts, ...products];

      // Check if there are more products to fetch
      if (products.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }
    }

    // 2. Map through every product found to get multi-angle mockups
    const productsWithMockups = await Promise.all(allSyncProducts.map(async (p) => {
      try {
        const detailRes = await fetch(`https://api.printful.com/store/products/${p.id}`, {
          headers: { 'Authorization': `Bearer ${API_KEY}` }
        });
        const detailData = await detailRes.json();
        
        // Extracting all unique preview images (Front, Back, etc.)
        const variantImages = detailData.result.sync_variants.flatMap(v => 
          v.files.filter(f => f.type === 'preview').map(f => f.preview_url)
        );

        const uniqueImages = [...new Set(variantImages)];

        return {
          id: p.id,
          name: p.name,
          images: uniqueImages.length > 0 ? uniqueImages : [p.thumbnail_url],
          price: "95.00" // Hardcoded as per your request
        };
      } catch (err) {
        // If one product fails, return a basic version so the whole store doesn't crash
        return {
          id: p.id,
          name: p.name,
          images: [p.thumbnail_url],
          price: "95.00"
        };
      }
    }));

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json", 
        "Access-Control-Allow-Origin": "*" 
      },
      body: JSON.stringify(productsWithMockups),
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};
