import fetch from 'node-fetch';

exports.handler = async () => {
  // We use PRINTFUL_API_KEY to match your Netlify settings
  const PRINTFUL_API_TOKEN = process.env.PRINTFUL_API_KEY;

  if (!PRINTFUL_API_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing API Token in Netlify settings." })
    };
  }

  try {
    const response = await fetch('https://api.printful.com/store/products', {
      headers: {
        'Authorization': `Bearer ${PRINTFUL_API_TOKEN}`
      }
    });
    
    const data = await response.json();

    // Check if Printful returned an error (like invalid token)
    if (data.code !== 200) {
      return {
        statusCode: data.code,
        body: JSON.stringify({ error: data.result || "Printful API Error" })
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data.result), 
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};
