const fetch = require('node-fetch');

exports.handler = async (event) => {
    // Dynamically find your site's URL
    const siteUrl = process.env.URL || `https://${event.headers.host}`;
    const API_ENDPOINT = `${siteUrl}/api/get-products`;
    
    console.log("ARTEMIS PROTOCOL: INITIATING ARCHIVE HARVEST...");

    try {
        // 1. Poke Page 0 to see how many hoodies we are dealing with today
        const initialRes = await fetch(`${API_ENDPOINT}?page=0`);
        const initialData = await initialRes.json();
        const totalItems = initialData.total;
        const totalPages = Math.ceil(totalItems / 4);

        console.log(`ARTEMIS: DETECTED ${totalItems} ITEMS. WALKING ${totalPages} PAGES...`);

        // 2. The Chronological Walk
        // We loop through every page. This forces 'get-products' to fetch 
        // and cache the details for every single hoodie.
        for (let i = 0; i < totalPages; i++) {
            // We don't even need the data back, we just need to 'poke' the API
            await fetch(`${API_ENDPOINT}?page=${i}`);
            
            // Log progress in Netlify every 20 pages
            if (i % 20 === 0) {
                console.log(`ARTEMIS: HARVESTED ${i}/${totalPages} BATCHES...`);
            }

            // Small delay (100ms) to prevent hitting Printful rate limits too hard
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log("ARTEMIS PROTOCOL: HARVEST COMPLETE. NEXUS SHIELD IS FULLY WARMED.");

        return {
            statusCode: 200,
            body: JSON.stringify({ 
                status: "Success", 
                batchesHarvested: totalPages,
                totalItems: totalItems
            })
        };

    } catch (error) {
        console.error("ARTEMIS CRITICAL ERROR:", error.message);
        return { statusCode: 500, body: "Artemis Link Interrupted" };
    }
};
