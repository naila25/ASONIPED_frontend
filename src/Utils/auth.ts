
import Cookies from 'js-cookie';

const TOKEN_KEY = 'auth_token';

export const login = (token: string) => {
  console.log('🔐 Guardando token:', token ? 'Token recibido' : 'No token');
  sessionStorage.removeItem('adminToken');
  Cookies.set(TOKEN_KEY, token, { 
    expires: 1,
    secure: false,
    sameSite: 'lax'
  });
  console.log('✅ Token guardado en cookies');
};

export const logout = () => {
  Cookies.remove(TOKEN_KEY);
  sessionStorage.removeItem('adminToken');
};

export const getToken = () => {
  console.log('🔍 Buscando token...');
  
  const cookieToken = Cookies.get(TOKEN_KEY);
  console.log('🍪 Token en cookies:', cookieToken ? 'Encontrado' : 'No encontrado');
  
  if (cookieToken) {
    sessionStorage.removeItem('adminToken');
    console.log('✅ Token encontrado en cookies');
    return cookieToken;
  }
  
  const sessionToken = sessionStorage.getItem('adminToken');
  console.log('💾 Token en sessionStorage:', sessionToken ? 'Encontrado' : 'No encontrado');
  
  if (sessionToken) {
    Cookies.set(TOKEN_KEY, sessionToken, { 
      expires: 1,
      secure: false,
      sameSite: 'lax'
    });
    console.log('✅ Token encontrado en sessionStorage');
    return sessionToken;
  }
  
  // Verificar localStorage también
  const localToken = localStorage.getItem('token');
  console.log('📦 Token en localStorage:', localToken ? 'Encontrado' : 'No encontrado');
  
  if (localToken) {
    console.log('✅ Token encontrado en localStorage');
    return localToken;
  }
  
  console.log('❌ No se encontró token en ningún lugar');
  return undefined;
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const getAuthHeader = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : { Authorization: '' };
};