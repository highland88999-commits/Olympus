const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const API_KEY = process.env.PRINTFUL_API_KEY;

  try {
    const listRes = await fetch('https://api.printful.com/product-templates?limit=100', {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    const listData = await listRes.json();
    const templates = listData.result.items;

    let completedCount = 0;
    let pendingCount = 0;

    const products = templates.map(item => {
      const isBlackBox = !item.thumbnail_url || item.thumbnail_url.includes('default-product-image');
      
      if (isBlackBox) {
        pendingCount++;
      } else {
        completedCount++;
      }

      return {
        id: item.id,
        name: item.title,
        status: isBlackBox ? "pending" : "ready",
        image: item.thumbnail_url || "loading-spinner.gif"
      };
    });

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        queue: {
          total: templates.length,
          ready: completedCount,
          processing: pendingCount,
          percent_complete: Math.round((completedCount / templates.length) * 100)
        },
        items: products
      }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
