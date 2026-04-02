import React, { useEffect, useState } from 'react';
import { Users, BarChart2, ChevronDown, ChevronUp } from 'lucide-react';
import { getFamilyAnalytics } from '../../Records/Services/recordsApi';

interface FamilyMember {
  name: string;
  age: number;
  relationship: string;
  occupation: string;
  marital_status: string;
}

interface FamilyInfo {
  mother_name?: string | null;
  father_name?: string | null;
  responsible_person?: string | null;
  family_members: FamilyMember[] | [];
}

interface FamilyRecord {
  id: number;
  record_number: string;
  created_at: string;
  family_information: FamilyInfo | null;
}

const FamilyAnalytics: React.FC = () => {
  const [records, setRecords] = useState<FamilyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getFamilyAnalytics();
        setRecords(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading family analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
      
      const hasMother = !!(familyInfo.mother_name && familyInfo.mother_name.trim() !== '');
      const hasFather = !!(familyInfo.father_name && familyInfo.father_name.trim() !== '');
      const hasGuardian = !!(familyInfo.responsible_person && familyInfo.responsible_person.trim() !== '');
      
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
    
    return { bothParents, onlyMother, onlyFather, legalGuardian, noFamilyInfo };
  };

  const getHouseholdSizeHistogram = () => {
    const bins = { one: 0, twoThree: 0, fourFive: 0, sixPlus: 0 };
    records.forEach(record => {
      const members = record.family_information?.family_members || [];
      const baseGuardians = record.family_information ? (
        (record.family_information.mother_name && record.family_information.mother_name.trim() !== '' ? 1 : 0) +
        (record.family_information.father_name && record.family_information.father_name.trim() !== '' ? 1 : 0) +
        (record.family_information.responsible_person && record.family_information.responsible_person.trim() !== '' ? 1 : 0)
      ) : 0;
      const memberCount = Array.isArray(members) ? members.length : 0;
      const inferred = memberCount > 0 ? memberCount : baseGuardians;
      const size = inferred > 0 ? inferred : 0;
      if (size <= 1) bins.one++;
      else if (size <= 3) bins.twoThree++;
      else if (size <= 5) bins.fourFive++;
      else bins.sixPlus++;
    });
    return bins;
  };

  const getAverageFamilyMembers = () => {
    let totalMembers = 0;
    let counted = 0;
    records.forEach(record => {
      const members = record.family_information?.family_members || [];
      const baseGuardians = record.family_information ? (
        (record.family_information.mother_name && record.family_information.mother_name.trim() !== '' ? 1 : 0) +
        (record.family_information.father_name && record.family_information.father_name.trim() !== '' ? 1 : 0) +
        (record.family_information.responsible_person && record.family_information.responsible_person.trim() !== '' ? 1 : 0)
      ) : 0;
      const memberCount = Array.isArray(members) ? members.length : 0;
      const inferred = memberCount > 0 ? memberCount : baseGuardians;
      if (inferred >= 0) {
        totalMembers += inferred;
        counted += 1;
      }
    });
    const average = counted === 0 ? 0 : Number((totalMembers / counted).toFixed(2));
    return { average, households: counted };
  };

  const familyStructure = getFamilyStructure();
  const householdSize = getHouseholdSizeHistogram();
  const avgMembers = getAverageFamilyMembers();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos familiares...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 md:p-6 min-w-0">
        <div className="text-red-700 text-sm">{error}</div>
      </div>
    );
  }

  const fullContent = (
    <>
      {/* Family Structure Overview */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 min-w-0 overflow-hidden">
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <Users className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <h3 className="text-base md:text-lg font-semibold text-gray-900">Estructura Familiar</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-w-0">
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
        </div>
      </div>

      {/* Household Size Histogram */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 min-w-0 overflow-hidden">
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <BarChart2 className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <h3 className="text-base md:text-lg font-semibold text-gray-900">Tamaño del Hogar</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 min-w-0">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{householdSize.one}</div>
            <div className="text-sm text-gray-600">1 persona</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{householdSize.twoThree}</div>
            <div className="text-sm text-gray-600">2–3 personas</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{householdSize.fourFive}</div>
            <div className="text-sm text-gray-600">4–5 personas</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{householdSize.sixPlus}</div>
            <div className="text-sm text-gray-600">6+ personas</div>
          </div>
        </div>
      </div>

      {/* Average Family Members */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 min-w-0 overflow-hidden">
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <Users className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <h3 className="text-base md:text-lg font-semibold text-gray-900">Promedio de Miembros por Hogar</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 min-w-0">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{avgMembers.average}</div>
            <div className="text-sm text-gray-600">Promedio</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{avgMembers.households}</div>
            <div className="text-sm text-gray-600">Hogares</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-w-0 overflow-x-hidden space-y-4 md:space-y-6">
      {/* Mobile: compact summary + expand */}
      <div className="md:hidden min-w-0">
        {!mobileExpanded ? (
          <div className="bg-white rounded-lg shadow-sm p-4 min-w-0 overflow-hidden">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Resumen familiar</h3>
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Estructura</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between gap-1.5 p-2 bg-blue-50 rounded">
                  <span className="text-xs text-gray-700">Ambos padres</span>
                  <span className="text-xs font-semibold text-blue-600 flex-shrink-0">{familyStructure.bothParents}</span>
                </div>
                <div className="flex items-center justify-between gap-1.5 p-2 bg-pink-50 rounded">
                  <span className="text-xs text-gray-700">Solo madre</span>
                  <span className="text-xs font-semibold text-pink-600 flex-shrink-0">{familyStructure.onlyMother}</span>
                </div>
                <div className="flex items-center justify-between gap-1.5 p-2 bg-green-50 rounded">
                  <span className="text-xs text-gray-700">Solo padre</span>
                  <span className="text-xs font-semibold text-green-600 flex-shrink-0">{familyStructure.onlyFather}</span>
                </div>
                <div className="flex items-center justify-between gap-1.5 p-2 bg-purple-50 rounded">
                  <span className="text-xs text-gray-700">Enc. legal</span>
                  <span className="text-xs font-semibold text-purple-600 flex-shrink-0">{familyStructure.legalGuardian}</span>
                </div>
              </div>
            </div>
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Tamaño del hogar</p>
              <div className="grid grid-cols-4 gap-1.5">
                <div className="text-center p-1.5 bg-gray-50 rounded">
                  <p className="text-sm font-bold text-gray-900">{householdSize.one}</p>
                  <p className="text-[10px] text-gray-600">1</p>
                </div>
                <div className="text-center p-1.5 bg-gray-50 rounded">
                  <p className="text-sm font-bold text-gray-900">{householdSize.twoThree}</p>
                  <p className="text-[10px] text-gray-600">2-3</p>
                </div>
                <div className="text-center p-1.5 bg-gray-50 rounded">
                  <p className="text-sm font-bold text-gray-900">{householdSize.fourFive}</p>
                  <p className="text-[10px] text-gray-600">4-5</p>
                </div>
                <div className="text-center p-1.5 bg-gray-50 rounded">
                  <p className="text-sm font-bold text-gray-900">{householdSize.sixPlus}</p>
                  <p className="text-[10px] text-gray-600">6+</p>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Promedio</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded">
                  <span className="text-xs text-gray-700">Miembros/hogar</span>
                  <span className="text-xs font-semibold text-gray-900 flex-shrink-0">{avgMembers.average}</span>
                </div>
                <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded">
                  <span className="text-xs text-gray-700">Hogares</span>
                  <span className="text-xs font-semibold text-gray-900 flex-shrink-0">{avgMembers.households}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileExpanded(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg"
            >
              Ver análisis detallado
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {fullContent}
            <button
              type="button"
              onClick={() => setMobileExpanded(false)}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg"
            >
              Ocultar detalle
              <ChevronUp className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Desktop: full content */}
      <div className="hidden md:block min-w-0 space-y-6">
        {fullContent}
      </div>
    </div>
  );
};

export default FamilyAnalytics;
