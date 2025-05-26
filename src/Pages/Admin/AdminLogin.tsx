import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple hardcoded check for demo
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('isAdmin', 'true');
      navigate({ to: '/admin', search: (prev) => prev, params: (prev) => prev });
    } else {
      alert('Credenciales incorrectas');
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
        >
          Ingresar
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;