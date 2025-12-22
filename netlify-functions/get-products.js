const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;
  // Your specific OlympusByMerlin Store ID
  const STORE_ID = "13451363"; 

  try {
    // Fetching Sync Products for the Etsy integration
    const response = await fetch(`https://api.printful.com/store/products?store_id=${STORE_ID}`, {
      headers: { 'Authorization': `Bearer ${PRINTFUL_API_KEY}` }
    });
    
    const data = await response.json();
    
    // Check if the store is reachable via API
    if (data.code !== 200) {
        return { 
            statusCode: data.code, 
            body: JSON.stringify({ error: "Store inaccessible", message: data.result }) 
        };
    }

    const syncProducts = data.result || [];

    const products = syncProducts.map(item => ({
      id: item.id,
      name: item.name, 
      // Sync products use thumbnail_url for the high-res mockup preview
      images: [item.thumbnail_url || "https://www.printful.com/static/images/layout/default-product-image.png"],
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
      body: JSON.stringify({ error: "Failed to pull synced data", details: error.message }) 
    };
  }
};
