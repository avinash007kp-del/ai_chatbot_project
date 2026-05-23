import React, { useState } from 'react';
import { marked } from 'marked';
import { Volume2, Square, Paperclip } from 'lucide-react';

marked.setOptions({
  breaks: true,
  gfm: true,
});

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const [isPlaying, setIsPlaying] = useState(false);

  if (!message || (!message.content && !message.attachment)) return null;

  const createMarkup = (text) => {
    return { __html: marked.parse(text || '') };
  };

  const toggleSpeech = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    // Strip markdown tags to read it cleanly
    const plainText = message.content.replace(/[#_*`~\[\]]/g, '');
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`chat-message-wrapper ${isUser ? 'user' : 'bot'}`}>
      <div className={`chat-message ${isUser ? 'user' : 'bot'}`}>
        {isUser ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {message.attachment && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.4rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                <Paperclip size={14} />
                {message.attachment.fileName}
              </div>
            )}
            {message.content && <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>}
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <div className="markdown-body" dangerouslySetInnerHTML={createMarkup(message.content)} />
            <button 
              onClick={toggleSpeech} 
              style={{ position: 'absolute', bottom: '-2rem', left: 0, background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', padding: 0 }}
              title={isPlaying ? "Stop playing" : "Play message"}
            >
              {isPlaying ? <Square size={14} color="var(--accent)" /> : <Volume2 size={14} />}
              <span style={{ color: isPlaying ? 'var(--accent)' : 'inherit' }}>{isPlaying ? 'Stop' : 'Listen'}</span>
            </button>
            <div style={{ marginBottom: '1.2rem' }}></div>
          </div>
        )}
      </div>
    </div>
  );
}
