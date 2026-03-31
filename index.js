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

// Demo API con Catálogo Real de Momma Kids (Simulado)
app.post('/api/demo-chat', async (req, res) => {
  const { business_name, business_description, business_tone, store_mode, user_message, chat_history = [] } = req.body;

  if (!business_name || !user_message) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const demoPrompt = `
    IDENTIDAD: Eres el especialista de '${business_name}'. Rubro: '${business_description}'.
    PERSONALIDAD: '${business_tone || 'Cordial'}'.
    REGLA: Responde en MÁXIMO 1 o 2 oraciones cortas. 🛑
    E-COMMERCE: No digas "producto destacado". Si el cliente pregunta por un producto, confirma que lo tenemos y brinda detalles técnicos (tamaños, materiales).
  `;

  try {
    let extraData = {};
    const textLower = (user_message || "").toLowerCase();
    
    // Simulación de Catálogo con Links Reales de Momma Kids
    if(store_mode) {
      if(textLower.includes('jirafa') || textLower.includes('jirafita')) {
        extraData.product = { 
          img: 'https://dcdn-us.mitiendanube.com/stores/006/549/339/products/jirafita-cf9cd8c38928b8dfd717642580406307-1024-1024.webp', 
          price: '$29.000,00', name: 'Cuadro Jirafa Gum' 
        };
      } else if(textLower.includes('conejo') || textLower.includes('apego')) {
        extraData.product = { 
          img: 'https://dcdn-us.mitiendanube.com/stores/006/549/339/products/conejito-grey-38e56c535a7182063b17540855008397-1024-1024.webp', 
          price: '$43.000,00', name: 'Muñeco Apego Conejo Gris' 
        };
      } else if(textLower.includes('cuadro') || textLower.includes('set') || textLower.includes('bebe') || textLower.includes('animales')) {
        extraData.product = { 
          img: 'https://dcdn-us.mitiendanube.com/stores/006/549/339/products/animalitos-bebe-084d59a7f34c26a79817165840673322-1024-1024.webp', 
          price: '$89.000,00', name: 'Set Cuadros Animalitos Bebé' 
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
