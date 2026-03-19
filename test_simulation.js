const { generateSalesResponse } = require('./salesBrain');

async function testBot() {
  console.log("--- SIMULACIÓN DE VENTA KLIC SYSTEMAS ---");
  
  const scenarios = [
    { name: "Usuario1", msg: "Hola, ¿cuánto cuesta un bot?" },
    { name: "Usuario2", msg: "Tengo un negocio de ropa, ¿ustedes me pueden ayudar a vender por DM?" },
    { name: "Usuario3", msg: "Me interesa, pero me da miedo que el bot responda mal." }
  ];

  for (const s of scenarios) {
    console.log(`\n👤 ${s.name}: ${s.msg}`);
    const res = await generateSalesResponse(s.name, s.msg);
    console.log(`🤖 Klic Bot: ${res}`);
  }
}

// Para correr esto, primero debes configurar tu OPENAI_API_KEY en el .env
// Luego: node test_simulation.js
testBot();
