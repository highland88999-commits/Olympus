exports.handler = async () => {
  // Use the key you set in Netlify Environment Variables
  const PRINTFUL_API_TOKEN = process.env.PRINTFUL_API_KEY;

  try {
    // Netlify provides 'fetch' automatically; no 'import' needed
    const response = await fetch('https://api.printful.com/store/products', {
      headers: { 'Authorization': `Bearer ${PRINTFUL_API_TOKEN}` }
    });
    
    const data = await response.json();

    // Check if Printful actually sent products
    if (!data.result) {
        return { statusCode: 200, body: JSON.stringify([]) };
    }

    // Convert the data into a simple list for the website
    const products = data.result.map(p => ({
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
      body: JSON.stringify({ error: "Backend Error: " + error.message }) 
    };
  }
};
