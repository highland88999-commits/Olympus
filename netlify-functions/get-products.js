const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

  try {
    // Calling the Product Templates endpoint to scan all 586+ designs
    const response = await fetch('https://api.printful.com/product-templates', {
      headers: { 'Authorization': `Bearer ${PRINTFUL_API_KEY}` }
    });
    
    const data = await response.json();

    // Map the template results to our grid format
    const products = data.result.map(item => ({
      id: item.id,
      name: item.title, // Templates use 'title'
      thumbnail_url: item.thumbnail_url,
      price: "95.00" // Hardcoded as requested
    }));

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
      body: JSON.stringify({ error: "Failed to scan templates", details: error.message }) 
    };
  }
};
