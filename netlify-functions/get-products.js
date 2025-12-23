const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const API_KEY = process.env.PRINTFUL_API_KEY;
  const STORE_ID = '17419146';

  try {
    // 1. Fetch all products from the store
    const response = await fetch(`https://api.printful.com/store/products?store_id=${STORE_ID}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    const data = await response.json();
    const syncProducts = data.result || [];

    // 2. For each product, fetch its variants to get all mockups
    const productsWithMockups = await Promise.all(syncProducts.map(async (p) => {
      const detailRes = await fetch(`https://api.printful.com/store/products/${p.id}`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
      });
      const detailData = await detailRes.json();
      
      // Collect all unique preview images from the variants (Front, Back, etc.)
      const variantImages = detailData.result.sync_variants.flatMap(v => 
        v.files.filter(f => f.type === 'preview').map(f => f.preview_url)
      );

      // Filter for unique URLs only
      const uniqueImages = [...new Set(variantImages)];

      return {
        id: p.id,
        name: p.name,
        // Fallback to thumbnail if no variants found
        images: uniqueImages.length > 0 ? uniqueImages : [p.thumbnail_url],
        price: "95.00"
      };
    }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(productsWithMockups),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
