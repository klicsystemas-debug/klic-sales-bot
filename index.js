const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();
const { generateSalesResponse } = require('./salesBrain');

const app = express().use(bodyParser.json());

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

// Endpoint para recibir mensajes y comentarios
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'instagram') {
    for (const entry of body.entry) {
      const messaging = entry.messaging || entry.changes;
      
      for (const event of messaging) {
        // Manejo de DMs
        if (event.message && !event.message.is_echo) {
          const senderId = event.sender.id;
          const userText = event.message.text;
          
          console.log(`DM recibido de ${senderId}: ${userText}`);

          const aiResponse = await generateSalesResponse("Cliente", userText);
          
          // Aquí iría la llamada a la API de Meta para enviar el mensaje de vuelta
          console.log(`Enviando respuesta IA: ${aiResponse}`);
          // sendInstagramMessage(senderId, aiResponse);
        }

        // Manejo de Comentarios
        if (event.value && event.value.item === 'comment') {
          const commentId = event.value.comment_id;
          const commentText = event.value.text;
          
          console.log(`Comentario recibido: ${commentText}`);
          
          const aiResponse = await generateSalesResponse("Usuario", commentText);
          console.log(`Respuesta sugerida para comentario: ${aiResponse}`);
          // postInstagramCommentReply(commentId, aiResponse);
        }
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Endpoint específico para ManyChat (External Request)
app.post('/manychat-brain', async (req, res) => {
  const { user_name, user_message } = req.body;

  if (!user_message) {
    return res.status(400).json({ error: "No user_message provided" });
  }

  console.log(`Petición de ManyChat para ${user_name}: ${user_message}`);

  try {
    const aiResponse = await generateSalesResponse(user_name || "Cliente", user_message);
    
    // Devolvemos la respuesta en un formato que ManyChat entiende fácilmente
    res.json({
      version: "v2",
      content: {
        messages: [
          {
            type: "text",
            text: aiResponse
          }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Error procesando IA" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor de automatización escuchando en el puerto ${PORT}`));
