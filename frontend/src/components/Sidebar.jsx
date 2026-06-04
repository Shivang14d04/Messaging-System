import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ folders, stats, activeFolder, onFolderChange, collapsed, isOpen }) => {
  const navigate = useNavigate();

  const handleFolderClick = (label) => {
    onFolderChange(label);
    navigate('/');
  };

  const getDotColor = (color) => {
    switch (color?.toLowerCase()) {
      case 'blue': return '#2563EB';
      case 'green': return '#16A34A';
      case 'yellow': return '#D97706';
      case 'red': return '#DC2626';
      default: return '#6B7280';
    }
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${isOpen ? 'mobile-open' : ''}`}>
      <button className="compose-btn" onClick={() => navigate('/compose')} title="Compose Email">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
          <path d="M12 5v14M5 12h14"/>
        </svg>
        <span>Compose</span>
      </button>

      <div className="sidebar-section">
        <h3 className="section-title">Default Folders</h3>
        {folders?.defaultFolders?.map((folder) => {
          const unreadCount = stats[folder.label] || 0;
          const isActive = activeFolder === folder.label;
          return (
            <div
              key={folder.label}
              className={`folder-item ${isActive ? 'active' : ''}`}
              onClick={() => handleFolderClick(folder.label)}
              title={folder.label}
            >
              <div className="folder-left">
                <span
                  className="folder-dot"
                  style={{ backgroundColor: getDotColor(folder.color) }}
                ></span>
                <span>{folder.label}</span>
              </div>
              {unreadCount > 0 && (
                <span className="unread-badge">{unreadCount}</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="sidebar-section">
        <h3 className="section-title">My Folders</h3>
        {folders?.userFolders?.map((folder) => {
          const unreadCount = stats[folder.label] || 0;
          const isActive = activeFolder === folder.label;
          return (
            <div
              key={folder.label}
              className={`folder-item ${isActive ? 'active' : ''}`}
              onClick={() => handleFolderClick(folder.label)}
              title={folder.label}
            >
              <div className="folder-left">
                <span
                  className="folder-dot"
                  style={{ backgroundColor: getDotColor(folder.color) }}
                ></span>
                <span>{folder.label}</span>
              </div>
              {unreadCount > 0 && (
                <span className="unread-badge">{unreadCount}</span>
              )}
            </div>
          );
        })}
        {(!folders?.userFolders || folders.userFolders.length === 0) && !collapsed && (
          <div style={{ paddingLeft: '0.75rem', fontSize: '0.8rem', color: '#9CA3AF' }}>
            No custom folders
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
