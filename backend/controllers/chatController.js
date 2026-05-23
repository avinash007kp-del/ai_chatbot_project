const Chat = require('../models/Chat');
const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI;

// Get all chats for history
exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};

// Create a new chat
exports.createChat = async (req, res) => {
  try {
    const { title } = req.body;
    const newChat = new Chat({ title: title || 'New Chat', messages: [], userId: req.user._id });
    await newChat.save();
    res.status(201).json(newChat);
  } catch (err) {
    console.error('Create chat error:', err);
    res.status(500).json({ error: 'Failed to create chat' });
  }
};

// Get a single chat by ID
exports.getChatById = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { content, attachment } = req.body;
    const chatId = req.params.id;

    const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    // Add user message to DB (excluding raw base64 data to save DB space)
    const userMessage = { 
      role: 'user', 
      content,
      attachment: attachment ? { fileName: attachment.fileName, mimeType: attachment.mimeType } : undefined
    };
    chat.messages.push(userMessage);

    // Auto-generate title if it's the first message
    if (chat.messages.length === 1) {
      chat.title = content.length > 30 ? content.substring(0, 30) + '...' : content || (attachment ? attachment.fileName : 'New Chat');
    }

    let botResponseContent = '';

    // If a valid API key exists, call Gemini
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'mock-key-to-prevent-crash') {
      if (!genAI) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      }

      const currentTimeString = new Date().toLocaleString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: `You are a helpful AI assistant. The current date and time is ${currentTimeString}.`,
      });

      // Gemini expects history without the final current prompt
      const historyForGemini = chat.messages.slice(0, -1).map((m) => ({
        role: m.role === 'bot' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const chatSession = model.startChat({
        history: historyForGemini,
      });

      const parts = [{ text: content }];
      if (attachment && attachment.data) {
        parts.push({
          inlineData: {
            mimeType: attachment.mimeType,
            data: attachment.data
          }
        });
      }

      const result = await chatSession.sendMessage(parts);
      botResponseContent = result.response.text();
    } else {
      // Mock response if no valid key
      botResponseContent = `This is a mock response from the Node.js backend. You said: "${content}". Attached file: ${attachment ? attachment.fileName : 'none'}`;
    }

    // Add bot response to DB
    const botMessage = { role: 'bot', content: botResponseContent };
    chat.messages.push(botMessage);

    await chat.save();

    res.json({
      userMessage: chat.messages[chat.messages.length - 2],
      botMessage: chat.messages[chat.messages.length - 1],
      chatId: chat._id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Clear history
exports.clearHistory = async (req, res) => {
  try {
    await Chat.deleteMany({ userId: req.user._id });
    res.json({ message: 'History cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear history' });
  }
};
