import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      await login(values);
      navigate('/admin');
    } catch (e) {
      setError(e.message);
    } finally {
      setPending(false);
    }
  };
  return (
    <div className="login-page">
      <form onSubmit={submit} className="login-card">
        <p className="admin-eyebrow">Mitti Rituals</p>
        <h1>Admin sign in</h1>
        <p>Use the securely created administrator account.</p>
        {error && <p className="form-error">{error}</p>}
        <label>
          Email
          <input
            value={values.email}
            onChange={(e) => setValues({ ...values, email: e.target.value })}
            type="email"
            required
          />
        </label>
        <label>
          Password
          <input
            value={values.password}
            onChange={(e) => setValues({ ...values, password: e.target.value })}
            type="password"
            required
          />
        </label>
        <button disabled={pending}>{pending ? 'Signing in…' : 'Sign in securely'}</button>
        <small>No public administrator registration is available.</small>
      </form>
    </div>
  );
}
