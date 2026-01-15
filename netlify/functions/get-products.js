const fetch = require('node-fetch');

exports.handler = async (event) => {
  // 1. Capture the page requested by the frontend
  const page = event.queryStringParameters.page || 0;
  
  // 2. Calculate the "jump" (Page 0 = 0, Page 1 = 100, Page 2 = 200)
  const offset = page * 100; 

  try {
    // 3. Pass that offset to Printful
    const response = await fetch(`https://api.printful.com/store/products?offset=${offset}&limit=100`, {
      headers: {
        'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`
      }
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        products: data.result,
        total: data.paging.total // This tells the frontend to keep asking until it hits 253
      })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
