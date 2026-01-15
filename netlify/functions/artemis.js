exports.handler = async () => {
  console.log("ARTEMIS PROTOCOL: Initializing Persistent Sequential Harvest...");
  
  const results = [];

  for (let i = 1; i <= 10; i++) {
    // We pad the number with a 0 to match the new filenames (01, 02, etc.)
    const sectorId = i.toString().padStart(2, '0');
    console.log(`ARTEMIS: Checking Sector ${sectorId}...`);

    try {
      const response = await fetch(`https://2c30e.netlify.app/.netlify/functions/get-products-${sectorId}`);
      
      if (!response.ok) {
        console.log(`ARTEMIS: Sector ${sectorId} reported status ${response.status}. Continuing...`);
        results.push({ sector: sectorId, status: "Empty/Error" });
        continue; // Keep going to the next sector no matter what
      }

      const data = await response.json();
      results.push({ sector: sectorId, status: "Success", count: data.products?.length || 0 });
      console.log(`ARTEMIS: Sector ${sectorId} synced successfully.`);
      
    } catch (error) {
      console.error(`ARTEMIS: Sector ${sectorId} failed. Continuing harvest...`);
      results.push({ sector: sectorId, status: "Failed" });
    }
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Artemis: Full Perimeter Scan Complete", details: results })
  };
};
