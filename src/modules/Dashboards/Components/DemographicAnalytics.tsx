import React, { useEffect, useState } from 'react';
import { Calendar, Users, User } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-sm text-red-700">{error}</div>
      )}
      {/* Demographic Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Resumen Demográfico</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Distribución por Género</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {genderDistribution.map(({ gender, count }) => {
            const percentage = Math.round((count / records.length) * 100);
            const color = getGenderColor(gender);
            const label = getGenderLabel(gender);
            
            return (
              <div key={gender} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 bg-${color}-100 rounded-lg`}>
                    <User className={`w-5 h-5 text-${color}-600`} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{label}</div>
                    <div className="text-sm text-gray-500">{count} beneficiarios</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-${color}-500 h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{percentage}% del total</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Age Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Distribución por Edad</h3>
        </div>
        
        <div className="space-y-4">
          {ageDistribution.map(({ ageGroup, count }) => {
            const maxCount = Math.max(...ageDistribution.map(a => a.count));
            const percentage = Math.round((count / maxCount) * 100);
            
            return (
              <div key={ageGroup} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{ageGroup} años</span>
                  <span className="text-sm font-bold text-gray-900">{count} beneficiarios</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DemographicAnalytics;
