const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const API_KEY = process.env.PRINTFUL_API_KEY;
  const STORE_ID = '17419146'; 

  try {
    const response = await fetch(`https://api.printful.com/store/products?store_id=${STORE_ID}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    
    if (!response.ok) throw new Error("Printful API Connection Failed");

    const data = await response.json();
    const syncProducts = data.result || [];

    // This matches p.thumbnail_url in your HTML
    const products = syncProducts.map(p => ({
      id: p.id,
      name: p.name,
      thumbnail_url: p.thumbnail_url, 
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
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Failed to load Store products." }) 
    };
  }
};
