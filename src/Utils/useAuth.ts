import { useState, useEffect } from 'react';
import { getToken } from './auth';

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone?: string;
  roles: any[];
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = getToken();
      if (token) {
        try {
          // Primero obtener datos básicos del token
          const payload = JSON.parse(atob(token.split('.')[1]));
          
          // Luego obtener el perfil completo del usuario
          const response = await fetch('http://localhost:3000/users/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser({
              id: data.user.id,
              username: data.user.username,
              email: data.user.email,
              full_name: data.user.full_name,
              phone: data.user.phone,
              roles: data.user.roles
            });
          } else {
            // Fallback a datos del token si falla la API
            setUser({
              id: payload.userId || payload.id,
              username: payload.username,
              email: payload.email || '',
              full_name: payload.full_name || '',
              phone: payload.phone || '',
              roles: payload.roles || []
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, []);

  return { user, loading };
};
