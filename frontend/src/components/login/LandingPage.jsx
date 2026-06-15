import './LandingPage.css';
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
    <>
      <div className="lp-root">
        <div className="lp-logo">
          <span className="lp-logo-icon">⬛</span>
          <span className="lp-logo-text">LOGO , company</span>
        </div>
        {/* Top-left logo */}

        {/* Centered card */}
        <div className="lp-card">
          {user && token ? (
            <div className="lp-logged-in">
              <p className="lp-welcome-back">Welcome Back!</p>
              <p className="lp-sub">You are signed in as <strong>{user.name}</strong> ({user.role})</p>
              <button className="lp-btn-primary" onClick={handleLogout}>Log out</button>
            </div>
          ) : (
            <>
              <div className="lp-title" >
                <h1>Welcome Back !</h1>
                <p className="lp-subtitle">Please enter your details</p>
              </div>

              <form onSubmit={handleSubmit} className="lp-form">
                <div className="lp-field">
                  <label className="lp-label" htmlFor="email">Email</label>
                  <input
                    className="lp-input"
                    id="email"
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder=""
                    required
                  />
                </div>

                <div className="lp-field">
                  <label className="lp-label" htmlFor="password">Password</label>
                  <input
                    className="lp-input"
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder=""
                    required
                  />
                </div>

                <button type="submit" className="lp-btn-primary">Sign up</button>
              </form>
              {/* <div className="lowerpart">



                <div className="lp-divider">
                  <span className="lp-divider-line"></span>
                  <span className="lp-divider-label">Access Quickly</span>
                  <span className="lp-divider-line"></span>
                </div>

                <div className="lp-social">
                  <button className="lp-social-btn">Google</button>
                  <button className="lp-social-btn">LinkedIn</button>
                  <button className="lp-social-btn">Other</button>
                </div>
              </div> */}
            </>
          )}
        </div>

        {/* Bottom footer */}
        {/* <div className="lp-footer">
          <span>Didn't have an account ?</span>
          <button className="lp-link-btn">Sign up</button>
        </div> */}
      </div>
    </>
  );
}

export default LandingPage;