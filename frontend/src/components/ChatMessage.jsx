import React from 'react';
import { marked } from 'marked';

marked.setOptions({
  breaks: true,
  gfm: true
});

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  
  if (!message || !message.content) return null;

  const createMarkup = (text) => {
    return { __html: marked.parse(text || '') };
  };

  return (
    <div className={`chat-message-wrapper ${isUser ? 'user' : 'bot'}`}>
      <div className={`chat-message ${isUser ? 'user' : 'bot'}`}>
        {isUser ? (
          <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
        ) : (
          <div 
            className="markdown-body" 
            dangerouslySetInnerHTML={createMarkup(message.content)} 
          />
        )}
      </div>
    </div>
  );
}
