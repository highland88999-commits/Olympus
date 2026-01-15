const fetch = require('node-fetch');

exports.handler = async (event) => {
    // UPDATED: Use the correct internal path
    const siteUrl = 'https://darling-moonbeam-c2c30e.netlify.app';
    const API_ENDPOINT = `${siteUrl}/.netlify/functions/get-products`;
    
    console.log("ARTEMIS PROTOCOL: INITIATING ARCHIVE HARVEST...");

    try {
        // Fetch a large batch at once to "warm up" the store cache
        const res = await fetch(`${API_ENDPOINT}?page=0`);
        const data = await res.json();
        
        console.log(`ARTEMIS: HARVESTED ${data.products.length} ITEMS FROM ARCHIVE.`);

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "Success", totalItems: data.total })
        };
    } catch (error) {
        console.error("ARTEMIS CRITICAL ERROR:", error.message);
        return { statusCode: 500, body: "Artemis Link Interrupted" };
    }
};
