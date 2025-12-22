const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

  try {
    const response = await fetch('https://api.printful.com/product-templates?limit=100', {
      headers: { 'Authorization': `Bearer ${PRINTFUL_API_KEY}` }
    });
    
    const data = await response.json();
    const templateList = data.result && data.result.items ? data.result.items : [];

    const products = templateList.map(item => {
      // Collect all available images into an array
      const images = [];
      if (item.thumbnail_url) images.push(item.thumbnail_url);
      
      // Add extra mockups if they exist
      if (item.extra_mockups) {
        item.extra_mockups.forEach(m => images.push(m.mockup_url));
      }

      return {
        id: item.id,
        name: item.title, 
        // We pass the whole array of images to the frontend
        images: images.length > 0 ? images : ["https://via.placeholder.com/300?text=Axiom+Design"],
        price: "95.00" 
      };
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(products),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
