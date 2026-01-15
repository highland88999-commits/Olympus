const fs = require('fs');

async function runHarvest() {
    console.log("ARTEMIS PROTOCOL: Sequential Storytelling Sync Initialized...");
    let masterArchive = [];

    for (let i = 1; i <= 10; i++) {
        const sectorId = i.toString().padStart(2, '0');
        console.log(`[ACTION] Harvesting Sector ${sectorId}...`);

        try {
            // THE CRITICAL 'AWAIT': It stops here until the file is fully read
            const response = await fetch(`https://2c30e.netlify.app/.netlify/functions/get-products-${sectorId}`);
            
            if (response.ok) {
                const data = await response.json();
                if (data.products && Array.isArray(data.products)) {
                    masterArchive = masterArchive.concat(data.products);
                    console.log(`[SUCCESS] Sector ${sectorId} added. Total items: ${masterArchive.length}`);
                }
            }
            
            // OPTIONAL: A small breather for the server
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.error(`[CRITICAL ERROR] Sector ${sectorId} failed:`, error.message);
            // We stop the whole process if a sector fails to protect the story order
            process.exit(1); 
        }
    }

    const manifest = {
        status: "SYNCED",
        lastSync: new Date().toISOString(),
        totalItems: masterArchive.length,
        products: masterArchive 
    };

    fs.writeFileSync('./netlify/functions/archive-map.json', JSON.stringify(manifest, null, 2));
    console.log(`ARCHIVE SECURED: ${masterArchive.length} items stored in chronological order.`);
}

runHarvest();
