const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

  try {
    // Increase limit to 100 to get a larger chunk of your 586 templates
    const response = await fetch('https://api.printful.com/product-templates?limit=100', {
      headers: { 'Authorization': `Bearer ${PRINTFUL_API_KEY}` }
    });
    
    const data = await response.json();
    const templateList = data.result && data.result.items ? data.result.items : [];

    const products = templateList.map(item => {
      const images = [];
      
      // Safety Net 1: Standard Thumbnail
      if (item.thumbnail_url) images.push(item.thumbnail_url);
      
      // Safety Net 2: The 'Preview' Slot (Crucial for templates without store-mockups)
      if (item.preview_url) images.push(item.preview_url);
      
      // Safety Net 3: Extra Mockups (The horizontal slider images)
      if (item.extra_mockups && Array.isArray(item.extra_mockups)) {
        item.extra_mockups.forEach(m => {
          if (m.mockup_url) images.push(m.mockup_url);
        });
      }

      // Final Safety Net: If Printful returns NO images, show a generic Shirt 
      // instead of a "Broken Image" icon.
      const finalImages = images.length > 0 ? images : ["https://www.printful.com/static/images/layout/default-product-image.png"];

      return {
        id: item.id,
        name: item.title, 
        images: finalImages,
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
    console.error("Critical Function Error:", error.message);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Server Error", details: error.message }) 
    };
  }
};
