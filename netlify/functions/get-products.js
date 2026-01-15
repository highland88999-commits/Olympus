const fetch = require('node-fetch');

exports.handler = async (event) => {
  // Capture requested page; Page 0 = items 0-100, Page 1 = items 101-200, etc.
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
      throw new Error(data.error || 'Printful link severed');
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        products: data.result,
        total: data.paging.total // Sends '253' so the frontend knows to keep digging
      })
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};
