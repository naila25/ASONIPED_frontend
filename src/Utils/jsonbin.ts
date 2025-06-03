/*import type { VolunteerForm, ApiResponse, ApiError } from '../types/volunteer';

const JSONBIN_API_URL = 'https://api.jsonbin.io/v3/b';
const VOLUNTEER_FORMS_BIN_ID = '6824fd018561e97a5013fbd4';
const MASTER_KEY = '$2a$10$5iW5mNvCihHbi0EF9JWv1eEyj0krBYq5egcBGd1weGSAcJ3er/ATG';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const validateVolunteerForm = (form: any): form is VolunteerForm => {
  return (
    form &&
    typeof form.id === 'string' &&
    form.personalInfo &&
    typeof form.personalInfo.firstName === 'string' &&
    typeof form.personalInfo.lastName === 'string' &&
    typeof form.personalInfo.email === 'string' &&
    typeof form.personalInfo.phone === 'string' &&
    typeof form.personalInfo.age === 'string' &&
    form.availability &&
    Array.isArray(form.availability.days) &&
    Array.isArray(form.availability.timeSlots) &&
    typeof form.skills === 'string' &&
    typeof form.motivation === 'string' &&
    typeof form.volunteerOptionId === 'string' &&
    typeof form.submissionDate === 'string' &&
    ['pending', 'approved', 'rejected'].includes(form.status)
  );
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    if (!response.ok && retries > 0) {
      await sleep(RETRY_DELAY);
      return fetchWithRetry(url, options, retries - 1);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      await sleep(RETRY_DELAY);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

export const fetchVolunteerForms = async (page = 1, limit = 10): Promise<ApiResponse<VolunteerForm[]>> => {
  try {
    const response = await fetchWithRetry(
      `${JSONBIN_API_URL}/${VOLUNTEER_FORMS_BIN_ID}`,
      {
        headers: {
          'X-Master-Key': MASTER_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch volunteer forms: ${response.statusText}`);
    }

    const data = await response.json();
    const forms = data.record.forms || [];

    // Validate each form
    const validForms = forms.filter(validateVolunteerForm);
    if (validForms.length !== forms.length) {
      console.warn('Some forms were invalid and were filtered out');
    }

    // Implement pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedForms = validForms.slice(start, end);

    return {
      data: paginatedForms,
      metadata: {
        total: validForms.length,
        page,
        limit,
      },
    };
  } catch (error) {
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      code: 'FETCH_ERROR',
      status: 500,
    };
    return { data: [], error: apiError };
  }
};

export const updateVolunteerForms = async (forms: VolunteerForm[]): Promise<ApiResponse<void>> => {
  try {
    // Validate all forms before updating
    const invalidForms = forms.filter(form => !validateVolunteerForm(form));
    if (invalidForms.length > 0) {
      throw new Error('Some forms are invalid');
    }

    const response = await fetchWithRetry(
      `${JSONBIN_API_URL}/${VOLUNTEER_FORMS_BIN_ID}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': MASTER_KEY,
        },
        body: JSON.stringify({ forms }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update volunteer forms: ${response.statusText}`);
    }

    return { data: undefined };
  } catch (error) {
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      code: 'UPDATE_ERROR',
      status: 500,
    };
    return { data: undefined, error: apiError };
  }
};

export const addVolunteerForm = async (form: Omit<VolunteerForm, 'id'>): Promise<ApiResponse<VolunteerForm>> => {
  try {
    const forms = await fetchVolunteerForms(1, 1000); // Get all forms
    if (forms.error) {
      throw new Error(forms.error.message);
    }

    const newForm: VolunteerForm = {
      ...form,
      id: Date.now().toString(),
      submissionDate: new Date().toISOString(),
      status: 'pending',
    };

    // Validate the new form
    if (!validateVolunteerForm(newForm)) {
      throw new Error('Invalid form data');
    }

    const updateResponse = await updateVolunteerForms([...forms.data, newForm]);
    if (updateResponse.error) {
      throw new Error(updateResponse.error.message);
    }

    return { data: newForm };
  } catch (error) {
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      code: 'ADD_ERROR',
      status: 500,
    };
    return { data: null as any, error: apiError };
  }
};

export const updateVolunteerFormStatus = async (
  formId: string,
  status: 'pending' | 'approved' | 'rejected'
): Promise<ApiResponse<void>> => {
  try {
    const forms = await fetchVolunteerForms(1, 1000); // Get all forms
    if (forms.error) {
      throw new Error(forms.error.message);
    }

    const formIndex = forms.data.findIndex(form => form.id === formId);
    if (formIndex === -1) {
      throw new Error('Form not found');
    }

    const updatedForms = forms.data.map(form =>
      form.id === formId ? { ...form, status } : form
    );

    const updateResponse = await updateVolunteerForms(updatedForms);
    if (updateResponse.error) {
      throw new Error(updateResponse.error.message);
    }

    return { data: undefined };
  } catch (error) {
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      code: 'STATUS_UPDATE_ERROR',
      status: 500,
    };
    return { data: undefined, error: apiError };
  }
}; 
*/