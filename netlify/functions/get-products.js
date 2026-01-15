const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Capture the page number from the frontend request (defaults to 0)
  const page = event.queryStringParameters.page || 0;
  const offset = page * 100; 

  try {
    const response = await fetch(`https://api.printful.com/store/products?offset=${offset}&limit=100`, {
      headers: {
        'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch from Printful');
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        products: data.result,
        total: data.paging.total // This allows the frontend to know there are 586 total
      })
    };
  } catch (error) {
    console.error("AXIOM HARVEST ERROR:", error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};
