import React from 'react';
import { Calendar, TrendingUp, Clock, BarChart3, Activity, Users } from 'lucide-react';

interface Record {
  id: number;
  created_at: string;
  updated_at: string;
  personal_data?: {
    created_at?: string;
  };
  complete_personal_data?: {
    registration_date?: string;
  };
}

interface TemporalAnalyticsProps {
  records: Record[];
}

const TemporalAnalytics: React.FC<TemporalAnalyticsProps> = ({ records }) => {
  // Analyze registration trends by month
  const getMonthlyRegistrationTrends = () => {
    const monthlyMap = new Map<string, number>();
    
    records.forEach(record => {
      const personalData = record.personal_data || record.complete_personal_data;
      const registrationDate = personalData?.registration_date 
        ? new Date(personalData.registration_date)
        : new Date(record.created_at);
      
      const monthKey = registrationDate.toLocaleDateString('es-ES', { 
        month: 'short', 
        year: 'numeric' 
      });
      const count = monthlyMap.get(monthKey) || 0;
      monthlyMap.set(monthKey, count + 1);
    });
    
    return Array.from(monthlyMap.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });
  };

  // Analyze registration trends by year
  const getYearlyRegistrationTrends = () => {
    const yearlyMap = new Map<number, number>();
    
    records.forEach(record => {
      const personalData = record.personal_data || record.complete_personal_data;
      const registrationDate = personalData?.registration_date 
        ? new Date(personalData.registration_date)
        : new Date(record.created_at);
      
      const year = registrationDate.getFullYear();
      const count = yearlyMap.get(year) || 0;
      yearlyMap.set(year, count + 1);
    });
    
    return Array.from(yearlyMap.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year - b.year);
  };

  // Analyze seasonal patterns
  const getSeasonalPatterns = () => {
    const seasonalMap = new Map<string, number>();
    
    records.forEach(record => {
      const personalData = record.personal_data || record.complete_personal_data;
      const registrationDate = personalData?.registration_date 
        ? new Date(personalData.registration_date)
        : new Date(record.created_at);
      
      const month = registrationDate.getMonth();
      let season = '';
      
      if (month >= 2 && month <= 4) season = 'Primavera';
      else if (month >= 5 && month <= 7) season = 'Verano';
      else if (month >= 8 && month <= 10) season = 'Otoño';
      else season = 'Invierno';
      
      const count = seasonalMap.get(season) || 0;
      seasonalMap.set(season, count + 1);
    });
    
    return Array.from(seasonalMap.entries())
      .map(([season, count]) => ({ season, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Analyze growth rate
  const getGrowthRate = () => {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    
    const currentYearCount = records.filter(record => {
      const personalData = record.personal_data || record.complete_personal_data;
      const registrationDate = personalData?.registration_date 
        ? new Date(personalData.registration_date)
        : new Date(record.created_at);
      return registrationDate.getFullYear() === currentYear;
    }).length;
    
    const lastYearCount = records.filter(record => {
      const personalData = record.personal_data || record.complete_personal_data;
      const registrationDate = personalData?.registration_date 
        ? new Date(personalData.registration_date)
        : new Date(record.created_at);
      return registrationDate.getFullYear() === lastYear;
    }).length;
    
    if (lastYearCount === 0) return 0;
    return Math.round(((currentYearCount - lastYearCount) / lastYearCount) * 100);
  };

  // Get peak registration periods
  const getPeakPeriods = () => {
    const monthlyTrends = getMonthlyRegistrationTrends();
    if (monthlyTrends.length === 0) return [];
    
    const maxCount = Math.max(...monthlyTrends.map(t => t.count));
    return monthlyTrends.filter(trend => trend.count === maxCount);
  };

  // Analyze recent activity (last 30 days)
  const getRecentActivity = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRecords = records.filter(record => {
      const personalData = record.personal_data || record.complete_personal_data;
      const registrationDate = personalData?.registration_date 
        ? new Date(personalData.registration_date)
        : new Date(record.created_at);
      return registrationDate >= thirtyDaysAgo;
    });
    
    return recentRecords.length;
  };

  // Get processing time analysis
  const getProcessingTimeAnalysis = () => {
    const processingTimes: number[] = [];
    
    records.forEach(record => {
      const personalData = record.personal_data || record.complete_personal_data;
      if (personalData?.registration_date) {
        const registrationDate = new Date(personalData.registration_date);
        const createdDate = new Date(record.created_at);
        const processingTime = Math.ceil((createdDate.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (processingTime >= 0 && processingTime <= 365) { // Valid range
          processingTimes.push(processingTime);
        }
      }
    });
    
    if (processingTimes.length === 0) return { average: 0, min: 0, max: 0 };
    
    processingTimes.sort((a, b) => a - b);
    return {
      average: Math.round(processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length),
      min: processingTimes[0],
      max: processingTimes[processingTimes.length - 1]
    };
  };

  const monthlyTrends = getMonthlyRegistrationTrends();
  const yearlyTrends = getYearlyRegistrationTrends();
  const seasonalPatterns = getSeasonalPatterns();
  const growthRate = getGrowthRate();
  const peakPeriods = getPeakPeriods();
  const recentActivity = getRecentActivity();
  const processingTime = getProcessingTimeAnalysis();

  return (
    <div className="space-y-6">
      {/* Temporal Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Resumen Temporal</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{recentActivity}</div>
            <div className="text-sm text-blue-800">Registros Recientes</div>
            <div className="text-xs text-blue-600">Últimos 30 días</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{growthRate}%</div>
            <div className="text-sm text-green-800">Crecimiento Anual</div>
            <div className="text-xs text-green-600">vs año anterior</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{processingTime.average}</div>
            <div className="text-sm text-purple-800">Tiempo Promedio</div>
            <div className="text-xs text-purple-600">Días de procesamiento</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{yearlyTrends.length}</div>
            <div className="text-sm text-orange-800">Años de Datos</div>
            <div className="text-xs text-orange-600">Histórico disponible</div>
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Tendencias Mensuales</h3>
        </div>
        
        {monthlyTrends.length > 0 ? (
          <div className="flex items-end justify-between h-32 space-x-1">
            {monthlyTrends.slice(-12).map(({ month, count }, index) => {
              const maxCount = Math.max(...monthlyTrends.map(t => t.count));
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
            <p>No hay datos de tendencias mensuales</p>
          </div>
        )}
      </div>

      {/* Yearly Trends */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Tendencias Anuales</h3>
        </div>
        
        <div className="space-y-4">
          {yearlyTrends.map(({ year, count }, index) => {
            const maxCount = Math.max(...yearlyTrends.map(y => y.count));
            const percentage = Math.round((count / maxCount) * 100);
            const isCurrentYear = year === new Date().getFullYear();
            
            return (
              <div key={year} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isCurrentYear ? 'text-blue-700' : 'text-gray-700'}`}>
                    {year} {isCurrentYear && '(Actual)'}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{count} registros</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${isCurrentYear ? 'bg-blue-500' : 'bg-green-500'}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seasonal Patterns */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Patrones Estacionales</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {seasonalPatterns.map(({ season, count }) => {
            const maxCount = Math.max(...seasonalPatterns.map(s => s.count));
            const percentage = Math.round((count / maxCount) * 100);
            
            const getSeasonColor = (season: string) => {
              switch (season) {
                case 'Primavera': return 'green';
                case 'Verano': return 'yellow';
                case 'Otoño': return 'orange';
                case 'Invierno': return 'blue';
                default: return 'gray';
              }
            };
            
            const color = getSeasonColor(season);
            
            return (
              <div key={season} className="p-4 border border-gray-200 rounded-lg text-center">
                <div className={`text-2xl font-bold text-${color}-600 mb-1`}>{count}</div>
                <div className="text-sm text-gray-600">{season}</div>
                <div className="text-xs text-gray-500">{percentage}% del máximo</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Peak Periods */}
      {peakPeriods.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Períodos de Mayor Actividad</h3>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Meses con mayor registro:</h4>
            <div className="flex flex-wrap gap-2">
              {peakPeriods.map(period => (
                <span 
                  key={period.month}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"
                >
                  {period.month} ({period.count} registros)
                </span>
              ))}
            </div>
            <p className="text-sm text-yellow-700 mt-2">
              Estos períodos pueden indicar patrones estacionales o eventos especiales que aumentan la demanda de servicios.
            </p>
          </div>
        </div>
      )}

      {/* Processing Time Analysis */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Análisis de Tiempo de Procesamiento</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{processingTime.average}</div>
            <div className="text-sm text-blue-800">Tiempo Promedio</div>
            <div className="text-xs text-blue-600">Días</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{processingTime.min}</div>
            <div className="text-sm text-green-800">Tiempo Mínimo</div>
            <div className="text-xs text-green-600">Días</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{processingTime.max}</div>
            <div className="text-sm text-orange-800">Tiempo Máximo</div>
            <div className="text-xs text-orange-600">Días</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemporalAnalytics;
