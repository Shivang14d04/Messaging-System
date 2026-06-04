import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { emailService } from '../services/api';

const EmailDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const folder = searchParams.get('folder') || 'Inbox';
  const navigate = useNavigate();

  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmailDetails = async () => {
      try {
        const data = await emailService.getEmail(id);
        setEmail(data);
      } catch (err) {
        console.error('Failed to fetch email:', err);
        setError('You do not have access to this email or it does not exist.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmailDetails();
  }, [id]);

  const handleReply = () => {
    if (!email) return;
    navigate(`/compose?to=${encodeURIComponent(email.from)}&replyId=${encodeURIComponent(email.id)}`);
  };

  if (loading) {
    return (
      <div className="email-detail-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading email details...</p>
        </div>
      </div>
    );
  }

  if (error || !email) {
    return (
      <div className="email-detail-container">
        <div className="back-link" onClick={() => navigate(-1)}>
          &larr; Back to {folder}
        </div>
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <h3>Error loading email</h3>
          <p>{error || 'An unexpected error occurred.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="email-detail-container">
      <div className="back-link" onClick={() => navigate(-1)}>
        &larr; Back to {folder}
      </div>

      <div className="email-header-card">
        <div className="email-title-row">
          <h2 className="email-subject-heading">{email.subject || '(No Subject)'}</h2>
          <div className="action-row">
            <button className="btn-secondary" onClick={handleReply}>
              Reply
            </button>
          </div>
        </div>

        <div className="email-meta-info">
          <div className="meta-row">
            <span className="meta-label">From:</span>
            <span className="meta-value">{email.from}</span>
          </div>
          <div className="meta-row">
            <span className="meta-label">To:</span>
            <span className="meta-value">{email.to?.join(', ')}</span>
          </div>
        </div>
      </div>

      <div className="email-body-card">
        {email.body || '(No message body)'}
      </div>
    </div>
  );
};

export default EmailDetail;
