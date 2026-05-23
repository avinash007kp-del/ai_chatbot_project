const { sql } = require('@vercel/postgres');
const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI;

// Get all chats for history
exports.getChats = async (req, res) => {
  try {
    const { rows } = await sql`
      SELECT id as _id, title, updated_at as "updatedAt"
      FROM chats
      WHERE user_id = ${req.user.id}
      ORDER BY updated_at DESC
    `;
    res.json(rows);
  } catch (err) {
    console.error('Fetch chats error:', err);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};

// Create a new chat
exports.createChat = async (req, res) => {
  try {
    const { title } = req.body;
    const chatTitle = title || 'New Chat';
    const { rows } = await sql`
      INSERT INTO chats (user_id, title, messages)
      VALUES (${req.user.id}, ${chatTitle}, '[]'::jsonb)
      RETURNING id as _id, title, messages, created_at as "createdAt", updated_at as "updatedAt"
    `;
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create chat error:', err);
    res.status(500).json({ error: 'Failed to create chat' });
  }
};

// Get a single chat by ID
exports.getChatById = async (req, res) => {
  try {
    const { rows } = await sql`
      SELECT id as _id, title, messages, created_at as "createdAt", updated_at as "updatedAt"
      FROM chats
      WHERE id = ${req.params.id} AND user_id = ${req.user.id}
    `;
    if (rows.length === 0) return res.status(404).json({ error: 'Chat not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Fetch chat by id error:', err);
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { content, attachment } = req.body;
    const chatId = req.params.id;

    const { rows: chatRows } = await sql`
      SELECT id, title, messages
      FROM chats
      WHERE id = ${chatId} AND user_id = ${req.user.id}
    `;
    
    if (chatRows.length === 0) return res.status(404).json({ error: 'Chat not found' });
    
    const chat = chatRows[0];
    let messages = chat.messages || [];

    // Add user message to DB (excluding raw base64 data to save DB space)
    const userMessage = { 
      role: 'user', 
      content,
      attachment: attachment ? { fileName: attachment.fileName, mimeType: attachment.mimeType } : undefined,
      timestamp: new Date().toISOString()
    };
    messages.push(userMessage);

    // Auto-generate title if it's the first message
    let newTitle = chat.title;
    if (messages.length === 1) {
      newTitle = content.length > 30 ? content.substring(0, 30) + '...' : content || (attachment ? attachment.fileName : 'New Chat');
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
      const historyForGemini = messages.slice(0, -1).map((m) => ({
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
    const botMessage = { 
      role: 'bot', 
      content: botResponseContent,
      timestamp: new Date().toISOString()
    };
    messages.push(botMessage);

    // Update the database
    await sql`
      UPDATE chats
      SET title = ${newTitle}, messages = ${JSON.stringify(messages)}::jsonb, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${chatId}
    `;

    res.json({
      userMessage: messages[messages.length - 2],
      botMessage: messages[messages.length - 1],
      chatId: chat.id, // Vercel Postgres ID
    });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Clear history
exports.clearHistory = async (req, res) => {
  try {
    await sql`DELETE FROM chats WHERE user_id = ${req.user.id}`;
    res.json({ message: 'History cleared' });
  } catch (err) {
    console.error('Clear history error:', err);
    res.status(500).json({ error: 'Failed to clear history' });
  }
};

