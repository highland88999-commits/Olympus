const fs = require('fs');
const path = require('path');

async function runHarvest() {
    const API_KEY = process.env.PRINTFUL_API_KEY;
    const manifest = {
        status: "ONLINE",
        totalItems: 0,
        products: []
    };

    console.log("🚀 STARTING OLYMPUS HARVEST...");

    try {
        // Loops through 10 sectors to find all 253 hoodies
        for (let i = 0; i < 10; i++) {
            const offset = i * 100;
            const response = await fetch(`https://api.printful.com/store/products?offset=${offset}&limit=100`, {
                headers: { 'Authorization': `Bearer ${API_KEY}` }
            });

            if (response.ok) {
                const data = await response.json();
                if (!data.result || data.result.length === 0) break;

                data.result.forEach(product => {
                    manifest.products.push({
                        id: product.id,
                        name: product.name,
                        images: [product.thumbnail_url],
                        price: 95
                    });
                });
                console.log(`📡 Sector ${i} Synchronized...`);
            } else {
                console.error(`[ERROR] Printful Connection Failed: ${response.statusText}`);
            }
            await new Promise(r => setTimeout(r, 1000)); // Rate limit protection
        }

        manifest.totalItems = manifest.products.length;
        
        // SAVE LOGIC
        const dir = path.join(process.cwd(), 'api');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        const filePath = path.join(dir, 'archive-map.json');
        
        fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2));
        console.log(`✅ ARCHIVE SECURED: ${manifest.totalItems} hoodies saved to ${filePath}`);

    } catch (error) {
        console.error("❌ HARVEST CRASHED:", error.message);
        process.exit(1);
    }
}

runHarvest();
