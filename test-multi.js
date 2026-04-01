const { OpenAI } = require('openai');

const GROQ = "gsk_" + "aZ1iRJGncvc" + "swzXSHZpuWGdyb3" + "FYL4xKCARceY3j0aCQJNjikOcg";
const groqAI = new OpenAI({ apiKey: GROQ, baseURL: "https://api.groq.com/openai/v1" });

async function test() {
  const messages = [
    { role: "system", content: "Eres un chatbot de prueba." },
    { role: "user", content: "Cliente (Miguel): tenes cuadros?" },
    { role: "assistant", content: "Sí, tenemos cuadros infantiles." },
    { role: "user", content: "Cliente (Miguel): elefantes?" }
  ];

  try {
    const res = await groqAI.chat.completions.create({ model: "llama-3.1-8b-instant", messages, temperature: 0.4 });
    console.log("GROQ 8B SUCCESS:", res.choices[0].message.content);
  } catch (e) {
    console.log("GROQ 8B ERROR:", e.message);
  }
}

test();
