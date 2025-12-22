const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

  try {
    // We fetch from /product-templates because the API block doesn't apply here
    const response = await fetch('https://api.printful.com/product-templates?limit=50', {
      headers: { 'Authorization': `Bearer ${PRINTFUL_API_KEY}` }
    });
    
    const data = await response.json();
    const templateList = data.result?.items || [];

    const products = templateList.map(item => {
      // In Templates, the high-res mockup is often in 'thumbnail_url' or 'image_url'
      // We also check for 'extra_mockups' for your horizontal slider
      const images = [];
      if (item.thumbnail_url) images.push(item.thumbnail_url);
      
      if (item.extra_mockups && Array.isArray(item.extra_mockups)) {
        item.extra_mockups.forEach(m => images.push(m.mockup_url));
      }

      return {
        id: item.id,
        name: item.title, 
        // Use a high-quality Printful placeholder if no image is found
        images: images.length > 0 ? images : ["https://www.printful.com/static/images/layout/default-product-image.png"],
        price: "95.00" 
      };
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(products),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: "Archive Retrieval Failed", details: error.message }) };
  }
};
