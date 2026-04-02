import React, { useEffect, useState } from 'react';
import { Calendar, Users, User, ChevronDown, ChevronUp } from 'lucide-react';
import { getDemographicRecords } from '../../Records/Services/recordsApi';

interface DemographicRecord {
  id: number;
  personal_data?: {
    gender?: string;
    birth_date?: string;
    birth_place?: string;
  };
  complete_personal_data?: {
    gender?: string;
    birth_date?: string;
    birth_place?: string;
    registration_date?: string;
    age?: number;
  };
}

const DemographicAnalytics: React.FC = () => {
  const [records, setRecords] = useState<DemographicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getDemographicRecords(1000);
        setRecords(data as DemographicRecord[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading demographic data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  // Analyze gender distribution
  const getGenderDistribution = () => {
    const genderMap = new Map<string, number>();
    
    records.forEach(record => {
      const personalData = record.personal_data || record.complete_personal_data;
      if (personalData?.gender) {
        const gender = personalData.gender;
        const count = genderMap.get(gender) || 0;
        genderMap.set(gender, count + 1);
      }
    });
    
    return Array.from(genderMap.entries())
      .map(([gender, count]) => ({ gender, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Analyze age distribution (0–5, 6–12, 13–17, 18–59, 60+)
  const getAgeDistribution = (): { ageGroup: string; count: number }[] => {
    const ageGroups: { [key: string]: number } = {
      '0-5': 0,
      '6-12': 0,
      '13-17': 0,
      '18-59': 0,
      '60+': 0
    };
    
    records.forEach(record => {
      const pd = record.personal_data;
      const cpd = record.complete_personal_data;
      let age: number | null = null;
      if (cpd?.birth_date || pd?.birth_date) {
        const birthDate = new Date((cpd?.birth_date || pd?.birth_date) as string);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
      } else if (cpd?.age !== undefined && cpd?.age !== null) {
        age = Number(cpd.age);
      }

      if (age !== null && age >= 0 && age <= 150) {
        if (age <= 5) ageGroups['0-5']++;
        else if (age <= 12) ageGroups['6-12']++;
        else if (age <= 17) ageGroups['13-17']++;
        else if (age <= 59) ageGroups['18-59']++;
        else ageGroups['60+']++;
      }
    });
    
    return Object.entries(ageGroups)
      .map(([ageGroup, count]) => ({ ageGroup, count: count as number }))
      .filter(group => group.count > 0);
  };

  // Calculate average age
  // Removed unused getAverageAge

  // Get age statistics
  const getAgeStatistics = (): { min: number; max: number; average: number } => {
    const ages: number[] = [];
    
    records.forEach(record => {
      const pd = record.personal_data;
      const cpd = record.complete_personal_data;
      let age: number | null = null;
      if (cpd?.birth_date || pd?.birth_date) {
        const birthDate = new Date((cpd?.birth_date || pd?.birth_date) as string);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
      } else if (cpd?.age !== undefined && cpd?.age !== null) {
        age = Number(cpd.age);
      }
      if (age !== null && age >= 0 && age <= 150) {
        ages.push(age);
      }
    });
    
    if (ages.length === 0) return { min: 0, max: 0, average: 0 };
    
    ages.sort((a, b) => a - b);
    return {
      min: ages[0],
      max: ages[ages.length - 1],
      average: Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length)
    };
  };

  const normalizeGender = (value: string): 'masculino' | 'femenino' | 'otro' => {
    const v = value.trim().toLowerCase();
    if (['male', 'masculino', 'hombre', 'm'].includes(v)) return 'masculino';
    if (['female', 'femenino', 'mujer', 'f'].includes(v)) return 'femenino';
    return 'otro';
  };

  const getGenderLabel = (value: string): string => {
    const n = normalizeGender(value);
    if (n === 'masculino') return 'Masculino';
    if (n === 'femenino') return 'Femenino';
    return 'Otro';
  };

  const getGenderColor = (value: string): 'blue' | 'pink' | 'gray' => {
    const n = normalizeGender(value);
    if (n === 'masculino') return 'blue';
    if (n === 'femenino') return 'pink';
    return 'gray';
  };

  const genderDistribution = getGenderDistribution();
  const ageDistribution = getAgeDistribution();
  const ageStats = getAgeStatistics();

  const fullContent = (
    <>
      {/* Demographic Overview */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 min-w-0 overflow-hidden">
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <Users className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <h3 className="text-base md:text-lg font-semibold text-gray-900">Resumen Demográfico</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 min-w-0">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{ageStats.average}</div>
            <div className="text-sm text-blue-800">Edad Promedio</div>
            <div className="text-xs text-blue-600">Años</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{ageStats.min} - {ageStats.max}</div>
            <div className="text-sm text-green-800">Rango de Edades</div>
            <div className="text-xs text-green-600">Años</div>
          </div>
        </div>
      </div>

      {/* Gender Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 min-w-0 overflow-hidden">
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <User className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <h3 className="text-base md:text-lg font-semibold text-gray-900">Distribución por Género</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 min-w-0">
          {genderDistribution.map(({ gender, count }) => {
            const percentage = records.length ? Math.round((count / records.length) * 100) : 0;
            const color = getGenderColor(gender);
            const label = getGenderLabel(gender);
            const colorClasses = color === 'blue' ? 'bg-blue-100 text-blue-600' : color === 'pink' ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-600';
            const barColor = color === 'blue' ? 'bg-blue-500' : color === 'pink' ? 'bg-pink-500' : 'bg-gray-500';
            return (
              <div key={gender} className="p-4 border border-gray-200 rounded-lg min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${colorClasses}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900">{label}</div>
                    <div className="text-sm text-gray-500">{count} beneficiarios</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 min-w-0">
                  <div className={`${barColor} h-2 rounded-full transition-all duration-300`} style={{ width: `${percentage}%` }} />
                </div>
                <div className="text-xs text-gray-500 mt-1">{percentage}% del total</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Age Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 min-w-0 overflow-hidden">
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <Calendar className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <h3 className="text-base md:text-lg font-semibold text-gray-900">Distribución por Edad</h3>
        </div>
        <div className="space-y-4 min-w-0">
          {ageDistribution.map(({ ageGroup, count }) => {
            const maxCount = Math.max(...ageDistribution.map(a => a.count), 1);
            const percentage = Math.round((count / maxCount) * 100);
            return (
              <div key={ageGroup} className="space-y-2 min-w-0">
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <span className="text-sm font-medium text-gray-700 truncate">{ageGroup} años</span>
                  <span className="text-sm font-bold text-gray-900 flex-shrink-0">{count} beneficiarios</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 min-w-0">
                  <div className="bg-green-500 h-2 rounded-full transition-all duration-300" style={{ width: `${percentage}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-w-0 overflow-x-hidden space-y-4 md:space-y-6">
      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 md:p-6 text-sm text-red-700 min-w-0">{error}</div>
      )}
      {!loading && !error && (
        <>
          {/* Mobile: compact summary + expand */}
          <div className="md:hidden min-w-0">
            {!mobileExpanded ? (
              <div className="bg-white rounded-lg shadow-sm p-4 min-w-0 overflow-hidden">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Resumen demográfico</h3>
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Edad</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-blue-50 rounded text-center">
                      <p className="text-lg font-bold text-blue-600">{ageStats.average}</p>
                      <p className="text-[10px] text-blue-700 uppercase">Promedio</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded text-center">
                      <p className="text-lg font-bold text-green-600">{ageStats.min}–{ageStats.max}</p>
                      <p className="text-[10px] text-green-700 uppercase">Rango (años)</p>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Por género</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {genderDistribution.map(({ gender, count }) => (
                      <div key={gender} className="flex items-center justify-between gap-1.5 p-2 bg-gray-50 rounded">
                        <span className="text-xs text-gray-700 truncate">{getGenderLabel(gender)}</span>
                        <span className="text-xs font-semibold text-gray-900 flex-shrink-0">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Por edad</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {ageDistribution.map(({ ageGroup, count }) => (
                      <div key={ageGroup} className="flex items-center justify-between gap-1.5 p-1.5 bg-gray-50 rounded">
                        <span className="text-[10px] text-gray-600 truncate">{ageGroup}a</span>
                        <span className="text-xs font-semibold text-gray-900 flex-shrink-0">{count}</span>
                      </div>
                    ))}
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
        </>
      )}
    </div>
  );
};

export default DemographicAnalytics;
