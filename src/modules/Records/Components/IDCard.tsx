import React, { useMemo, useState, useEffect, useRef } from 'react';
import type { RecordWithDetails } from '../Types/records';
import { buildAttendanceQrData } from '../Utils/idCard';
import logo from '../../../assets/logoasoniped.png';
import { getAPIBaseURLSync, getAPIBaseURL } from '../../../shared/Services/config';
import { getToken } from '../../../modules/Login/Services/auth';

type IDCardProps = {
  record: RecordWithDetails;
  qrUrl?: string; 
  className?: string;
};


const IDCard: React.FC<IDCardProps> = ({ record, qrUrl, className }) => {
  const cpd = record.complete_personal_data;
  const disability = (record.disability_information || record.disability_data) as any;
  const medicalAdditional = disability?.medical_additional || {};

  const fullName = cpd?.full_name || record.personal_data?.full_name || '';
  const cedula = cpd?.cedula || record.personal_data?.cedula || '';
  const exactAddress = cpd?.exact_address || record.personal_data?.address || '';

  // Parent/guardian info (prefer complete_personal_data keys if present)
  const parentName = useMemo(() => {
    const fim = (record.family_information as any) || {};
    const familyMother = fim.mother_name;
    const familyFather = fim.father_name;
    const responsible = fim.responsible_person;
    const mother = record.personal_data?.mother_name || (cpd as any)?.mother_name;
    const father = record.personal_data?.father_name || (cpd as any)?.father_name;
    // Preference: family info (mother/father) > responsible > personal/complete
    return familyMother || familyFather || responsible || mother || father || '';
  }, [record.personal_data, cpd, record.family_information]);

  const parentPhone = useMemo(() => {
    const fim = (record.family_information as any) || {};
    const familyMotherPhone = fim.mother_phone;
    const familyFatherPhone = fim.father_phone;
    const responsible = fim.responsible_phone;
    const m = (cpd as any)?.mother_phone || record.personal_data?.mother_phone;
    const f = (cpd as any)?.father_phone || record.personal_data?.father_phone;
    // Preference: family phones > responsible > personal/complete
    return familyMotherPhone || familyFatherPhone || responsible || m || f || '';
  }, [record.personal_data, cpd, record.family_information]);

  const disabilityType = disability?.disability_type || cpd?.pcd_name || record.personal_data?.pcd_name || '';
  const bloodType = medicalAdditional?.blood_type || '';
  const diseases = medicalAdditional?.diseases || (disability?.medical_conditions ?? '') || '';

  const [backendUrl, setBackendUrl] = useState<string>('');
  const [passportPhotoBlob, setPassportPhotoBlob] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  // Fetch backend URL asynchronously to ensure correct production URL
  useEffect(() => {
    const fetchBackendUrl = async () => {
      try {
        const url = await getAPIBaseURL();
        setBackendUrl(url);
      } catch (error) {
        console.error('Error fetching backend URL:', error);
        // Fallback to sync version
        setBackendUrl(getAPIBaseURLSync());
      }
    };
    fetchBackendUrl();
  }, []);

  // Get passport photo document
  const photoDoc = useMemo(() => {
    if (!record.documents || record.documents.length === 0) {
      return null;
    }

    // Look for passport photo in documents
    return record.documents.find(doc => {
      return doc.document_type === 'photo' ||
        doc.original_name?.toLowerCase().includes('foto') ||
        doc.original_name?.toLowerCase().includes('passport') ||
        doc.original_name?.toLowerCase().includes('pasaporte');
    });
  }, [record.documents]);

  // Fetch image with authentication and convert to blob URL
  useEffect(() => {
    if (!photoDoc || !backendUrl) return;

    const fetchImage = async () => {
      try {
        // Cleanup previous blob URL if exists
        if (blobUrlRef.current && blobUrlRef.current.startsWith('blob:')) {
          URL.revokeObjectURL(blobUrlRef.current);
          blobUrlRef.current = null;
        }

        // Get the Google Drive file ID
        const photoDocAny = photoDoc as { google_drive_id?: string; google_drive_url?: string; file_path?: string };
        let driveId: string | undefined = photoDocAny.google_drive_id;
        
        if (!driveId) {
          // Try to extract from google_drive_url
          const url = photoDocAny.google_drive_url;
          if (url) {
            const matchPath = url.match(/\/d\/([^/]+)/);
            const matchQuery = url.match(/[?&]id=([^&]+)/);
            driveId = (matchPath && matchPath[1]) || (matchQuery && matchQuery[1]) || undefined;
          }
        }

        // If we have a drive ID, fetch via authenticated endpoint
        if (driveId) {
          const baseUrl = backendUrl || getAPIBaseURLSync();
          const imageUrl = `${baseUrl}/admin/google-drive/image/${driveId}`;
          
          // Get auth token
          const token = getToken();
          
          // Fetch image with authentication
          const response = await fetch(imageUrl, {
            method: 'GET',
            credentials: 'include', // Include cookies
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to load image: ${response.status}`);
          }

          // Convert to blob and create blob URL
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          blobUrlRef.current = blobUrl;
          setPassportPhotoBlob(blobUrl);
        } else {
          // Fallback to file_path if available
          const filePath = photoDocAny.file_path;
          if (filePath) {
            setPassportPhotoBlob(filePath);
          }
        }
      } catch (error) {
        console.error('Error loading passport photo:', error);
        setPassportPhotoBlob(null);
      }
    };

    fetchImage();
    
    // Cleanup: revoke blob URL when component unmounts or photo changes
    return () => {
      if (blobUrlRef.current && blobUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [photoDoc, backendUrl]);

  // Use blob URL or fallback
  const passportPhoto = passportPhotoBlob;

  // Fallback QR if not provided (simple, service-based generator)
  const qrImageSrc = qrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    buildAttendanceQrData({ recordId: record.id, fullName: fullName })
  )}`;

  return (
    <div className={`max-w-[580px] w-full min-w-0 min-h-[360px] rounded-2xl overflow-hidden bg-white shadow-[0_8px_25px_rgba(17,24,39,0.15)] border border-gray-200 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 bg-[#3B5BA9] text-white min-w-0">
        <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-full bg-white grid place-items-center overflow-hidden">
          <img src={logo} alt="ASONIPED Logo" className="w-full h-full object-contain" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="m-0 text-xs sm:text-[19px] tracking-wide font-semibold leading-tight">CARNET DE IDENTIFICACIÓN DE BENEFICIARIO</h1>
          <div className="text-[10px] sm:text-[13px] opacity-90 mt-0.5 sm:mt-1">ASOCIACIÓN NICOYANA DE PERSONAS CON DISCAPACIDAD</div>
        </div>
      </div>

      {/* Body: stacked on mobile, side-by-side on sm+ */}
      <div className="p-3 sm:p-5 min-w-0">
        <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-4 sm:gap-6">
          {/* Photo Section */}
          <div className="flex flex-row sm:flex-col items-center justify-center gap-4 sm:gap-0 sm:justify-start">
            <div className="w-[120px] h-[140px] sm:w-[180px] sm:h-[200px] flex-shrink-0 rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100 sm:mb-4">
              {passportPhoto ? (
                <img 
                  src={passportPhoto} 
                  alt="Foto del beneficiario" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex items-center justify-center text-slate-400 text-sm ${passportPhoto ? 'hidden' : ''}`}>
                Sin foto
              </div>
            </div>
            <div className="w-[100px] h-[100px] sm:w-[160px] sm:h-[160px] flex-shrink-0 bg-white border border-gray-200 rounded-lg grid place-items-center overflow-hidden">
              <img src={qrImageSrc} alt="QR Verificación / Asistencia" className="w-full h-full object-contain"/>
            </div>
          </div>

          {/* Information Section */}
          <div className="space-y-3 sm:space-y-4 min-w-0">
            {/* Personal Info */}
            <div className="bg-slate-50 rounded-lg p-3 sm:p-4 border border-slate-200 min-w-0">
              <div className="text-lg sm:text-[22px] font-extrabold text-slate-900 leading-snug break-words mb-1 sm:mb-2">{fullName || '—'}</div>
              <div className="text-slate-600 font-semibold tracking-wide text-xs sm:text-[13px] mb-1 break-all">
                {record.record_number || '—'}{cedula ? ` | Ced: ${cedula}` : ''}
              </div>
              <div className="text-[11px] sm:text-[12px] text-slate-600 break-words">{exactAddress || '—'}</div>
              {bloodType && (
                <div className="text-[11px] sm:text-[12px] text-slate-600 mt-1 font-medium">Tipo de sangre: {bloodType}</div>
              )}
            </div>

            {/* Medical & Family Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div className="border border-slate-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 min-h-[60px] sm:min-h-[70px] bg-white min-w-0">
                <div className="text-[10px] sm:text-[11px] text-slate-500 mb-1 sm:mb-2 font-medium uppercase tracking-wide">TIPO DE DISCAPACIDAD</div>
                <div className="text-xs sm:text-[13px] font-semibold text-slate-900 break-words leading-tight">{disabilityType || '—'}</div>
              </div>
              <div className="border border-slate-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 min-h-[60px] sm:min-h-[70px] bg-white min-w-0">
                <div className="text-[10px] sm:text-[11px] text-slate-500 mb-1 sm:mb-2 font-medium uppercase tracking-wide">ENFERMEDADES QUE PADECE</div>
                <div className="text-xs sm:text-[13px] font-semibold text-slate-900 break-words leading-tight">{diseases || 'No padece ninguna enfermedad'}</div>
              </div>
              <div className="border border-slate-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 min-h-[60px] sm:min-h-[70px] bg-white min-w-0">
                <div className="text-[10px] sm:text-[11px] text-slate-500 mb-1 sm:mb-2 font-medium uppercase tracking-wide">ENCARGADO</div>
                <div className="text-xs sm:text-[13px] font-semibold text-slate-900 break-words leading-tight">{parentName || '—'}</div>
              </div>
              <div className="border border-slate-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 min-h-[60px] sm:min-h-[70px] bg-white min-w-0">
                <div className="text-[10px] sm:text-[11px] text-slate-500 mb-1 sm:mb-2 font-medium uppercase tracking-wide">TELÉFONO DE CONTACTO</div>
                <div className="text-xs sm:text-[13px] font-semibold text-slate-900 break-words leading-tight">{parentPhone || '—'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDCard;


