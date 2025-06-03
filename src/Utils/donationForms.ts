/**
 * Types and API utilities for managing donation forms.
 */

/**
 * Represents a donation form entry.
 */
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

/**
 * Standard API response wrapper.
 */
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


export const fetchDonationForms = async (page = 1, limit = 10): Promise<ApiResponse<DonationForm[]>> => {
  try {
    const response = await fetch(`http://localhost:3000/donations`);
    if (!response.ok) {
      throw new Error(`Failed to fetch donation forms: ${response.statusText}`);
    }
    const data = await response.json();
    // Paginate on frontend if backend doesn't support it
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedForms = data.slice(start, end);

    return {
      data: paginatedForms,
      metadata: {
        total: data.length,
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


export const updateDonationForm = async (
  correo: string,
  status: 'pending' | 'approved' | 'rejected'
): Promise<ApiResponse<void>> => {
  try {
    // Fetch all donations to find the one with the matching correo
    const response = await fetch(`http://localhost:3000/donations`);
    if (!response.ok) throw new Error('Failed to fetch donations');
    const data = await response.json();
    const donation = data.find((form: DonationForm) => form.correo === correo);
    if (!donation) throw new Error('Donation not found');

    // Update the status
    const updateResponse = await fetch(`http://localhost:3000/donations/${donation.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer supersecrettoken', // Use your admin token
      },
      body: JSON.stringify({ status }),
    });
    if (!updateResponse.ok) throw new Error('Failed to update donation status');
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


export const deleteDonationForm = async (correo: string): Promise<ApiResponse<void>> => {
  try {
    // Fetch all donations to find the one with the matching correo
    const response = await fetch(`http://localhost:3000/donations`);
    if (!response.ok) throw new Error('Failed to fetch donations');
    const data = await response.json();
    const donation = data.find((form: DonationForm) => form.correo === correo);
    if (!donation) throw new Error('Donation not found');

    // Delete the donation
    const deleteResponse = await fetch(`http://localhost:3000/donations/${donation.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer supersecrettoken', // Use your admin token
      },
    });
    if (!deleteResponse.ok) throw new Error('Failed to delete donation');
    return { data: undefined };
  } catch (error) {
    const apiError = {
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      code: 'DELETE_ERROR',
      status: 500,
    };
    return { data: undefined, error: apiError };
  }
};
