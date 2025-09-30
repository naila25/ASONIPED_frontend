import React from 'react';
import { Heart, User, Eye, Ear, Brain, Activity, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface Record {
  id: number;
  disability_information?: {
    disability_type?: string;
    insurance_type?: string;
    disability_origin?: string;
    disability_certificate?: string;
    conapdis_registration?: string;
    medical_diagnosis?: string;
    medical_additional?: {
      blood_type?: string;
      diseases?: string;
      permanent_limitations?: Array<{
        limitation: string;
        degree: string;
        observations?: string;
      }>;
      biomechanical_benefits?: Array<{
        type: string;
        other_description?: string;
      }>;
    };
  };
  complete_personal_data?: {
    blood_type?: string;
    diseases?: string;
  };
}

interface DisabilityAnalyticsProps {
  records: Record[];
}

const DisabilityAnalytics: React.FC<DisabilityAnalyticsProps> = ({ records }) => {
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

  // Get equipment needs
  const getEquipmentNeeds = () => {
    const equipmentMap = new Map<string, number>();
    
    records.forEach(record => {
      const disabilityInfo = record.disability_information;
      if (disabilityInfo?.medical_additional?.biomechanical_benefits) {
        disabilityInfo.medical_additional.biomechanical_benefits.forEach(benefit => {
          const equipment = benefit.type;
          const count = equipmentMap.get(equipment) || 0;
          equipmentMap.set(equipment, count + 1);
        });
      }
    });
    
    return Array.from(equipmentMap.entries())
      .map(([equipment, count]) => ({ equipment, count }))
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

  // Get limitations analysis
  const getLimitationsAnalysis = () => {
    const limitationsMap = new Map<string, number>();
    
    records.forEach(record => {
      const disabilityInfo = record.disability_information;
      if (disabilityInfo?.medical_additional?.permanent_limitations) {
        disabilityInfo.medical_additional.permanent_limitations.forEach(limitation => {
          const limitationType = limitation.limitation;
          const count = limitationsMap.get(limitationType) || 0;
          limitationsMap.set(limitationType, count + 1);
        });
      }
    });
    
    return Array.from(limitationsMap.entries())
      .map(([limitation, count]) => ({ limitation, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Get certificate status
  const getCertificateStatus = () => {
    let withCertificate = 0;
    let withoutCertificate = 0;
    
    records.forEach(record => {
      const disabilityInfo = record.disability_information;
      if (disabilityInfo?.disability_certificate) {
        if (disabilityInfo.disability_certificate.toLowerCase() === 'sí' || 
            disabilityInfo.disability_certificate.toLowerCase() === 'si') {
          withCertificate++;
        } else {
          withoutCertificate++;
        }
      }
    });
    
    return { withCertificate, withoutCertificate };
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
          {disabilityTypes.map(({ type, count }, index) => {
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equipmentNeeds.map(({ equipment, count }) => (
            <div key={equipment} className="p-4 border border-gray-200 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">{count}</div>
              <div className="text-sm text-gray-600">{equipment}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Medical Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blood Type Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Distribución de Tipos de Sangre</h3>
          </div>
          
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
            
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">Sin Certificado</span>
              </div>
              <span className="text-lg font-bold text-orange-600">{certificateStatus.withoutCertificate}</span>
            </div>
          </div>
          
          {certificateStatus.withCertificate + certificateStatus.withoutCertificate > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Progreso de Certificación</span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.round((certificateStatus.withCertificate / (certificateStatus.withCertificate + certificateStatus.withoutCertificate)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(certificateStatus.withCertificate / (certificateStatus.withCertificate + certificateStatus.withoutCertificate)) * 100}%`
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
      </div>
    </div>
  );
};

export default DisabilityAnalytics;
