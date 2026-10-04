import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await authApi.resetPassword({ token: params.get('token'), password });
      await auth.refresh();
      navigate('/account', { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };
  return (
    <section className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <p className="eyebrow">Your account</p>
        <h1>Choose a new password</h1>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <label>
          New password
          <input
            required
            minLength="8"
            autoComplete="new-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button className="button">Reset password</button>
        <Link className="text-link centered" to="/login">
          Return to sign in
        </Link>
      </form>
    </section>
  );
}
