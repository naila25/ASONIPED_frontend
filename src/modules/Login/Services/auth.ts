
import Cookies from 'js-cookie';

const TOKEN_KEY = 'auth_token';

export const login = (token: string) => {
  sessionStorage.removeItem('adminToken');
  Cookies.set(TOKEN_KEY, token, { 
    expires: 1,
    secure: false,
    sameSite: 'lax'
  });
};

export const logout = async () => {
  try {
    // Call backend logout endpoint to remove active session
    const { getAPIBaseURL } = await import('../../../shared/Services/config');
    const base = await getAPIBaseURL();
    const token = getToken();
    
    if (token) {
      await fetch(`${base}/users/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).catch(() => {
        // Don't fail logout if backend call fails
      });
    }
  } catch {
    // Logout error, continue with cleanup
  } finally {
    // Always clear local storage regardless of backend response
    Cookies.remove(TOKEN_KEY);
    sessionStorage.removeItem('adminToken');
  }
};

export const getToken = () => {
  const cookieToken = Cookies.get(TOKEN_KEY);
  
  if (cookieToken) {
    sessionStorage.removeItem('adminToken');
    return cookieToken;
  }
  
  const sessionToken = sessionStorage.getItem('adminToken');
  
  if (sessionToken) {
    Cookies.set(TOKEN_KEY, sessionToken, { 
      expires: 1,
      secure: false,
      sameSite: 'lax'
    });
    return sessionToken;
  }
  
  // Verificar localStorage también
  const localToken = localStorage.getItem('token');
  
  if (localToken) {
    return localToken;
  }
  
  return undefined;
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const getAuthHeader = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : { Authorization: '' };
};