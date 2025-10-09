import React, { useMemo } from 'react';
import type { RecordWithDetails } from '../Types/records';
import { buildAttendanceQrData } from '../Utils/idCard';

type IDCardProps = {
  record: RecordWithDetails;
  qrUrl?: string; // full URL for the QR code image (already signed/encoded)
  className?: string;
};

// A lightweight, dependency-free ID Card component designed for screen/print and PDF capture
// Renders the required fields and an externally generated QR image
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

  // Fallback QR if not provided (simple, service-based generator)
  const qrImageSrc = qrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(
    buildAttendanceQrData({ recordId: record.id, fullName: fullName })
  )}`;

  return (
    <div className={`w-[540px] min-h-[340px] rounded-2xl overflow-hidden bg-white shadow-[0_6px_20px_rgba(17,24,39,0.15)] border border-gray-200 ${className || ''}`}>
      {/* Header */}
      <div className="flex items-center gap-4 px-5 py-3 bg-[#3B5BA9] text-white">
        <div className="w-11 h-11 rounded-full bg-white grid place-items-center text-[#3B5BA9] font-bold text-[12px]">ASONIPED</div>
        <div>
          <h1 className="m-0 text-[18px] tracking-wide">CARNET DE IDENTIFICACIÓN DE BENEFICIARIO</h1>
          <div className="text-[12px] opacity-90">ASOCIACIÓN NICOYANA DE PERSONAS CON DISCAPACIDAD</div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="grid grid-cols-[180px_1fr] gap-4">
          {/* Photo placeholder (external consumer can wrap to pass an <img /> if available) */}
          <div className="w-[180px] h-[220px] rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100"/>

          <div>
            {/* Fields grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-dashed border-slate-300 rounded-lg px-3 py-2 min-h-[58px]">
                <div className="text-[12px] text-slate-500 mb-1">TIPO DE DISCAPACIDAD</div>
                <div className="text-[13px] font-semibold text-slate-900 break-words">{disabilityType || '—'}</div>
              </div>
              <div className="border border-dashed border-slate-300 rounded-lg px-3 py-2 min-h-[58px]">
                <div className="text-[12px] text-slate-500 mb-1">ENFERMEDADES QUE PADECE</div>
                <div className="text-[13px] font-semibold text-slate-900 break-words">{diseases || '—'}</div>
              </div>
              <div className="border border-dashed border-slate-300 rounded-lg px-3 py-2 min-h-[58px]">
                <div className="text-[12px] text-slate-500 mb-1">NOMBRE DEL PADRE/MADRE/ENCARGADO</div>
                <div className="text-[13px] font-semibold text-slate-900 break-words">{parentName || '—'}</div>
              </div>
              <div className="border border-dashed border-slate-300 rounded-lg px-3 py-2 min-h-[58px]">
                <div className="text-[12px] text-slate-500 mb-1">TELÉFONO DEL PADRE/MADRE/ENCARGADO</div>
                <div className="text-[13px] font-semibold text-slate-900 break-words">{parentPhone || '—'}</div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
              <div>
                <div className="text-[20px] font-extrabold text-slate-900 leading-6 break-words">{fullName || '—'}</div>
                <div className="text-slate-500 font-semibold tracking-wide text-[12px]">
                  {record.record_number || '—'}{cedula ? ` • ${cedula}` : ''}
                </div>
                <div className="text-[12px] text-slate-600 max-w-[280px] break-words">{exactAddress || '—'}</div>
                <div className="text-[12px] text-slate-600">{bloodType ? `Tipo de sangre: ${bloodType}` : ''}</div>
              </div>
              <div className="w-[110px] h-[110px] bg-white border border-gray-200 rounded-lg grid place-items-center overflow-hidden">
                <img src={qrImageSrc} alt="QR Verificación / Asistencia" className="w-full h-full object-contain"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDCard;


