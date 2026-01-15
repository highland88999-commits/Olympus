const fs = require('fs');
const path = require('path');

export default async function handler(req, res) {
    const manifestPath = path.join(process.cwd(), 'api', 'archive-map.json');

    try {
        if (!fs.existsSync(manifestPath)) {
            return res.status(404).json({ status: "OFFLINE", error: "Manifest not found." });
        }

        const rawData = fs.readFileSync(manifestPath, 'utf8');
        const manifest = JSON.parse(rawData);

        // Standard Store Response
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(manifest);

    } catch (error) {
        res.status(500).json({ status: "ERROR", message: error.message });
    }
}
