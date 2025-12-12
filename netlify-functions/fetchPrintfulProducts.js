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
    // Using modern 'Bearer' token authentication
    const authHeader = `Bearer ${PRINTFUL_API_KEY}`;
    
    // Uses the universal /products endpoint with store_id=13451363 (Final Working URL)
    const PRINTFUL_API_URL = 'https://api.printful.com/products?store_id=13451363'; 

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
            
            const firstVariant = item.variants && item.variants.length > 0 ? item.variants[0] : null;

            // FIX 1: Use the main mockup image (item.main_image) for reliability
            const mainMockupUrl = item.main_image; 
            const imageUrl = mainMockupUrl || firstVariant?.files?.[0]?.url || 'https://via.placeholder.com/200';
            
            // FIX 2: Explicitly use the retail_price from the first variant
            const retailPrice = firstVariant?.retail_price;
            const price = retailPrice ? retailPrice : 'N/A'; // Show 'N/A' if price is missing, instead of a random number

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
