const axios = require('axios');

exports.handler = async (event, context) => {
  const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY;

  try {
    // We are now calling the PRODUCT-TEMPLATES endpoint
    const response = await axios.get('https://api.printful.com/product-templates', {
      headers: { 'Authorization': `Bearer ${PRINTFUL_API_KEY}` }
    });

    // We map the templates so the HTML still recognizes "name", "thumbnail_url", etc.
    const products = response.data.result.map(item => ({
      id: item.id,
      name: item.title, // Templates use 'title' instead of 'name'
      thumbnail_url: item.thumbnail_url,
      price: "95.00" // Since templates don't always have a retail price set
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(products),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
