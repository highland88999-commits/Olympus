const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

  try {
    const response = await fetch('https://api.printful.com/product-templates?limit=100', {
      headers: { 'Authorization': `Bearer ${PRINTFUL_API_KEY}` }
    });
    
    const data = await response.json();

    // PRINTFUL LOGIC ADJUSTMENT:
    // Templates are stored in data.result.items, not just data.result
    const templateList = data.result && data.result.items ? data.result.items : [];

    if (templateList.length === 0) {
        console.log("No templates found or API response structure changed:", data);
    }

    const products = templateList.map(item => ({
      id: item.id,
      name: item.title, 
      thumbnail_url: item.thumbnail_url,
      price: "95.00" 
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
    console.error("Critical Function Error:", error.message);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Server Error", details: error.message }) 
    };
  }
};
