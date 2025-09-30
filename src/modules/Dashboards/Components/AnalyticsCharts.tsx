import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Users, FileText, Clock, MapPin, Activity, PersonStanding } from 'lucide-react';
import GeographicAnalytics from './GeographicAnalytics';
import DisabilityAnalytics from './DisabilityAnalytics';
import FamilyAnalytics from './FamilyAnalytics';
import DemographicAnalytics from './DemographicAnalytics';
import TemporalAnalytics from './TemporalAnalytics';

interface ChartData {
  labels: string[];
  data: number[];
  colors: string[];
}

interface AnalyticsChartsProps {
  records: any[];
  stats: any;
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ records, stats }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [monthlyCarouselIndex, setMonthlyCarouselIndex] = useState(0);

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: BarChart3 },
    { id: 'geographic', label: 'Geográfico', icon: MapPin },
    { id: 'disability', label: 'Discapacidad', icon: Activity },
    { id: 'family', label: 'Familiar', icon: Users },
    { id: 'demographic', label: 'Demográfico', icon: PersonStanding },
    { id: 'temporal', label: 'Temporal', icon: Clock }
  ];
  // Calculate chart data
  const getStatusChartData = (): ChartData => {
    if (!stats) return { labels: [], data: [], colors: [] };
    
    return {
      labels: ['Activos', 'Pendientes', 'Aprobados', 'Rechazados'],
      data: [
        stats.active || 0, 
        stats.pending || 0, 
        stats.approved || 0, 
        stats.rejected || 0
      ],
      colors: ['#10B981', '#F59E0B', '#3B82F6', '#EF4444']
    };
  };

  const getPhaseChartData = (): ChartData => {
    if (!stats) return { labels: [], data: [], colors: [] };
    
    return {
      labels: ['Fase 1', 'Fase 2', 'Fase 3', 'Fase 4', 'Completados'],
      data: [
        stats.phase1 || 0, 
        stats.phase2 || 0, 
        stats.phase3 || 0, 
        stats.phase4 || 0, 
        stats.completed || 0
      ],
      colors: ['#8B5CF6', '#06B6D4', '#F59E0B', '#EF4444', '#10B981']
    };
  };

  const getCreatorChartData = (): ChartData => {
    const adminCreated = records.filter(r => r.admin_created).length;
    const userCreated = records.filter(r => !r.admin_created).length;
    
    return {
      labels: ['Creados por Usuarios', 'Creados por Admins'],
      data: [userCreated, adminCreated],
      colors: ['#3B82F6', '#F59E0B']
    };
  };

  const getMonthlyTrendData = (): ChartData => {
    // Group records by month for the last 12 months
    const months = [];
    const data = [];
    const colors = ['#3B82F6'];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      months.push(monthKey);
      
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const monthRecords = records.filter(record => {
        const recordDate = new Date(record.created_at);
        return recordDate >= monthStart && recordDate <= monthEnd;
      });
      
      data.push(monthRecords.length);
    }
    
    return { labels: months, data, colors };
  };

  const getHandoverStats = () => {
    const adminCreated = records.filter(r => r.admin_created);
    const handedOver = adminCreated.filter(r => r.handed_over_to_user);
    
    return {
      total: adminCreated.length,
      handedOver: handedOver.length,
      pending: adminCreated.length - handedOver.length
    };
  };

  const statusData = getStatusChartData();
  const phaseData = getPhaseChartData();
  const creatorData = getCreatorChartData();
  const trendData = getMonthlyTrendData();
  const handoverStats = getHandoverStats();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'geographic':
        return <GeographicAnalytics records={records} />;
      case 'disability':
        return <DisabilityAnalytics records={records} />;
      case 'family':
        return <FamilyAnalytics records={records} />;
      case 'demographic':
        return <DemographicAnalytics records={records} />;
      case 'temporal':
        return <TemporalAnalytics records={records} />;
      default:
        return (
          <div className="space-y-6">
            {/* Status Distribution Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <PieChart className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Distribución por Estado</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chart Legend */}
                <div className="space-y-3">
                  {statusData.labels.map((label, index) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: statusData.colors[index] }}
                        ></div>
                        <span className="text-sm text-gray-700">{label}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {statusData.data[index]}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Simple Bar Chart */}
                <div className="flex items-end justify-between h-30 space-x-2">
                  {statusData.data.map((value, index) => {
                    const maxValue = Math.max(...statusData.data);
                    const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                    
                    return (
                      <div key={index} className="flex flex-col items-center flex-1 h-full">
                        <div 
                          className="w-full rounded-t"
                          style={{ 
                            height: `${height}%`,
                            backgroundColor: statusData.colors[index],
                            minHeight: value > 0 ? '4px' : '0px'
                          }}
                        ></div>
                      </div>
                    );
                  })}
                </div>

                {/* Placeholder for values */}
                <div className="flex justify-between items-start space-x-2">
                </div>

                {/* Values row aligned uniformly at bottom */}
                  <div className="flex justify-between items-start space-x-4">
                  {statusData.data.map((value, index) => (
                    <div key={index} className="flex-1 text-center">
                      <span className="text-xs text-gray-500">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Phase Distribution Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Distribución por Fase</h3>
              </div>
              
              <div className="space-y-4">
                {phaseData.labels.map((label, index) => {
                  const maxValue = Math.max(...phaseData.data);
                  const percentage = maxValue > 0 ? (phaseData.data[index] / maxValue) * 100 : 0;
                  
                  return (
                    <div key={label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{label}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {phaseData.data[index]}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: phaseData.colors[index]
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Creator Distribution */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Distribución por Creador</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {creatorData.labels.map((label, index) => (
                  <div key={label} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: creatorData.colors[index] }}
                      >
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900">
                      {creatorData.data[index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Trend */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Tendencia Mensual</h3>
                </div>
                
                {/* Carousel Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setMonthlyCarouselIndex(Math.max(0, monthlyCarouselIndex - 1))}
                    disabled={monthlyCarouselIndex === 0}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-sm text-gray-500 px-2">
                    {monthlyCarouselIndex + 1} - {Math.min(monthlyCarouselIndex + 6, trendData.data.length)} de {trendData.data.length}
                  </span>
                  <button
                    onClick={() => setMonthlyCarouselIndex(Math.min(trendData.data.length - 6, monthlyCarouselIndex + 1))}
                    disabled={monthlyCarouselIndex >= trendData.data.length - 6}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Chart Container */}
              <div className="relative">
                <div className="flex items-end justify-between h-32 space-x-2">
                  {trendData.data.slice(monthlyCarouselIndex, monthlyCarouselIndex + 6).map((value, index) => {
                    const actualIndex = monthlyCarouselIndex + index;
                    const maxValue = Math.max(...trendData.data);
                    const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                    
                    return (
                      <div key={actualIndex} className="flex flex-col items-center flex-1 h-full">
                        <div 
                          className="w-full rounded-t bg-blue-500"
                          style={{ 
                            height: `${height}%`,
                            minHeight: value > 0 ? '4px' : '0px'
                          }}
                        ></div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Values row aligned uniformly at bottom */}
                <div className="flex justify-between items-start mt-2 space-x-2">
                  {trendData.data.slice(monthlyCarouselIndex, monthlyCarouselIndex + 6).map((value, index) => {
                    const actualIndex = monthlyCarouselIndex + index;
                    return (
                      <div key={actualIndex} className="flex-1 text-center">
                        <span className="text-xs text-gray-500">{value}</span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Month labels row */}
                <div className="flex justify-between items-start mt-1 space-x-2">
                  {trendData.data.slice(monthlyCarouselIndex, monthlyCarouselIndex + 6).map((value, index) => {
                    const actualIndex = monthlyCarouselIndex + index;
                    return (
                      <div key={actualIndex} className="flex-1 text-center">
                        <span className="text-xs text-gray-400">
                          {trendData.labels[actualIndex]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Analytics Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Análisis Avanzado de Expedientes</h3>
        </div>
        
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default AnalyticsCharts;
