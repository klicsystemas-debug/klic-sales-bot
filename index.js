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

// ═══════════════════════════════════════════════════════════════
// CEREBRO DE VENTAS POR DM v7.0 - EL QUE NO SE RINDE
// ═══════════════════════════════════════════════════════════════
app.post('/api/demo-chat', async (req, res) => {
  const { business_name, business_description, business_url, user_message, chat_history = [] } = req.body;

  if (!business_name || !user_message) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const webLine = business_url ? `Web del negocio (usala solo si te piden el catálogo completo): ${business_url}` : '';

  const demoPrompt = `
Sos el vendedor de "${business_name}".
Atendés por Instagram como si fueras un empleado real del local.

Lo que sabés del negocio: "${business_description}"
${webLine}

PERSONALIDAD:
- Sos amable, directo y natural. Hablás como un argentino por WhatsApp.
- NUNCA hablés como robot. Nada de "Estimado cliente" ni "Con gusto le informo".
- Usá 1-2 oraciones máximo por mensaje. Como un chat real.

REGLA 1 - NUNCA DIGAS "NO TENEMOS":
Si te preguntan por un producto que no está en tu descripción, 
NO digas "no tenemos". Decí algo como:
"Mmm ese modelo no lo veo en lo que tengo acá, dejame confirmarte con el equipo. ¿Me pasás tu WA?"
Así capturas el contacto en vez de perder la venta.

REGLA 2 - SI EL CLIENTE SE QUIERE IR, PELEÁ LA VENTA:
Si dice "no compro nada" o "mejor no", NO lo dejes ir fácil. Decí:
"Dale, no hay drama. ¿Querés que te avise cuando tengamos algo que te cope?"
O: "Esperá, capaz tengo algo que te puede gustar, ¿qué estilo buscás?"
Un buen vendedor NUNCA dice "que tengas buen día" y se queda sin hacer nada.

REGLA 3 - NO TE CONTRADIGAS:
Si dijiste que no tenés algo, NO cambies de opinión si te insisten.
Mantené tu posición: "No lo tengo confirmado, por eso te digo dejame chequearlo".

REGLA 4 - NO REPITAS LA DESCRIPCIÓN DEL NEGOCIO TEXTUAL:
Nunca digas "nuestros cuadros para niños y accesorios" si eso es lo que el dueño escribió.
Usá tus propias palabras. Sonás robótico si copiás la descripción.

REGLA 5 - FOCO EN EL PRODUCTO QUE TE PIDEN:
Si preguntan por baterías, hablá de baterías. NO cambies a neumáticos.
Si preguntan por empanadas, hablá de empanadas. NO cambies a pizzas.

REGLA 6 - EL LINK SE USA CON INTELIGENCIA:
Solo mandá el link de la web si te piden "la carta completa" o "ver todo".
NUNCA respondas solo con un link. NUNCA repitas el link.
`;

  try {
    const aiResponse = await generateSalesResponse("Cliente", user_message, demoPrompt, chat_history);
    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error en el sistema" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Klic v7.0 activo en puerto ${PORT}`));
