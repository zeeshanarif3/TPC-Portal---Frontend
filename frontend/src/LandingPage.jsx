import './LandingPage.css';
import { useState, useEffect } from 'react';

function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginClick = () => {
    setIsLoginOpen(true);
  };

  const handleCloseLogin = () => {
    setIsLoginOpen(false);
    setUsername('');
    setPassword('');
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement actual login logic with backend
    console.log('Login attempt:', { username, password });
    alert('Login functionality not implemented yet (TODO)');
    // For now, just close the form
    handleCloseLogin();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && isLoginOpen) {
      handleCloseLogin();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLoginOpen]);

  const handleOutsideClick = (e) => {
    if (isLoginOpen && e.target === e.currentTarget) {
      handleCloseLogin();
    }
  };

  return (
    <div
      className="landing-page"
      onClick={handleOutsideClick}
    >
      <div className="landing-page-content">
        {isLoginOpen ? (
          <div className="login-modal-backdrop" onClick={e => e.stopPropagation()}>
            <div className="login-card" onClick={e => e.stopPropagation()}>
              <div className="login-header">
                <h2>TPC Global Login</h2>
                <button className="close-button" onClick={handleCloseLogin}>
                  ×
                </button>
              </div>
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="Enter your username"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <button type="submit" className="login-button">
                  Login
                </button>
                <p className="login-note">
                  TODO: Implement actual backend authentication
                </p>
              </form>
            </div>
          </div>
        ) : (
          <div className="two-columns">
            <div className="left-column">
              {/* Logo Placeholder */}
              <div className="logo-placeholder">
                <div className="logo-box">
                  <div className="logo-text">TPC Global Logo</div>
                </div>
              </div>

              {/* Title */}
              <h1 className="hero-title">TPC Global Session Manager</h1>
            </div>

            <div className="right-column">
              {/* Description */}
              <p className="hero-description">
                Streamline your enterprise workflows. Monitor, secure, and manage active global sessions from a single unified workspace.
              </p>
              {/* CTA Button */}
              <button className="cta-button" onClick={handleLoginClick}>
                Head to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LandingPage;