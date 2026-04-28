import React, { useEffect, useState } from 'react';
import { BarChart3, PieChart, Users, MapPin, Activity, PersonStanding, ChevronDown, ChevronUp } from 'lucide-react';
import GeographicAnalytics from './GeographicAnalytics';
import DisabilityAnalytics from './DisabilityAnalytics';
import FamilyAnalytics from './FamilyAnalytics';
import DemographicAnalytics from './DemographicAnalytics';
import { getDemographicRecords } from '../../Records/Services/recordsApi';
import type { Record, RecordStats } from '../../Records/Types/records';

interface ChartData {
  labels: string[];
  data: number[];
  colors: string[];
}

interface AnalyticsChartsProps {
  records: Record[];
  stats: RecordStats | null;
  onTabChange?: (tabId: string) => void;
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ records, stats, onTabChange }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileOverviewExpanded, setMobileOverviewExpanded] = useState(false);

  useEffect(() => {
    onTabChange?.(activeTab);
  }, [activeTab, onTabChange]);

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: BarChart3 },
    { id: 'geographic', label: 'Geográfico', icon: MapPin },
    { id: 'disability', label: 'Discapacidad', icon: Activity },
    { id: 'family', label: 'Familiar', icon: Users },
    { id: 'demographic', label: 'Demográfico', icon: PersonStanding }
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

  const [creatorCounts, setCreatorCounts] = useState<{userCreated: number; adminCreated: number} | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const all = await getDemographicRecords(1000);
        if (!isMounted) return;
        const adminCreated = all.filter((r: Record) => r.admin_created).length;
        const userCreated = all.filter((r: Record) => !r.admin_created).length;
        setCreatorCounts({ userCreated, adminCreated });
      } catch {
        // Fallback to current page if fetch fails
        const adminCreated = records.filter(r => r.admin_created).length;
        const userCreated = records.filter(r => !r.admin_created).length;
        setCreatorCounts({ userCreated, adminCreated });
      }
    })();
    return () => { isMounted = false; };
  }, [records]);

  const getCreatorChartData = (): ChartData => {
    const adminCreated = creatorCounts ? creatorCounts.adminCreated : records.filter(r => r.admin_created).length;
    const userCreated = creatorCounts ? creatorCounts.userCreated : records.filter(r => !r.admin_created).length;
    return {
      labels: ['Creados por Usuarios', 'Creados por Admins'],
      data: [userCreated, adminCreated],
      colors: ['#3B82F6', '#F59E0B']
    };
  };


  const statusData = getStatusChartData();
  const phaseData = getPhaseChartData();
  const creatorData = getCreatorChartData();


  const renderTabContent = () => {
    switch (activeTab) {
      case 'geographic':
        return <GeographicAnalytics />;
      case 'disability':
        return <DisabilityAnalytics />;
      case 'family':
        return <FamilyAnalytics />;
      case 'demographic':
        return <DemographicAnalytics />;
      default: {
        const fullOverview = (
          <div className="space-y-6">
            {/* Status Distribution Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6 min-w-0 overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <PieChart className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <h3 className="text-lg font-semibold text-gray-900">Distribución por Estado</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
                <div className="space-y-3 min-w-0">
                  {statusData.labels.map((label, index) => (
                    <div key={label} className="flex items-center justify-between gap-2 min-w-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: statusData.colors[index] }} />
                        <span className="text-sm text-gray-700 truncate">{label}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 flex-shrink-0">{statusData.data[index]}</span>
                    </div>
                  ))}
                </div>
                {/* Note: percentage heights require an explicit parent height */}
                <div className="flex items-end justify-between h-32 space-x-2 min-w-0">
                  {statusData.data.map((value, index) => {
                    const maxValue = Math.max(...statusData.data);
                    const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
                    return (
                      <div key={index} className="flex h-full flex-col justify-end items-center flex-1 min-w-0">
                        <div
                          className="w-full rounded-t"
                          style={{
                            height: `${height}%`,
                            backgroundColor: statusData.colors[index],
                            minHeight: value > 0 ? '4px' : '0px',
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Phase Distribution Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6 min-w-0 overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <h3 className="text-lg font-semibold text-gray-900">Distribución por Fase</h3>
              </div>
              <div className="space-y-4 min-w-0">
                {phaseData.labels.map((label, index) => {
                  const maxValue = Math.max(...phaseData.data);
                  const percentage = maxValue > 0 ? (phaseData.data[index] / maxValue) * 100 : 0;
                  return (
                    <div key={label} className="space-y-2 min-w-0">
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <span className="text-sm font-medium text-gray-700 truncate">{label}</span>
                        <span className="text-sm font-medium text-gray-900 flex-shrink-0">{phaseData.data[index]}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 min-w-0">
                        <div className="h-2 rounded-full transition-all duration-300" style={{ width: `${percentage}%`, backgroundColor: phaseData.colors[index] }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Creator Distribution */}
            <div className="bg-white rounded-lg shadow-sm p-6 min-w-0 overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <Users className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <h3 className="text-lg font-semibold text-gray-900">Distribución por Creador</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
                {creatorData.labels.map((label, index) => (
                  <div key={label} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: creatorData.colors[index] }}>
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 truncate">{label}</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900 flex-shrink-0">{creatorData.data[index]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

        return (
          <>
            {/* Mobile: single compact summary card (replaces 3 large cards by default) */}
            <div className="md:hidden min-w-0">
              {!mobileOverviewExpanded ? (
                <div className="bg-white rounded-lg shadow-sm p-4 min-w-0 overflow-hidden">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Resumen</h3>
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Por estado</p>
                    <div className="grid grid-cols-2 gap-2">
                    {statusData.labels.map((label, index) => (
                      <div key={label} className="flex items-center justify-between gap-1.5 p-2 bg-gray-50 rounded">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: statusData.colors[index] }} />
                        <span className="text-xs text-gray-700 truncate">{label}</span>
                        <span className="text-xs font-semibold text-gray-900 flex-shrink-0">{statusData.data[index]}</span>
                      </div>
                    ))}
                    </div>
                  </div>
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Por fase</p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {phaseData.labels.map((label, i) => (
                        <div key={label} className="text-center p-1.5 bg-gray-50 rounded">
                          <p className="text-[10px] text-gray-500 truncate" title={label}>
                            {label.replace('Fase ', 'F').replace('Completados', '✓')}
                          </p>
                          <p className="text-xs font-semibold text-gray-900">{phaseData.data[i]}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Por creador</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded">
                        <span className="text-xs text-gray-700">Usuarios</span>
                        <span className="text-xs font-semibold text-gray-900">{creatorData.data[0]}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded">
                        <span className="text-xs text-gray-700">Admins</span>
                        <span className="text-xs font-semibold text-gray-900">{creatorData.data[1]}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileOverviewExpanded(true)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg"
                  >
                    Ver análisis detallado
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  {fullOverview}
                  <button
                    type="button"
                    onClick={() => setMobileOverviewExpanded(false)}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg"
                  >
                    Ocultar detalle
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Desktop: always show full overview */}
            <div className="hidden md:block min-w-0">
              {fullOverview}
            </div>
          </>
        );
      }
    }
  };

  return (
    <div className="min-w-0 overflow-x-hidden space-y-4 md:space-y-6">
      {/* Analytics Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 min-w-0">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 min-w-0">
          <BarChart3 className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate">Análisis Avanzado de Expedientes</h3>
        </div>
        <div className="border-b border-gray-200 md:-mb-px">
          {/* Mobile: 2-row grid */}
          <nav className="grid grid-cols-3 gap-2 md:hidden">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg border-2 font-medium text-xs ${
                    isActive
                      ? 'border-blue-500 bg-blue-50 text-blue-600'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
          {/* Desktop: single row with underline */}
          <nav className="-mb-px hidden md:flex md:space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-w-0 overflow-hidden">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AnalyticsCharts;
