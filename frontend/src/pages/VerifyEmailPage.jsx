import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../services/api';
export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [state, setState] = useState('Verifying your email…');
  useEffect(() => {
    const token = params.get('token');
    if (!token) return setState('This verification link is invalid.');
    authApi
      .verifyEmail(token)
      .then(({ message }) => setState(message))
      .catch((error) => setState(error.message));
  }, [params]);
  return (
    <section className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Your account</p>
        <h1>Email verification</h1>
        <p>{state}</p>
        <Link className="button" to="/login">
          Continue to sign in
        </Link>
      </div>
    </section>
  );
}
