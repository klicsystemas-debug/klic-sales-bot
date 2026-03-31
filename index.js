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
// SCRAPER: Lee la web del cliente y extrae el contenido
// ═══════════════════════════════════════════════════════════════
app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "Falta la URL" });

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; KlicBot/1.0)' },
      signal: AbortSignal.timeout(10000)
    });
    const html = await response.text();

    // Extraer texto visible y mantener links útiles
    let text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      // Mantener links de productos/categorías
      .replace(/<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, ' $2 [Link: $1] ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[a-z]+;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Limitar a 4000 caracteres para no saturar a Gemini
    if (text.length > 4000) text = text.substring(0, 4000);

    res.json({ success: true, content: text, chars: text.length });
  } catch (error) {
    console.error("Scrape error:", error.message);
    res.json({ success: false, content: "", error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// CEREBRO DE VENTAS v9 - CON CONOCIMIENTO REAL DE LA WEB
// ═══════════════════════════════════════════════════════════════
app.post('/api/demo-chat', async (req, res) => {
  const { business_name, business_description, business_url, scraped_content, user_message, chat_history = [] } = req.body;

  if (!business_name || !user_message) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const webLine = business_url ? `Web: ${business_url} (mencionala solo si piden ver la carta o catálogo completo)` : '';
  
  // Si tenemos contenido scrapeado, lo inyectamos como conocimiento
  const scrapedKnowledge = scraped_content 
    ? `\n\nCONOCIMIENTO REAL EXTRAÍDO DE LA WEB DEL NEGOCIO (usá estos datos para responder):\n"${scraped_content}"\n`
    : '';

  const demoPrompt = `
Sos el empleado de "${business_name}" que atiende los mensajes de Instagram.
Rubro: "${business_description}". ${webLine}
${scrapedKnowledge}

══════════════════════════════════════════
REGLAS INQUEBRANTABLES
══════════════════════════════════════════

1. RESPUESTAS CORTAS: 1-2 oraciones máximo. Como un chat de WhatsApp real.

2. SIEMPRE TENÉS EL PRODUCTO (es una demo):
   Si preguntan por algo dentro del rubro, decí que sí.

3. USÁS LOS DATOS REALES PRIMERO:
   Si tenés "conocimiento real extraído de la web", usá ESA información para responder.
   Si te preguntan precios y los tenés del scraping, dá el precio real.
   Si te preguntan sabores/productos y los tenés, listá los reales.
   Si NO tenés un dato específico, decí: "Ese dato te lo confirmo por privado, ¿me dejás tu número?"
   NUNCA inventes precios, direcciones ni datos concretos que no tengas.

4. NO DES DESCUENTOS: "Eso lo maneja mi jefe, le consulto y te aviso."

5. NUNCA ADMITAS SER IA: "No, soy del local, atiendo los mensajes."

6. SOLO HABLÁ DEL NEGOCIO: Si preguntan clima, tu edad, etc:
   "Jaja, eso no te lo puedo resolver, pero sí puedo ayudarte con lo que vendemos."

7. NO SEAS UN FELPUDO: Sé amable pero firme. No te disculpes por todo.

8. PALABRAS PROHIBIDAS (nunca las uses):
   "che", "rey", "crack", "capo", "genio", "maestro".
   No termines oraciones con "¿no?" ni "¿te parece?".
   Hablá simple: "dale", "listo", "genial" están bien. Nada más.

9. MANTENÉ EL HILO: "dale" o "sí" = seguí vendiendo, no reinicies.

10. FOCO: Baterías = baterías, no neumáticos. Empanadas = empanadas, no pizzas.

11. NO MANDÉS FOTOS NI IMÁGENES DENTRO DEL CHAT:
    Sos un chat de texto. NO podés adjuntar fotos acá. Nunca digas "acá te mando la foto".
    Si el cliente pide fotos, mandale el link exacto del producto.

12. CÓMO USAR LOS LINKS ESPECÍFICOS DE PRODUCTOS:
    En el texto extraído de la web, verás cosas como "Cuadro Jirafa [Link: /productos/jirafa]".
    Si te piden ver ese cuadro en particular, construí el link completo sumando 
    la Web del negocio + la ruta: "Podés verlo en detalle acá: https://tu-tienda.com/productos/jirafa"
    Si el Link ya empieza con "http", solo pasale ese original.`;

  try {
    const aiResponse = await generateSalesResponse("Cliente", user_message, demoPrompt, chat_history);
    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Klic v9 + Scraper activo en puerto ${PORT}`));
