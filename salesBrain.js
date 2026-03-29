const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

/**
 * Genera una respuesta persuasiva para cerrar ventas en Instagram.
 * Permite inyectar un systemPrompt y un chat_history para demos dinámicas.
 */
async function generateSalesResponse(userName, userMessage, customSystemPrompt = null, chat_history = []) {
  const defaultPrompt = `
    Eres un experto en ventas online de 'Klic Systemas' (Laboratorio de Bots).
    Tu objetivo es cerrar ventas de servicios de automatización de Instagram de forma persuasiva.
    
    REGLAS:
    1. Brevedad y emojis (estilo Instagram 📱).
    2. Respondé en Castellano (Usa Voseo si el negocio es argentino).
    3. INVITACIÓN: Si el cliente quiere ver cómo funciona, invitalo a probar la demo en vivo en nuestra web oficial: https://klic-sales-bot.onrender.com/ 🚀
    4. Siempre termina con un Call to Action (CTA) claro.
  `;

  const systemPrompt = customSystemPrompt || defaultPrompt;

  try {
    // Construimos los mensajes con la historia del chat
    const messages = [
      { role: "system", content: systemPrompt },
      ...chat_history,
      { role: "user", content: `Cliente (${userName}): ${userMessage}` }
    ];

    const response = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messages,
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error en SalesBrain (Groq):", error.message);
    return "¡Hola! Gracias por escribirnos. En un momento un asesor humano te atenderá. 😊";
  }
}

module.exports = { generateSalesResponse };
