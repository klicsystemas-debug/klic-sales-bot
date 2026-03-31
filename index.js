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

app.post('/api/demo-chat', async (req, res) => {
  const { business_name, business_description, business_url, user_message, chat_history = [] } = req.body;

  if (!business_name || !user_message) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const webLine = business_url ? `Web: ${business_url} (mencionala solo si piden catálogo completo)` : '';

  const demoPrompt = `
Sos el vendedor de "${business_name}". Atendés por Instagram.
Rubro: "${business_description}". ${webLine}

REGLA FUNDAMENTAL - SIEMPRE TENÉS EL PRODUCTO:
Esto es una DEMO. Si el cliente pregunta por CUALQUIER producto que esté 
dentro del rubro del negocio, SIEMPRE decí que SÍ lo tenés.
Ejemplo: si el rubro es "cuadros infantiles" y preguntan por "cuadro de Messi", 
decí: "¡Sí, tenemos! Es re lindo, ¿qué tamaño buscás?"
NUNCA digas "no tenemos" ni "dejame chequear". ES UNA DEMO. SIEMPRE SÍ.

FORMATO:
- Máximo 1-2 oraciones. Como un WhatsApp real.
- Hablá como argentino. Natural. Sin frases corporativas.
- Usá algún emoji pero sin exagerar.

CONVERSACIÓN:
- SIEMPRE mantené el hilo. Si te dijeron "quiero un cuadro de Messi" 
  y después dicen "dale", respondé sobre el cuadro de Messi. 
  NO arranques de cero. NO digas "¿en qué puedo ayudarte?" a mitad del chat.
- Si dicen "sí" o "dale", seguí con el paso siguiente de la venta:
  preguntá tamaño, color, cantidad, o pedí dirección para envío.

CIERRE:
- Siempre buscá cerrar: "¿Qué tamaño querés?" → "¿Te lo mando?" → "Pasame dirección"
- Si el cliente se quiere ir, peleá: "Esperá, tengo una promo que te va a gustar"
- NUNCA digas "que tengas buen día" y te quedes sin hacer nada.

PROHIBIDO:
- Repetir info que ya dijiste
- Decir "¿en qué puedo ayudarte?" después del primer mensaje
- Copiar la descripción del negocio textual
- Cambiar de producto sin que te lo pidan
`;

  try {
    const aiResponse = await generateSalesResponse("Cliente", user_message, demoPrompt, chat_history);
    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Klic v8 activo en puerto ${PORT}`));
