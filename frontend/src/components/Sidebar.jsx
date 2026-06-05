import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { folderService } from '../services/api';

const Sidebar = ({ folders, stats, activeFolder, onFolderChange, collapsed, isOpen, onFoldersRefresh }) => {
  const navigate = useNavigate();

  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFolderClick = (label) => {
    onFolderChange(label);
    navigate('/');
  };

  const getFolderIcon = (label) => {
    const lowerLabel = label?.toLowerCase();

    // Inbox Icon
    if (lowerLabel === 'inbox') {
      return (
        <svg className="folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
          <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
      );
    }

    // Sent Items Icon
    if (lowerLabel === 'sent items' || lowerLabel === 'sent') {
      return (
        <svg className="folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      );
    }

    // Important Icon
    if (lowerLabel === 'important') {
      return (
        <svg className="folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    }

    // Default/Custom Folder Icon
    return (
      <svg className="folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    );
  };

  const handleAddFolderSubmit = async (e) => {
    e.preventDefault();
    if (!newLabel.trim()) {
      setError('Folder name cannot be empty');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      await folderService.addFolder(newLabel.trim(), 'blue');
      setNewLabel('');
      setIsAdding(false);
      if (onFoldersRefresh) {
        await onFoldersRefresh();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Failed to add folder');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${isOpen ? 'mobile-open' : ''}`}>
      <button className="compose-btn" onClick={() => navigate('/compose')} title="Compose Email">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
          <path d="M12 5v14M5 12h14" />
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
                {getFolderIcon(folder.label)}
                <span className={unreadCount > 0 ? 'unread-folder' : ''} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>{folder.label}</span>
                  {unreadCount > 0 && <span className="folder-unread-count">({unreadCount})</span>}
                </span>
              </div>
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
                {getFolderIcon(folder.label)}
                <span className={unreadCount > 0 ? 'unread-folder' : ''} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span>{folder.label}</span>
                  {unreadCount > 0 && <span className="folder-unread-count">({unreadCount})</span>}
                </span>
              </div>
            </div>
          );
        })}
        {(!folders?.userFolders || folders.userFolders.length === 0) && !collapsed && (
          <div style={{ paddingLeft: '0.75rem', fontSize: '0.8rem', color: '#9CA3AF', marginBottom: '0.5rem' }}>
            No custom folders
          </div>
        )}

        {!collapsed && (
          <div className="add-folder-section">
            {!isAdding ? (
              <button className="add-folder-btn" onClick={() => { setIsAdding(true); setError(''); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>Add Folder</span>
              </button>
            ) : (
              <form onSubmit={handleAddFolderSubmit} className="add-folder-form">
                <input
                  type="text"
                  placeholder="Folder name"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="add-folder-input"
                  maxLength={20}
                  disabled={isSubmitting}
                  autoFocus
                />

                {error && <div className="add-folder-error">{error}</div>}

                <div className="add-folder-actions">
                  <button type="submit" className="btn-create" disabled={isSubmitting}>
                    {isSubmitting ? '...' : 'Create'}
                  </button>
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => { setIsAdding(false); setError(''); setNewLabel(''); }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
