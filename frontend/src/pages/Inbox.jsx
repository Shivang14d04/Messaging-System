import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { emailService } from '../services/api';

const Inbox = ({ activeFolder, onStatsRefresh }) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const fetchEmails = async () => {
      setLoading(true);
      try {
        const data = await emailService.getEmails(activeFolder);
        if (active) {
          setEmails(data || []);
        }
      } catch (err) {
        console.error('Failed to load emails:', err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchEmails();

    return () => {
      active = false;
    };
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

  const unreadCount = emails.filter(e => !e.read).length;

  return (
    <div className="mail-list-pane">
      <div className="pane-header">
        <h2 className="pane-title">{activeFolder}</h2>
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
              className={`mail-row-card ${!email.read ? 'unread' : ''}`}
              onClick={() => handleEmailClick(email.id, email.read)}
            >
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
