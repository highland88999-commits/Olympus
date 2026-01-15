const fetch = require('node-fetch');

exports.handler = async (event) => {
    // Determine where the site is hosted
    const siteUrl = process.env.URL || 'https://your-site-name.netlify.app';
    const API_ENDPOINT = `${siteUrl}/api/get-products`;
    
    console.log("ARTEMIS PROTOCOL: STARTING HARVEST...");

    try {
        // 1. Poke Page 0 to get the total count
        const initialRes = await fetch(`${API_ENDPOINT}?page=0`);
        const initialData = await initialRes.json();
        const totalItems = initialData.total;
        const totalPages = Math.ceil(totalItems / 4);

        console.log(`ARTEMIS: DETECTED ${totalItems} ITEMS. HARVESTING ${totalPages} PAGES...`);

        // 2. Chronological Walk through all pages
        // We use a loop with a small delay to avoid hitting Printful rate limits
        for (let i = 0; i < totalPages; i++) {
            await fetch(`${API_ENDPOINT}?page=${i}`);
            
            // Log progress every 10 pages to keep logs clean
            if (i % 10 === 0) console.log(`ARTEMIS: HARVESTED PAGE ${i}/${totalPages}`);
            
            // 200ms rest between calls to stay under the radar
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ status: "Success", itemsHarvested: totalItems })
        };

    } catch (error) {
        console.error("ARTEMIS CRITICAL ERROR:", error);
        return { statusCode: 500, body: error.message };
    }
};
