import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { login } from '../../Utils/auth';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        alert('Credenciales incorrectas');
        setLoading(false);
        return;
      }

      const data = await response.json();
      login(data.token);
      navigate({ to: '/admin', search: (prev) => prev, params: (prev) => prev });
    } catch (err) {
      alert('Error de red o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <form onSubmit={handleSubmit} className="bg-dark p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl  mb-6 text-center text-black">Admin Login</h2>
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full mb-4 px-3 py-2 border rounded text-gray-900"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full mb-6 px-3 py-2 border rounded text-gray-900"
        />
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-orange-500 to-orange-800 text-white py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;