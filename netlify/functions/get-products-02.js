export default async function handler(req, res) {
  try {
    const response = await fetch(`https://api.printful.com/store/products?offset=100&limit=100`, {
      headers: { 'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}` }
    });
    const data = await response.json();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json({ 
      products: data.result || [], 
      total: data.paging ? data.paging.total : 0 
    });
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
}
