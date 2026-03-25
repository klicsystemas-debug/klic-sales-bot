const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const { generateSalesResponse } = require('./salesBrain');

const app = express().use(bodyParser.json());

// Servir archivos estáticos (para nuestra página web de Klic)
app.use(express.static('public'));

// Token de verificación para configurar el webhook en la Meta Developer Console
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'sales_bot_secret_token';

// Endpoint para la validación del Webhook
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Endpoint para recibir mensajes y comentarios de Instagram
app.post('/webhook', async (req, res) => {
  const body = req.body;
  if (body.object === 'instagram') {
    for (const entry of body.entry) {
      const messaging = entry.messaging || entry.changes;
      for (const event of messaging) {
        if (event.message && !event.message.is_echo) {
          const senderId = event.sender.id;
          const userText = event.message.text;
          const aiResponse = await generateSalesResponse("Cliente", userText);
          console.log(`Respuesta IA para IG: ${aiResponse}`);
        }
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Endpoint específico para ManyChat
app.post('/manychat-brain', async (req, res) => {
  const { user_name, user_message } = req.body;
  if (!user_message) return res.status(400).json({ error: "No user_message" });
  try {
    const aiResponse = await generateSalesResponse(user_name || "Cliente", user_message);
    res.json({
      version: "v2",
      content: { messages: [{ type: "text", text: aiResponse }] }
    });
  } catch (error) {
    res.status(500).json({ error: "Error procesando IA" });
  }
});

// NUEVO: Endpoint para la Demo Interactiva de Klic Systemas (CON MEMORIA)
app.post('/api/demo-chat', async (req, res) => {
  const { business_name, business_description, user_message, chat_history = [] } = req.body;

  if (!business_name || !user_message) {
    return res.status(400).json({ error: "Faltan datos para la demo" });
  }

  const demoPrompt = `
    Eres el experto en ventas de '${business_name}'.
    Tu personalidad es profesional, DIRECTA y humana. NO eres un bot asistente.
    Información de tu negocio: ${business_description}
    
    REGLAS ESTRICTAS PARA NO PARECER UN BOT:
    1. JAMÁS uses frases como "Me alegra que estés interesado", "Estoy aquí para ayudarte" o "En qué te puedo asistir hoy". Son de robot.
    2. Respondé como si estuvieras en INSTAGRAM DM: frases cortas, con onda, sin muchas vueltas.
    3. NO PROMETAS FOTOS NI ARCHIVOS. Si el cliente pide fotos, decí: "En esta demo interactiva no puedo mandarte la imagen, pero imaginate que es un diseño premium que queda bárbaro en cualquier pared".
    4. NO ATOSIGUES CON PREGUNTAS. Hacé como máximo UNA pregunta al final, o ninguna si la charla fluye sola.
    5. Usa CASTELLANO DE ARGENTINA (Voseo: "Vos tenés", "Querés", "Pasame").
  `;

  try {
    // Creamos el array de mensajes para la IA incluyendo la historia
    const messages = [
      { role: "system", content: demoPrompt },
      ...chat_history,
      { role: "user", content: user_message }
    ];

    const response = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messages,
      temperature: 0.7,
    });

    res.json({ response: response.choices[0].message.content });
  } catch (error) {
    console.error("Error en Demo API:", error);
    res.status(500).json({ error: "Error procesando demo" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor de Klic Systemas activo en puerto ${PORT}`));
