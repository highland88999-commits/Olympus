const fetch = require('node-fetch');

exports.handler = async (event) => {
    // Force the live URL so Artemis doesn't get lost
    const siteUrl = 'https://darling-moonbeam-c2c30e.netlify.app';
    const API_ENDPOINT = `${siteUrl}/.netlify/functions/get-products`;
    
    console.log("ARTEMIS PROTOCOL: INITIATING ARCHIVE HARVEST...");

    try {
        // 1. Fetch the first page to see the total count
        const initialRes = await fetch(`${API_ENDPOINT}?limit=100`);
        const initialData = await initialRes.json();
        
        // If your get-products returns a 'products' array, use that length
        const itemsFound = initialData.products ? initialData.products.length : 0;

        console.log(`ARTEMIS: DETECTED ${itemsFound} ITEMS.`);

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                status: "Success", 
                totalItems: itemsFound,
                data: initialData
            })
        };

    } catch (error) {
        console.error("ARTEMIS CRITICAL ERROR:", error.message);
        return { statusCode: 500, body: "Artemis Link Interrupted" };
    }
};
