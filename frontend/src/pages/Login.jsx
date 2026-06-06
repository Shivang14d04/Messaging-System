import React, { useState } from 'react';
import { authService } from '../services/api';

const Login = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await authService.register(username, password);
        setSuccessMsg('Registration successful! Logging you in...');
        await authService.login(username, password);
        onLoginSuccess();
      } else {
        await authService.login(username, password);
        onLoginSuccess();
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data || 'An error occurred. Please try again.';
      setError(typeof msg === 'string' ? msg : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-icon login-logo">Æ</div>
        <h2 className="login-title">Aether Inbox</h2>
        <p className="login-subtitle">
          {isSignUp ? 'Create your new productivity account' : 'A professional productivity email workspace'}
        </p>

        {error && <div className="login-error-message">{error}</div>}
        {successMsg && <div className="login-success-message">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              placeholder="Enter your username"
              required
            />
          </div>

          <div className="login-input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="Enter your password"
              required
            />
          </div>

          {isSignUp && (
            <div className="login-input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                placeholder="Confirm your password"
                required
              />
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        {!isSignUp && (
          <>
            <div className="login-divider">
              <span>or</span>
            </div>
            <button
              type="button"
              className="oauth-button github-btn"
              onClick={() => {
                window.location.href = 'http://localhost:8080/oauth2/authorization/github';
              }}
              disabled={loading}
            >
              Sign in with GitHub
            </button>
          </>
        )}

        <p className="login-toggle-text">
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button
            type="button"
            className="login-toggle-link"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setSuccessMsg('');
            }}
            disabled={loading}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
