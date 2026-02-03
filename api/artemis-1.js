const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch'); // Required for GitHub Actions environment

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
        for (let i = 0; i < 5; i++) { 
            const offset = i * 100;
            const response = await fetch(`https://api.printful.com/store/products?offset=${offset}&limit=100`, {
                headers: { 'Authorization': `Bearer ${API_KEY}` }
            });

            const data = await response.json();
            if (!data.result || data.result.length === 0) break;

            data.result.forEach(p => {
                manifest.products.push({
                    id: p.id,
                    name: p.name,
                    images: [p.thumbnail_url],
                    price: 95 
                });
            });
            await new Promise(r => setTimeout(r, 1200)); 
        }

        manifest.totalItems = manifest.products.length;
        const dirPath = path.resolve(process.cwd(), 'api');
        if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

        fs.writeFileSync(path.join(dirPath, 'archive-map.json'), JSON.stringify(manifest, null, 2));
        console.log(`✅ Success: ${manifest.totalItems} items harvested.`);
    } catch (error) {
        console.error("❌ Failed:", error.message);
        process.exit(1);
    }
}
runHarvest();
