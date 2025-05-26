import type { VolunteerOption, ApiResponse, ApiError } from '../types/volunteer';
import { JSONBIN_CONFIG } from './config';

const validateVolunteerOption = (option: any): option is VolunteerOption => {
  return (
    option &&
    typeof option.id === 'string' &&
    typeof option.title === 'string' &&
    typeof option.description === 'string' &&
    typeof option.imageUrl === 'string' &&
    typeof option.date === 'string' &&
    typeof option.location === 'string'
  );
};

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

export const fetchVolunteers = async (page = 1, limit = 10): Promise<ApiResponse<VolunteerOption[]>> => {
  try {
    const response = await fetchWithRetry(
      `${JSONBIN_CONFIG.API_URL}/${JSONBIN_CONFIG.ACCOUNTS.VOLUNTEER.BINS.OPTIONS}`,
      {
        headers: {
          'X-Master-Key': JSONBIN_CONFIG.ACCOUNTS.VOLUNTEER.MASTER_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch volunteer options: ${response.statusText}`);
    }

    const data = await response.json();
    const options = data.record.options || [];

    const validOptions = options.filter(validateVolunteerOption);
    if (validOptions.length !== options.length) {
      console.warn('Some volunteer options were invalid and were filtered out');
    }

    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedOptions = validOptions.slice(start, end);

    return {
      data: paginatedOptions,
      metadata: {
        total: validOptions.length,
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

export const updateVolunteerOptions = async (options: VolunteerOption[]): Promise<ApiResponse<void>> => {
  try {
    const invalidOptions = options.filter(option => !validateVolunteerOption(option));
    if (invalidOptions.length > 0) {
      throw new Error('Some options are invalid');
    }

    const response = await fetchWithRetry(
      `${JSONBIN_CONFIG.API_URL}/${JSONBIN_CONFIG.ACCOUNTS.VOLUNTEER.BINS.OPTIONS}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_CONFIG.ACCOUNTS.VOLUNTEER.MASTER_KEY,
        },
        body: JSON.stringify({ options }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update volunteer options: ${response.statusText}`);
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

export const addVolunteerOption = async (option: Omit<VolunteerOption, 'id'>): Promise<ApiResponse<VolunteerOption>> => {
  try {
    const options = await fetchVolunteers(1, 1000);
    if (options.error) {
      throw new Error(options.error.message);
    }

    const newOption: VolunteerOption = {
      ...option,
      id: Date.now().toString(),
    };

    if (!validateVolunteerOption(newOption)) {
      throw new Error('Invalid option data');
    }

    const updateResponse = await updateVolunteerOptions([...options.data, newOption]);
    if (updateResponse.error) {
      throw new Error(updateResponse.error.message);
    }

    return { data: newOption };
  } catch (error) {
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      code: 'ADD_ERROR',
      status: 500,
    };
    return { data: null as any, error: apiError };
  }
};

export const deleteVolunteerOption = async (id: string): Promise<ApiResponse<void>> => {
  try {
    const options = await fetchVolunteers(1, 1000);
    if (options.error) {
      throw new Error(options.error.message);
    }

    const updatedOptions = options.data.filter(option => option.id !== id);
    const updateResponse = await updateVolunteerOptions(updatedOptions);
    if (updateResponse.error) {
      throw new Error(updateResponse.error.message);
    }

    return { data: undefined };
  } catch (error) {
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      code: 'DELETE_ERROR',
      status: 500,
    };
    return { data: undefined, error: apiError };
  }
};
