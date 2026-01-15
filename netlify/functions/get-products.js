const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Capture page from frontend or default to 0
  const page = event.queryStringParameters.page || 0;
  // Calculate jump point (0, 100, 200, etc.)
  const offset = page * 100; 

  try {
    const response = await fetch(`https://api.printful.com/store/products?offset=${offset}&limit=100`, {
      headers: {
        'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Printful API Error: ${response.status}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      },
      body: JSON.stringify({
        products: data.result,
        total: data.paging.total 
      })
    };
  } catch (error) {
    console.error("Fetch Error:", error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};
