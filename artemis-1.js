const fs = require('fs');
const path = require('path');

// ... (your existing Printful fetching logic) ...

function saveManifest(data) {
    // FORCE SAVE INTO THE API FOLDER FOR VERCEL
    const dir = path.join(process.cwd(), 'api');
    const filePath = path.join(dir, 'archive-map.json');

    // Create the /api directory if it doesn't exist yet
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`✅ ARCHIVE SECURED: ${data.products.length} hoodies saved to ${filePath}`);
    } catch (err) {
        console.error("❌ CRITICAL SAVE ERROR:", err.message);
    }
}
