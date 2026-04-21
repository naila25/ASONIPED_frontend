import { getAuthHeader } from '../../Login/Services/auth';
import { getAPIBaseURLSync } from '../../../shared/Services/config';
import type {
  ActivityTrack,
  ActivityTrackWithStats,
  AttendanceRecord,
  AttendanceRecordWithDetails,
  QRScanData,
  AttendanceStats,
  AttendanceAnalytics,
  CreateActivityTrackData,
  CreateActivityTrackResponse,
  ParkingPublicLinkResponse,
  CreateGuestAttendanceData,
  QRScanRequest,
  PaginatedResponse,
  DashboardStats,
  PublicParkingActivityResponse,
  ActivityParkingRegistration,
  SubmitPublicParkingData,
} from '../Types/attendanceNew';

const API_URL = `${getAPIBaseURLSync()}/api/attendance`;

/** Public parking link flow (no auth). */
export const parkingPublicApi = {
  getByToken: async (token: string): Promise<PublicParkingActivityResponse> => {
    const safe = encodeURIComponent(token.trim());
    const response = await fetch(`${API_URL}/public/parking/${safe}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    const data = (await response.json().catch(() => null)) as PublicParkingActivityResponse | { error?: string } | null;
    if (!response.ok) {
      const msg = data && typeof data === 'object' && 'error' in data ? (data as { error?: string }).error : undefined;
      if (response.status === 404 || response.status === 403) {
        throw new Error(msg || 'Registro no disponible');
      }
      throw new Error(msg || 'Error al cargar la actividad');
    }
    return data as PublicParkingActivityResponse;
  },

  submit: async (token: string, data: SubmitPublicParkingData): Promise<{ message: string; id: number }> => {
    const safe = encodeURIComponent(token.trim());
    const response = await fetch(`${API_URL}/public/parking/${safe}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plate: data.plate,
        full_name: data.full_name,
        cedula: data.cedula,
        phone: data.phone,
      }),
    });
    const body = (await response.json().catch(() => null)) as { message?: string; id?: number; error?: string } | null;
    if (!response.ok) {
      const msg = body?.error;
      if (response.status === 409) {
        throw new Error(msg || 'Esta placa ya está registrada');
      }
      throw new Error(msg || 'Error al registrar el vehículo');
    }
    return body as { message: string; id: number };
  },
};

/** Authenticated: parking rows for an activity. */
export const parkingRegistrationsApi = {
  listByActivity: async (activityTrackId: number): Promise<ActivityParkingRegistration[]> => {
    const response = await fetch(`${API_URL}/activity-tracks/${activityTrackId}/parking-registrations`, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Please log in again');
      }
      throw new Error('Failed to fetch parking registrations');
    }
    const data = await response.json();
    return data.registrations || [];
  },

  createAdmin: async (
    activityTrackId: number,
    body: SubmitPublicParkingData
  ): Promise<{ message: string; id: number }> => {
    const response = await fetch(`${API_URL}/activity-tracks/${activityTrackId}/parking-registrations`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plate: body.plate,
        full_name: body.full_name,
        cedula: body.cedula,
        phone: body.phone,
      }),
    });
    const data = (await response.json().catch(() => null)) as { message?: string; id?: number; error?: string } | null;
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Please log in again');
      }
      if (response.status === 409) {
        throw new Error(data?.error || 'Esta placa ya está registrada');
      }
      throw new Error(data?.error || 'Error al registrar el vehículo');
    }
    return data as { message: string; id: number };
  },
};

// Activity Tracks API
export const activityTracksApi = {
  // Create a new activity track
  create: async (data: CreateActivityTrackData): Promise<CreateActivityTrackResponse> => {
      const response = await fetch(`${API_URL}/activity-tracks`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in again');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create activity track');
      }

      return await response.json();
  },

  // Get all activity tracks with pagination
  getAll: async (
    page = 1,
    limit = 10,
    status?: string,
    createdBy?: number,
    includeArchived = false,
    search?: string
  ): Promise<PaginatedResponse<ActivityTrackWithStats>> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
        ...(createdBy && { createdBy: createdBy.toString() }),
        ...(includeArchived ? { includeArchived: 'true' } : {}),
        ...(search && search.trim() ? { search: search.trim() } : {}),
      });

      const response = await fetch(`${API_URL}/activity-tracks?${params}`, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in again');
        }
        throw new Error('Failed to fetch activity tracks');
      }

      const data = await response.json();
      return {
        data: data.activityTracks,
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages
      };
  },

  // Get activity track by ID
  getById: async (id: number): Promise<ActivityTrackWithStats> => {
      const response = await fetch(`${API_URL}/activity-tracks/${id}`, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in again');
        }
        if (response.status === 404) {
          throw new Error('Activity track not found');
        }
        throw new Error('Failed to fetch activity track');
      }

      return await response.json();
  },

  /** Current signed parking URL segment + expiry (authenticated). */
  getParkingPublicLink: async (id: number): Promise<ParkingPublicLinkResponse> => {
      const response = await fetch(`${API_URL}/activity-tracks/${id}/parking-link`, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in again');
        }
        const err = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || 'No se pudo obtener el enlace de estacionamiento');
      }

      return (await response.json()) as ParkingPublicLinkResponse;
  },

  // Update activity track
  update: async (id: number, data: Partial<ActivityTrack>): Promise<void> => {
      const response = await fetch(`${API_URL}/activity-tracks/${id}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in again');
        }
        if (response.status === 404) {
          throw new Error('Activity track not found');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update activity track');
      }
  },

  archive: async (id: number): Promise<void> => {
      const response = await fetch(`${API_URL}/activity-tracks/${id}/archive`, {
        method: 'PUT',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in again');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData as { error?: string }).error || 'No se pudo archivar la actividad');
      }
  },

  unarchive: async (id: number): Promise<void> => {
      const response = await fetch(`${API_URL}/activity-tracks/${id}/unarchive`, {
        method: 'PUT',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in again');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData as { error?: string }).error || 'No se pudo restaurar la actividad');
      }
  },

  // Delete activity track (hard delete; prefer archive)
  delete: async (id: number): Promise<void> => {
      const response = await fetch(`${API_URL}/activity-tracks/${id}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in again');
        }
        if (response.status === 404) {
          throw new Error('Activity track not found');
        }
        const errorData = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(errorData.error || 'No se pudo eliminar la actividad');
      }
  },

  // Start QR scanning for an activity track
  startScanning: async (id: number): Promise<void> => {
      const response = await fetch(`${API_URL}/activity-tracks/${id}/start-scanning`, {
        method: 'PUT',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in again');
        }
        if (response.status === 404) {
          throw new Error('Activity track not found');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start QR scanning');
      }
  },

  // Stop QR scanning for an activity track
  stopScanning: async (id: number): Promise<void> => {
      const response = await fetch(`${API_URL}/activity-tracks/${id}/stop-scanning`, {
        method: 'PUT',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in again');
        }
        if (response.status === 404) {
          throw new Error('Activity track not found');
        }
        throw new Error('Failed to stop QR scanning');
      }
  },

  // Get currently active scanning activity track
  getActiveScanning: async (): Promise<ActivityTrack | null> => {
      const response = await fetch(`${API_URL}/activity-tracks/active-scanning`, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in again');
        }
        throw new Error('Failed to fetch active scanning activity');
      }

      const data = await response.json();
      return data.activeTrack || null;
  },

  // Get upcoming activity tracks
  getUpcoming: async (limit = 5): Promise<ActivityTrackWithStats[]> => {
      const response = await fetch(`${API_URL}/activity-tracks/upcoming?limit=${limit}`, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in again');
        }
        throw new Error('Failed to fetch upcoming activities');
      }

      const data = await response.json();
      return data.activityTracks || [];
  }
};

// Attendance Records API
export const attendanceRecordsApi = {
  // Process QR code scan
  processQRScan: async (data: QRScanRequest): Promise<AttendanceRecord> => {
      const response = await fetch(`${API_URL}/attendance-records/qr-scan`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in again');
        }
        if (response.status === 409) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Attendance already recorded');
        }
        if (response.status === 404) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Record not found');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process QR scan');
      }

      const result = await response.json();
      return result.attendanceRecord;
  },

  // Create manual attendance entry
  createManual: async (data: CreateGuestAttendanceData): Promise<AttendanceRecord> => {
      const response = await fetch(`${API_URL}/attendance-records/manual`, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in again');
        }
        if (response.status === 409) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Attendance already recorded');
        }
        if (response.status === 404) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Activity track not found');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create manual attendance');
      }

      const result = await response.json();
      return result.attendanceRecord;
  },

  // Get attendance records with filtering
  getAll: async (
    page = 1,
    limit = 50,
    activityTrackId?: number,
    attendanceType?: 'beneficiario' | 'guest',
    attendanceMethod?: 'qr_scan' | 'manual_form',
    startDate?: string,
    endDate?: string
  ): Promise<PaginatedResponse<AttendanceRecordWithDetails>> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(activityTrackId && { activityTrackId: activityTrackId.toString() }),
        ...(attendanceType && { attendanceType }),
        ...(attendanceMethod && { attendanceMethod }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await fetch(`${API_URL}/attendance-records?${params}`, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in again');
        }
        throw new Error('Failed to fetch attendance records');
      }

      const data = await response.json();
      return {
        data: data.records,
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages
      };
  },

  // Get attendance records for a specific activity track
  getByActivityTrack: async (activityTrackId: number, page = 1, limit = 50): Promise<PaginatedResponse<AttendanceRecordWithDetails>> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await fetch(`${API_URL}/attendance-records/activity-track/${activityTrackId}?${params}`, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in again');
        }
        throw new Error('Failed to fetch attendance records for activity');
      }

      const data = await response.json();
      return {
        data: data.records,
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages
      };
  },

  // Get recent attendance records
  getRecent: async (limit = 10): Promise<AttendanceRecordWithDetails[]> => {
      const response = await fetch(`${API_URL}/attendance-records/recent?limit=${limit}`, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in again');
        }
        throw new Error('Failed to fetch recent attendance records');
      }

      const data = await response.json();
      return data.records || [];
  },

  // Get attendance statistics for an activity track
  getStats: async (activityTrackId: number): Promise<AttendanceStats> => {
      const response = await fetch(`${API_URL}/attendance-records/activity-track/${activityTrackId}/stats`, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in again');
        }
        throw new Error('Failed to fetch attendance statistics');
      }

      const data = await response.json();
      return data.stats;
  }
};

// Analytics API
export const analyticsApi = {
  // Get comprehensive analytics overview
  getOverview: async (startDate?: string, endDate?: string): Promise<AttendanceAnalytics> => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`${API_URL}/analytics/overview?${params}`, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in again');
        }
        throw new Error('Failed to fetch analytics overview');
      }

      return await response.json();
  },

  // Export attendance data
  exportData: async (format: 'json' | 'csv' = 'json', startDate?: string, endDate?: string): Promise<Blob> => {
      const params = new URLSearchParams({ format });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`${API_URL}/analytics/export?${params}`, {
        headers: {
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in again');
        }
        throw new Error('Failed to export attendance data');
      }

      return await response.blob();
  }
};

// Records Integration API
export const recordsApi = {
  // Generate attendance QR data for a record
  generateAttendanceQR: async (recordId: number): Promise<{ qrData: QRScanData; record: AttendanceRecord }> => {
      const response = await fetch(`${getAPIBaseURLSync()}/records/${recordId}/attendance-qr`, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please log in again');
        }
        if (response.status === 404) {
          throw new Error('Record not found');
        }
        if (response.status === 403) {
          throw new Error('Access denied to this record');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate attendance QR');
      }

      return await response.json();
  }
};

// Dashboard API - Combined data for dashboard
export const dashboardApi = {
  // Get dashboard statistics
  getStats: async (): Promise<DashboardStats> => {
    try {
      const upcomingActivities = await activityTracksApi.getUpcoming(5);

      const today = new Date().toISOString().split('T')[0];

      const todayAttendance = await attendanceRecordsApi.getAll(1, 1000, undefined, undefined, undefined, today, today);

      const totalAttendance = await attendanceRecordsApi.getAll(1, 1);

      const allActivities = await activityTracksApi.getAll(1, 1000);

      const stats = {
        totalActivities: allActivities.total || 0,
        activeActivities: (allActivities.data || []).filter(a => a.status === 'active').length,
        todayAttendance: todayAttendance.total || 0,
        totalAttendance: totalAttendance.total || 0,
        recentActivities: upcomingActivities || []
      };

      return stats;
    } catch {
      return {
        totalActivities: 0,
        activeActivities: 0,
        todayAttendance: 0,
        totalAttendance: 0,
        recentActivities: []
      };
    }
  }
};
