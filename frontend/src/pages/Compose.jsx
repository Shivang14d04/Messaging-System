import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { emailService } from '../services/api';

const Compose = ({ onStatsRefresh }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const toParam = searchParams.get('to');
    const replyIdParam = searchParams.get('replyId');

    if (toParam) {
      setTo(toParam);
    }

    if (replyIdParam) {
      const loadOriginalEmail = async () => {
        try {
          const original = await emailService.getEmail(replyIdParam);
          setSubject(`Re: ${original.subject || ''}`);
          setBody(`\n\n\n----------------------------------\nFrom: ${original.from}\nTo: ${original.to?.join(', ')}\n\n${original.body || ''}`);
        } catch (err) {
          console.error('Failed to load original email for reply:', err);
        }
      };
      loadOriginalEmail();
    }
  }, [searchParams]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!to.trim()) {
      setError('Please specify at least one recipient.');
      return;
    }

    const recipients = to
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    setSending(true);
    setError(null);

    try {
      await emailService.sendEmail(recipients, subject, body);
      if (onStatsRefresh) onStatsRefresh();
      navigate('/');
    } catch (err) {
      console.error('Failed to send email:', err);
      setError('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="compose-container">
      <div className="compose-card">
        <h2 className="compose-title">Compose Message</h2>

        {error && (
          <div style={{ color: '#DC2626', background: '#FEE2E2', padding: '0.8rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSend}>
          <div className="form-group">
            <label className="form-label">To (comma-separated usernames)</label>
            <input
              type="text"
              className="form-input"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="e.g. Shivang, Aarushi"
              required
              disabled={sending}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Subject</label>
            <input
              type="text"
              className="form-input"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject line"
              disabled={sending}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Message Body</label>
            <textarea
              className="form-input form-textarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email here..."
              disabled={sending}
            />
          </div>

          <div className="compose-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(-1)}
              disabled={sending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="compose-btn"
              style={{ width: 'auto' }}
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Compose;
