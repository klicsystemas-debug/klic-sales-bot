const { generateSalesResponse } = require('./salesBrain');

async function test() {
  console.log("Testing dual-agent fallback...");
  const res = await generateSalesResponse("Miguel", "tenes cuadros?", null, []);
  console.log("RESPONSE:", res);
}
test();
