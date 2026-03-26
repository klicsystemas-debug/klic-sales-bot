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
    Eres el Representante de '${business_name}'. Eres un ASESOR TÉCNICO EXPERTO. 🚀✨
    Tu objetivo es asesorar técnicamente y CAPTURAR EL CONTACTO del cliente. 🏆🏁

    REGLAS DE CAPTURA DE LEADS (ESTRICTAS):
    1. ¡PROHIBIDO DAR PRECIOS ESPECÍFICOS! 🛑 No inventes números.
    2. SI PIDEN PRECIOS: Di que los valores varían por stock y modelo exacto. Respondé: "Para pasarte el presupuesto formal y los descuentos del día, ¿me dejas un WhatsApp o contacto y te lo mando ahora mismo?". ✨🦾
    3. CONOCIMIENTO TÉCNICO: Usa todo tu conocimiento sobre el rubro '${business_description}' para asesorar. Hablá de marcas, medidas y calidad para generar confianza.
    4. FOCO: Menos charla aburrida, más asesoría técnica y cierre de contacto.
    5. IDIOMA: Español NEUTRO PROFESIONAL. Directo y eficiente.
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
