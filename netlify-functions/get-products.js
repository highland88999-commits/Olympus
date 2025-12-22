const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const API_KEY = process.env.PRINTFUL_API_KEY;
  const STORE_ID = '17419146'; 

  try {
    const response = await fetch(`https://api.printful.com/store/products?store_id=${STORE_ID}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    
    const data = await response.json();
    
    // Safety check to ensure we got results
    if (!data.result) {
      throw new Error("No products found in this store.");
    }

    const products = data.result.map(p => ({
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
    console.error("Store Fetch Error:", error.message);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Failed to load Store products." }) 
    };
  }
};
