import fetch from 'node-fetch';

exports.handler = async () => {
  // MATCHING YOUR NETLIFY KEY: PRINTFUL_API_KEY
  const PRINTFUL_API_TOKEN = process.env.PRINTFUL_API_KEY;

  if (!PRINTFUL_API_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Key mismatch: Code expects PRINTFUL_API_KEY" })
    };
  }

  try {
    const response = await fetch('https://api.printful.com/store/products', {
      headers: { 'Authorization': `Bearer ${PRINTFUL_API_TOKEN}` }
    });
    
    const data = await response.json();

    // Mapping the data for your HTML storefront
    const products = (data.result || []).map(p => ({
      id: p.id,
      name: p.name,
      thumbnail_url: p.thumbnail_url,
      price: "View Item" 
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
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
