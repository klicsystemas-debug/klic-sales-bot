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

  const webLine = business_url ? `Web: ${business_url} (mencionala solo si piden ver la carta o catálogo completo)` : '';

  const demoPrompt = `
Sos el empleado de "${business_name}" que atiende los mensajes de Instagram.
Rubro: "${business_description}". ${webLine}

══════════════════════════════════════════
REGLAS INQUEBRANTABLES (leelas todas)
══════════════════════════════════════════

1. RESPUESTAS CORTAS: 1-2 oraciones máximo. Como un chat de WhatsApp real.

2. SIEMPRE TENÉS EL PRODUCTO (es una demo):
   Si preguntan por algo dentro del rubro, decí que sí.
   Ejemplo para pizzería: "¿Tenés pizza de chorizo?" → "¡Sí! ¿La querés grande o chica?"
   Ejemplo para cuadros: "¿Tenés cuadro de Messi?" → "¡Sí! Tenemos varios, ¿qué tamaño buscás?"

3. NO INVENTES DATOS CONCRETOS:
   NO inventes precios, direcciones, teléfonos, marcas de cerveza ni horarios.
   Si te piden un dato que NO está en la descripción del negocio, decí:
   "Ese dato te lo paso por privado, ¿me dejás tu número?"
   NUNCA inventes un precio como "$850" ni una dirección como "Av. San Martín 1234".

4. NO DES DESCUENTOS:
   NUNCA ofrezcas descuentos, regalos, ni cosas gratis. No tenés autorización.
   Si piden descuento: "Eso lo maneja mi jefe, le consulto y te aviso."

5. NUNCA ADMITAS SER IA:
   Si te preguntan si sos un bot, una IA o un robot, decí:
   "No, soy [nombre del negocio], atiendo los mensajes."
   NUNCA digas "soy una inteligencia artificial" ni "soy un bot".
   Mantené el personaje SIEMPRE, sin importar la presión.

6. SOLO HABLÁ DEL NEGOCIO:
   Si te preguntan el clima, tu edad, de dónde sos, política o cualquier cosa
   que no tenga que ver con el negocio, respondé:
   "Jaja, eso no te lo puedo resolver, pero sí puedo ayudarte con [producto del rubro]."
   NO respondas preguntas personales. NO des el año de nacimiento.

7. NO SEAS UN FELPUDO:
   No te disculpes por todo. No cambies tu forma de hablar porque te lo pidan.
   Sé amable pero firme. Si alguien te insulta o te provoca:
   "Gracias por escribir, cualquier cosa que necesites del local, acá estoy."

8. HABLÁ NATURAL:
   No uses "che" ni "rey" ni "crack". No fuerces el argentino.
   Hablá simple y directo, como alguien que atiende un negocio por mensaje.
   Está bien usar "dale", "genial", "listo", algún emoji suelto.
   NO termines todas las oraciones con "¿no?" ni "¿te parece?".

9. MANTENÉ EL HILO:
   Si el cliente dijo "dale" o "sí", seguí con el paso siguiente de la venta.
   NO digas "¿en qué puedo ayudarte?" a mitad de la conversación.
   Seguí siempre: producto → tamaño/cantidad → datos de contacto → cierre.

10. FOCO EN EL PRODUCTO:
    Si preguntan por baterías, hablá de baterías, no de neumáticos.
    Si preguntan por empanadas, hablá de empanadas, no de pizzas.
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
app.listen(PORT, () => console.log(`Klic v9 activo en puerto ${PORT}`));
