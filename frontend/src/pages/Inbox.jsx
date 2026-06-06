import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { emailService } from '../services/api';

const Inbox = ({ activeFolder, onStatsRefresh, userFolders }) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmailIds, setSelectedEmailIds] = useState([]);
  const navigate = useNavigate();

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const data = await emailService.getEmails(activeFolder);
      setEmails(data || []);
    } catch (err) {
      console.error('Failed to load emails:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedEmailIds([]); // Clear selection when active folder changes
    fetchEmails();
  }, [activeFolder]);

  const handleEmailClick = async (emailId, isRead) => {
    try {
      if (!isRead) {
        await emailService.markAsRead(emailId, activeFolder);
        if (onStatsRefresh) onStatsRefresh();
      }
    } catch (err) {
      console.error('Failed to mark email as read:', err);
    }
    navigate(`/email/${emailId}?folder=${encodeURIComponent(activeFolder)}`);
  };

  const handleSelectEmail = (emailId) => {
    setSelectedEmailIds((prev) =>
      prev.includes(emailId)
        ? prev.filter((id) => id !== emailId)
        : [...prev, emailId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmailIds.length === emails.length) {
      setSelectedEmailIds([]);
    } else {
      setSelectedEmailIds(emails.map((e) => e.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEmailIds.length === 0) return;
    const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedEmailIds.length} email(s)?`);
    if (!confirmDelete) return;

    try {
      await emailService.deleteEmails(activeFolder, selectedEmailIds);
      setSelectedEmailIds([]);
      if (onStatsRefresh) onStatsRefresh();
      await fetchEmails();
    } catch (err) {
      console.error('Failed to delete emails:', err);
      alert('Failed to delete selected emails.');
    }
  };

  const handleBulkCopy = async (targetFolder) => {
    if (selectedEmailIds.length === 0) return;
    try {
      await emailService.copyEmails(activeFolder, targetFolder, selectedEmailIds);
      setSelectedEmailIds([]);
      if (onStatsRefresh) onStatsRefresh();
      await fetchEmails();
      alert(`Successfully copied ${selectedEmailIds.length} email(s) to ${targetFolder}`);
    } catch (err) {
      console.error('Failed to copy emails:', err);
      alert('Failed to copy selected emails.');
    }
  };

  if (loading) {
    return (
      <div className="mail-list-pane">
        <div className="pane-header">
          <h2 className="pane-title">{activeFolder}</h2>
        </div>
        <div className="loading-container" style={{ minHeight: '300px' }}>
          <div className="spinner"></div>
          <p>Retrieving messages...</p>
        </div>
      </div>
    );
  }

  const unreadCount = emails.filter((e) => !e.read).length;
  const isAnySelected = selectedEmailIds.length > 0;

  return (
    <div className="mail-list-pane">
      {isAnySelected ? (
        <div className="pane-header bulk-actions-active">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input
              type="checkbox"
              checked={emails.length > 0 && selectedEmailIds.length === emails.length}
              onChange={handleSelectAll}
              className="mail-checkbox master-checkbox"
              title="Deselect all"
            />
            <span className="selection-count">{selectedEmailIds.length} selected</span>
          </div>
          <div className="bulk-action-buttons">
            {userFolders && userFolders.length > 0 && (
              <div className="copy-dropdown-wrapper">
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkCopy(e.target.value);
                      e.target.value = '';
                    }
                  }}
                  className="bulk-select"
                  defaultValue=""
                >
                  <option value="" disabled>Copy to folder...</option>
                  {userFolders.map((folder) => (
                    <option key={folder.label} value={folder.label}>
                      {folder.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button onClick={handleBulkDelete} className="bulk-btn-delete" title="Delete selected">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
              <span>Delete</span>
            </button>

            <button onClick={() => setSelectedEmailIds([])} className="bulk-btn-cancel">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="pane-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {emails.length > 0 && (
              <input
                type="checkbox"
                checked={false}
                onChange={handleSelectAll}
                className="mail-checkbox master-checkbox"
                title="Select all"
              />
            )}
            <h2 className="pane-title">{activeFolder}</h2>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span>{emails.length} message(s)</span>
            {unreadCount > 0 && (
              <>
                <span style={{ color: 'var(--border-color)' }}>•</span>
                <span style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>{unreadCount} unread</span>
              </>
            )}
          </span>
        </div>
      )}

      <div className="mail-rows">
        {emails.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>No messages found</h3>
            <p>This folder is completely empty.</p>
          </div>
        ) : (
          emails.map((email) => (
            <div
              key={email.id}
              className={`mail-row-card ${!email.read ? 'unread' : ''} ${selectedEmailIds.includes(email.id) ? 'selected' : ''}`}
              onClick={() => handleEmailClick(email.id, email.read)}
            >
              <div className="mail-checkbox-wrapper" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedEmailIds.includes(email.id)}
                  onChange={() => handleSelectEmail(email.id)}
                  className="mail-checkbox"
                />
              </div>
              <div className="mail-sender">
                {email.from}
              </div>
              <div className="mail-main-content">
                <div className="mail-subject">{email.subject || '(No Subject)'}</div>
                <div className="mail-snippet">
                  {email.to ? `To: ${email.to.join(', ')}` : ''}
                </div>
              </div>
              <div className="mail-meta">
                <span className="mail-time">{email.agoTimeString}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Inbox;
