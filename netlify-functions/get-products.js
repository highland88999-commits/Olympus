import fetch from 'node-fetch';

exports.handler = async () => {
  // This tells the code to look for the secret key you saved in Netlify
  const PRINTFUL_API_TOKEN = process.env.PRINTFUL_API_KEY;

  if (!PRINTFUL_API_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Missing PRINTFUL_API_KEY in Netlify settings." })
    };
  }

  try {
    const response = await fetch('https://api.printful.com/store/products', {
      headers: {
        'Authorization': `Bearer ${PRINTFUL_API_TOKEN}`
      }
    });
    
    const data = await response.json();

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      },
      body: JSON.stringify(data.result || []), 
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};
