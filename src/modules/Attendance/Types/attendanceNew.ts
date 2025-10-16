// New Attendance System Types
// These types match our backend implementation

export interface ActivityTrack {
  id?: number;
  name: string;
  description?: string;
  event_date: string; // YYYY-MM-DD format
  event_time?: string; // HH:MM:SS format
  location?: string;
  status?: 'active' | 'inactive' | 'completed';
  scanning_active?: boolean;
  created_by: number;
  created_at?: string;
  updated_at?: string;
}

export interface ActivityTrackWithStats extends ActivityTrack {
  total_attendance?: number;
  beneficiarios_count?: number;
  guests_count?: number;
  created_by_name?: string;
}

export interface AttendanceRecord {
  id?: number;
  activity_track_id: number;
  record_id?: number; // For beneficiarios, null for guests
  attendance_type: 'beneficiario' | 'guest';
  full_name: string;
  cedula?: string; // Optional for guests
  phone?: string; // Optional for guests
  attendance_method: 'qr_scan' | 'manual_form';
  scanned_at?: string;
  created_by: number;
  created_at?: string;
  updated_at?: string;
}

export interface AttendanceRecordWithDetails extends AttendanceRecord {
  activity_track_name?: string;
  activity_track_date?: string;
  record_number?: string; // From records table for beneficiarios
  created_by_name?: string;
}

export interface QRScanData {
  record_id: number;
  name: string;
}

export interface AttendanceStats {
  total_attendance: number;
  beneficiarios_count: number;
  guests_count: number;
  qr_scans_count: number;
  manual_entries_count: number;
}

export interface AttendanceAnalytics {
  overview: {
    overall_stats: AttendanceStats & {
      daily_breakdown: Array<{
        date: string;
        total: number;
        beneficiarios: number;
        guests: number;
      }>;
    };
    activity_stats: {
      total_activities: number;
      active_activities: number;
      completed_activities: number;
      avg_attendance_per_activity: number;
    };
    top_activities: ActivityTrackWithStats[];
    attendance_trends: Array<{
      date: string;
      total_attendance: number;
      beneficiarios_count: number;
      guests_count: number;
    }>;
  };
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface CreateActivityTrackData {
  name: string;
  description?: string;
  event_date: string;
  event_time?: string;
  location?: string;
  status?: 'active' | 'inactive' | 'completed';
}

export interface CreateGuestAttendanceData {
  activity_track_id: number;
  attendance_type: 'guest';
  full_name: string;
  cedula?: string;
  phone?: string;
}

export interface QRScanRequest {
  qrData: QRScanData;
  activityTrackId: number;
}

// Component Props Types
export interface ActivitySelectorProps {
  onActivitySelect: (activity: ActivityTrack) => void;
  selectedActivity?: ActivityTrack;
  showCreateButton?: boolean;
  onCreateActivity?: () => void;
}

export interface QRScannerProps {
  onScanSuccess: (data: QRScanData) => void;
  onScanError: (error: string) => void;
  isActive: boolean;
  activityTrack?: ActivityTrack;
}

export interface ScanningStatusProps {
  isScanning: boolean;
  currentActivity?: ActivityTrack;
  attendanceCount: number;
  onStartScanning: () => void;
  onStopScanning: () => void;
  success?: string | null;
  error?: string | null;
}

export interface BeneficiarioCardProps {
  record: AttendanceRecordWithDetails;
  onRemove?: (id: number) => void;
  showActions?: boolean;
}

// Dashboard Stats
export interface DashboardStats {
  totalActivities: number;
  activeActivities: number;
  todayAttendance: number;
  totalAttendance: number;
  recentActivities: ActivityTrackWithStats[];
}
