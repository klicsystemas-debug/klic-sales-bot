const OpenAI = require('openai');
require('dotenv').config();

// Groq es compatible con la librería de OpenAI, solo cambiamos la URL
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

/**
 * Genera una respuesta persuasiva para cerrar ventas en Instagram.
 * Permite inyectar un systemPrompt personalizado para demos dinámicas.
 */
async function generateSalesResponse(userName, userMessage, customSystemPrompt = null) {
  const defaultPrompt = `
    Eres un experto en ventas online de 'Klic Systemas' (Laboratorio de Bots).
    Tu objetivo es cerrar ventas de servicios de automatización de Instagram de forma persuasiva.
    
    REGLAS:
    1. Brevedad y emojis (estilo Instagram 📱).
    2. Si es comentario, invita a DM para asesoría.
    3. Maneja objeciones con beneficios potentes.
    4. Siempre termina con un Call to Action (CTA) claro.
  `;

  const systemPrompt = customSystemPrompt || defaultPrompt;

  try {
    const response = await openai.chat.completions.create({
      model: "llama3-70b-8192", 
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Cliente (${userName}): ${userMessage}` }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error en SalesBrain (Groq):", error);
    return "¡Hola! Gracias por escribirnos. En un momento un asesor humano te atenderá. 😊";
  }
}

module.exports = { generateSalesResponse };
