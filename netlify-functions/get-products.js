exports.handler = async () => {
  // 1. Pull settings from your Netlify Environment Variables
  const PRINTFUL_API_TOKEN = process.env.PRINTFUL_API_KEY;
  const STORE_ID = process.env.PRINTFUL_STORE_ID;

  // Safety Check: If variables are missing, stop and explain why
  if (!PRINTFUL_API_TOKEN || !STORE_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing PRINTFUL_API_KEY or PRINTFUL_STORE_ID in Netlify settings." })
    };
  }

  let allProducts = [];
  let offset = 0;
  const limit = 100; // Fetching 100 at a time (Printful's max) to be fast
  let hasMore = true;

  try {
    // 2. The Loop: This keeps running until we have all 586 products
    while (hasMore) {
      const url = `https://api.printful.com/store/products?store_id=${STORE_ID}&offset=${offset}&limit=${limit}`;
      
      const response = await fetch(url, {
        headers: { 
          'Authorization': `Bearer ${PRINTFUL_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.code !== 200) {
        throw new Error(data.result || "Printful API Error");
      }

      // Add the current batch of products to our big list
      const batch = data.result || [];
      allProducts = [...allProducts, ...batch];

      // Check if there are more products to fetch
      if (batch.length < limit) {
        hasMore = false; // We reached the end
      } else {
        offset += limit; // Move to the next "page" of products
      }
    }

    // 3. Clean the data: Only send what your website needs (ID, Name, Image)
    const simplifiedProducts = allProducts.map(p => ({
      id: p.id,
      name: p.name,
      thumbnail_url: p.thumbnail_url
    }));

    // 4. Send the final list to your website
    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // Allows your site to read this data
      },
      body: JSON.stringify(simplifiedProducts), 
    };

  } catch (error) {
    console.error("Build Error:", error.message);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Backend error: " + error.message }) 
    };
  }
};
