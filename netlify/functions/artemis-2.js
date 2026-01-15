const fs = require('fs');
const path = require('path');

exports.handler = async () => {
    // This looks for the file exactly where the bot saves it
    const filePath = path.resolve(__dirname, 'archive-map.json');
    
    try {
        if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath, 'utf8');
            return {
                statusCode: 200,
                headers: { 
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*" 
                },
                body: fileData
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "Manifest not found. Run Artemis 1 Sync." })
            };
        }
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
