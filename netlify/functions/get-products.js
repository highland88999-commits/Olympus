const axios = require('axios');

exports.handler = async (event) => {
  // Capture the page number from the frontend request (defaults to 0)
  const page = event.queryStringParameters.page || 0;
  const offset = page * 100; 

  try {
    const response = await axios.get('https://api.printful.com/store/products', {
      headers: {
        'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`
      },
      params: {
        offset: offset,
        limit: 100
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        products: response.data.result,
        total: response.data.paging.total // This tells the frontend there are 586 total
      })
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};
