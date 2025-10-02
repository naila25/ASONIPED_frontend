import React, { useState, useEffect } from 'react';
import { Heart, User, Eye, Ear, Brain, Activity, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { getDisabilityAnalytics } from '../../Records/Services/recordsApi';

interface DisabilityRecord {
  id: number;
  record_number: string;
  created_at: string;
  disability_information: {
    disability_type: string | null;
    insurance_type: string | null;
    disability_origin: string | null;
    disability_certificate: string | null;
    conapdis_registration: string | null;
    medical_diagnosis: string | null;
    medical_additional: {
      blood_type: string | null;
      diseases: string | null;
      permanent_limitations: Array<{
        limitation: string;
        degree: string;
        observations?: string;
      }> | null;
      biomechanical_benefits: Array<{
        type: string;
        other_description?: string;
      }> | null;
    } | null;
  } | null;
  complete_personal_data: {
    blood_type: string | null;
    diseases: string | null;
  } | null;
}

const DisabilityAnalytics: React.FC = () => {
  const [records, setRecords] = useState<DisabilityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDisabilityData = async () => {
      try {
        setLoading(true);
        const data = await getDisabilityAnalytics();
        setRecords(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading disability data');
        console.error('Error loading disability analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDisabilityData();
  }, []);

  // Helpers to map backend enum codes to human-friendly labels
  const EQUIPMENT_LABELS: Record<string, string> = {
    'silla_ruedas': 'Silla de ruedas',
    'baston': 'Bastón',
    'andadera': 'Andadera',
    'audifono': 'Audífono',
    'baston_guia': 'Bastón guía',
    'otro': 'Otro'
  };

  const LIMITATION_LABELS: Record<string, string> = {
    'moverse_caminar': 'Moverse/Caminar',
    'ver_lentes': 'Ver (con lentes)',
    'oir_audifono': 'Oír (con audífono)',
    'comunicarse_hablar': 'Comunicarse/Hablar',
    'entender_aprender': 'Entender/Aprender',
    'relacionarse': 'Relacionarse'
  };

  const toTitle = (value: string) => value
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const formatEquipmentLabel = (type: string) => EQUIPMENT_LABELS[type] || toTitle(type);
  const formatLimitationLabel = (limitation: string) => LIMITATION_LABELS[limitation] || toTitle(limitation);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de discapacidad...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-red-800">Error</h3>
        </div>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }
  // Get disability type distribution
  const getDisabilityTypeDistribution = () => {
    const disabilityMap = new Map<string, number>();
    
    records.forEach(record => {
      const disabilityInfo = record.disability_information;
      if (disabilityInfo?.disability_type) {
        const count = disabilityMap.get(disabilityInfo.disability_type) || 0;
        disabilityMap.set(disabilityInfo.disability_type, count + 1);
      }
    });
    
    return Array.from(disabilityMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Get insurance type distribution
  const getInsuranceDistribution = () => {
    const insuranceMap = new Map<string, number>();
    
    records.forEach(record => {
      const disabilityInfo = record.disability_information;
      if (disabilityInfo?.insurance_type) {
        const count = insuranceMap.get(disabilityInfo.insurance_type) || 0;
        insuranceMap.set(disabilityInfo.insurance_type, count + 1);
      }
    });
    
    return Array.from(insuranceMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Get disability origin distribution
  const getDisabilityOriginDistribution = () => {
    const originMap = new Map<string, number>();
    
    records.forEach(record => {
      const disabilityInfo = record.disability_information;
      if (disabilityInfo?.disability_origin) {
        const count = originMap.get(disabilityInfo.disability_origin) || 0;
        originMap.set(disabilityInfo.disability_origin, count + 1);
      }
    });
    
    return Array.from(originMap.entries())
      .map(([origin, count]) => ({ origin, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Get equipment needs (aggregated from biomechanical_benefits)
  const getEquipmentNeeds = () => {
    const equipmentMap = new Map<string, number>();

    records.forEach(record => {
      const benefits = record.disability_information?.medical_additional?.biomechanical_benefits;
      if (Array.isArray(benefits)) {
        benefits.forEach(b => {
          if (!b?.type) return;
          const count = equipmentMap.get(b.type) || 0;
          equipmentMap.set(b.type, count + 1);
        });
      }
    });

    return Array.from(equipmentMap.entries())
      .map(([equipment, count]) => ({ equipment: formatEquipmentLabel(equipment), count }))
      .sort((a, b) => b.count - a.count);
  };

  // Get blood type distribution
  const getBloodTypeDistribution = () => {
    const bloodTypeMap = new Map<string, number>();
    
    records.forEach(record => {
      const personalData = record.complete_personal_data;
      if (personalData?.blood_type) {
        const count = bloodTypeMap.get(personalData.blood_type) || 0;
        bloodTypeMap.set(personalData.blood_type, count + 1);
      }
    });
    
    return Array.from(bloodTypeMap.entries())
      .map(([bloodType, count]) => ({ bloodType, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Get limitations analysis (aggregated from permanent_limitations)
  const getLimitationsAnalysis = () => {
    const limitationMap = new Map<string, number>();

    records.forEach(record => {
      const limitations = record.disability_information?.medical_additional?.permanent_limitations;
      if (Array.isArray(limitations)) {
        limitations.forEach(l => {
          if (!l?.limitation) return;
          const count = limitationMap.get(l.limitation) || 0;
          limitationMap.set(l.limitation, count + 1);
        });
      }
    });

    return Array.from(limitationMap.entries())
      .map(([limitation, count]) => ({ limitation: formatLimitationLabel(limitation), count }))
      .sort((a, b) => b.count - a.count);
  };

  // Get certificate status
  const getCertificateStatus = () => {
    let withCertificate = 0;
    let withoutCertificate = 0;
    let inProcess = 0;
    
    records.forEach(record => {
      const disabilityInfo = record.disability_information;
      if (disabilityInfo?.disability_certificate) {
        if (disabilityInfo.disability_certificate === 'si') {
          withCertificate++;
        } else if (disabilityInfo.disability_certificate === 'no') {
          withoutCertificate++;
        } else if (disabilityInfo.disability_certificate === 'en_tramite') {
          inProcess++;
        }
      }
    });
    
    return { withCertificate, withoutCertificate, inProcess };
  };

  // Get disability icon
  const getDisabilityIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('visual') || lowerType.includes('vista')) return Eye;
    if (lowerType.includes('motora') || lowerType.includes('movimiento')) return User;
    if (lowerType.includes('auditiva') || lowerType.includes('oído')) return Ear;
    if (lowerType.includes('intelectual') || lowerType.includes('mental')) return Brain;
    return Activity;
  };

  const disabilityTypes = getDisabilityTypeDistribution();
  const insuranceTypes = getInsuranceDistribution();
  const disabilityOrigins = getDisabilityOriginDistribution();
  const equipmentNeeds = getEquipmentNeeds();
  const bloodTypes = getBloodTypeDistribution();
  const limitations = getLimitationsAnalysis();
  const certificateStatus = getCertificateStatus();

  return (
    <div className="space-y-6">
      {/* Disability Type Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Distribución por Tipo de Discapacidad</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {disabilityTypes.map(({ type, count }) => {
            const Icon = getDisabilityIcon(type);
            const maxCount = Math.max(...disabilityTypes.map(d => d.count));
            const percentage = Math.round((count / maxCount) * 100);
            
            return (
              <div key={type} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{type}</div>
                    <div className="text-sm text-gray-500">{count} beneficiarios</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insurance and Origin Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insurance Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Tipos de Seguro</h3>
          </div>
          
          <div className="space-y-3">
            {insuranceTypes.map(({ type, count }) => (
              <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{type}</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Disability Origin */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Origen de la Discapacidad</h3>
          </div>
          
          <div className="space-y-3">
            {disabilityOrigins.map(({ origin, count }) => (
              <div key={origin} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{origin}</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Equipment Needs */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Necesidades de Equipamiento</h3>
        </div>
        
        {equipmentNeeds.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipmentNeeds.map(({ equipment, count }) => (
              <div key={equipment} className="p-4 border border-gray-200 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">{count}</div>
                <div className="text-sm text-gray-600">{equipment}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">No hay datos de equipamiento disponibles.</p>
            <p className="text-xs text-gray-400 mt-2">Esta información se recopila durante el proceso de registro.</p>
          </div>
        )}
      </div>

      {/* Medical Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blood Type Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Distribución de Tipos de Sangre</h3>
          </div>
          
          {bloodTypes.length > 0 ? (
            <div className="space-y-3">
              {bloodTypes.map(({ bloodType, count }) => (
                <div key={bloodType} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">{bloodType}</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">No hay datos de tipos de sangre disponibles.</p>
              <p className="text-xs text-gray-400 mt-2">Esta información se recopila durante el proceso de registro.</p>
            </div>
          )}
        </div>

        {/* Certificate Status */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Estado de Certificados</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Con Certificado</span>
              </div>
              <span className="text-lg font-bold text-green-600">{certificateStatus.withCertificate}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">En Trámite</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{certificateStatus.inProcess}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">Sin Certificado</span>
              </div>
              <span className="text-lg font-bold text-orange-600">{certificateStatus.withoutCertificate}</span>
            </div>
          </div>
          
          {certificateStatus.withCertificate + certificateStatus.withoutCertificate + certificateStatus.inProcess > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Progreso de Certificación</span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.round((certificateStatus.withCertificate / (certificateStatus.withCertificate + certificateStatus.withoutCertificate + certificateStatus.inProcess)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(certificateStatus.withCertificate / (certificateStatus.withCertificate + certificateStatus.withoutCertificate + certificateStatus.inProcess)) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Limitations Analysis */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Limitaciones Permanentes</h3>
        </div>
        
        {limitations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {limitations.map(({ limitation, count }) => (
              <div key={limitation} className="p-4 border border-gray-200 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{count}</div>
                  <div className="text-sm text-gray-600">{limitation}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">No hay datos de limitaciones permanentes disponibles.</p>
            <p className="text-xs text-gray-400 mt-2">Esta información se recopila durante el proceso de registro.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisabilityAnalytics;
