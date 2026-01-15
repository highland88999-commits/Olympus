const fs = require('fs');
const path = require('path');

export default async function handler(req, res) {
    // 1. Locate the Manifest in the /api folder
    const manifestPath = path.join(process.cwd(), 'api', 'archive-map.json');

    try {
        // 2. Read the 253 hoodies
        if (!fs.existsSync(manifestPath)) {
            return res.status(404).json({ error: "Manifest not found. Run Artemis 1 first." });
        }

        const rawData = fs.readFileSync(manifestPath, 'utf8');
        const manifest = JSON.parse(rawData);

        // 3. Handle Pagination (The "Chapters" of 24)
        const page = parseInt(req.query.page) || 1;
        const limit = 24;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const paginatedProducts = manifest.products.slice(startIndex, endIndex);

        // 4. Send the data to your website
        res.setHeader('Access-Control-Allow-Origin', '*'); // Allows your site to talk to this API
        res.status(200).json({
            status: "ONLINE",
            totalItems: manifest.totalItems,
            currentPage: page,
            totalPages: Math.ceil(manifest.totalItems / limit),
            products: paginatedProducts
        });

    } catch (error) {
        console.error("ARTEMIS 2 ERROR:", error.message);
        res.status(500).json({ error: "Internal System Error" });
    }
}
