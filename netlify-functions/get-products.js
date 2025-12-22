const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

  try {
    // We target product-templates to bypass the Etsy API restriction
    const response = await fetch('https://api.printful.com/product-templates?limit=100', {
      headers: { 'Authorization': `Bearer ${PRINTFUL_API_KEY}` }
    });
    
    const data = await response.json();
    const templateList = data.result?.items || [];

    const products = templateList.map(item => {
      const images = [];
      
      // Best mockup image for templates
      if (item.thumbnail_url) images.push(item.thumbnail_url);
      
      // Secondary preview image (often higher resolution)
      if (item.preview_url) images.push(item.preview_url);
      
      // Additional mockup angles if you've generated them
      if (item.extra_mockups && Array.isArray(item.extra_mockups)) {
        item.extra_mockups.forEach(m => {
          if (m.mockup_url) images.push(m.mockup_url);
        });
      }

      return {
        id: item.id,
        name: item.title, 
        // Fallback to a Printful placeholder if no images exist
        images: images.length > 0 ? images : ["https://www.printful.com/static/images/layout/default-product-image.png"],
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
      body: JSON.stringify({ error: "Failed to fetch images", details: error.message }) 
    };
  }
};
