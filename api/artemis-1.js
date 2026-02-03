const fs = require('fs');
const path = require('path');
// CRITICAL FIX: Added node-fetch for GitHub Actions compatibility
const fetch = require('node-fetch');

async function runHarvest() {
    const API_KEY = process.env.PRINTFUL_API_KEY;
    
    if (!API_KEY) {
        console.error("❌ ERROR: PRINTFUL_API_KEY is missing from Environment Secrets.");
        process.exit(1);
    }

    const manifest = {
        status: "ONLINE",
        lastSync: new Date().toISOString(),
        totalItems: 0,
        products: []
    };

    console.log("🚀 STARTING OLYMPUS HARVEST...");

    try {
        for (let i = 0; i < 5; i++) { 
            const offset = i * 100;
            console.log(`📡 Requesting Sector ${i} (Offset: ${offset})...`);
            
            const response = await fetch(`https://api.printful.com/store/products?offset=${offset}&limit=100`, {
                headers: { 'Authorization': `Bearer ${API_KEY}` }
            });

            if (!response.ok) {
                throw new Error(`Printful API responded with ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.result || data.result.length === 0) {
                console.log("📍 End of Archive reached.");
                break;
            }

            data.result.forEach(product => {
                manifest.products.push({
                    id: product.id,
                    name: product.name,
                    images: [product.thumbnail_url],
                    price: 95 
                });
            });

            await new Promise(r => setTimeout(r, 1200)); 
        }

        manifest.totalItems = manifest.products.length;
        
        // Ensure directory exists
        const dirPath = path.resolve(process.cwd(), 'api');
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const filePath = path.join(dirPath, 'archive-map.json');
        fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2));
        
        console.log(`✅ ARCHIVE SECURED: ${manifest.totalItems} hoodies saved to ${filePath}`);

    } catch (error) {
        console.error("❌ HARVEST CRASHED:", error.message);
        process.exit(1); 
    }
}

runHarvest();
