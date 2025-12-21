exports.handler = async () => {
  const PRINTFUL_API_TOKEN = process.env.PRINTFUL_API_KEY;
  const STORE_ID = process.env.PRINTFUL_STORE_ID;

  if (!PRINTFUL_API_TOKEN || !STORE_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Configuration Error: Missing API Key or Store ID." })
    };
  }

  let allProducts = [];
  let offset = 0;
  const limit = 100; // Max per page
  let hasMore = true;

  try {
    // 1. PAGINATION LOOP: Get every single product ID first
    while (hasMore) {
      const listUrl = `https://api.printful.com/store/products?store_id=${STORE_ID}&offset=${offset}&limit=${limit}`;
      const listRes = await fetch(listUrl, {
        headers: { 'Authorization': `Bearer ${PRINTFUL_API_TOKEN}` }
      });
      const listData = await listRes.json();

      if (listData.code !== 200) throw new Error(listData.result || "API Error");

      const batch = listData.result || [];
      allProducts = [...allProducts, ...batch];

      if (batch.length < limit) {
        hasMore = false;
      } else {
        offset += limit;
      }
    }

    // 2. INTERCEPTOR: Get detailed retail prices for every product found
    const finalProducts = await Promise.all(allProducts.map(async (p) => {
      try {
        const detailRes = await fetch(`https://api.printful.com/store/products/${p.id}?store_id=${STORE_ID}`, {
          headers: { 'Authorization': `Bearer ${PRINTFUL_API_TOKEN}` }
        });
        const detailData = await detailRes.json();
        
        // Grab the price from the first available variant
        const variants = detailData.result.sync_variants || [];
        const retailPrice = variants.length > 0 ? variants[0].retail_price : "0.00";

        return {
          id: p.id,
          name: p.name,
          thumbnail_url: p.thumbnail_url,
          price: retailPrice
        };
      } catch (err) {
        return { id: p.id, name: p.name, thumbnail_url: p.thumbnail_url, price: "N/A" };
      }
    }));

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      },
      body: JSON.stringify(finalProducts), 
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Repository Sync Failed: " + error.message }) 
    };
  }
};
