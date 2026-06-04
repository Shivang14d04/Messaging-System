import React from 'react';
import { authService } from '../services/api';

const Navbar = ({ user, onToggleSidebar }) => {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle-btn" onClick={onToggleSidebar} aria-label="Toggle Sidebar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div className="brand-section">
          <div className="logo-icon">Æ</div>
          <h1 className="brand-name">Aether Inbox</h1>
        </div>
      </div>

      {user && (
        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">{user.name || user.login}</span>
            <span className="user-role">@{user.login}</span>
          </div>
          <div className="avatar-wrapper">
            <img
              src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}
              alt={user.name}
              className="avatar"
            />
          </div>
          <button className="logout-btn" onClick={authService.logout}>
            Sign Out
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
