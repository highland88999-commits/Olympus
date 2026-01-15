const fetch = require('node-fetch');

exports.handler = async (event) => {
  // 1. Capture the page number from the frontend request (defaults to 0)
  const page = event.queryStringParameters.page || 0;
  
  // 2. Calculate the offset (Set 0 = 0, Set 1 = 100, Set 2 = 200...)
  const offset = page * 100; 

  try {
    // 3. Call Printful API with the specific window of 100 items
    const response = await fetch(`https://api.printful.com/store/products?offset=${offset}&limit=100`, {
      headers: {
        'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Printful API responded with ${response.status}`);
    }

    const data = await response.json();

    // 4. Return the specific batch and the total count back to the frontend
    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // Allows the frontend to communicate
      },
      body: JSON.stringify({
        products: data.result,
        total: data.paging.total // This tells the frontend if there are 253 or 586 total
      })
    };
  } catch (error) {
    console.error("Harvester Error:", error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};
