import { JSONBIN_CONFIG } from './config';

export interface DonationForm {
  nombre: string;
  telefono: string;
  correo: string;
  tipo: string;
  metodo: string;
  monto: string;
  aceptar: boolean;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code: string;
    status: number;
  };
  metadata?: {
    total: number;
    page: number;
    limit: number;
  };
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url: string, options: RequestInit, retries = JSONBIN_CONFIG.MAX_RETRIES): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    if (!response.ok && retries > 0) {
      await sleep(JSONBIN_CONFIG.RETRY_DELAY);
      return fetchWithRetry(url, options, retries - 1);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      await sleep(JSONBIN_CONFIG.RETRY_DELAY);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

export const fetchDonationForms = async (page = 1, limit = 10): Promise<ApiResponse<DonationForm[]>> => {
  try {
    const response = await fetchWithRetry(
      `${JSONBIN_CONFIG.API_URL}/${JSONBIN_CONFIG.ACCOUNTS.DONATION.BINS.FORMS}`,
      {
        headers: {
          'X-Master-Key': JSONBIN_CONFIG.ACCOUNTS.DONATION.MASTER_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch donation forms: ${response.statusText}`);
    }

    const data = await response.json();
    const forms = Array.isArray(data.record) ? data.record : [];

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedForms = forms.slice(start, end);

    return {
      data: paginatedForms,
      metadata: {
        total: forms.length,
        page,
        limit,
      },
    };
  } catch (error) {
    const apiError = {
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      code: 'FETCH_ERROR',
      status: 500,
    };
    return { data: [], error: apiError };
  }
};

export const updateDonationForm = async (correo: string, status: 'pending' | 'approved' | 'rejected'): Promise<ApiResponse<void>> => {
  try {
    const response = await fetchWithRetry(
      `${JSONBIN_CONFIG.API_URL}/${JSONBIN_CONFIG.ACCOUNTS.DONATION.BINS.FORMS}`,
      {
        headers: {
          'X-Master-Key': JSONBIN_CONFIG.ACCOUNTS.DONATION.MASTER_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch donation forms: ${response.statusText}`);
    }

    const data = await response.json();
    const forms = Array.isArray(data.record) ? data.record : [];

    const updatedForms = forms.map((form: DonationForm) =>
      form.correo === correo ? { ...form, status } : form
    );

    const updateResponse = await fetchWithRetry(
      `${JSONBIN_CONFIG.API_URL}/${JSONBIN_CONFIG.ACCOUNTS.DONATION.BINS.FORMS}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_CONFIG.ACCOUNTS.DONATION.MASTER_KEY,
        },
        body: JSON.stringify(updatedForms),
      }
    );

    if (!updateResponse.ok) {
      throw new Error(`Failed to update donation form: ${updateResponse.statusText}`);
    }

    return { data: undefined };
  } catch (error) {
    const apiError = {
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      code: 'UPDATE_ERROR',
      status: 500,
    };
    return { data: undefined, error: apiError };
  }
};
