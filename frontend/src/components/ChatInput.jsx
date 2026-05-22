import React, { useState } from 'react';
import { Send } from 'lucide-react';

export default function ChatInput({ onSendMessage, isProcessing }) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isProcessing) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="input-container">
      <form className="input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="input-field"
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isProcessing}
          autoFocus
        />
        <button 
          type="submit" 
          className="send-btn" 
          disabled={!inputValue.trim() || isProcessing}
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
