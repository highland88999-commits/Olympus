const fs = require('fs');

async function runHarvest() {
    console.log("ARTEMIS PROTOCOL: Sequential Storytelling Sync Initialized...");
    
    // This array will hold everything in the exact order we pull it
    let masterArchive = [];

    // 1. Pulling in strict numerical order (01 -> 10)
    for (let i = 1; i <= 10; i++) {
        const sectorId = i.toString().padStart(2, '0');
        console.log(`HARVESTING SECTOR ${sectorId}...`);

        try {
            const response = await fetch(`https://2c30e.netlify.app/.netlify/functions/get-products-${sectorId}`);
            if (response.ok) {
                const data = await response.json();
                
                if (data.products && Array.isArray(data.products)) {
                    // We add them to the master list exactly as they come out of the sector
                    masterArchive = masterArchive.concat(data.products);
                    console.log(`Added ${data.products.length} items from Sector ${sectorId}`);
                }
            }
        } catch (error) {
            console.error(`CRITICAL: Sector ${sectorId} skip in sequence!`, error);
        }
    }

    // 2. The Final Storage
    const manifest = {
        status: "SYNCED",
        lastSync: new Date().toISOString(),
        totalItems: masterArchive.length,
        // The front-end will now receive one array in the order of Sector 01 -> Sector 10
        products: masterArchive 
    };

    fs.writeFileSync('./netlify/functions/archive-map.json', JSON.stringify(manifest, null, 2));
    console.log(`SUCCESS: Storyline preserved. ${masterArchive.length} items archived.`);
}

runHarvest();
