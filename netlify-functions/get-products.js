exports.handler = async (event, context) => {
  const API_KEY = process.env.PRINTFUL_API_KEY;

  try {
    // 1. Get the list of 586 templates
    const listRes = await fetch('https://api.printful.com/product-templates?limit=100', {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    const listData = await listRes.json();
    
    // 2. Map them into your Axiom Repository format
    const products = listData.result.items.map(template => {
      return {
        id: template.id,
        name: template.title,
        // Using the Template's thumbnail ensures pocket alignment is preserved
        images: [template.thumbnail_url], 
        price: "95.00"
      };
    });

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(products),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
