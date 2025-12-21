exports.handler = async () => {
  const PRINTFUL_API_TOKEN = process.env.PRINTFUL_API_KEY;
  const STORE_ID = '13451363';

  try {
    const response = await fetch(`https://api.printful.com/store/products?store_id=${STORE_ID}`, {
      headers: { 'Authorization': `Bearer ${PRINTFUL_API_TOKEN}` }
    });
    
    const data = await response.json();

    // This part is the fix: It precisely finds the product list
    const result = data.result || data; 
    const productsList = Array.isArray(result) ? result : [];

    const products = productsList.map(p => ({
      id: p.id,
      name: p.name,
      thumbnail_url: p.thumbnail_url
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
      body: JSON.stringify({ error: "Backend error: " + error.message }) 
    };
  }
};
