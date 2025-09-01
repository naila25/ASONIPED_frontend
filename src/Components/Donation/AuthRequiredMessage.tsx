import React from 'react';
import { Link } from '@tanstack/react-router';
import { FaLock } from 'react-icons/fa';

interface AuthRequiredMessageProps {
  message?: string;
}

const AuthRequiredMessage: React.FC<AuthRequiredMessageProps> = ({ 
  message = "Debe iniciar sesión para acceder a esta funcionalidad" 
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 space-y-8">
      
      {/* Authentication Section - Top */}
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <FaLock className="text-gray-600 text-2xl" />
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">
            Acceso Requerido
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed max-w-2xl mx-auto">
            {message}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/admin/login"
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-8 rounded-md transition-colors duration-200"
          >
            Iniciar Sesión
          </Link>
          
          <Link
            to="/admin/register"
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2.5 px-8 rounded-md transition-colors duration-200"
          >
            Registrarse
          </Link>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 pt-8">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Formulario de Donación
          </h2>
          <p className="text-gray-600">
            Complete el formulario para crear un ticket de soporte y recibir asistencia personalizada
          </p>
        </div>

        {/* Real Form Preview - Disabled */}
        <div className="max-w-2xl mx-auto">
          <form className="text-black grid grid-cols-1 gap-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
            <p className="text-gray-700">Déjanos tu mensaje</p>
            
            <div>
              <input
                type="text"
                placeholder="Nombre completo"
                disabled
                className="border border-gray-300 rounded px-4 py-2 w-full bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="Correo electrónico"
                disabled
                className="border border-gray-300 rounded px-4 py-2 w-full bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <input
                type="tel"
                placeholder="Teléfono (88888888)"
                disabled
                className="border border-gray-300 rounded px-4 py-2 w-full bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Asunto (mínimo 10 caracteres)"
                disabled
                className="border border-gray-300 rounded px-4 py-2 w-full bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <textarea
                placeholder="Mensaje (mínimo 10 caracteres)"
                disabled
                className="border border-gray-300 rounded px-4 py-2 min-h-[100px] w-full bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="flex items-start">
              <input 
                type="checkbox" 
                id="privacy" 
                disabled
                className="mr-2 mt-1 cursor-not-allowed" 
              />
              <label htmlFor="privacy" className="text-sm text-gray-500 cursor-not-allowed">
                He leído y acepto el aviso de privacidad
              </label>
            </div>

            <div className="flex items-start">
              <input 
                type="checkbox" 
                id="comunicacion" 
                disabled
                className="mr-2 mt-1 cursor-not-allowed" 
              />
              <label htmlFor="comunicacion" className="text-sm text-gray-500 cursor-not-allowed">
                Acepto recibir comunicación de parte de ASONIPED
              </label>
            </div>

            <button
              type="button"
              disabled
              className="bg-gray-400 text-white font-semibold py-2 px-6 rounded transition self-start cursor-not-allowed"
            >
              Enviar mensaje
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthRequiredMessage;
