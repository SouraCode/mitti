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

  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <p className="eyebrow">Your account</p>
        <h1>{title}</h1>
        <p>{copy}</p>
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
            <div className="or">or</div>
            {providers.google ? (
              <a
                className="google-button"
                href={`${import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000/api`}/auth/google`}
              >
                Continue with Google
              </a>
            ) : (
              <button className="google-button unavailable" type="button" disabled>
                Google sign-in is not configured
              </button>
            )}
            <p className="form-foot">
              {providers.google
                ? ''
                : 'The store owner needs to add Google OAuth credentials to enable this option.'}
            </p>
            <p className="form-foot">
              New here? <Link to="/register">Create an account</Link>
            </p>
          </>
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
      </form>
    </section>
  );
}
