const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

  try {
    // 1. Fetch from Product Templates (the design library)
    // This endpoint is NOT restricted by the "Manual Order" block you saw.
    const response = await fetch('https://api.printful.com/product-templates?limit=100', {
      headers: { 'Authorization': `Bearer ${PRINTFUL_API_KEY}` }
    });
    
    const data = await response.json();
    const templateList = data.result?.items || [];

    const products = templateList.map(item => {
      const images = [];
      
      // Safety Net 1: Use the Template's internal high-res thumbnail
      if (item.thumbnail_url) images.push(item.thumbnail_url);
      
      // Safety Net 2: Check for a direct mockup preview URL
      if (item.preview_url) images.push(item.preview_url);
      
      // Safety Net 3: Pull any extra mockups (like different angles)
      if (item.extra_mockups && Array.isArray(item.extra_mockups)) {
        item.extra_mockups.forEach(m => {
          if (m.mockup_url) images.push(m.mockup_url);
        });
      }

      return {
        id: item.id,
        name: item.title, 
        // If absolutely no design is found, use a clean placeholder
        images: images.length > 0 ? images : ["https://via.placeholder.com/600x600?text=Design+Pending"],
        price: "95.00" 
      };
    });

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      },
      body: JSON.stringify(products),
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Backdoor Fetch Failed", details: error.message }) 
    };
  }
};
