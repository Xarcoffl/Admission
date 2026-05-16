import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdmission } from '../data/admissionContext';

export default function Login() {
  const { user, login } = useAdmission();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/overview" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await login(username, password);
    if (!success) {
      setError('Invalid username or password');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'radial-gradient(circle at top, rgba(79, 139, 255, 0.16), transparent 28%), #0f172a' }}>
      <div className="card" style={{ width: 400, textAlign: 'center' }}>
        <h1 style={{ marginBottom: 8 }}>College Admissions</h1>
        <p style={{ color: '#94a3b8', marginBottom: 24 }}>Login to access the dashboard</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          {error && <p style={{ color: '#f87171', marginBottom: 16 }}>{error}</p>}

          <button type="submit" className="button-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: 24, padding: 16, background: 'rgba(79, 139, 255, 0.1)', borderRadius: 8 }}>
          <h4 style={{ margin: 0, marginBottom: 8 }}>Demo Accounts</h4>
          <p style={{ fontSize: '0.9rem', color: '#cbd5e1', margin: 0 }}>
            Admin: admin / admin123<br />
            Officer: officer / officer123<br />
            Faculty: faculty / faculty123
          </p>
        </div>
      </div>
    </div>
  );
}
