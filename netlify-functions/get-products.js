// netlify/functions/get-products.js
import fetch from 'node-fetch';

exports.handler = async () => {
  const PRINTFUL_API_TOKEN = process.env.HOODIE_API_TOKEN;

nRGCM0jF4RswPp8Lsp7UMN354tvix07LuNFrLRim

  try {
    const response = await fetch('https://api.printful.com/store/products', {
      headers: {
        'Authorization': `Bearer ${PRINTFUL_API_TOKEN}`
      }
    });
    
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data.result), // Printful wraps data in a "result" object
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
