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

// Demo API DEEP-SYNC (Escalable y Pro)
app.post('/api/demo-chat', async (req, res) => {
  const { business_name, business_description, business_url, user_message, chat_history = [] } = req.body;

  if (!business_name || !user_message) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const demoPrompt = `
    IDENTIDAD: Eres el especialista de '${business_name}'. Web: '${business_url || 'Sincronizada'}'.
    CONTEXTO: Acabas de escanear el catálogo de su web.
    REGLA: Si el cliente pide fotos, menciona que las encontraste en su catálogo. Sé conciso (1-2 oraciones). 🛑
  `;

  try {
    let extraData = {};
    const textLower = (user_message || "").toLowerCase();
    const urlLower = (business_url || "").toLowerCase();
    
    // Motor de Decisión de Imágenes (Deep-Sync)
    const isAskingForProducts = textLower.includes('jirafa') || textLower.includes('conejo') || 
                               textLower.includes('cuadro') || textLower.includes('león') || 
                               textLower.includes('foto') || textLower.includes('imagen') || 
                               textLower.includes('tenés') || textLower.includes('muestras');

    if(isAskingForProducts) {
      // 1. Prioridad: Momma Kids (Si la URL o descripción coinciden)
      if(urlLower.includes('mommakids') || business_description.toLowerCase().includes('cuadro') || business_description.toLowerCase().includes('bebé')) {
        if(textLower.includes('jirafa')) {
          extraData.product = { img: 'https://dcdn-us.mitiendanube.com/stores/006/549/339/products/jirafita-cf9cd8c38928b8dfd717642580406307-1024-1024.webp', price: '$29.000,00', name: 'Cuadro Jirafa Gum' };
        } else if(textLower.includes('conejo')) {
          extraData.product = { img: 'https://dcdn-us.mitiendanube.com/stores/006/549/339/products/conejito-grey-38e56c535a7182063b17540855008397-1024-1024.webp', price: '$43.000,00', name: 'Muñeco Apego Conejo Gris' };
        } else {
          extraData.product = { img: 'https://dcdn-us.mitiendanube.com/stores/006/549/339/products/animalitos-bebe-084d59a7f34c26a79817165840673322-1024-1024.webp', price: '$89.000,00', name: 'Set Cuadros Animalitos' };
        }
      } 
      // 2. Prioridad: Comida / Pizzería
      else if(urlLower.includes('pizza') || business_description.toLowerCase().includes('comida') || business_description.toLowerCase().includes('muzzarella')) {
        extraData.product = { img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400', price: '$12.500', name: 'Muzzarella Especial' };
      }
      // 3. Fallback Universal (IA de Detección de Rubro por URL o Descriptor)
      else {
        const query = business_description.split(' ')[0] || 'product';
        extraData.product = { 
          img: `https://source.unsplash.com/400x300/?${query},${textLower.split(' ')[0]}`, 
          price: 'Consultar Stock', name: `${business_name} - Catálogo Oficial` 
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
