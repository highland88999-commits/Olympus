const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

  try {
    // Calling the Product Templates endpoint to scan all designs in the account
    const response = await fetch('https://api.printful.com/product-templates', {
      headers: { 'Authorization': `Bearer ${PRINTFUL_API_KEY}` }
    });
    
    const data = await response.json();

    if (!data.result) {
        throw new Error(data.error || "No templates found");
    }

    // Map the template results to our grid format
    // Templates use 'title' instead of 'name'
    const products = data.result.map(item => ({
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
    console.error("Fetch Error:", error.message);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Failed to scan templates", details: error.message }) 
    };
  }
};
