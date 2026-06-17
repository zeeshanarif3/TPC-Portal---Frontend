// import './LandingPage.css';
import { useState, useEffect } from 'react';

function LandingPage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null); // {name, email, role}
  const [token, setToken] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: username, // backend expects email
          password: password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        // login successful
        setToken(data.token);
        setUser({
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        });
        // optionally store in localStorage
        localStorage.setItem('tpctoken', data.token);
        localStorage.set_tpcuser, JSON.stringify(data.user);
        handleCloseLogin();
        alert('Login successful!');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Network error. Please try again.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('tpctoken');
    localStorage.removeItem('tpcuser');
    alert('Logged out');
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

  // Attempt to restore session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('tpctoken');
    const storedUser = localStorage.getItem('tpcuser');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleOutsideClick = (e) => {
    if (isLoginOpen && e.target === e.currentTarget) {
      handleCloseLogin();
    }
  };

  return (
    <div className="landing-page" onClick={handleOutsideClick}>
      <div className="landing-page-content">
        {/* Show user info if logged in */}
        {user && token ? (
          <div className="user-info-bar">
            <span>Welcome, {user.name}! Role: {user.role}</span>
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : null}

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
                  <label htmlFor="username">Username (Email)</label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="Enter your email"
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
                  Logging in to the backend API...
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