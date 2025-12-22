const fetch = require('node-fetch');

// Replace with your actual key
const API_KEY = process.env.PRINTFUL_API_KEY; 

async function getTemplateCoordinates(templateId) {
    const response = await fetch(`https://api.printful.com/product-templates/${templateId}`, {
        headers: { 'Authorization': `Bearer ${API_KEY}` }
    });
    const data = await response.json();
    const files = data.result.product_template.files;

    // This extracts the specific 'pocket' math you did
    const pocket = files.find(f => f.placement === 'pocket');
    console.log(`Template ${templateId} Pocket Position:`, pocket.position);
    
    return files; // Returns all placement data (front, back, sleeves, etc.)
}
