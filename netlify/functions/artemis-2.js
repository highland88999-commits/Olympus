// netlify/functions/artemis-2.js

exports.handler = async (event, context) => {
    // This allows your website to talk to the function without security blocks (CORS)
    const headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET"
    };

    try {
        const metadata = {
            status: "ONLINE",
            directory: "AXIOM_O1",
            totalSectors: 10,       // Tells front-end to stop at 10
            itemsPerPage: 24,      // Matches your grid layout
            totalItems: 253,       // The full count of the archive
            lastSync: new Date().toISOString()
        };

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(metadata)
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Artemis Link Severed" })
        };
    }
};
