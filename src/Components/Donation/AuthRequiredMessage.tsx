import React from 'react';
import { Link } from '@tanstack/react-router';

interface AuthRequiredMessageProps {
  message?: string;
}

const AuthRequiredMessage: React.FC<AuthRequiredMessageProps> = ({ 
  message = "Debe iniciar sesión para acceder a esta funcionalidad" 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl shadow-lg p-8">
      <div className="text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Acceso Requerido
        </h2>
        <p className="text-gray-600 mb-6 max-w-md">
          {message}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/admin/login"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
          >
            Iniciar Sesión
          </Link>
          <Link
            to="/admin/register"
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
          >
            Registrarse
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthRequiredMessage;
