import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiRequest } from './lib/api.js';
import { useAuth } from './auth/AuthProvider.jsx';
import fallbackImage from './assets/jharkhand-landscape.svg';

export default function LoginPage({ accountOnly = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, status, setUser, refreshUser } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isSignup = mode === 'signup';

  const handleChange = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }));
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (isSignup && form.name.trim().length < 2) return setError('Please enter your name (at least 2 characters).');
    if (!form.email.trim()) return setError('Please enter your email address.');
    if (form.password.length < 8) return setError('Use a password with at least 8 characters.');
    if (new TextEncoder().encode(form.password).length > 72) return setError('Password must be 72 bytes or fewer.');

    setSubmitting(true);
    try {
      const endpoint = isSignup ? '/auth/register' : '/auth/login';
      const payload = isSignup
        ? { name: form.name.trim(), email: form.email.trim(), password: form.password }
        : { email: form.email.trim(), password: form.password, remember };
      const result = await apiRequest(endpoint, { method: 'POST', body: JSON.stringify(payload) });
      setUser(result.user);
      const returnTo = location.state?.from;
      navigate(typeof returnTo === 'string' && returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/');
    } catch (requestError) {
      setError(requestError.message || 'Could not connect to the account server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setError('');
    setSubmitting(true);
    try {
      await apiRequest('/auth/logout', { method: 'POST', body: '{}' });
      setUser(null);
      navigate('/');
    } catch (requestError) {
      setError(requestError.message || 'Could not sign out.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-page__panel">
        <img
          onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = fallbackImage; }}
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80"
          alt="Jharkhand forest"
          loading="lazy"
          decoding="async"
        />
        <div className="login-page__panel-overlay" />
        <div className="login-page__panel-content">
          <Link to="/" className="login-page__brand">Jharkhand</Link>
          <h1>Discover the beauty of Jharkhand</h1>
          <p>Sign in to keep your account ready while you plan your next journey.</p>
        </div>
      </div>

      <div className="login-page__form-side">
        <Link to="/" className="login-page__back">← Back to home</Link>

        <div className="login-page__form-wrap">
          {status === 'loading' ? (
            <p role="status">Restoring your sign-in…</p>
          ) : user ? (
            <>
              <p className="eyebrow">Account</p>
              <h2>Welcome, {user.name}</h2>
              <p className="login-page__account-email">{user.email}</p>
              <p className="login-page__account-note">You’re signed in. Your account is ready while you plan your next journey.</p>
              {error && <p className="login-form__error" role="alert">{error}</p>}
              <div className="login-page__account-actions">
                {accountOnly && <Link className="button button--dark" to="/">Explore Jharkhand</Link>}
                <button className="button button--orange" onClick={handleLogout} disabled={submitting}>
                  {submitting ? 'Please wait…' : 'Log out'}
                </button>
              </div>
            </>
          ) : accountOnly ? (
            <>
              <p className="eyebrow">My account</p>
              {status === 'error' ? (
                <div className="auth-status-error" role="status">
                  <h2>We couldn’t verify your session</h2>
                  <p>Your account has not been changed. Retry the session check or continue to sign in.</p>
                  <button className="button button--dark" type="button" onClick={refreshUser}>Try again</button>
                  <Link className="button button--orange" to="/login">Go to sign in</Link>
                </div>
              ) : (
                <>
                  <h2>Sign in to view your account</h2>
                  <p className="login-page__account-note">Log in or create an account to see your profile.</p>
                  <Link className="button button--orange login-form__submit" to="/login">Log in or create account</Link>
                </>
              )}
            </>
          ) : (
            <>
              {status === 'error' && (
                <div className="auth-status-error" role="status">
                  <p>We couldn’t verify your current session. You can still try to sign in.</p>
                  <button className="button button--dark" type="button" onClick={refreshUser}>Retry session check</button>
                </div>
              )}
              <p className="eyebrow">{isSignup ? 'Create account' : 'Welcome back'}</p>
              <h2>{isSignup ? 'Sign up to get started' : 'Log in to your account'}</h2>

              <form className="login-form" onSubmit={handleSubmit} noValidate>
                {isSignup && (
                  <label className="login-form__field">
                    <span>Full name</span>
                    <input type="text" autoComplete="name" value={form.name} onChange={handleChange('name')} placeholder="Your name" required minLength={2} maxLength={80} />
                  </label>
                )}

                <label className="login-form__field">
                  <span>Email</span>
                  <input type="email" autoComplete="email" value={form.email} onChange={handleChange('email')} placeholder="you@example.com" required maxLength={254} />
                </label>

                <label className="login-form__field">
                  <span>Password</span>
                  <input type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} value={form.password} onChange={handleChange('password')} placeholder="At least 8 characters" required minLength={8} maxLength={72} />
                </label>

                {!isSignup && (
                  <label className="login-form__checkbox">
                    <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
                    <span>Keep me signed in for 30 days</span>
                  </label>
                )}

                {error && <p className="login-form__error" role="alert">{error}</p>}

                <button type="submit" className="button button--orange login-form__submit" disabled={submitting}>
                  {submitting ? 'Please wait…' : isSignup ? 'Create account' : 'Log in'}
                </button>
              </form>

              <p className="login-page__switch">
                {isSignup ? 'Already have an account?' : 'New to Jharkhand Tourism?'}{' '}
                <button type="button" onClick={() => { setMode(isSignup ? 'login' : 'signup'); setError(''); }}>
                  {isSignup ? 'Log in' : 'Create one'}
                </button>
              </p>
              <p className="login-form__note">Your account is stored in the project’s MySQL database. Never reuse a password from another site.</p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
