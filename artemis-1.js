// artemis-1.js (Save this in your ROOT folder, not netlify/functions)
const fs = require('fs');

async function runHarvest() {
    console.log("ARTEMIS PROTOCOL: Initializing Persistent Sequential Harvest...");
    const results = [];
    let totalItemsFound = 0;

    for (let i = 1; i <= 10; i++) {
        const sectorId = i.toString().padStart(2, '0');
        console.log(`ARTEMIS: Checking Sector ${sectorId}...`);

        try {
            // It checks its own live site to see if the data is there
            const response = await fetch(`https://2c30e.netlify.app/.netlify/functions/get-products-${sectorId}`);
            
            if (response.ok) {
                const data = await response.json();
                const count = data.products?.length || 0;
                results.push({ sector: sectorId, status: "Success", count: count });
                totalItemsFound += count;
            } else {
                results.push({ sector: sectorId, status: "Empty", count: 0 });
            }
        } catch (error) {
            results.push({ sector: sectorId, status: "Offline", count: 0 });
        }
    }

    // THE CRITICAL STEP: Writing the Manifest
    const manifest = {
        status: "ONLINE",
        directory: "AXIOM_O1",
        totalSectors: 10,
        itemsPerPage: 24,
        totalItems: totalItemsFound,
        lastSync: new Date().toISOString(),
        scanDetails: results
    };

    // Save this so Artemis 2 can read it
    fs.writeFileSync('./netlify/functions/archive-map.json', JSON.stringify(manifest, null, 2));
    console.log("ARTEMIS: Manifest updated with " + totalItemsFound + " items.");
}

runHarvest();
