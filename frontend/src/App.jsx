import React, { useState, useRef, useEffect } from 'react';
import { BotMessageSquare, PanelLeftOpen, Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Settings from './components/Settings';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

const API_URL = '/api/chats';

function App() {
  const [activeView, setActiveView] = useState('chat');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  // Auth state
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')));
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (activeView === 'chat') {
      scrollToBottom();
    }
  }, [messages, activeView]);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch chat history on mount or when token changes
  useEffect(() => {
    if (token) fetchChats();
  }, [token]);

  const fetchChats = async () => {
    try {
      const res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setChatHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch chat history:', err);
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    setActiveView('chat');
  };

  const handleSelectChat = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCurrentChatId(data._id);
      setMessages(data.messages || []);
      setActiveView('chat');
    } catch (err) {
      console.error('Failed to load chat:', err);
    }
  };

  const handleSendMessage = async (content, attachment) => {
    const newUserMsg = { 
      id: Date.now().toString(), 
      role: 'user', 
      content, 
      attachment: attachment ? { fileName: attachment.fileName } : undefined 
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setIsProcessing(true);

    try {
      let chatIdToUse = currentChatId;

      // If no current chat, create one first
      if (!chatIdToUse) {
        const createRes = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title: content.substring(0, 30) || (attachment ? attachment.fileName : 'New Chat') }),
        });
        if (!createRes.ok) throw new Error('Failed to create chat');
        const newChat = await createRes.json();
        chatIdToUse = newChat._id;
        setCurrentChatId(chatIdToUse);
        fetchChats(); // refresh sidebar
      }

      // Send the message
      const res = await fetch(`${API_URL}/${chatIdToUse}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, attachment }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to send message');
      }
      const data = await res.json();

      // Append the bot response securely
      if (data && data.botMessage) {
        setMessages((prev) => [...prev, data.botMessage]);
      } else {
        throw new Error('No bot message received');
      }

      fetchChats(); // refresh sidebar in case title changed
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: 'bot', content: `Error: ${err.message}` },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await fetch(API_URL, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages([]);
      setCurrentChatId(null);
      setChatHistory([]);
      setActiveView('chat');
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setToken(userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setMessages([]);
    setChatHistory([]);
    setCurrentChatId(null);
  };

  if (!user) {
    return authMode === 'login' ? (
      <Login onLogin={handleLoginSuccess} switchToRegister={() => setAuthMode('register')} />
    ) : (
      <Register onRegister={handleLoginSuccess} switchToLogin={() => setAuthMode('login')} />
    );
  }

  return (
    <div className="layout-container">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        toggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isDesktopCollapsed={isDesktopCollapsed}
        toggleDesktopSidebar={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
        activeView={activeView}
        setActiveView={setActiveView}
        chatHistory={chatHistory}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onLogout={handleLogout}
        onClearHistory={handleClearHistory}
      />

      <div className="main-content">
        <header
          className="header"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <div className="header-left">
            <button
              className="icon-btn mobile-menu-btn"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>

            {isDesktopCollapsed && (
              <button
                className="icon-btn desktop-menu-btn"
                onClick={() => setIsDesktopCollapsed(false)}
                title="Open sidebar"
              >
                <PanelLeftOpen size={24} />
              </button>
            )}

            <h1>
              <BotMessageSquare className="accent-icon" size={28} />
              AI Chatbot
            </h1>
          </div>
          <div
            className="header-right"
            style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}
          >
            {currentTime.toLocaleString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </header>

        {activeView === 'chat' ? (
          <>
            <main className="chat-container" ref={chatContainerRef}>
              {messages.length === 0 ? (
                <div className="empty-chat-message">
                  <h2>How can I help you today?</h2>
                </div>
              ) : (
                messages.map((msg, idx) => <ChatMessage key={msg._id || idx} message={msg} />)
              )}
              {isProcessing && (
                <div className="chat-message-wrapper bot">
                  <div className="chat-message bot typing-indicator">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              )}
            </main>
            <ChatInput onSendMessage={handleSendMessage} isProcessing={isProcessing} />
          </>
        ) : (
          <Settings onClearHistory={handleClearHistory} onLogout={handleLogout} user={user} />
        )}
      </div>
    </div>
  );
}

export default App;
