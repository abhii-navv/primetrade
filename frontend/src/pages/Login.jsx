import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const styles = {
  page: { minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif" },
  card: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 40, width: '100%', maxWidth: 420 },
  title: { fontFamily: "'Space Mono', monospace", color: '#fff', fontSize: 24, marginBottom: 8, marginTop: 0 },
  subtitle: { color: '#666', fontSize: 14, marginBottom: 32 },
  label: { display: 'block', color: '#aaa', fontSize: 13, marginBottom: 6 },
  input: { width: '100%', background: '#111', border: '1px solid #333', borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: 14, boxSizing: 'border-box', outline: 'none' },
  btn: { width: '100%', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
  field: { marginBottom: 20 },
  error: { background: '#2a1010', border: '1px solid #5a1010', color: '#f87171', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 20 },
  link: { color: '#818cf8', textDecoration: 'none' },
  footer: { color: '#555', fontSize: 13, marginTop: 24, textAlign: 'center' },
};

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          </div>
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          No account? <Link to="/register" style={styles.link}>Register here</Link>
        </p>
      </div>
    </div>
  );
}
