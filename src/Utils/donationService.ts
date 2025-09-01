import { getToken } from './auth';

export interface DonationFormData {
  nombre: string;
  correo: string;
  telefono: string;
  asunto: string;
  mensaje: string;
  aceptacion_privacidad: boolean;
  aceptacion_comunicacion: boolean;
}

export interface DonationResponse {
  success: boolean;
  message: string;
  error?: string;
}

const API_BASE_URL = 'http://localhost:3000';

export const submitDonation = async (donationData: DonationFormData): Promise<DonationResponse> => {
  try {
    console.log('Enviando datos:', donationData); // Para debugging
    
    const token = getToken();
    if (!token) {
      return {
        success: false,
        message: 'Debe iniciar sesión para enviar una donación',
        error: 'AUTHENTICATION_REQUIRED'
      };
    }
    
    const response = await fetch(`${API_BASE_URL}/donations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...donationData,
        telefono: donationData.telefono.replace(/\D/g, '') // Solo números
      }),
    });

    console.log('Respuesta del servidor:', response.status); // Para debugging

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        message: '¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.'
      };
    } else {
      let errorMessage = 'Error al enviar el mensaje. Inténtalo de nuevo.';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // Si no se puede parsear el error, usar el mensaje por defecto
      }
      
      return {
        success: false,
        message: errorMessage,
        error: errorMessage
      };
    }
  } catch (error) {
    console.error('Error en submitDonation:', error); // Para debugging
    return {
      success: false,
      message: 'Error de conexión. Verifica tu internet e inténtalo de nuevo.',
      error: 'NETWORK_ERROR'
    };
  }
};

export const validateDonationForm = (formData: DonationFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Validar nombre completo (mínimo nombre y apellido)
  if (!formData.nombre.trim() || formData.nombre.trim().split(' ').length < 2) {
    errors.nombre = 'Debe ingresar un nombre completo (mínimo nombre y apellido)';
  }

  // Validar correo electrónico
  if (!formData.correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
    errors.correo = 'Correo electrónico inválido';
  }

  // Validar teléfono (formato 88888888)
  if (!formData.telefono || !/^[0-9]{8}$/.test(formData.telefono.replace(/\D/g, ''))) {
    errors.telefono = 'Teléfono inválido (formato 88888888)';
  }

  // Validar asunto (mínimo 10 caracteres)
  if (!formData.asunto.trim() || formData.asunto.trim().length < 10) {
    errors.asunto = 'El asunto debe tener al menos 10 caracteres';
  }

  // Validar mensaje (mínimo 10 caracteres)
  if (!formData.mensaje.trim() || formData.mensaje.trim().length < 10) {
    errors.mensaje = 'El mensaje debe tener al menos 10 caracteres';
  }

  // Validar aceptaciones
  if (!formData.aceptacion_privacidad) {
    errors.aceptacion_privacidad = 'Debe aceptar la política de privacidad';
  }

  if (!formData.aceptacion_comunicacion) {
    errors.aceptacion_comunicacion = 'Debe aceptar recibir comunicación';
  }

  return errors;
};

export const formatPhoneNumber = (value: string): string => {
  // Solo permitir números y formatear como 8888-8888
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 4) return numbers;
  return `${numbers.slice(0, 4)}-${numbers.slice(4, 8)}`;
};
