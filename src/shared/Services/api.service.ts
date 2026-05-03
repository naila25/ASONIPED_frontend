import { getAPIBaseURL } from './config';
import { logout } from '../../modules/Login/Services/auth';

const SESSION_INVALIDATED_EVENT = 'asoniped:session-invalidated';

// Enhanced fetch wrapper that handles session invalidation
export const apiRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const base = await getAPIBaseURL();
  const fullUrl = url.startsWith('http') ? url : `${base}${url}`;

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // Check for session invalidation
  if (response.status === 401) {
    try {
      const errorData = await response.json();
      if (errorData.code === 'SESSION_INVALIDATED') {
        // Session was invalidated (user logged in elsewhere).
        // Use a project-style modal (not a native alert/confirm).
        await logout();

        window.dispatchEvent(
          new CustomEvent(SESSION_INVALIDATED_EVENT, {
            detail: {
              title: 'Sesión invalidada',
              message:
                'Tu sesión ha sido invalidada porque has iniciado sesión desde otro navegador o dispositivo.',
              redirectTo: '/admin/login',
            },
          })
        );

        return response;
      }
    } catch {
      // If we can't parse the error, it might still be a session issue
    }
  }

  return response;
};

// Helper function to make authenticated requests
export const authenticatedRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const { getToken } = await import('../../modules/Login/Services/auth');
  const token = getToken();
  
  if (!token) {
    throw new Error('No authentication token available');
  }

  return apiRequest(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
};
