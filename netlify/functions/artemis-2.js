const manifest = require('./archive-map.json');
exports.handler = async () => ({
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify(manifest)
});
