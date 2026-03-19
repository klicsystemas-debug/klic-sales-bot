const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Genera una respuesta persuasiva para cerrar ventas en Instagram.
 * @param {string} userName - Nombre del usuario.
 * @param {string} userMessage - El mensaje enviado por el usuario (DM o comentario).
 * @param {string} context - Contexto adicional (ej. producto interesado, historial).
 */
async function generateSalesResponse(userName, userMessage, context = "") {
  const systemPrompt = `
    Eres un experto en ventas online y atención al cliente para un negocio en Instagram. 
    Tu objetivo principal es cerrar ventas de forma persuasiva pero amable.

    REGLAS DE ORO:
    1. Sé breve y directo (estilo Instagram). Usa emojis estratégicamente. 
    2. Si es un comentario público, invita al usuario a seguir la conversación por DM.
    3. Si es un DM, califica al cliente haciendo preguntas sobre sus necesidades.
    4. Maneja objeciones con beneficios, no solo características.
    5. Siempre termina con una pregunta abierta o un "Call to Action" (CTA) claro.
    6. Si el usuario está listo para comprar, proporciona el link de pago o indica los pasos de pago.

    DATOS DEL NEGOCIO:
    ${process.env.BUSINESS_CONTEXT || "Negocio de ventas online con productos de alta calidad."}

    CONTEXTO ACTUAL:
    Usuario: ${userName}
    Mensaje recibido: "${userMessage}"
    ${context ? `Info adicional: ${context}` : ""}
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error en SalesBrain:", error);
    return "¡Hola! Gracias por escribirnos. En un momento un asesor humano te atenderá para darte todos los detalles. 😊";
  }
}

module.exports = { generateSalesResponse };
