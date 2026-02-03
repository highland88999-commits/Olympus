const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

async function runHarvest() {
    const API_KEY = process.env.PRINTFUL_API_KEY;
    
    if (!API_KEY) {
        console.error("❌ ERROR: PRINTFUL_API_KEY is missing.");
        process.exit(1);
    }

    const manifest = {
        status: "ONLINE",
        lastSync: new Date().toISOString(),
        totalItems: 0,
        products: []
    };

    try {
        // Standard for-loop ensures one request finishes before the next starts
        for (let i = 0; i < 5; i++) { 
            const offset = i * 100;
            console.log(`📡 Fetching Sector: Offset ${offset}...`);

            const response = await fetch(`https://api.printful.com/store/products?offset=${offset}&limit=100`, {
                headers: { 'Authorization': `Bearer ${API_KEY}` }
            });

            const data = await response.json();

            // Safety check: ensure 'result' exists and is an array
            if (!data.result || !Array.isArray(data.result)) {
                console.log(`⚠️ Sequence complete or API limit hit at offset ${offset}.`);
                // Log the message if the API returned an error instead of products
                if (data.error) console.log(`API Message: ${data.error.message}`);
                break; 
            }

            if (data.result.length === 0) {
                console.log(`🏁 No more products found at offset ${offset}.`);
                break;
            }

            data.result.forEach(p => {
                manifest.products.push({
                    id: p.id,
                    name: p.name,
                    images: [p.thumbnail_url],
                    price: 95 
                });
            });

            console.log(`✅ Loaded ${data.result.length} items. Total: ${manifest.products.length}`);

            // MANDATORY COOL-DOWN: Wait 2 seconds (2000ms) to respect rate limits
            if (i < 4) { // Don't wait after the last loop
                console.log(`⏱️ Cooling down sensors for 2 seconds...`);
                await new Promise(r => setTimeout(r, 2000));
            }
        }

        manifest.totalItems = manifest.products.length;
        
        // Ensure the /api directory exists relative to the root
        const dirPath = path.resolve(process.cwd(), 'api');
        if (!fs.existsSync(dirPath)) {
            console.log("📁 Creating missing /api directory...");
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // Write the manifest
        const filePath = path.join(dirPath, 'archive-map.json');
        fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2));
        
        console.log(`🏆 Mission Accomplished: ${manifest.totalItems} items stored in ${filePath}.`);
    } catch (error) {
        console.error("❌ System Failure:", error.message);
        process.exit(1);
    }
}

runHarvest();
