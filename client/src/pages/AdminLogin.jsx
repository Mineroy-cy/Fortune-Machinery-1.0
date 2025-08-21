import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow-md flex flex-col gap-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
      {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-center">{error}</div>}
      <div>
        <label className="block font-medium mb-1" htmlFor="username">Username</label>
        <input
          id="username"
          className="input w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-400"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          autoFocus
          disabled={loading}
        />
      </div>
      <div>
        <label className="block font-medium mb-1" htmlFor="password">Password</label>
        <div className="relative">
          <input
            id="password"
            className="input w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-blue-400 pr-10"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            disabled={loading}
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.403-3.22 1.125-4.575M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.875-4.575A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.575-1.125" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm2.021 2.021A9.956 9.956 0 0022 12c0-5.523-4.477-10-10-10a9.956 9.956 0 00-4.575 1.125M3.98 3.98A9.956 9.956 0 002 12c0 5.523 4.477 10 10 10a9.956 9.956 0 004.575-1.125" /></svg>
            )}
          </button>
        </div>
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-semibold disabled:opacity-60"
        disabled={loading || !form.username || !form.password}
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}
