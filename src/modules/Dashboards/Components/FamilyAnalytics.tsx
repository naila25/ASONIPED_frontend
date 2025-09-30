import React from 'react';
import { Users, User, UserCheck, Phone, Heart, AlertCircle } from 'lucide-react';

interface Record {
  id: number;
  family_information?: {
    mother_name?: string;
    mother_cedula?: string;
    mother_occupation?: string;
    mother_phone?: string;
    father_name?: string;
    father_cedula?: string;
    father_occupation?: string;
    father_phone?: string;
    responsible_person?: string;
    responsible_phone?: string;
    responsible_occupation?: string;
    family_members?: Array<{
      name: string;
      age: number;
      relationship: string;
      occupation: string;
      marital_status: string;
    }>;
  };
  complete_personal_data?: {
    primary_phone?: string;
    secondary_phone?: string;
    email?: string;
  };
}

interface FamilyAnalyticsProps {
  records: Record[];
}

const FamilyAnalytics: React.FC<FamilyAnalyticsProps> = ({ records }) => {
  // Analyze family structure
  const getFamilyStructure = () => {
    let bothParents = 0;
    let onlyMother = 0;
    let onlyFather = 0;
    let legalGuardian = 0;
    let noFamilyInfo = 0;
    
    records.forEach(record => {
      const familyInfo = record.family_information;
      if (!familyInfo) {
        noFamilyInfo++;
        return;
      }
      
      const hasMother = familyInfo.mother_name && familyInfo.mother_name.trim() !== '';
      const hasFather = familyInfo.father_name && familyInfo.father_name.trim() !== '';
      const hasGuardian = familyInfo.responsible_person && familyInfo.responsible_person.trim() !== '';
      
      if (hasMother && hasFather) {
        bothParents++;
      } else if (hasMother && !hasFather) {
        onlyMother++;
      } else if (!hasMother && hasFather) {
        onlyFather++;
      } else if (hasGuardian) {
        legalGuardian++;
      } else {
        noFamilyInfo++;
      }
    });
    
    return {
      bothParents,
      onlyMother,
      onlyFather,
      legalGuardian,
      noFamilyInfo
    };
  };

  // Analyze contact information completeness
  const getContactCompleteness = () => {
    let completeContact = 0;
    let partialContact = 0;
    let incompleteContact = 0;
    
    records.forEach(record => {
      const personalData = record.complete_personal_data;
      const familyInfo = record.family_information;
      
      if (!personalData) {
        incompleteContact++;
        return;
      }
      
      const hasPrimaryPhone = personalData.primary_phone && personalData.primary_phone.trim() !== '';
      const hasEmail = personalData.email && personalData.email.trim() !== '';
      const hasSecondaryPhone = personalData.secondary_phone && personalData.secondary_phone.trim() !== '';
      
      // Check family contact info
      const hasMotherPhone = familyInfo?.mother_phone && familyInfo.mother_phone.trim() !== '';
      const hasFatherPhone = familyInfo?.father_phone && familyInfo.father_phone.trim() !== '';
      const hasGuardianPhone = familyInfo?.responsible_phone && familyInfo.responsible_phone.trim() !== '';
      
      const contactCount = [hasPrimaryPhone, hasEmail, hasSecondaryPhone, hasMotherPhone, hasFatherPhone, hasGuardianPhone]
        .filter(Boolean).length;
      
      if (contactCount >= 4) {
        completeContact++;
      } else if (contactCount >= 2) {
        partialContact++;
      } else {
        incompleteContact++;
      }
    });
    
    return { completeContact, partialContact, incompleteContact };
  };

  // Analyze occupation patterns
  const getOccupationAnalysis = () => {
    const motherOccupations = new Map<string, number>();
    const fatherOccupations = new Map<string, number>();
    const guardianOccupations = new Map<string, number>();
    
    records.forEach(record => {
      const familyInfo = record.family_information;
      if (!familyInfo) return;
      
      // Mother occupations
      if (familyInfo.mother_occupation && familyInfo.mother_occupation.trim() !== '' && familyInfo.mother_occupation !== 'null') {
        const occupation = familyInfo.mother_occupation;
        motherOccupations.set(occupation, (motherOccupations.get(occupation) || 0) + 1);
      }
      
      // Father occupations
      if (familyInfo.father_occupation && familyInfo.father_occupation.trim() !== '' && familyInfo.father_occupation !== 'null') {
        const occupation = familyInfo.father_occupation;
        fatherOccupations.set(occupation, (fatherOccupations.get(occupation) || 0) + 1);
      }
      
      // Guardian occupations
      if (familyInfo.responsible_occupation && familyInfo.responsible_occupation.trim() !== '' && familyInfo.responsible_occupation !== 'null') {
        const occupation = familyInfo.responsible_occupation;
        guardianOccupations.set(occupation, (guardianOccupations.get(occupation) || 0) + 1);
      }
    });
    
    return {
      motherOccupations: Array.from(motherOccupations.entries())
        .map(([occupation, count]) => ({ occupation, count }))
        .sort((a, b) => b.count - a.count),
      fatherOccupations: Array.from(fatherOccupations.entries())
        .map(([occupation, count]) => ({ occupation, count }))
        .sort((a, b) => b.count - a.count),
      guardianOccupations: Array.from(guardianOccupations.entries())
        .map(([occupation, count]) => ({ occupation, count }))
        .sort((a, b) => b.count - a.count)
    };
  };

  // Analyze phone number patterns
  const getPhoneAnalysis = () => {
    let primaryPhoneComplete = 0;
    let secondaryPhoneComplete = 0;
    let motherPhoneComplete = 0;
    let fatherPhoneComplete = 0;
    let guardianPhoneComplete = 0;
    
    records.forEach(record => {
      const personalData = record.complete_personal_data;
      const familyInfo = record.family_information;
      
      if (personalData?.telefono_principal && personalData.telefono_principal.trim() !== '') {
        primaryPhoneComplete++;
      }
      if (personalData?.telefono_secundario && personalData.telefono_secundario.trim() !== '') {
        secondaryPhoneComplete++;
      }
      if (familyInfo?.telefono_madre && familyInfo.telefono_madre.trim() !== '') {
        motherPhoneComplete++;
      }
      if (familyInfo?.telefono_padre && familyInfo.telefono_padre.trim() !== '') {
        fatherPhoneComplete++;
      }
      if (familyInfo?.telefono_encargado_legal && familyInfo.telefono_encargado_legal.trim() !== '') {
        guardianPhoneComplete++;
      }
    });
    
    return {
      primaryPhoneComplete,
      secondaryPhoneComplete,
      motherPhoneComplete,
      fatherPhoneComplete,
      guardianPhoneComplete
    };
  };

  const familyStructure = getFamilyStructure();
  const contactCompleteness = getContactCompleteness();
  const occupationAnalysis = getOccupationAnalysis();
  const phoneAnalysis = getPhoneAnalysis();

  return (
    <div className="space-y-6">
      {/* Family Structure Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Estructura Familiar</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{familyStructure.bothParents}</div>
            <div className="text-sm text-blue-800">Ambos Padres</div>
            <div className="text-xs text-blue-600">Presentes</div>
          </div>
          <div className="text-center p-4 bg-pink-50 rounded-lg">
            <div className="text-2xl font-bold text-pink-600">{familyStructure.onlyMother}</div>
            <div className="text-sm text-pink-800">Solo Madre</div>
            <div className="text-xs text-pink-600">Presente</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{familyStructure.onlyFather}</div>
            <div className="text-sm text-green-800">Solo Padre</div>
            <div className="text-xs text-green-600">Presente</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{familyStructure.legalGuardian}</div>
            <div className="text-sm text-purple-800">Encargado Legal</div>
            <div className="text-xs text-purple-600">Responsable</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{familyStructure.noFamilyInfo}</div>
            <div className="text-sm text-orange-800">Sin Info</div>
            <div className="text-xs text-orange-600">Familiar</div>
          </div>
        </div>
      </div>

      {/* Contact Information Completeness */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Phone className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Completitud de Información de Contacto</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{contactCompleteness.completeContact}</div>
            <div className="text-sm text-green-800">Información Completa</div>
            <div className="text-xs text-green-600">4+ contactos</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{contactCompleteness.partialContact}</div>
            <div className="text-sm text-yellow-800">Información Parcial</div>
            <div className="text-xs text-yellow-600">2-3 contactos</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{contactCompleteness.incompleteContact}</div>
            <div className="text-sm text-red-800">Información Incompleta</div>
            <div className="text-xs text-red-600">0-1 contactos</div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Progreso de Completitud</span>
            <span className="text-sm font-medium text-gray-900">
              {Math.round((contactCompleteness.completeContact / records.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(contactCompleteness.completeContact / records.length) * 100}%`
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Phone Number Analysis */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Phone className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Análisis de Números Telefónicos</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">{phoneAnalysis.primaryPhoneComplete}</div>
            <div className="text-sm text-gray-600">Teléfono Principal</div>
            <div className="text-xs text-gray-500">
              {Math.round((phoneAnalysis.primaryPhoneComplete / records.length) * 100)}% completo
            </div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">{phoneAnalysis.secondaryPhoneComplete}</div>
            <div className="text-sm text-gray-600">Teléfono Secundario</div>
            <div className="text-xs text-gray-500">
              {Math.round((phoneAnalysis.secondaryPhoneComplete / records.length) * 100)}% completo
            </div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">{phoneAnalysis.motherPhoneComplete}</div>
            <div className="text-sm text-gray-600">Teléfono Madre</div>
            <div className="text-xs text-gray-500">
              {Math.round((phoneAnalysis.motherPhoneComplete / records.length) * 100)}% completo
            </div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">{phoneAnalysis.fatherPhoneComplete}</div>
            <div className="text-sm text-gray-600">Teléfono Padre</div>
            <div className="text-xs text-gray-500">
              {Math.round((phoneAnalysis.fatherPhoneComplete / records.length) * 100)}% completo
            </div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">{phoneAnalysis.guardianPhoneComplete}</div>
            <div className="text-sm text-gray-600">Teléfono Encargado</div>
            <div className="text-xs text-gray-500">
              {Math.round((phoneAnalysis.guardianPhoneComplete / records.length) * 100)}% completo
            </div>
          </div>
        </div>
      </div>

      {/* Occupation Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mother Occupations */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-pink-600" />
            <h3 className="text-lg font-semibold text-gray-900">Ocupaciones de Madres</h3>
          </div>
          
          <div className="space-y-3">
            {occupationAnalysis.motherOccupations.slice(0, 8).map(({ occupation, count }) => (
              <div key={occupation} className="flex items-center justify-between p-2 bg-pink-50 rounded-lg">
                <span className="text-sm text-gray-700 truncate">{occupation}</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Father Occupations */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Ocupaciones de Padres</h3>
          </div>
          
          <div className="space-y-3">
            {occupationAnalysis.fatherOccupations.slice(0, 8).map(({ occupation, count }) => (
              <div key={occupation} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-700 truncate">{occupation}</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Guardian Occupations */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <UserCheck className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Ocupaciones de Encargados</h3>
          </div>
          
          <div className="space-y-3">
            {occupationAnalysis.guardianOccupations.slice(0, 8).map(({ occupation, count }) => (
              <div key={occupation} className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                <span className="text-sm text-gray-700 truncate">{occupation}</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Family Support Insights */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Insights de Apoyo Familiar</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Familias con Mayor Estabilidad</h4>
            <p className="text-sm text-blue-700">
              {familyStructure.bothParents} familias tienen ambos padres presentes, 
              lo que representa el {Math.round((familyStructure.bothParents / records.length) * 100)}% 
              de los beneficiarios.
            </p>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-medium text-orange-800 mb-2">Necesidad de Apoyo Adicional</h4>
            <p className="text-sm text-orange-700">
              {familyStructure.onlyMother + familyStructure.legalGuardian} familias 
              ({Math.round(((familyStructure.onlyMother + familyStructure.legalGuardian) / records.length) * 100)}%) 
              pueden necesitar apoyo adicional debido a la ausencia del padre.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyAnalytics;
