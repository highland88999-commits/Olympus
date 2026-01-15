const fetch = require('node-fetch');
exports.handler = async () => {
  console.log("Sector 6: Fetching 501-600");
  try {
    const response = await fetch(`https://api.printful.com/store/products?offset=500&limit=100`, {
      headers: { 'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}` }
    });
    const data = await response.json();
    return { statusCode: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ products: data.result, total: data.paging.total })
    };
  } catch (e) { return { statusCode: 500, body: JSON.stringify({ error: e.message }) }; }
};
