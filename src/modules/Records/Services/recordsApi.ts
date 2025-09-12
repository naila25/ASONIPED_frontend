import { getAuthHeader, getToken } from '../../Login/Services/auth';
import { API_BASE_URL } from '../../../shared/Services/config';
import type { 
  Record, 
  RecordWithDetails, 
  Phase1Data, 
  Phase3Data, 
  RecordsResponse, 
  RecordStats
} from '../Types/records';

const API_URL = `${API_BASE_URL}/records`;

// ===== SERVICIOS BÁSICOS =====

// Obtener expediente del usuario actual
export const getUserRecord = async (): Promise<RecordWithDetails | null> => {
  try {
    const authHeader = getAuthHeader();
    console.log('=== GET USER RECORD ===');
    console.log('Auth header:', authHeader);
    console.log('Token:', getToken());
    
    const response = await fetch(`${API_URL}/my-record`, {
      headers: {
        ...authHeader,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (response.status === 404) {
      console.log('User has no record');
      return null; // Usuario no tiene expediente
    }
    
    if (response.status === 401) {
      console.log('User not authenticated');
      throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error(`Error obteniendo expediente: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('User record data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching user record:', error);
    throw error;
  }
};

// Crear expediente inicial (Fase 1)
export const createInitialRecord = async (phase1Data: Phase1Data): Promise<Record> => {
  try {
    const requestBody = {
      phase: 'phase1',
      personal_data: phase1Data
    };
    
    console.log('=== CREATING INITIAL RECORD ===');
    console.log('Request body:', requestBody);
    console.log('Auth header:', getAuthHeader());
    
    const response = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error text:', errorText);
      
             try {
         const error = JSON.parse(errorText);
         throw new Error(error.error || 'Error creando expediente');
       } catch {
         throw new Error(`Error creando expediente: ${errorText}`);
       }
    }
    
    const data = await response.json();
    console.log('Created record data:', data);
    return data;
  } catch (error) {
    console.error('Error creating initial record:', error);
    throw error;
  }
};

// Completar expediente (Fase 3)
export const completeRecord = async (recordId: number, phase3Data: Phase3Data): Promise<Record> => {
  try {
    console.log('=== COMPLETANDO EXPEDIENTE ===');
    console.log('Record ID:', recordId);
    console.log('Phase3Data:', phase3Data);
    console.log('Disability Information:', phase3Data.disability_information);
    console.log('Medical Additional:', phase3Data.disability_information?.medical_additional);
    console.log('Biomechanical Benefits:', phase3Data.disability_information?.medical_additional?.biomechanical_benefit);
    console.log('Permanent Limitations:', phase3Data.disability_information?.medical_additional?.permanent_limitations);
    console.log('Socioeconomic Information:', phase3Data.socioeconomic_information);
    
    const formData = new FormData();
    
    // Agregar datos JSON
    formData.append('data', JSON.stringify({
      phase: 'phase3',
      complete_personal_data: phase3Data.complete_personal_data,
      family_information: phase3Data.family_information,
      disability_information: phase3Data.disability_information,
      socioeconomic_information: phase3Data.socioeconomic_information,
      documentation_requirements: phase3Data.documentation_requirements,
    }));
    
    // Agregar documentos con nombres de campo específicos
    phase3Data.documents.forEach((file) => {
      // Usar el tipo de documento proporcionado por el formulario
      let documentType = 'other';
      
      // Si tenemos información de tipos de documentos del formulario, usarla
      if ((phase3Data as any).documentTypes && (phase3Data as any).documentTypes[file.name]) {
        documentType = (phase3Data as any).documentTypes[file.name];
      } else {
        // Fallback: mapeo inteligente basado en el nombre del archivo
        const fileName = file.name.toLowerCase();
        
        // Patrones para identificar tipos de documentos
        if (fileName.includes('dictamen') || fileName.includes('medico') || fileName.includes('diagnostico') || fileName.includes('diagnóstico')) {
          documentType = 'dictamen_medico';
        } else if (fileName.includes('nacimiento') || fileName.includes('birth') || fileName.includes('partida')) {
          documentType = 'constancia_nacimiento';
        } else if (fileName.includes('cedula') || fileName.includes('identificacion') || fileName.includes('identificación') || fileName.includes('dni') || fileName.includes('carnet')) {
          documentType = 'copia_cedula';
        } else if (fileName.includes('foto') || fileName.includes('photo') || fileName.includes('imagen') || fileName.includes('retrato')) {
          documentType = 'foto_pasaporte';
        } else if (fileName.includes('pension') || fileName.includes('ccss') || fileName.includes('pensión')) {
          documentType = 'constancia_pension_ccss';
        } else if (fileName.includes('pension_alimentaria') || fileName.includes('alimentaria') || fileName.includes('alimentario')) {
          documentType = 'constancia_pension_alimentaria';
        } else if (fileName.includes('estudio') || fileName.includes('study') || fileName.includes('academico') || fileName.includes('académico')) {
          documentType = 'constancia_estudio';
        } else if (fileName.includes('banco') || fileName.includes('cuenta') || fileName.includes('socioeconomica') || fileName.includes('socioeconómica') || fileName.includes('beca') || fileName.includes('solicitud')) {
          documentType = 'cuenta_banco_nacional';
        }
        
        // Si no se pudo mapear, intentar con el formato anterior
        if (documentType === 'other') {
          const fileNameParts = file.name.split('_');
          if (fileNameParts.length > 0) {
            const extractedType = fileNameParts[0];
            const typeMapping: { [key: string]: string } = {
              'dictamen_medico': 'dictamen_medico',
              'constancia_nacimiento': 'constancia_nacimiento',
              'copia_cedula': 'copia_cedula',
              'foto_pasaporte': 'foto_pasaporte',
              'constancia_pension_ccss': 'constancia_pension_ccss',
              'constancia_estudio': 'constancia_estudio',
              'medical_diagnosis': 'dictamen_medico',
              'birth_certificate': 'constancia_nacimiento',
              'cedula': 'copia_cedula',
              'photo': 'foto_pasaporte',
              'pension_certificate': 'constancia_pension_ccss',
              'study_certificate': 'constancia_estudio'
            };
            documentType = typeMapping[extractedType] || 'other';
          }
        }
      }
      
      console.log(`Mapeando archivo "${file.name}" como tipo: ${documentType}`);
      
      // Usar el tipo de documento como nombre del campo
      formData.append(documentType, file);
    });
    
    console.log('FormData preparado, enviando request...');
    
    const response = await fetch(`${API_URL}/${recordId}/complete`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        // No incluir Content-Type para FormData
      },
      body: formData,
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      
      try {
        const error = JSON.parse(errorText);
        throw new Error(error.error || 'Error completando expediente');
      } catch {
        throw new Error(`Error completando expediente: ${errorText}`);
      }
    }
    
    const data = await response.json();
    console.log('Expediente completado exitosamente:', data);
    return data;
  } catch (error) {
    console.error('Error completing record:', error);
    throw error;
  }
};

// ===== SERVICIOS DE ADMIN =====

// Obtener todos los expedientes (admin)
export const getRecords = async (
  page = 1, 
  limit = 10, 
  status?: string, 
  phase?: string,
  search?: string
): Promise<RecordsResponse> => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    
    if (status) params.append('status', status);
    if (phase) params.append('phase', phase);
    if (search) params.append('search', search);
    
    const response = await fetch(`${API_URL}?${params.toString()}`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Error obteniendo expedientes');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching records:', error);
    throw error;
  }
};

// Obtener expediente por ID (admin)
export const getRecordById = async (id: number): Promise<RecordWithDetails> => {
  try {
    console.log('=== GET RECORD BY ID ===');
    console.log('Record ID:', id);
    console.log('API URL:', `${API_URL}/${id}`);
    console.log('Auth header:', getAuthHeader());
    
    const response = await fetch(`${API_URL}/${id}`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error:', errorText);
      throw new Error('Error obteniendo expediente');
    }
    
    const data = await response.json();
    console.log('Record data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching record by ID:', error);
    throw error;
  }
};

// Aprobar fase 1
export const approvePhase1 = async (recordId: number, comment?: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/${recordId}/approve-phase1`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment }),
    });
    
    if (!response.ok) {
      throw new Error('Error aprobando fase 1');
    }
  } catch (error) {
    console.error('Error approving phase 1:', error);
    throw error;
  }
};

// Rechazar fase 1
export const rejectPhase1 = async (recordId: number, comment: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/${recordId}/reject-phase1`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment }),
    });
    
    if (!response.ok) {
      throw new Error('Error rechazando fase 1');
    }
  } catch (error) {
    console.error('Error rejecting phase 1:', error);
    throw error;
  }
};

// Solicitar modificación de fase 1
export const requestPhase1Modification = async (recordId: number, comment?: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/${recordId}/request-modification`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment }),
    });
    
    if (!response.ok) {
      throw new Error('Error solicitando modificación');
    }
  } catch (error) {
    console.error('Error requesting modification:', error);
    throw error;
  }
};

// Update phase 1 data (for modifications)
export const updatePhase1Data = async (recordId: number, personalData: any): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/${recordId}/update-phase1`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(personalData),
    });
    
    if (!response.ok) {
      throw new Error('Error actualizando datos');
    }
  } catch (error) {
    console.error('Error updating phase 1 data:', error);
    throw error;
  }
};

// Aprobar expediente completo
export const approveRecord = async (recordId: number, comment?: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/${recordId}/approve`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment }),
    });
    
    if (!response.ok) {
      throw new Error('Error aprobando expediente');
    }
  } catch (error) {
    console.error('Error approving record:', error);
    throw error;
  }
};

// Rechazar expediente completo
export const rejectRecord = async (recordId: number, comment: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/${recordId}/reject`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment }),
    });
    
    if (!response.ok) {
      throw new Error('Error rechazando expediente');
    }
  } catch (error) {
    console.error('Error rejecting record:', error);
    throw error;
  }
};

// Agregar comentario
export const addNote = async (recordId: number, note: string, type: string = 'activity'): Promise<void> => {
  try {
    console.log('=== AGREGANDO COMENTARIO ===');
    console.log('Record ID:', recordId);
    console.log('Note:', note);
    console.log('Type:', type);
    
    const response = await fetch(`${API_URL}/${recordId}/notes`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ note, type }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error text:', errorText);
      throw new Error('Error agregando comentario');
    }
    
    console.log('Comentario agregado exitosamente');
  } catch (error) {
    console.error('Error adding note:', error);
    throw error;
  }
};

// Actualizar comentario
export const updateNote = async (noteId: number, note: string, type?: string): Promise<void> => {
  try {
    console.log('=== ACTUALIZANDO COMENTARIO ===');
    console.log('Note ID:', noteId);
    console.log('Note:', note);
    console.log('Type:', type);
    
    const response = await fetch(`${API_URL}/notes/${noteId}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ note, type }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error text:', errorText);
      throw new Error('Error actualizando comentario');
    }
    
    console.log('Comentario actualizado exitosamente');
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
};

// Eliminar comentario
export const deleteNote = async (noteId: number): Promise<void> => {
  try {
    console.log('=== ELIMINANDO COMENTARIO ===');
    console.log('Note ID:', noteId);
    
    const response = await fetch(`${API_URL}/notes/${noteId}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error text:', errorText);
      throw new Error('Error eliminando comentario');
    }
    
    console.log('Comentario eliminado exitosamente');
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};

// Eliminar expediente
export const deleteRecord = async (recordId: number): Promise<void> => {
  try {
    console.log('=== ELIMINANDO EXPEDIENTE ===');
    console.log('Record ID:', recordId);
    
    const response = await fetch(`${API_URL}/${recordId}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error text:', errorText);
      throw new Error('Error eliminando expediente');
    }
    
    console.log('Expediente eliminado exitosamente');
  } catch (error) {
    console.error('Error deleting record:', error);
    throw error;
  }
};

// Obtener estadísticas (admin)
export const getRecordStats = async (): Promise<RecordStats> => {
  try {
    const response = await fetch(`${API_URL}/stats`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Error obteniendo estadísticas');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching record stats:', error);
    throw error;
  }
};

// ===== SERVICIOS DE VALIDACIÓN =====

// Verificar si cédula está disponible
export const checkCedulaAvailability = async (cedula: string, excludeRecordId?: number): Promise<boolean> => {
  try {
    const params = new URLSearchParams();
    if (excludeRecordId) {
      params.append('excludeRecordId', excludeRecordId.toString());
    }
    
    const response = await fetch(`${API_URL}/check-cedula-availability/${cedula}?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 409) {
      return false; // Cédula ya existe
    }
    
    if (response.ok) {
      return true; // Cédula disponible
    }
    
    throw new Error('Error verificando cédula');
  } catch (error) {
    console.error('Error checking cedula availability:', error);
    throw error;
  }
};

// ===== SERVICIOS DE NOTIFICACIONES =====

// Obtener notificaciones del usuario
export const getUserNotifications = async (): Promise<unknown[]> => {
  try {
    const response = await fetch(`${API_URL}/notifications`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Error obteniendo notificaciones');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Marcar notificación como leída
export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Error marcando notificación como leída');
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};
