const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro', systemInstruction: 'You are a helpful AI assistant.' });
async function test() {
  try {
    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage('Hi');
    console.log(result.response.text());
  } catch (err) {
    console.error('ERROR:', err);
  }
}
test();
