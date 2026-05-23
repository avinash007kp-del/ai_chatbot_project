import React, { useState } from 'react';
import {
  MessageSquare,
  Settings as SettingsIcon,
  X,
  Search,
  Clock,
  PanelLeftClose,
  LogOut,
  Trash2,
} from 'lucide-react';

export default function Sidebar({
  isMobileOpen,
  toggleMobileSidebar,
  isDesktopCollapsed,
  toggleDesktopSidebar,
  activeView,
  setActiveView,
  chatHistory,
  onSelectChat,
  onNewChat,
  onLogout,
  onClearHistory,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { id: 'chat', label: 'New Chat', icon: MessageSquare, action: onNewChat },
    {
      id: 'settings',
      label: 'Settings',
      icon: SettingsIcon,
      action: () => setActiveView('settings'),
    },
    {
      id: 'clear',
      label: 'Clear History',
      icon: Trash2,
      action: () => {
        if (window.confirm('Are you sure you want to permanently delete all chat history?')) {
          onClearHistory();
        }
      },
    },
    { id: 'logout', label: 'Logout', icon: LogOut, action: onLogout },
  ];

  const filteredHistory =
    chatHistory?.filter((item) => item.title?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    [];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && <div className="sidebar-overlay" onClick={toggleMobileSidebar}></div>}

      {/* Sidebar Content */}
      <aside
        className={`sidebar ${isMobileOpen ? 'mobile-open' : ''} ${isDesktopCollapsed ? 'desktop-collapsed' : ''}`}
      >
        <div className="sidebar-header">
          {!isDesktopCollapsed && <h2>AI Chatbot</h2>}
          <button className="icon-btn mobile-close" onClick={toggleMobileSidebar}>
            <X size={20} />
          </button>
          {!isDesktopCollapsed && (
            <button
              className="icon-btn desktop-close"
              onClick={toggleDesktopSidebar}
              title="Hide sidebar"
            >
              <PanelLeftClose size={20} />
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeView === item.id ? 'active' : ''} ${isDesktopCollapsed ? 'collapsed' : ''}`}
                onClick={() => {
                  item.action();
                  if (window.innerWidth <= 768) {
                    toggleMobileSidebar();
                  }
                }}
                title={isDesktopCollapsed ? item.label : ''}
              >
                <Icon size={18} />
                {!isDesktopCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {!isDesktopCollapsed && (
          <div className="sidebar-history-section">
            <div className="history-search">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="history-list">
              <span className="history-label">Recent Chats</span>
              <div className="history-items-container">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item) => (
                    <button
                      key={item._id}
                      className="history-item"
                      onClick={() => {
                        onSelectChat(item._id);
                        if (window.innerWidth <= 768) toggleMobileSidebar();
                      }}
                    >
                      <Clock size={16} className="history-item-icon" />
                      <div className="history-item-content">
                        <span className="history-title">{item.title}</span>
                        <span className="history-date">
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="history-empty">No results found</div>
                )}
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
