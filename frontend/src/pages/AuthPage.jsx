import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi, authProvidersApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const content = {
  login: ['Welcome back', 'Sign in to see your orders and saved rituals.', 'Sign in'],
  register: [
    'Join Mitti Rituals',
    'Create an account to make your future rituals easier.',
    'Create account',
  ],
  forgot: [
    'Reset your password',
    'Enter your email and we’ll send reset instructions if email delivery is configured.',
    'Send reset link',
  ],
};

export default function AuthPage({ mode }) {
  const [title, copy, button] = content[mode];
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [providers, setProviders] = useState({ google: false, emailDelivery: false });
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    authProvidersApi()
      .then(setProviders)
      .catch(() => setProviders({ google: false, emailDelivery: false }));
  }, []);
  useEffect(() => {
    if (params.get('google') === 'failed')
      setError(
        'Google sign-in could not be completed. Try email and password or check the Google OAuth setup.'
      );
    if (params.get('google') === 'unconfigured')
      setError('Google sign-in is not configured yet. Email and password sign-in are available.');
  }, [params]);

  const update = (key) => (event) =>
    setValues((current) => ({ ...current, [key]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      if (mode === 'login') {
        await auth.login({ email: values.email, password: values.password });
        navigate(location.state?.from || '/account', { replace: true });
      } else if (mode === 'register') {
        const result = await auth.register(values);
        setMessage(result.message);
        navigate(location.state?.from || '/account', {
          replace: true,
          state: { notice: result.message },
        });
      } else {
        const result = await authApi.forgotPassword({ email: values.email });
        setMessage(result.message);
      }
    } catch (err) {
      setError(
        err.message ||
          'Could not reach the sign-in service. Check that the API is running and try again.'
      );
    } finally {
      setBusy(false);
    }
  };

  if (mode !== 'forgot' && auth.loading)
    return (
      <section className="auth-page">
        <div className="auth-card">Checking your account…</div>
      </section>
    );
  if (mode !== 'forgot' && auth.user)
    return <Navigate to={location.state?.from || '/account'} replace />;

  const googleLoginUrl = `${import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000/api`}/auth/google`;

  return (
    <section className="auth-page">
      <form className={`auth-card auth-card--${mode}`} onSubmit={submit}>
        <div className="auth-card-intro">
          <h1>{title}</h1>
          <p>{copy}</p>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="form-success" role="status">
            {message}
          </p>
        )}
        {mode === 'register' && (
          <label>
            Name
            <input
              required
              minLength="2"
              autoComplete="name"
              value={values.name}
              onChange={update('name')}
            />
          </label>
        )}
        <label>
          Email
          <input
            required
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={update('email')}
          />
        </label>
        {mode !== 'forgot' && (
          <label>
            Password
            <input
              required
              minLength={mode === 'register' ? 8 : undefined}
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={values.password}
              onChange={update('password')}
            />
          </label>
        )}
        <button disabled={busy} className="button">
          {busy ? 'Please wait…' : button}
        </button>
        {mode === 'login' && (
          <>
            <Link className="text-link centered" to="/forgot-password">
              Forgot password?
            </Link>
          </>
        )}
        {mode !== 'forgot' && providers.google && (
          <>
            <div className="or">or</div>
            <a className="google-button" href={googleLoginUrl}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.19-2.04H12v3.86h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.23c1.89-1.74 2.98-4.31 2.98-7.35Z" />
                <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.42l-3.23-2.51c-.9.6-2.05.96-3.39.96-2.6 0-4.8-1.76-5.59-4.12H3.08v2.59A10 10 0 0 0 12 22Z" />
                <path fill="#FBBC05" d="M6.41 13.91A6 6 0 0 1 6.1 12c0-.66.11-1.3.31-1.91V7.5H3.08A10 10 0 0 0 2 12c0 1.61.39 3.13 1.08 4.5l3.33-2.59Z" />
                <path fill="#EA4335" d="M12 5.97c1.47 0 2.79.51 3.83 1.51l2.87-2.87C16.96 2.99 14.7 2 12 2a10 10 0 0 0-8.92 5.5l3.33 2.59C7.2 7.73 9.4 5.97 12 5.97Z" />
              </svg>
              <span>Continue with Google</span>
            </a>
          </>
        )}
        {mode === 'login' && (
          <p className="form-foot">
            New here? <Link to="/register">Create an account</Link>
          </p>
        )}
        {mode === 'forgot' && !providers.emailDelivery && (
          <p className="form-foot">
            Password reset email is unavailable until store email settings are configured.
          </p>
        )}
        {mode === 'register' && (
          <p className="form-foot">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        )}
        {mode !== 'forgot' && (
          <p className="auth-trust">
            <span aria-hidden="true">✦</span> A considered space for your rituals and orders.
          </p>
        )}
      </form>
    </section>
  );
}
