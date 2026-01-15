const fs = require('fs');
const path = require('path');

export default async function handler(req, res) {
    // Set headers to allow your website to talk to the API
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    try {
        // This finds your 253-hoodie manifest in the same folder
        const filePath = path.join(process.cwd(), 'api', 'archive-map.json');
        
        if (!fs.existsSync(filePath)) {
            console.error("Path missing:", filePath);
            return res.status(404).json({ error: "Archive map not found." });
        }

        const fileData = fs.readFileSync(filePath, 'utf8');
        const manifest = JSON.parse(fileData);

        // Success: Sends the data to your 24-item grid
        return res.status(200).json(manifest);
    } catch (error) {
        console.error("VIEWER ERROR:", error);
        return res.status(500).json({ error: "The Axiom Archive is currently rebuilding." });
    }
}
