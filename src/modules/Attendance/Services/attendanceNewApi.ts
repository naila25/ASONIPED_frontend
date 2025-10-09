import { getAuthHeader } from '../../Login/Services/auth';
import { API_BASE_URL } from '../../../shared/Services/config';
import type {
  ActivityTrack,
  ActivityTrackWithStats,
  AttendanceRecord,
  AttendanceRecordWithDetails,
  QRScanData,
  AttendanceStats,
  AttendanceAnalytics,
  CreateActivityTrackData,
  CreateGuestAttendanceData,
  QRScanRequest,
  PaginatedResponse,
  DashboardStats
} from '../Types/attendanceNew';

const API_URL = `${API_BASE_URL}/api/attendance`;

// Activity Tracks API
export const activityTracksApi = {
  // Create a new activity track
  create: async (data: CreateActivityTrackData): Promise<{ activity_track_id: number }> => {
    try {
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
    } catch (error) {
      console.error('Error creating activity track:', error);
      throw error;
    }
  },

  // Get all activity tracks with pagination
  getAll: async (page = 1, limit = 10, status?: string, createdBy?: number): Promise<PaginatedResponse<ActivityTrackWithStats>> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
        ...(createdBy && { createdBy: createdBy.toString() })
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
    } catch (error) {
      console.error('Error fetching activity tracks:', error);
      throw error;
    }
  },

  // Get activity track by ID
  getById: async (id: number): Promise<ActivityTrackWithStats> => {
    try {
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
    } catch (error) {
      console.error('Error fetching activity track:', error);
      throw error;
    }
  },

  // Update activity track
  update: async (id: number, data: Partial<ActivityTrack>): Promise<void> => {
    try {
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
    } catch (error) {
      console.error('Error updating activity track:', error);
      throw error;
    }
  },

  // Delete activity track
  delete: async (id: number): Promise<void> => {
    try {
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
        throw new Error('Failed to delete activity track');
      }
    } catch (error) {
      console.error('Error deleting activity track:', error);
      throw error;
    }
  },

  // Start QR scanning for an activity track
  startScanning: async (id: number): Promise<void> => {
    try {
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
    } catch (error) {
      console.error('Error starting QR scanning:', error);
      throw error;
    }
  },

  // Stop QR scanning for an activity track
  stopScanning: async (id: number): Promise<void> => {
    try {
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
    } catch (error) {
      console.error('Error stopping QR scanning:', error);
      throw error;
    }
  },

  // Get currently active scanning activity track
  getActiveScanning: async (): Promise<ActivityTrack | null> => {
    try {
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
    } catch (error) {
      console.error('Error fetching active scanning activity:', error);
      throw error;
    }
  },

  // Get upcoming activity tracks
  getUpcoming: async (limit = 5): Promise<ActivityTrackWithStats[]> => {
    try {
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
    } catch (error) {
      console.error('Error fetching upcoming activities:', error);
      throw error;
    }
  }
};

// Attendance Records API
export const attendanceRecordsApi = {
  // Process QR code scan
  processQRScan: async (data: QRScanRequest): Promise<AttendanceRecord> => {
    try {
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
    } catch (error) {
      console.error('Error processing QR scan:', error);
      throw error;
    }
  },

  // Create manual attendance entry
  createManual: async (data: CreateGuestAttendanceData): Promise<AttendanceRecord> => {
    try {
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
    } catch (error) {
      console.error('Error creating manual attendance:', error);
      throw error;
    }
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
    try {
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
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      throw error;
    }
  },

  // Get attendance records for a specific activity track
  getByActivityTrack: async (activityTrackId: number, page = 1, limit = 50): Promise<PaginatedResponse<AttendanceRecordWithDetails>> => {
    try {
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
    } catch (error) {
      console.error('Error fetching attendance records for activity:', error);
      throw error;
    }
  },

  // Get recent attendance records
  getRecent: async (limit = 10): Promise<AttendanceRecordWithDetails[]> => {
    try {
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
    } catch (error) {
      console.error('Error fetching recent attendance records:', error);
      throw error;
    }
  },

  // Get attendance statistics for an activity track
  getStats: async (activityTrackId: number): Promise<AttendanceStats> => {
    try {
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
    } catch (error) {
      console.error('Error fetching attendance statistics:', error);
      throw error;
    }
  }
};

// Analytics API
export const analyticsApi = {
  // Get comprehensive analytics overview
  getOverview: async (startDate?: string, endDate?: string): Promise<AttendanceAnalytics> => {
    try {
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
    } catch (error) {
      console.error('Error fetching analytics overview:', error);
      throw error;
    }
  },

  // Export attendance data
  exportData: async (format: 'json' | 'csv' = 'json', startDate?: string, endDate?: string): Promise<Blob> => {
    try {
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
    } catch (error) {
      console.error('Error exporting attendance data:', error);
      throw error;
    }
  }
};

// Records Integration API
export const recordsApi = {
  // Generate attendance QR data for a record
  generateAttendanceQR: async (recordId: number): Promise<{ qrData: QRScanData; record: any }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/records/${recordId}/attendance-qr`, {
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
    } catch (error) {
      console.error('Error generating attendance QR:', error);
      throw error;
    }
  }
};

// Dashboard API - Combined data for dashboard
export const dashboardApi = {
  // Get dashboard statistics
  getStats: async (): Promise<DashboardStats> => {
    try {
      // Get upcoming activities
      const upcomingActivities = await activityTracksApi.getUpcoming(5);
      
      // Get today's date for filtering
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's attendance
      const todayAttendance = await attendanceRecordsApi.getAll(1, 1000, undefined, undefined, undefined, today, today);
      
      // Get total attendance
      const totalAttendance = await attendanceRecordsApi.getAll(1, 1);
      
      // Get all activities for stats
      const allActivities = await activityTracksApi.getAll(1, 1000);
      
      return {
        totalActivities: allActivities.total,
        activeActivities: allActivities.data.filter(a => a.status === 'active').length,
        todayAttendance: todayAttendance.total,
        totalAttendance: totalAttendance.total,
        recentActivities: upcomingActivities
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
};
