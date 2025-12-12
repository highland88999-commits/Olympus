const fetch = require('node-fetch'); 

// The function will securely access the key stored in Netlify's Environment Variables
const PRINTFUL_API_KEY = process.env.PRINTFUL_API_KEY; 

exports.handler = async (event, context) => {
    // 1. Check if the key is available
    if (!PRINTFUL_API_KEY) {
        console.error("Missing PRINTFUL_API_KEY environment variable.");
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: "Server Configuration Error: API key is missing." })
        };
    }
    
    // 2. Authorization Header for Printful API
    // We use Base64 encoding for the Basic authentication required by Printful
    const authHeader = `Basic ${Buffer.from(PRINTFUL_API_KEY).toString('base64')}`;
    const PRINTFUL_API_URL = 'https://api.printful.com/store/products'; 

    try {
        // 3. Securely Fetch data from Printful
        const response = await fetch(PRINTFUL_API_URL, {
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        // Check if Printful returned an error (e.g., key is invalid)
        if (data.code !== 200) {
            console.error(`Printful Error: ${data.result}`);
            return {
                statusCode: 401, // Unauthorized
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: data.result || "Authentication Failed. Check Printful API Key Value." })
            };
        }
        
        // 4. Process the data and prepare it for the HTML storefront
        const products = data.result.map(item => {
            // Find the image and a simple price for the first variant
            const firstVariant = item.variants && item.variants.length > 0 ? item.variants[0] : null;
            const imageUrl = firstVariant?.files?.[0]?.url || 'https://via.placeholder.com/200';
            
            // Placeholder price. If Printful provides a retail price, use it.
            const price = firstVariant?.retail_price || (Math.random() * 50 + 20).toFixed(2); 

            return {
                id: item.id,
                title: item.name,
                image_url: imageUrl, 
                price: price, 
                // IMPORTANT: You will update this later for your secure checkout
                checkout_url: `https://YOUR_EXTERNAL_SHOP.com/product/${item.id}` 
            };
        });

        // 5. Return the public data to the storefront (GoDaddy)
        return {
            statusCode: 200,
            headers: {
                // This header is essential to allow your GoDaddy site to read the data
                'Access-Control-Allow-Origin': '*', 
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(products)
        };

    } catch (error) {
        console.error("Function Execution Error:", error.message);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: 'Server Error during Printful call.' })
        };
    }
};
    
