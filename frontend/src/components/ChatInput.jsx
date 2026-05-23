import React, { useState, useRef } from 'react';
import { Send, Paperclip, Monitor, Mic, MicOff, X } from 'lucide-react';

export default function ChatInput({ onSendMessage, isProcessing }) {
  const [inputValue, setInputValue] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((inputValue.trim() || attachment) && !isProcessing) {
      onSendMessage(inputValue.trim() || 'What is in this file?', attachment);
      setInputValue('');
      setAttachment(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isCodeFile = /\.(js|py|html|css|txt|json|md|ts|jsx|tsx)$/i.test(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (isCodeFile) {
        // For code/text files, read as text and inject into prompt
        setInputValue((prev) => prev + (prev ? '\n\n' : '') + `Analyze this file (${file.name}):\n\`\`\`\n${event.target.result}\n\`\`\``);
      } else {
        // For images/PDFs, attach as Base64 inlineData
        const base64Data = event.target.result.split(',')[1];
        setAttachment({
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          data: base64Data
        });
      }
    };

    if (isCodeFile) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const base64Data = dataUrl.split(',')[1];

      setAttachment({
        fileName: 'screenshot.jpg',
        mimeType: 'image/jpeg',
        data: base64Data
      });

      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error("Screenshot failed or cancelled");
    }
  };

  const toggleVoice = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Voice Input.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputValue((prev) => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  return (
    <div className="input-container">
      {attachment && (
        <div className="attachment-preview" style={{ padding: '0.5rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem', backgroundColor: 'var(--bot-msg-bg)', borderRadius: '0.5rem', marginBottom: '0.8rem', width: 'fit-content', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 500 }}>
            Attached: {attachment.fileName}
          </span>
          <button type="button" onClick={() => setAttachment(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: '0.2rem', borderRadius: '50%' }} className="icon-btn">
            <X size={14} />
          </button>
        </div>
      )}
      
      <form className="input-form" onSubmit={handleSubmit}>
        <button type="button" className="icon-btn" onClick={() => fileInputRef.current?.click()} aria-label="Attach file" disabled={isProcessing}>
          <Paperclip size={18} />
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileUpload} 
          accept="image/*,application/pdf,.js,.py,.html,.css,.txt,.json,.md,.ts,.jsx,.tsx"
        />

        <button type="button" className="icon-btn" onClick={handleScreenshot} aria-label="Take screenshot" disabled={isProcessing}>
          <Monitor size={18} />
        </button>

        <button type="button" className="icon-btn" onClick={toggleVoice} aria-label="Voice input" disabled={isProcessing}>
          {isRecording ? <MicOff size={18} color="#ef4444" /> : <Mic size={18} />}
        </button>

        <input
          type="text"
          className="input-field"
          placeholder={isRecording ? "Listening..." : "Type your message..."}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isProcessing}
          autoFocus
        />
        <button
          type="submit"
          className="send-btn"
          disabled={(!inputValue.trim() && !attachment) || isProcessing}
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
