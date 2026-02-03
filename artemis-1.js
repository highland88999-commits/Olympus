const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

async function runHarvest() {
    const API_KEY = process.env.PRINTFUL_API_KEY;
    const STORE_ID = '17419146'; // Your specific Olympian Store ID
    
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
        for (let i = 0; i < 5; i++) { 
            const offset = i * 100;
            console.log(`📡 Fetching Sector: Offset ${offset}...`);

            // Updated URL with your Store ID
            const response = await fetch(`https://api.printful.com/store/products?store_id=${STORE_ID}&offset=${offset}&limit=100`, {
                headers: { 'Authorization': `Bearer ${API_KEY}` }
            });

            const data = await response.json();

            if (!data.result || !Array.isArray(data.result)) {
                console.log(`⚠️ Sequence complete or API error at offset ${offset}.`);
                if (data.error) console.log(`API Message: ${data.error.message}`);
                break; 
            }

            if (data.result.length === 0) break;

            data.result.forEach(p => {
                manifest.products.push({
                    id: p.id,
                    name: p.name,
                    images: [p.thumbnail_url],
                    price: 95 
                });
            });

            console.log(`✅ Loaded ${data.result.length} items. Total: ${manifest.products.length}`);
            await new Promise(r => setTimeout(r, 2000));
        }

        manifest.totalItems = manifest.products.length;
        const dirPath = path.resolve(process.cwd(), 'api');
        if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

        fs.writeFileSync(path.join(dirPath, 'archive-map.json'), JSON.stringify(manifest, null, 2));
        console.log(`🏆 Mission Accomplished: ${manifest.totalItems} items stored.`);
    } catch (error) {
        console.error("❌ System Failure:", error.message);
        process.exit(1);
    }
}
runHarvest();
