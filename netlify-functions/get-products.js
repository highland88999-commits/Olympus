exports.handler = async () => {
  const PRINTFUL_API_TOKEN = process.env.PRINTFUL_API_KEY;
  const STORE_ID = process.env.PRINTFUL_STORE_ID;

  if (!PRINTFUL_API_TOKEN || !STORE_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing API Key or Store ID." })
    };
  }

  try {
    // 1. Fetch the list of products from your Manual Store
    const response = await fetch(`https://api.printful.com/store/products?store_id=${STORE_ID}`, {
      headers: { 'Authorization': `Bearer ${PRINTFUL_API_TOKEN}` }
    });
    
    const data = await response.json();
    const productsList = data.result || [];

    // 2. THE INTERCEPTOR: Fetch details for each product to find the RETAIL PRICE
    const detailedProducts = await Promise.all(productsList.map(async (p) => {
      const detailResponse = await fetch(`https://api.printful.com/store/products/${p.id}?store_id=${STORE_ID}`, {
        headers: { 'Authorization': `Bearer ${PRINTFUL_API_TOKEN}` }
      });
      const detailData = await detailResponse.json();
      
      // Get the first variant to find the price you set
      const variants = detailData.result.sync_variants || [];
      const price = variants.length > 0 ? variants[0].retail_price : "0.00";

      return {
        id: p.id,
        name: p.name,
        thumbnail_url: p.thumbnail_url,
        price: price // Now showing YOUR price, not Printful's cost
      };
    }));

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      },
      body: JSON.stringify(detailedProducts), 
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Backend error: " + error.message }) 
    };
  }
};
