const axios = require('axios');

exports.handler = async (event, context) => {
  // Ensure these are set in your Netlify Environment Variables
  const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
  const STORE_ID = process.env.PRINTFUL_STORE_ID; 

  if (!PRINTFUL_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "API Key missing" }) };
  }

  try {
    // Calling the Product Templates endpoint
    const response = await axios.get('https://api.printful.com/product-templates', {
      headers: { 
        'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
        'X-Store-Id': STORE_ID // Optional: ensures it pulls from the correct store
      }
    });

    // We map the templates to the format our HTML grid expects
    const products = response.data.result.map(item => ({
      id: item.id,
      name: item.title, 
      thumbnail_url: item.thumbnail_url,
      price: "95.00" 
    }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(products),
    };
  } catch (error) {
    console.error("Printful API Error:", error.response ? error.response.data : error.message);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Failed to fetch archives", details: error.message }) 
    };
  }
};
