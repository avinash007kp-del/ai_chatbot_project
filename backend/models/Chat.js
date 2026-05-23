const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'New Chat'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'bot'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    attachment: {
      fileName: String,
      mimeType: String
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema);
