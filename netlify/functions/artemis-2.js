// netlify/functions/artemis-2.js
const manifest = require('./archive-map.json');

exports.handler = async () => {
    return {
        statusCode: 200,
        headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*" 
        },
        body: JSON.stringify(manifest)
    };
};
