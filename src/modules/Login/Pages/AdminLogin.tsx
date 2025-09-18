import { useState } from 'react';
import { login } from '../Services/auth';
import { getAPIBaseURL } from '../../../shared/Services/config';

// Validation function for user data
const validateUserInput = (username: string, email: string, fullName: string, phone: string, password: string): string | null => {
  
  if (!/^[A-Za-z]{1,15}$/.test(username)) {
    return 'El usuario solo debe contener letras y máximo 15 caracteres.';
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Debe ingresar un correo electrónico válido.';
  }
 
  if (!/^([A-Za-zÁÉÍÓÚáéíóúÑñ]+(\s+|$)){2,}$/.test(fullName.trim())) {
    return 'Debe ingresar un nombre completo válido (al menos dos palabras).';
  }

  if (!/^[0-9]{8}$/.test(phone)) {
    return 'El teléfono debe tener exactamente 8 dígitos.';
  }
 
  if (!/^[A-Za-z0-9]{6,20}$/.test(password)) {
    return 'La contraseña debe tener mínimo 6 caracteres y máximo 20 caracteres y solo letras y números.';
  }
  return null;
};

const AdminLogin = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  // const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const base = await getAPIBaseURL();
      const response = await fetch(`${base}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        setError('Credenciales incorrectas');
        return;
      }

             const data = await response.json();
       login(data.token);
       localStorage.setItem('username', data.user.username);
       
               // Determinar a dónde redirigir basado en los roles del usuario
        const isAdmin = data.user.roles.some((role: { name?: string } | string) => 
          typeof role === 'string' ? role === 'admin' : role.name === 'admin'
        );
        
        // Navegar basado en el rol del usuario
        if (isAdmin) {
          window.location.href = '/admin';
        } else {
          window.location.href = '/';
        }
    } catch {
      setError('Error de red o servidor. Verificando conexión automáticamente...');
      // Intentar nueva detección automática
      try {
        const { refreshBackendDetection } = await import('../../../shared/Services/config');
        await refreshBackendDetection();
        setError('Conexión restaurada. Intenta iniciar sesión nuevamente.');
      } catch {
        setError('Error de red. Asegúrate de que el servidor esté ejecutándose.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    
    const validationError = validateUserInput(username, email, fullName, phone, password);
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }
    
    try {
      const base = await getAPIBaseURL();
      const response = await fetch(`${base}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          email, 
          password, 
          full_name: fullName, 
          phone,
          roles: ['user', 'beneficiary']
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Error en el registro');
        return;
      }

      await response.json();
      setSuccess('Usuario registrado exitosamente. Revisa tu email para verificar tu cuenta.');
      setShowVerificationMessage(true);
      // Limpiar formulario
      setUsername('');
      setEmail('');
      setPassword('');
      setFullName('');
      setPhone('');
    } catch {
      setError('Error de red o servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = isLogin ? handleLogin : handleRegister;

  return (
    <div className="min-h-[100dvh] flex flex-col lg:flex-row">
      {/* Left Panel - Login Form */}
      <div className="w-full lg:w-1/2 bg-gray-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl text-white mb-2">ASONIPED</h1>
            <p className="text-gray-400 text-sm">Portal de Acceso</p>
          </div>

          {/* Toggle Buttons */}
          <div className="mb-6 sm:mb-8">
            <div className="flex bg-gray-800/50 rounded-lg p-1">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  isLogin 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-3 sm:px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                  !isLogin 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Registrarse
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 leading-tight">
              {isLogin ? (
                <>
                  Donde la inclusión<br />
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    encuentra el futuro.
                  </span>
                </>
              ) : (
                <>
                  Únete a la<br />
                  <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    familia ASONIPED.
                  </span>
                </>
              )}
            </h2>
            <p className="text-gray-300 text-base sm:text-lg">
              {isLogin 
                ? 'Accede a tu cuenta personal de ASONIPED.'
                : 'Crea tu cuenta y comienza tu journey con nosotros.'
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                         {error && (
               <div className="p-3 sm:p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-red-300 text-sm sm:text-base">
                 <div className="flex items-center justify-between">
                   <span>{error}</span>
                                       {error.includes('Error de red') && (
                      <div className="flex gap-2">
                        <button
                          onClick={async () => {
                            setError('Verificando conexión...');
                            try {
                              const { refreshBackendDetection } = await import('../../../shared/Services/config');
                              await refreshBackendDetection();
                              setError('Conexión restaurada. Intenta iniciar sesión nuevamente.');
                            } catch {
                              setError('Error de red. Asegúrate de que el servidor esté ejecutándose.');
                            }
                          }}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors"
                        >
                          Reintentar
                        </button>
                        <button
                          onClick={() => {
                            const ip = prompt('Ingresa la IP del servidor (ej: 192.168.1.100):');
                                                         if (ip) {
                               import('../../../shared/Services/simpleNetworkConfig').then(({ simpleNetwork }) => {
                                 simpleNetwork.setBackendUrl(`http://${ip}:3000`);
                                 setError('IP configurada. Intenta iniciar sesión nuevamente.');
                               });
                             }
                          }}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
                        >
                          Configurar IP
                        </button>
                      </div>
                    )}
                 </div>
               </div>
             )}
            
            {success && (
              <div className="p-3 sm:p-4 bg-green-900/50 border border-green-500/50 rounded-lg text-green-300 text-sm sm:text-base">
                {success}
              </div>
            )}
            
            {showVerificationMessage && (
              <div className="p-4 bg-blue-900/50 border border-blue-500/50 rounded-lg text-blue-300 text-sm sm:text-base">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-200 mb-2">Verificación de Email Requerida</h4>
                    <p className="text-blue-300 mb-3">
                      Hemos enviado un enlace de verificación a tu correo electrónico. 
                      Por favor, revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
                    </p>
                    <div className="bg-blue-800/30 p-3 rounded border border-blue-600/50">
                      <p className="text-blue-200 text-sm">
                        <strong>¿No recibiste el email?</strong> Revisa tu carpeta de spam
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div>
              <input
                type="text"
                placeholder="Usuario"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                required
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    required
                  />
                </div>
                
                <div>
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                    required
                  />
                </div>
                
                <div>
                  <input
                    type="tel"
                    placeholder="Teléfono (8 dígitos)"
                    value={phone}
                    onChange={e => {
                      const value = e.target.value;
                      // Only allow numbers and limit to 8 digits
                      if (/^\d{0,8}$/.test(value)) {
                        setPhone(value);
                      }
                    }}
                    maxLength={8}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  />
                </div>
              </>
            )}
            
            <div>
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              disabled={loading}
            >
              {loading 
                ? (isLogin ? 'Conectando...' : 'Registrando...') 
                : (isLogin ? 'CONECTAR' : 'REGISTRARSE')
              }
            </button>
            
            {/* Forgot Password Link - Only show on login */}
            {isLogin && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => window.location.href = '/forgot-password'}
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors underline"
                >
                  ¿Olvidó su contraseña?
                </button>
              </div>
            )}
          </form>

          {/* Bottom Features - Hidden on mobile */}
           <div className="hidden sm:grid mt-8 sm:mt-12 grid-cols-3 gap-4">
             <div className="text-center">
               <div className="w-8 h-8 mx-auto mb-2 bg-blue-500/20 rounded-lg flex items-center justify-center">
                 <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                   <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
               </div>
               <p className="text-xs text-gray-400">Gestión Segura</p>
             </div>
             <div className="text-center">
               <div className="w-8 h-8 mx-auto mb-2 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                 <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                   <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                 </svg>
               </div>
               <p className="text-xs text-gray-400">Control Total</p>
             </div>
             <div className="text-center">
               <div className="w-8 h-8 mx-auto mb-2 bg-purple-500/20 rounded-lg flex items-center justify-center">
                 <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                   <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                 </svg>
               </div>
               <p className="text-xs text-gray-400">Analítica</p>
             </div>
           </div>

           {/* Mobile Features - Visible only on mobile */}
           <div className="sm:hidden mt-10 space-y-8">
             {/* Contact Info for Mobile */}
             <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
               <h4 className="text-white text-sm font-medium mb-3">¿Necesitas ayuda?</h4>
               <div className="space-y-2 text-sm">
                 <div className="flex items-center space-x-2 text-gray-300">
                   <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                     <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                     <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                   </svg>
                   <span>soporte@asoniped.org</span>
                 </div>
                 <div className="flex items-center space-x-2 text-gray-300">
                   <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                     <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                   </svg>
                   <span>+506 2222-2222</span>
                 </div>
                 <div className="flex items-center space-x-2 text-gray-300">
                   <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                     <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                   </svg>
                   <span> Nicoya, Costa Rica</span>
                 </div>
               </div>
             </div>

             {/* Footer for Mobile */}
             <div className="text-center pt-4 border-t border-gray-700">
               <p className="text-gray-400 text-xs">
                 © 2025 ASONIPED. Todos los derechos reservados.
               </p>
               <p className="text-gray-500 text-xs mt-1">
                 Donde la inclusión encuentra el futuro
               </p>
             </div>
           </div>
        </div>
      </div>

      {/* Right Panel - ASONIPED Dashboard - Hidden on mobile */}
      <div className="hidden lg:block w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 relative overflow-hidden">
        {/* Background Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-cyan-500/20"></div>
        
        {/* Header */}
        <div className="absolute top-8 left-8 right-8">
          <h3 className="text-white text-lg font-semibold mb-2">Panel ASONIPED</h3>
          <p className="text-gray-300 text-sm">Sistema de gestión integral</p>
        </div>

        {/* Statistics Section - Top */}
        <div className="absolute top-24 left-8 right-8">
          <h4 className="text-white text-sm font-medium mb-4">Estadísticas Rápidas</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-xs">Beneficiarios</p>
                  <p className="text-white text-xl font-bold">0+</p>
                </div>
                <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-xs">Voluntarios</p>
                  <p className="text-white text-xl font-bold">0+</p>
                </div>
                <div className="w-8 h-8 bg-cyan-500/30 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-cyan-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-xs">Talleres</p>
                  <p className="text-white text-xl font-bold">0+</p>
                </div>
                <div className="w-8 h-8 bg-purple-500/30 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-xs">Donaciones</p>
                  <p className="text-white text-xl font-bold">0+</p>
                </div>
                <div className="w-8 h-8 bg-green-500/30 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section - Middle */}
        <div className="absolute top-80 left-8 right-8">
          <h4 className="text-white text-sm font-medium mb-4">Servicios Destacados</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
              <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-white text-sm">Expedientes Digitales</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
              <div className="w-8 h-8 bg-cyan-500/30 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-cyan-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <span className="text-white text-sm">Talleres de Inclusión</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
              <div className="w-8 h-8 bg-purple-500/30 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <span className="text-white text-sm">Programas de Voluntariado</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
              <div className="w-8 h-8 bg-green-500/30 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-white text-sm">Sistema de Donaciones</span>
            </div>
          </div>
        </div>

        {/* Quick Access Section - Bottom */}
        <div className="absolute bottom-8 left-8 right-8">
          <h4 className="text-white text-sm font-medium mb-4">Acceso Rápido</h4>
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-all duration-200 text-left">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-white text-xs">Crear Expediente</span>
              </div>
            </button>
            <button className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-all duration-200 text-left">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-cyan-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                <span className="text-white text-xs">Ver Talleres</span>
              </div>
            </button>
            <button className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-all duration-200 text-left">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                <span className="text-white text-xs">Consultar Donaciones</span>
              </div>
            </button>
            <button className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-all duration-200 text-left">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="text-white text-xs">Contactar Soporte</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;