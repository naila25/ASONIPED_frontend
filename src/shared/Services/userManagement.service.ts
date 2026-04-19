import { authenticatedRequest } from './api.service';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone?: string;
  status?: 'active' | 'inactive';
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  roles?: string[];
}

export interface UserWithStatistics extends User {
  statistics?: {
    records: number;
    tickets: number;
    workshops: number;
    volunteers: number;
  };
}

export interface UserFilters {
  search?: string;
  status?: 'active' | 'inactive';
  email_verified?: boolean;
  role?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface UserSort {
  field: 'id' | 'username' | 'email' | 'full_name' | 'created_at' | 'status';
  order: 'ASC' | 'DESC';
}

export interface PaginatedUsersResult {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserFormData {
  username: string;
  password?: string;
  email?: string;
  full_name?: string;
  phone?: string;
  status?: 'active' | 'inactive';
  roles?: string[];
}

// Get all users with pagination, filtering, and sorting
export const getUsers = async (
  filters?: UserFilters,
  sort?: UserSort,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedUsersResult> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  if (filters?.search) params.append('search', filters.search);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.email_verified !== undefined) params.append('email_verified', filters.email_verified.toString());
  if (filters?.role) params.append('role', filters.role);
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.append('dateTo', filters.dateTo);

  if (sort?.field) params.append('sortField', sort.field);
  if (sort?.order) params.append('sortOrder', sort.order);

  const response = await authenticatedRequest(`/users?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return await response.json();
};

// Get user by ID with statistics
export const getUserById = async (id: number): Promise<UserWithStatistics> => {
  const response = await authenticatedRequest(`/users/${id}`);

  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }

  return await response.json();
};

// Create user
export const createUser = async (userData: UserFormData): Promise<{ message: string; id: number }> => {
  const response = await authenticatedRequest('/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Failed to create user');
  }

  return await response.json();
};

// Update user
export const updateUser = async (id: number, userData: Partial<UserFormData>): Promise<{ message: string }> => {
  const response = await authenticatedRequest(`/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Failed to update user');
  }

  return await response.json();
};

// Delete user
export const deleteUser = async (id: number): Promise<void> => {
  const response = await authenticatedRequest(`/users/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || 'Failed to delete user');
  }
};

