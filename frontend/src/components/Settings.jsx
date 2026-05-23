import React from 'react';
import ThemeToggle from './ThemeToggle';
import { Trash2, Settings as SettingsIcon, LogOut, User } from 'lucide-react';

export default function Settings({ onClearHistory, onLogout, user }) {
  return (
    <div className="settings-container">
      <h2>Settings</h2>

      <div className="settings-section">
        <h3>Appearance</h3>
        <div className="setting-item">
          <span>Theme Preference</span>
          <ThemeToggle />
        </div>
      </div>

      <div className="settings-section">
        <h3>Account</h3>
        <div className="setting-item">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} />
            <span>
              Logged in as: <strong>{user?.email}</strong>
            </span>
          </div>
          <button
            className="btn-primary"
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'transparent',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="settings-section danger-zone">
        <h3>Danger Zone</h3>
        <div className="setting-item">
          <span>Clear all chat history permanently</span>
          <button
            className="btn-danger"
            onClick={() => {
              if (window.confirm('Are you sure you want to permanently delete all chat history?')) {
                onClearHistory();
              }
            }}
          >
            <Trash2 size={16} /> Clear
          </button>
        </div>
      </div>
    </div>
  );
}
