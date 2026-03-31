const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: "AIzaSyCj4TmKooFb_UiChppMxwdRA3XIpVMocy8", // Using the key the user provided
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

async function test() {
  try {
    const response = await openai.chat.completions.create({
      model: "gemini-2.0-flash",
      messages: [{ role: "user", content: "Hola, ¿funcionás?" }],
      temperature: 0.4,
    });
    console.log("SUCCESS:", response.choices[0].message.content);
  } catch (e) {
    console.error("ERROR TYPE:", e.name);
    console.error("ERROR MSG:", e.message);
    if (e.response && e.response.data) {
        console.error("DATA:", e.response.data);
    }
  }
}

test();
