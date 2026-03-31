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

// Demo API CERRADORA DE VENTAS
app.post('/api/demo-chat', async (req, res) => {
  const { business_name, business_description, business_url, user_message, chat_history = [] } = req.body;

  if (!business_name || !user_message) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  // PROMPT CERRADOR DE VENTAS (MÁXIMA EFICIENCIA)
  const demoPrompt = `
    IDENTIDAD: Eres el ASESOR DE VENTAS de '${business_name}'.
    RUBRO: '${business_description}'. Menú/Web: '${business_url || 'Nuestra Tienda'}'.

    REGLAS DE ORO (MÁXIMA PRIORIDAD):
    1. PROHIBIDO PREGUNTAR SI QUIEREN VER: Si piden un producto, dile que SI tenemos stock y envíale de una vez este link: '${business_url || 'https://tu-tienda.com'}'.
    2. ACCIÓN DE CIERRE: Invítalos a hacer el pedido directamente por aquí o por WhatsApp.
    3. BREVEDAD EXTREMA: NO hables como un robot de Google. Sé directo y pícaro si el tono es cordial. 🛑
    4. SIN REPETICIONES: No saludes dos veces ni repitas el rubro.
  `;

  try {
    let extraData = {};
    const textLower = (user_message || "").toLowerCase();
    const bizLower = (business_description || "").toLowerCase();
    const urlLower = (business_url || "").toLowerCase();
    
    // Mapeo Dinámico de Imágenes (Sincronizado con el Prompt Cerrador)
    const canShowProduct = textLower.includes('jirafa') || textLower.includes('conejo') || 
                          textLower.includes('cuadro') || textLower.includes('leon') || 
                          textLower.includes('pizza') || textLower.includes('muzzarella') ||
                          textLower.includes('messi') || textLower.includes('foto') || 
                          textLower.includes('tenés') || textLower.includes('muestras');

    if(canShowProduct) {
      if(urlLower.includes('mommakids') || bizLower.includes('cuadro') || bizLower.includes('bebe')) {
        extraData.product = { img: 'https://dcdn-us.mitiendanube.com/stores/006/549/339/products/animalitos-bebe-084d59a7f34c26a79817165840673322-1024-1024.webp', price: 'Consultar', name: 'Catálogo Kids' };
      } 
      else if(bizLower.includes('pizza') || bizLower.includes('muzzarella') || textLower.includes('pizza')) {
        extraData.product = { img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400', price: 'Desde $12.500', name: 'Pizzas a la Piedra' };
      }
      else {
        const query = business_description.split(' ')[0] || 'product';
        extraData.product = { img: `https://images.unsplash.com/photo-1579546673183-59ee379b790d?auto=format&fit=crop&q=80&w=400&q=${query}`, price: 'Catálogo Online', name: business_name };
      }
    }

    const aiResponse = await generateSalesResponse("Cliente", user_message, demoPrompt, chat_history);
    res.json({ response: aiResponse, ...extraData });
  } catch (error) {
    res.status(500).json({ error: "Error en el sistema" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Klic Systemas 6.0 Pro Activo`));
