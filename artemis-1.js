const fs = require('fs');

async function runHarvest() {
    console.log("ARTEMIS PROTOCOL: Direct Printful Sync Initialized...");
    let masterArchive = [];

    // Harvesting all 10 sectors (25 products per fetch = 250+ hoodies)
    for (let i = 1; i <= 10; i++) {
        console.log(`[ACTION] Harvesting Sector ${i} from Printful...`);

        try {
            // THE DIRECT LINK: Using your new API Key Secret
            const response = await fetch(`https://api.printful.com/store/products?offset=${(i-1)*25}&limit=25`, {
                headers: {
                    'Authorization': `Bearer ${process.env.PRINTFUL_API_KEY}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                // Printful returns products in a 'result' array
                if (data.result && Array.isArray(data.result)) {
                    masterArchive = masterArchive.concat(data.result);
                    console.log(`[SUCCESS] Sector ${i} added. Total items: ${masterArchive.length}`);
                }
            } else {
                console.error(`[ERROR] Printful rejected Sector ${i}: ${response.statusText}`);
            }
            
            // Short delay to respect Printful's rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.error(`[CRITICAL ERROR] Sector ${i} failed:`, error.message);
            process.exit(1); 
        }
    }

    const manifest = {
        status: "SYNCED",
        lastSync: new Date().toISOString(),
        totalItems: masterArchive.length,
        products: masterArchive 
    };

    // SAVING TO VERCEL FOLDER
    fs.writeFileSync('./api/archive-map.json', JSON.stringify(manifest, null, 2));
    console.log(`ARCHIVE SECURED: ${masterArchive.length} items stored in the /api folder.`);
}

runHarvest();
