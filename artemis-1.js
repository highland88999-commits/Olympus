const fs = require('fs');

async function runHarvest() {
    console.log("ARTEMIS PROTOCOL: Vercel-Ready Sync Initialized...");
    let masterArchive = [];

    // Harvesting all 10 sectors to get your 253 hoodies
    for (let i = 1; i <= 10; i++) {
        const sectorId = i.toString().padStart(2, '0');
        console.log(`[ACTION] Harvesting Sector ${sectorId}...`);

        try {
            // FIX: Pointing back to the original source so totalItems isn't 0
            const response = await fetch(`https://2c30e.netlify.app/.netlify/functions/get-products-${sectorId}`);
            
            if (response.ok) {
                const data = await response.json();
                if (data.products && Array.isArray(data.products)) {
                    masterArchive = masterArchive.concat(data.products);
                    console.log(`[SUCCESS] Sector ${sectorId} added. Total items: ${masterArchive.length}`);
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.error(`[CRITICAL ERROR] Sector ${sectorId} failed:`, error.message);
            process.exit(1); 
        }
    }

    const manifest = {
        status: "SYNCED",
        lastSync: new Date().toISOString(),
        totalItems: masterArchive.length,
        products: masterArchive 
    };

    // SAVING TO VERCEL FOLDER: This ensures the 253 items show up on the new site
    fs.writeFileSync('./api/archive-map.json', JSON.stringify(manifest, null, 2));
    console.log(`ARCHIVE SECURED: ${masterArchive.length} items stored in the /api folder.`);
}

runHarvest();
