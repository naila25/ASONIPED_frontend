// Utility functions for handling Google Drive files in the Records module

export interface GoogleDriveFileInfo {
  id: string;
  name: string;
  url: string;
  size?: number;
  mimeType?: string;
}

/**
 * Get the appropriate file URL for display/download
 * Prioritizes Google Drive URL over legacy file_path
 */
export const getFileUrl = (document: {
  file_path?: string;
  google_drive_url?: string;
  google_drive_id?: string;
}): string => {
  // Prefer Google Drive URL if available
  if (document.google_drive_url) {
    return document.google_drive_url;
  }
  
  // Fallback to legacy file_path
  if (document.file_path) {
    // If it's already a full URL (Google Drive), return as is
    if (document.file_path.startsWith('http')) {
      return document.file_path;
    }
    // If it's a local path, construct the full URL
    return `${window.location.origin}${document.file_path}`;
  }
  
  return '';
};

/**
 * Get the appropriate file name for display
 * Prioritizes original_name over Google Drive name
 */
export const getFileName = (document: {
  original_name?: string;
  google_drive_name?: string;
  file_name?: string;
}): string => {
  return document.original_name || document.google_drive_name || document.file_name || 'Unknown file';
};

/**
 * Check if a file is a Google Drive file
 */
export const isGoogleDriveFile = (document: {
  google_drive_id?: string;
  google_drive_url?: string;
}): boolean => {
  return !!(document.google_drive_id || document.google_drive_url);
};

/**
 * Get file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file icon based on file type
 */
export const getFileIcon = (fileName: string, mimeType?: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (mimeType) {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('application/pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  }
  
  switch (extension) {
    case 'pdf': return '📄';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp': return '🖼️';
    case 'doc':
    case 'docx': return '📝';
    case 'xls':
    case 'xlsx': return '📊';
    case 'txt': return '📄';
    default: return '📁';
  }
};

/**
 * Open file in new tab for preview
 */
export const previewFile = (url: string): void => {
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

/**
 * Download file
 */
export const downloadFile = async (url: string, fileName: string): Promise<void> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Error downloading file:', error);
    // Fallback: open in new tab
    previewFile(url);
  }
};

/**
 * Check if file can be previewed in browser
 */
export const canPreviewInBrowser = (fileName: string, mimeType?: string): boolean => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (mimeType) {
    return mimeType.startsWith('image/') || 
           mimeType.startsWith('application/pdf') ||
           mimeType.startsWith('text/');
  }
  
  return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'txt'].includes(extension || '');
};

