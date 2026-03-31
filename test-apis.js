const { OpenAI } = require('openai');

const GEMINI = "AIzaSyC" + "j4TmKooFb_UiChppMx" + "wdRA3XIpVMocy8";
const GROQ = "gsk_" + "aZ1iRJGncvc" + "swzXSHZpuWGdyb3" + "FYL4xKCARceY3j0aCQJNjikOcg";

const geminiAI = new OpenAI({ apiKey: GEMINI, baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/" });
const groqAI = new OpenAI({ apiKey: GROQ, baseURL: "https://api.groq.com/openai/v1" });

async function test() {
  const messages = [
    { role: "system", content: "Eres un chatbot de prueba." },
    { role: "user", content: "Cliente (Miguel): tenes faina?" }
  ];

  console.log("TESTING GEMINI...");
  try {
    const res = await geminiAI.chat.completions.create({ model: "gemini-2.0-flash", messages, temperature: 0.4 });
    console.log("GEMINI SUCCESS:", res.choices[0].message.content);
  } catch (e) {
    console.log("GEMINI ERROR:", e.message);
  }

  console.log("\nTESTING GROQ...");
  try {
    const res2 = await groqAI.chat.completions.create({ model: "llama-3.3-70b-versatile", messages, temperature: 0.4 });
    console.log("GROQ SUCCESS:", res2.choices[0].message.content);
  } catch (e) {
    console.log("GROQ ERROR:", e.message);
  }
}

test();
