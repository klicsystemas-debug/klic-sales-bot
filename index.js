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

// NUEVO: Endpoint para la Demo Interactiva de Klic Systemas (CON MEMORIA REAL)
app.post('/api/demo-chat', async (req, res) => {
  const { business_name, business_description, user_message, chat_history = [] } = req.body;

  if (!business_name || !user_message) {
    return res.status(400).json({ error: "Faltan datos para la demo" });
  }

  const demoPrompt = `
    Eres el REPRESENTANTE de '${business_name}'. Vendés por Instagram DMs. 🚀✨
    Tu objetivo es ser un HUMANO que asesora a otro humano con sentido común. 🏆🏁

    REGLAS DE ORO DE REALISMO KLIC:
    1. PROHIBIDAS frases de bot como: "Estimado cliente", "Gracias por considerar", "Para proporcionarte una respuesta". 🛑🛑🛑
    2. SALUDO NATURAL: Si el cliente te contacta, respondé como una persona normal: "¡Hola! ¿Cómo estás? Contame, ¿en qué proyecto estás trabajando?". ✨🦾
    3. INTERÉS GENUINO: Si te preguntan por un producto, respondé y preguntá para qué lo van a usar: "¿Son para madera o metal?", "¿Qué tipo de tornillo buscabas exactamente?".
    4. FOCO COMERCIAL: Menos charla comercial aburrida, más solución directa.
    5. IDIOMA: Español Natural y Directo. Sin presionar con datos de pago antes de tiempo.
  `;

  try {
    // Usamos la función oficial del cerebro para no perder la configuración de la clave API
    const aiResponse = await generateSalesResponse("Cliente", user_message, demoPrompt, chat_history);
    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error en Demo API:", error);
    res.status(500).json({ error: "Error procesando demo" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor de Klic Systemas activo en puerto ${PORT}`));
