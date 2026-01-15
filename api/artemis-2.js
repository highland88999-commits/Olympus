const fs = require('fs');

async function runHarvest() {
    console.log("ARTEMIS PROTOCOL: Sequential Storytelling Sync Initialized...");
    let masterArchive = [];

    // We keep the loop at 10 to cover your sectors
    for (let i = 1; i <= 10; i++) {
        const sectorId = i.toString().padStart(2, '0');
        console.log(`[ACTION] Harvesting Sector ${sectorId}...`);

        try {
            // UPDATED: Now points to the new Vercel-style API path
            const response = await fetch(`https://2c30e.netlify.app/api/get-products-${sectorId}`);
            
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

    // UPDATED: Now saves to the /api folder for Vercel instead of Netlify
    fs.writeFileSync('./api/archive-map.json', JSON.stringify(manifest, null, 2));
    console.log(`ARCHIVE SECURED: ${masterArchive.length} items stored in the Vercel API folder.`);
}

runHarvest();
