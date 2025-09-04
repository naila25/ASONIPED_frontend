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
  ticketId?: string;
  ticketType?: string;
}

const API_BASE_URL = 'http://localhost:3000';

export const submitDonation = async (donationData: DonationFormData, isAnonymous: boolean = false): Promise<DonationResponse> => {
  try {
    console.log('Enviando datos:', donationData, 'Anonymous:', isAnonymous); // Para debugging
    
    // Get authentication token if available
    const token = getToken();
    
    // Prepare the data to send
    const dataToSend = {
      ...donationData,
      isAnonymous: isAnonymous
    };
    
    // Only include phone if not anonymous
    if (!isAnonymous) {
      dataToSend.telefono = donationData.telefono.replace(/\D/g, ''); // Solo números
    }
    
    // For authenticated users, don't send isAnonymous flag - let backend determine based on auth
    if (token) {
      delete dataToSend.isAnonymous;
    }
    
    // Prepare headers with authentication if available
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/donations`, {
      method: 'POST',
      headers,
      body: JSON.stringify(dataToSend),
    });

    console.log('Respuesta del servidor:', response.status); // Para debugging

    if (response.ok) {
      const result = await response.json();
      
      // Check if this is an anonymous donation
      if (result.ticketType === 'anonymous') {
        return {
          success: true,
          message: `¡Mensaje enviado exitosamente! Tu ticket de soporte es: ${result.ticketId}. Guárdalo para acceder a tu conversación en /soporte.`,
          ticketId: result.ticketId,
          ticketType: 'anonymous'
        };
      } else {
        return {
          success: true,
          message: '¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.'
        };
      }
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

export const validateDonationForm = (formData: DonationFormData, isAnonymous: boolean = false): Record<string, string> => {
  const errors: Record<string, string> = {};

  // Only validate personal fields if not anonymous
  if (!isAnonymous) {
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
