import React from 'react';

const Login = () => {
  const handleGitHubLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/github';
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-icon login-logo">Æ</div>
        <h2 className="login-title">Aether Inbox</h2>
        <p className="login-subtitle">A professional productivity email workspace</p>

        <button className="oauth-button github-btn" onClick={handleGitHubLogin}>
          Sign in with GitHub
        </button>

        <button className="oauth-button google-btn" onClick={handleGoogleLogin}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
