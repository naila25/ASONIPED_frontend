import { getAuthHeader } from '../../Login/Services/auth';
import { getAPIBaseURLSync } from '../../../shared/Services/config';
import type { 
  Record, 
  RecordWithDetails, 
  Phase1Data, 
  Phase3Data, 
  RecordsResponse, 
  RecordStats
} from '../Types/records';

const getAPIUrl = () => `${getAPIBaseURLSync()}/records`;

/** Non-empty `Authorization` value for XHR (skips header when unauthenticated). */
function authorizationHeaderForXHR(): string | undefined {
  const raw = getAuthHeader()['Authorization'];
  const trimmed = typeof raw === 'string' ? raw.trim() : '';
  return trimmed || undefined;
}

// ===== SERVICIOS BÁSICOS =====

// Obtener expediente del usuario actual
export const getUserRecord = async (): Promise<RecordWithDetails | null> => {
  const authHeader = getAuthHeader();

  const response = await fetch(`${getAPIUrl()}/my-record`, {
    headers: {
      ...authHeader,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 404) {
    return null; // Usuario no tiene expediente
  }

  if (response.status === 401) {
    throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
  }

  if (!response.ok) {
    await response.text();
    throw new Error(`Error obteniendo expediente: ${response.status}`);
  }

  return await response.json();
};

// Crear expediente inicial (Fase 1)
export const createInitialRecord = async (phase1Data: Phase1Data): Promise<Record> => {
  const requestBody = {
    phase: 'phase1',
    personal_data: phase1Data
  };

  const response = await fetch(`${getAPIUrl()}`, {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();

    try {
      const error = JSON.parse(errorText);
      throw new Error(error.error || 'Error creando expediente');
    } catch {
      throw new Error(`Error creando expediente: ${errorText}`);
    }
  }

  return await response.json();
};

// Completar expediente (Fase 3)
export const completeRecord = async (
  recordId: number,
  phase3Data: Phase3Data,
  onProgress?: (percent: number) => void
): Promise<Record> => {
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
      if (phase3Data.documentTypes?.[file.name]) {
        documentType = phase3Data.documentTypes[file.name];
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

      // Usar el tipo de documento como nombre del campo
      formData.append(documentType, file);
    });

    // Usar XMLHttpRequest para poder reportar progreso de subida
    const token = authorizationHeaderForXHR();

    const xhrResponse = await new Promise<Record>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', `${getAPIUrl()}/${recordId}/complete`);

      // Agregar encabezados de autenticación si existen
      if (token) {
        xhr.setRequestHeader('Authorization', token);
      }

      // Progreso de carga
      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event: ProgressEvent) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText) as Record);
            } catch {
              resolve({} as Record);
            }
          } else {
            const errorText = xhr.responseText || `HTTP ${xhr.status}`;
            try {
              const error = JSON.parse(errorText) as { error?: string };
              reject(new Error(error.error || 'Error completando expediente'));
            } catch {
              reject(new Error(`Error completando expediente: ${errorText}`));
            }
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Error de red al completar expediente'));
      };

      xhr.send(formData);
    });

    return xhrResponse;
};

// Crear expediente directamente por admin (bypass workflow)
export const createAdminDirectRecord = async (
  phase3Data: Phase3Data,
  onProgress?: (percent: number) => void
): Promise<Record> => {
  const formData = new FormData();

  // Agregar datos JSON
  formData.append('data', JSON.stringify({
    complete_personal_data: phase3Data.complete_personal_data,
    family_information: phase3Data.family_information,
    disability_information: phase3Data.disability_information,
    socioeconomic_information: phase3Data.socioeconomic_information,
    documentation_requirements: phase3Data.documentation_requirements,
  }));

  // Agregar documentos con nombres de campo específicos
  if (phase3Data.documents && phase3Data.documents.length > 0) {
    phase3Data.documents.forEach((file) => {
      let documentType = 'other';

      if (phase3Data.documentTypes?.[file.name]) {
        documentType = phase3Data.documentTypes[file.name];
      } else {
        const fileName = file.name.toLowerCase();

        if (fileName.includes('dictamen') || fileName.includes('medico')) {
          documentType = 'dictamen_medico';
        } else if (fileName.includes('nacimiento') || fileName.includes('birth')) {
          documentType = 'constancia_nacimiento';
        } else if (fileName.includes('cedula') || fileName.includes('identificacion')) {
          documentType = 'copia_cedula';
        } else if (fileName.includes('foto') || fileName.includes('photo')) {
          documentType = 'foto_pasaporte';
        } else if (fileName.includes('pension') || fileName.includes('ccss')) {
          documentType = 'constancia_pension_ccss';
        } else if (fileName.includes('estudio') || fileName.includes('study')) {
          documentType = 'constancia_estudio';
        } else if (fileName.includes('banco') || fileName.includes('cuenta')) {
          documentType = 'cuenta_banco_nacional';
        }
      }

      formData.append(documentType, file);
    });
  }

  const token = authorizationHeaderForXHR();

  const xhrResponse = await new Promise<Record>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${getAPIUrl()}/admin-direct`);

    if (token) {
      xhr.setRequestHeader('Authorization', token);
    }

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event: ProgressEvent) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText) as Record);
          } catch {
            resolve({} as Record);
          }
        } else {
          const errorText = xhr.responseText || `HTTP ${xhr.status}`;

          try {
            const error = JSON.parse(errorText) as { error?: string };
            reject(new Error(error.error || 'Error creando expediente admin'));
          } catch {
            reject(new Error(`Error creando expediente admin: ${errorText}`));
          }
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Error de red al crear expediente admin'));
    };

    xhr.send(formData);
  });

  return xhrResponse;
};

// ===== SERVICIOS DE ADMIN =====

// Obtener todos los expedientes (admin)
// Get geographic analytics data only (lightweight)
export const getGeographicAnalytics = async (): Promise<Array<{
  id: number;
  record_number: string;
  province: string | null;
  canton: string | null;
  district: string | null;
  created_at: string;
}>> => {
  const response = await fetch(`${getAPIUrl()}/geographic-analytics`, {
    method: 'GET',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

// Get disability analytics data only (lightweight)
export const getDisabilityAnalytics = async (): Promise<Array<{
  id: number;
  record_number: string;
  created_at: string;
  disability_information: {
    disability_type: string | null;
    insurance_type: string | null;
    disability_origin: string | null;
    disability_certificate: string | null;
    conapdis_registration: string | null;
    medical_diagnosis: string | null;
    medical_additional: {
      blood_type: string | null;
      diseases: string | null;
      permanent_limitations: Array<{
        limitation: string;
        degree: string;
        observations?: string;
      }> | null;
      biomechanical_benefits: Array<{
        type: string;
        other_description?: string;
      }> | null;
    } | null;
  } | null;
  complete_personal_data: {
    blood_type: string | null;
    diseases: string | null;
  } | null;
}>> => {
  const response = await fetch(`${getAPIUrl()}/disability-analytics`, {
    method: 'GET',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

export const getDemographicRecords = async (limit: number = 1000): Promise<Record[]> => {
  // getAPIUrl() already points to /records base; do not append /records again
  const response = await fetch(`${getAPIUrl()}?page=1&limit=${limit}`, {
    method: 'GET',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = (await response.json()) as RecordsResponse;
  return data.records ?? [];
};

export const getFamilyAnalytics = async (): Promise<Array<{
  id: number;
  record_number: string;
  created_at: string;
  family_information: {
    mother_name?: string | null;
    father_name?: string | null;
    responsible_person?: string | null;
    family_members: Array<{
      name: string;
      age: number;
      relationship: string;
      occupation: string;
      marital_status: string;
    }> | [];
  } | null;
}>> => {
  const response = await fetch(`${getAPIUrl()}/family-analytics`, {
    method: 'GET',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

export const getRecords = async (
  page = 1, 
  limit = 10, 
  status?: string, 
  phase?: string,
  search?: string,
  creator?: string
): Promise<RecordsResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (status) params.append('status', status);
  if (phase) params.append('phase', phase);
  if (search) params.append('search', search);
  if (creator) params.append('creator', creator);

  const response = await fetch(`${getAPIUrl()}?${params.toString()}`, {
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error obteniendo expedientes');
  }

  return await response.json();
};

// Obtener expediente por ID (admin)
export const getRecordById = async (id: number): Promise<RecordWithDetails> => {
  const { authenticatedRequest } = await import('../../../shared/Services/api.service');
  const response = await authenticatedRequest(`/records/${id}`, {
    method: 'GET',
  });

  if (!response.ok) {
    await response.text();
    throw new Error('Error obteniendo expediente');
  }

  return await response.json();
};

// Aprobar fase 1
export const approvePhase1 = async (recordId: number, comment?: string): Promise<void> => {
  const response = await fetch(`${getAPIUrl()}/${recordId}/approve-phase1`, {
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
};

// Rechazar fase 1
export const rejectPhase1 = async (recordId: number, comment: string): Promise<void> => {
  const response = await fetch(`${getAPIUrl()}/${recordId}/reject-phase1`, {
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
};

// Solicitar modificación de fase 1
export const requestPhase1Modification = async (recordId: number, comment?: string): Promise<void> => {
  const response = await fetch(`${getAPIUrl()}/${recordId}/request-modification`, {
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
};

// Solicitar modificación de fase 3
export const requestPhase3Modification = async (
  recordId: number,
  comment: string,
  sectionsToModify: string[] = [],
  documentsToReplace: number[] = []
): Promise<void> => {
  const requestUrl = `${getAPIUrl()}/${recordId}/request-phase3-modification`;
  const response = await fetch(requestUrl, {
    method: 'PUT',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      comment,
      sections_to_modify: sectionsToModify,
      documents_to_replace: documentsToReplace
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error solicitando modificación de Fase 3');
  }

  await response.json();
};

// Update phase 1 data (for modifications)
export const updatePhase1Data = async (recordId: number, personalData: Phase1Data): Promise<void> => {
  const response = await fetch(`${getAPIUrl()}/${recordId}/update-phase1`, {
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
};

// Aprobar expediente completo
export const approveRecord = async (recordId: number, comment?: string): Promise<void> => {
  const response = await fetch(`${getAPIUrl()}/${recordId}/approve`, {
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
};

// Rechazar expediente completo
export const rejectRecord = async (recordId: number, comment: string): Promise<void> => {
  const response = await fetch(`${getAPIUrl()}/${recordId}/reject`, {
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
};

// Agregar comentario
export const addNote = async (recordId: number, note: string, type: string = 'activity'): Promise<void> => {
  const response = await fetch(`${getAPIUrl()}/${recordId}/notes`, {
    method: 'POST',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ note, type }),
  });

  if (!response.ok) {
    await response.text();
    throw new Error('Error agregando comentario');
  }
};

// Actualizar comentario
export const updateNote = async (noteId: number, note: string, type?: string): Promise<void> => {
  const response = await fetch(`${getAPIUrl()}/notes/${noteId}`, {
    method: 'PUT',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ note, type }),
  });

  if (!response.ok) {
    await response.text();
    throw new Error('Error actualizando comentario');
  }
};

// Eliminar comentario
export const deleteNote = async (noteId: number): Promise<void> => {
  const response = await fetch(`${getAPIUrl()}/notes/${noteId}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    await response.text();
    throw new Error('Error eliminando comentario');
  }
};

// Eliminar expediente
export const deleteRecord = async (recordId: number): Promise<void> => {
  const response = await fetch(`${getAPIUrl()}/${recordId}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeader(),
    },
  });

  if (!response.ok) {
    await response.text();
    throw new Error('Error eliminando expediente');
  }
};

// Obtener estadísticas (admin)
export const getRecordStats = async (): Promise<RecordStats> => {
  const response = await fetch(`${getAPIUrl()}/stats`, {
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error obteniendo estadísticas');
  }

  return await response.json();
};

// ===== SERVICIOS DE VALIDACIÓN =====

// Verificar si cédula está disponible
export const checkCedulaAvailability = async (cedula: string, excludeRecordId?: number): Promise<boolean> => {
  const params = new URLSearchParams();
  if (excludeRecordId) {
    params.append('excludeRecordId', excludeRecordId.toString());
  }

  const response = await fetch(`${getAPIUrl()}/check-cedula-availability/${cedula}?${params.toString()}`, {
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
};

// ===== SERVICIOS DE FASE 3 MODIFICACIONES =====

// Actualizar datos de fase 3 (para modificaciones)
export const updatePhase3Data = async (
  recordId: number, 
  phase3Data: Phase3Data,
  onProgress?: (percent: number) => void
): Promise<Record> => {
  const formData = new FormData();

  // Agregar datos JSON
  formData.append('data', JSON.stringify({
      complete_personal_data: phase3Data.complete_personal_data,
      family_information: phase3Data.family_information,
      disability_information: phase3Data.disability_information,
      socioeconomic_information: phase3Data.socioeconomic_information,
      documentation_requirements: phase3Data.documentation_requirements,
    }));

  // Agregar documentos con nombres de campo específicos
  phase3Data.documents.forEach((file) => {
    let documentType = 'other';

    if (phase3Data.documentTypes?.[file.name]) {
      documentType = phase3Data.documentTypes[file.name];
    } else {
      const fileName = file.name.toLowerCase();

      if (fileName.includes('dictamen') || fileName.includes('medico')) {
        documentType = 'dictamen_medico';
      } else if (fileName.includes('nacimiento') || fileName.includes('birth')) {
        documentType = 'constancia_nacimiento';
      } else if (fileName.includes('cedula') || fileName.includes('identificacion')) {
        documentType = 'copia_cedula';
      } else if (fileName.includes('foto') || fileName.includes('photo')) {
        documentType = 'foto_pasaporte';
      } else if (fileName.includes('pension') || fileName.includes('ccss')) {
        documentType = 'constancia_pension_ccss';
      } else if (fileName.includes('estudio') || fileName.includes('study')) {
        documentType = 'constancia_estudio';
      } else if (fileName.includes('banco') || fileName.includes('cuenta')) {
        documentType = 'cuenta_banco_nacional';
      }
    }

    formData.append(documentType, file);
  });

  const token = authorizationHeaderForXHR();

  const xhrResponse = await new Promise<Record>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', `${getAPIUrl()}/${recordId}/update-phase3`);

      if (token) {
        xhr.setRequestHeader('Authorization', token);
      }

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event: ProgressEvent) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText) as Record);
            } catch {
              resolve({} as Record);
            }
          } else {
            const errorText = xhr.responseText || `HTTP ${xhr.status}`;
            try {
              const error = JSON.parse(errorText) as { error?: string };
              reject(new Error(error.error || 'Error actualizando datos de fase 3'));
            } catch {
              reject(new Error(`Error actualizando datos de fase 3: ${errorText}`));
            }
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Error de red al actualizar datos de fase 3'));
      };

      xhr.send(formData);
    });

  return xhrResponse;
};

// Reemplazar documento específico
export const replaceDocument = async (
  recordId: number, 
  documentId: number, 
  file: File,
  onProgress?: (percent: number) => void
): Promise<unknown> => {
  const formData = new FormData();
  formData.append('document', file);

  const token = authorizationHeaderForXHR();

  const xhrResponse = await new Promise<unknown>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `${getAPIUrl().replace('/records', '/documents')}/${recordId}/documents/${documentId}/replace`);

      if (token) {
        xhr.setRequestHeader('Authorization', token);
      }

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event: ProgressEvent) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText) as unknown);
            } catch {
              resolve({});
            }
          } else {
            const errorText = xhr.responseText || `HTTP ${xhr.status}`;
            try {
              const error = JSON.parse(errorText) as { error?: string };
              reject(new Error(error.error || 'Error reemplazando documento'));
            } catch {
              reject(new Error(`Error reemplazando documento: ${errorText}`));
            }
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Error de red al reemplazar documento'));
      };

      xhr.send(formData);
    });

  return xhrResponse;
};

// ===== SERVICIOS DE NOTIFICACIONES =====

// Obtener notificaciones del usuario
export const getUserNotifications = async (): Promise<unknown[]> => {
  const response = await fetch(`${getAPIUrl()}/notifications`, {
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error obteniendo notificaciones');
  }

  return await response.json();
};

// Marcar notificación como leída
export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
  const response = await fetch(`${getAPIUrl()}/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Error marcando notificación como leída');
  }
};

// Admin record update with override capability
export const updateRecordAdmin = async (
  recordId: number,
  data: Phase3Data,
  onProgress?: (percent: number) => void
): Promise<void> => {
  const formData = new FormData();

  formData.append('data', JSON.stringify(data));

  if (data.documentation_requirements?.documents) {
    data.documentation_requirements.documents.forEach((doc, index) => {
      if (doc.file instanceof File) {
        formData.append(`document_${index}`, doc.file);
      }
    });
  }

  const token = authorizationHeaderForXHR();

  await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.open('PUT', `${getAPIUrl()}/${recordId}/admin-edit`);
      
      if (token) {
        xhr.setRequestHeader('Authorization', token);
      }
      
      // Progress tracking
      if (xhr.upload && onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        });
      }
      
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              JSON.parse(xhr.responseText);
            } catch {
              // non-JSON success body is still success
            }
            resolve(undefined);
          } else {
            try {
              const errorResponse = JSON.parse(xhr.responseText) as { error?: string };
              reject(new Error(errorResponse.error || `HTTP ${xhr.status}`));
            } catch {
              reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
            }
          }
        }
      };
      
      xhr.onerror = () => {
        reject(new Error('Network error occurred'));
      };
      
      xhr.send(formData);
    });
};

// Hand over admin-created record to user
export const handoverRecordToUser = async (
  recordId: number,
  userId: number
): Promise<{ message: string; record_id: number; user: { id: number; username: string; full_name: string } }> => {
  const response = await fetch(`${getAPIUrl()}/${recordId}/handover`, {
    method: 'PUT',
    headers: {
      ...getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return await response.json();
};
