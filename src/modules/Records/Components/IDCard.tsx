import React, { useMemo } from 'react';
import type { RecordWithDetails } from '../Types/records';
import { buildAttendanceQrData } from '../Utils/idCard';
import logo from '../../../assets/logoasoniped.png';

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

  // Get passport photo from record documents
  const passportPhoto = useMemo(() => {
    if (!record.documents || record.documents.length === 0) {
      return null;
    }

    // Look for passport photo in documents
    const photoDoc = record.documents.find(doc => {
      return doc.document_type === 'photo' ||
        doc.original_name?.toLowerCase().includes('foto') ||
        doc.original_name?.toLowerCase().includes('passport') ||
        doc.original_name?.toLowerCase().includes('pasaporte');
    });

    if (!photoDoc) {
      return null;
    }

    // Prefer a backend-proxied Google Drive URL using the file id
    const driveId = (photoDoc as any).google_drive_id as string | undefined;
    if (driveId) {
      return `http://localhost:3000/admin/google-drive/image/${driveId}`;
    }

    // If we only have a google_drive_url, try to extract the id
    const url = (photoDoc as any).google_drive_url as string | undefined;
    if (url) {
      // Try common patterns: /file/d/<id>/view or ...?id=<id>
      const matchPath = url.match(/\/d\/([^/]+)/);
      const matchQuery = url.match(/[?&]id=([^&]+)/);
      const extractedId = (matchPath && matchPath[1]) || (matchQuery && matchQuery[1]);
      if (extractedId) {
        return `http://localhost:3000/admin/google-drive/image/${extractedId}`;
      }
      // Fallback to provided url (may not render in <img> if it is a viewer link)
      return url;
    }

    // Final fallback to local/server file_path
    return (photoDoc as any).file_path || null;
  }, [record.documents]);

  // Fallback QR if not provided (simple, service-based generator)
  const qrImageSrc = qrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    buildAttendanceQrData({ recordId: record.id, fullName: fullName })
  )}`;

  return (
    <div className={`w-[580px] min-h-[360px] rounded-2xl overflow-hidden bg-white shadow-[0_8px_25px_rgba(17,24,39,0.15)] border border-gray-200 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 bg-[#3B5BA9] text-white">
        <div className="w-12 h-12 rounded-full bg-white grid place-items-center overflow-hidden">
          <img src={logo} alt="ASONIPED Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex-1">
          <h1 className="m-0 text-[19px] tracking-wide font-semibold">CARNET DE IDENTIFICACIÓN DE BENEFICIARIO</h1>
          <div className="text-[13px] opacity-90 mt-1">ASOCIACIÓN NICOYANA DE PERSONAS CON DISCAPACIDAD</div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="grid grid-cols-[200px_1fr] gap-6">
          {/* Photo Section */}
          <div className="flex flex-col items-center">
            <div className="w-[180px] h-[200px] rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100 mb-4">
              {passportPhoto ? (
                <img 
                  src={passportPhoto} 
                  alt="Foto del beneficiario" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-full h-full flex items-center justify-center text-slate-400 text-sm ${passportPhoto ? 'hidden' : ''}`}>
                Sin foto
              </div>
            </div>
            <div className="w-[160px] h-[160px] bg-white border border-gray-200 rounded-lg grid place-items-center overflow-hidden">
              <img src={qrImageSrc} alt="QR Verificación / Asistencia" className="w-full h-full object-contain"/>
            </div>
          </div>

          {/* Information Section */}
          <div className="space-y-4">
            {/* Personal Info */}
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="text-[22px] font-extrabold text-slate-900 leading-6 break-words mb-2">{fullName || '—'}</div>
              <div className="text-slate-600 font-semibold tracking-wide text-[13px] mb-1">
                {record.record_number || '—'}{cedula ? ` | Ced: ${cedula}` : ''}
              </div>
              <div className="text-[12px] text-slate-600 break-words">{exactAddress || '—'}</div>
              {bloodType && (
                <div className="text-[12px] text-slate-600 mt-1 font-medium">Tipo de sangre: {bloodType}</div>
              )}
            </div>

            {/* Medical & Family Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-slate-300 rounded-lg px-4 py-3 min-h-[70px] bg-white">
                <div className="text-[11px] text-slate-500 mb-2 font-medium uppercase tracking-wide">TIPO DE DISCAPACIDAD</div>
                <div className="text-[13px] font-semibold text-slate-900 break-words leading-tight">{disabilityType || '—'}</div>
              </div>
              <div className="border border-slate-300 rounded-lg px-4 py-3 min-h-[70px] bg-white">
                <div className="text-[11px] text-slate-500 mb-2 font-medium uppercase tracking-wide">ENFERMEDADES QUE PADECE</div>
                <div className="text-[13px] font-semibold text-slate-900 break-words leading-tight">{diseases || 'No padece ninguna enfermedad'}</div>
              </div>
              <div className="border border-slate-300 rounded-lg px-4 py-3 min-h-[70px] bg-white">
                <div className="text-[11px] text-slate-500 mb-2 font-medium uppercase tracking-wide">ENCARGADO</div>
                <div className="text-[13px] font-semibold text-slate-900 break-words leading-tight">{parentName || '—'}</div>
              </div>
              <div className="border border-slate-300 rounded-lg px-4 py-3 min-h-[70px] bg-white">
                <div className="text-[11px] text-slate-500 mb-2 font-medium uppercase tracking-wide">TELÉFONO DE CONTACTO</div>
                <div className="text-[13px] font-semibold text-slate-900 break-words leading-tight">{parentPhone || '—'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDCard;


