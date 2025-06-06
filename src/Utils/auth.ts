
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

export const logout = () => {
  Cookies.remove(TOKEN_KEY);
  sessionStorage.removeItem('adminToken');
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
  
  return undefined;
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const getAuthHeader = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : { Authorization: '' };
};