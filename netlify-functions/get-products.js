const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

  try {
    // We pull from /product-templates to get ALL 71 pages of designs
    // even the ones not synced to Etsy
    const response = await fetch('https://api.printful.com/product-templates?limit=100', {
      headers: { 'Authorization': `Bearer ${PRINTFUL_API_KEY}` }
    });
    
    const data = await response.json();
    const allTemplates = data.result?.items || [];

    const products = allTemplates.map(item => ({
      id: item.id,
      name: item.title, 
      // Templates use thumbnail_url for the high-res mockup design
      images: [item.thumbnail_url || "https://www.printful.com/static/images/layout/default-product-image.png"],
      price: "95.00" 
    }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(products),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
