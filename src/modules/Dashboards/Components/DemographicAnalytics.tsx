import React from 'react';
import { Calendar, Users, User, UserCheck, MapPin, Clock, TrendingUp } from 'lucide-react';

interface Record {
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
  };
}

interface DemographicAnalyticsProps {
  records: Record[];
}

const DemographicAnalytics: React.FC<DemographicAnalyticsProps> = ({ records }) => {
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

  // Analyze age distribution
  const getAgeDistribution = () => {
    const ageGroups = {
      '0-5': 0,
      '6-12': 0,
      '13-17': 0,
      '18-25': 0,
      '26-35': 0,
      '36-50': 0,
      '51+': 0
    };
    
    records.forEach(record => {
      const personalData = record.personal_data || record.complete_personal_data;
      if (personalData?.birth_date) {
        const birthDate = new Date(personalData.birth_date);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (age >= 0 && age <= 5) ageGroups['0-5']++;
        else if (age >= 6 && age <= 12) ageGroups['6-12']++;
        else if (age >= 13 && age <= 17) ageGroups['13-17']++;
        else if (age >= 18 && age <= 25) ageGroups['18-25']++;
        else if (age >= 26 && age <= 35) ageGroups['26-35']++;
        else if (age >= 36 && age <= 50) ageGroups['36-50']++;
        else if (age >= 51) ageGroups['51+']++;
      }
    });
    
    return Object.entries(ageGroups)
      .map(([ageGroup, count]) => ({ ageGroup, count }))
      .filter(group => group.count > 0);
  };

  // Analyze nationality distribution
  const getNationalityDistribution = () => {
    const nationalityMap = new Map<string, number>();
    
    records.forEach(record => {
      const personalData = record.personal_data || record.complete_personal_data;
      if (personalData?.birth_place) {
        const nationality = personalData.birth_place;
        const count = nationalityMap.get(nationality) || 0;
        nationalityMap.set(nationality, count + 1);
      }
    });
    
    return Array.from(nationalityMap.entries())
      .map(([nationality, count]) => ({ nationality, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Analyze registration trends
  const getRegistrationTrends = () => {
    const monthlyRegistrations = new Map<string, number>();
    const currentYear = new Date().getFullYear();
    
    records.forEach(record => {
      const personalData = record.personal_data || record.complete_personal_data;
      if (personalData?.registration_date) {
        const registrationDate = new Date(personalData.registration_date);
        if (registrationDate.getFullYear() === currentYear) {
          const monthKey = registrationDate.toLocaleDateString('es-ES', { 
            month: 'short', 
            year: 'numeric' 
          });
          const count = monthlyRegistrations.get(monthKey) || 0;
          monthlyRegistrations.set(monthKey, count + 1);
        }
      }
    });
    
    return Array.from(monthlyRegistrations.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });
  };

  // Calculate average age
  const getAverageAge = () => {
    let totalAge = 0;
    let validAges = 0;
    
    records.forEach(record => {
      const personalData = record.personal_data || record.complete_personal_data;
      if (personalData?.fecha_nacimiento) {
        const birthDate = new Date(personalData.fecha_nacimiento);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age >= 0 && age <= 120) { // Valid age range
          totalAge += age;
          validAges++;
        }
      }
    });
    
    return validAges > 0 ? Math.round(totalAge / validAges) : 0;
  };

  // Get age statistics
  const getAgeStatistics = () => {
    const ages: number[] = [];
    
    records.forEach(record => {
      const personalData = record.personal_data || record.complete_personal_data;
      if (personalData?.fecha_nacimiento) {
        const birthDate = new Date(personalData.fecha_nacimiento);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age >= 0 && age <= 120) {
          ages.push(age);
        }
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

  const genderDistribution = getGenderDistribution();
  const ageDistribution = getAgeDistribution();
  const nationalityDistribution = getNationalityDistribution();
  const registrationTrends = getRegistrationTrends();
  const ageStats = getAgeStatistics();

  return (
    <div className="space-y-6">
      {/* Demographic Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Resumen Demográfico</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{records.length}</div>
            <div className="text-sm text-purple-800">Total Beneficiarios</div>
            <div className="text-xs text-purple-600">Registrados</div>
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
            const isMale = gender.toLowerCase().includes('masculino') || gender.toLowerCase().includes('hombre');
            const color = isMale ? 'blue' : 'pink';
            
            return (
              <div key={gender} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 bg-${color}-100 rounded-lg`}>
                    <User className={`w-5 h-5 text-${color}-600`} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{gender}</div>
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

      {/* Nationality Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Distribución por Nacionalidad</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nationalityDistribution.map(({ nationality, count }) => (
            <div key={nationality} className="p-4 border border-gray-200 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">{count}</div>
              <div className="text-sm text-gray-600">{nationality}</div>
              <div className="text-xs text-gray-500">
                {Math.round((count / records.length) * 100)}% del total
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Registration Trends */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Tendencias de Registro {new Date().getFullYear()}</h3>
        </div>
        
        {registrationTrends.length > 0 ? (
          <div className="flex items-end justify-between h-32 space-x-2">
            {registrationTrends.map(({ month, count }, index) => {
              const maxCount = Math.max(...registrationTrends.map(r => r.count));
              const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
              
              return (
                <div key={month} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full rounded-t bg-blue-500"
                    style={{ 
                      height: `${height}%`,
                      minHeight: count > 0 ? '4px' : '0px'
                    }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">{count}</span>
                  <span className="text-xs text-gray-400 mt-1 text-center">
                    {month}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No hay datos de registro para este año</p>
          </div>
        )}
      </div>

      {/* Age Insights */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <UserCheck className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Insights Demográficos</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Grupo Etario Principal</h4>
            <p className="text-sm text-blue-700">
              {ageDistribution.length > 0 && (
                <>
                  El grupo de {ageDistribution[0].ageGroup} años representa el mayor número 
                  de beneficiarios ({ageDistribution[0].count} personas), 
                  indicando una concentración en esta franja etaria.
                </>
              )}
            </p>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Diversidad Nacional</h4>
            <p className="text-sm text-green-700">
              {nationalityDistribution.length > 0 && (
                <>
                  {nationalityDistribution[0].nationality} representa el {Math.round((nationalityDistribution[0].count / records.length) * 100)}% 
                  de los beneficiarios, con {nationalityDistribution.length} nacionalidades diferentes registradas.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemographicAnalytics;
