const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();
const { generateSalesResponse } = require('./salesBrain');

const app = express().use(bodyParser.json());
app.use(express.static('public'));

app.get('/lab', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'lab.html'));
});

// Webhook Meta
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'sales_bot_secret_token';
app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === VERIFY_TOKEN) res.send(req.query['hub.challenge']);
  else res.sendStatus(403);
});

// Demo API con Modo E-commerce Simulator
app.post('/api/demo-chat', async (req, res) => {
  const { business_name, business_description, business_tone, store_mode, user_message, chat_history = [] } = req.body;

  if (!business_name || !user_message) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const demoPrompt = `
    IDENTIDAD: Eres el especialista de '${business_name}' para '${business_description}'.
    PERSONALIDAD: '${business_tone || 'Cordial'}'.
    REGLA: Responde en MÁXIMO 1 o 2 oraciones cortas. 🛑
    E-COMMERCE: Si el cliente busca algo, el sistema mostrará una card visual automáticamente.
  `;

  try {
    let extraData = {};
    const textLower = (user_message || "").toLowerCase();
    
    // Simulación de Catálogo Dinámico
    if(store_mode) {
      if(textLower.includes('conejo') || textLower.includes('cuadro')) {
        extraData.product = { 
          img: 'https://images.unsplash.com/photo-1591769225440-811ad7d62ca2?auto=format&fit=crop&q=80&w=400', 
          price: '$4.500', name: 'Cuadro Conejito Art' 
        };
      } else if(textLower.includes('neumatico') || textLower.includes('rueda')) {
        extraData.product = { 
          img: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&q=80&w=400', 
          price: '$120.000', name: 'Neumático Classic Premium' 
        };
      }
    }

    const aiResponse = await generateSalesResponse("Cliente", user_message, demoPrompt, chat_history);
    res.json({ response: aiResponse, ...extraData });
  } catch (error) {
    res.status(500).json({ error: "Error en el sistema" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Klic Systemas activo en puerto ${PORT}`));
