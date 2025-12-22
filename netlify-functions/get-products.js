const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const API_KEY = process.env.PRINTFUL_API_KEY;

  try {
    // 1. Fetch your 586 templates
    const listRes = await fetch('https://api.printful.com/product-templates?limit=100', {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    const listData = await listRes.json();
    const templates = listData.result.items;

    // 2. Loop through and check for "Black Boxes"
    const products = await Promise.all(templates.map(async (item) => {
      let imageUrl = item.thumbnail_url;

      // If the image is the black placeholder, trigger a fresh mockup task
      if (!imageUrl || imageUrl.includes('default-product-image')) {
        try {
          const taskRes = await fetch(`https://api.printful.com/mockup-generator/create-task/140`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${API_KEY}` },
            body: JSON.stringify({
              variant_ids: [10374], // Default 'Large' variant for the hoodie
              format: "jpg",
              template_id: item.id // This inherits your manual pocket alignment!
            })
          });
          const taskData = await taskRes.json();
          // We grab the new URL from the generation task
          imageUrl = taskData.result?.mockups?.[0]?.extra_mockups?.[0]?.mockup_url || imageUrl;
        } catch (e) { console.error("Mockup Task Failed", e); }
      }

      return {
        id: item.id,
        name: item.title,
        images: [imageUrl],
        price: "95.00"
      };
    }));

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(products),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
