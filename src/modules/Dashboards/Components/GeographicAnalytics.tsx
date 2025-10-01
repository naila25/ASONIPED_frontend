import React, { useState, useEffect } from 'react';
import { MapPin, Users, CheckCircle } from 'lucide-react';
import { getGeographicAnalytics } from '../../Records/Services/recordsApi';

interface GeographicRecord {
  id: number;
  record_number: string;
  province: string | null;
  canton: string | null;
  district: string | null;
  created_at: string;
}

// No longer need props - we fetch our own data
type GeographicAnalyticsProps = Record<string, never>;

// No more hardcoded address parsing - we use structured data directly

interface GeographicData {
  province: string;
  canton: string;
  district: string;
  count: number;
}

const GeographicAnalytics: React.FC<GeographicAnalyticsProps> = () => {
  const [records, setRecords] = useState<GeographicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGeographicData = async () => {
      try {
        setLoading(true);
        const data = await getGeographicAnalytics();
        setRecords(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading geographic data');
        console.error('Error loading geographic analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGeographicData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Cargando datos geográficos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }
  
  // Extract geographic data from records
  const extractGeographicData = (): GeographicData[] => {
    const geographicMap = new Map<string, GeographicData>();
    
    records.forEach((record) => {
      
      // Use structured geographic data directly
      const province = record.province;
      const canton = record.canton;
      const district = record.district;
      
      if (province && canton && district) {
        const key = `${province}-${canton}-${district}`;
        const existing = geographicMap.get(key);
        
        if (existing) {
          existing.count += 1;
        } else {
          geographicMap.set(key, {
            province: province,
            canton: canton,
            district: district,
            count: 1
          });
        }
      } else if (province && canton) {
        // If we have province and canton but no district, use a default district
        const key = `${province}-${canton}-Sin Distrito`;
        const existing = geographicMap.get(key);
        
        if (existing) {
          existing.count += 1;
        } else {
          geographicMap.set(key, {
            province: province,
            canton: canton,
            district: 'Sin Distrito',
            count: 1
          });
        }
      }
    });
    
    return Array.from(geographicMap.values()).sort((a, b) => b.count - a.count);
  };


  // Analyze canton distribution
  const getCantonDistribution = () => {
    const cantonMap = new Map<string, { canton: string; province: string; count: number }>();
    
    records.forEach(record => {
      const province = record.province;
      const canton = record.canton;
      
      if (canton && province) {
        const key = `${province}-${canton}`;
        const existing = cantonMap.get(key);
        
        if (existing) {
          existing.count += 1;
        } else {
          cantonMap.set(key, {
            canton: canton,
            province: province,
            count: 1
          });
        }
      }
    });
    
    return Array.from(cantonMap.values()).sort((a, b) => b.count - a.count);
  };



  // Calculate coverage statistics
  const getCoverageStats = () => {
    const totalProvinces = 7;
    
    const coveredProvinces = new Set(
      records.map(record => record.province).filter(Boolean)
    ).size;
    
    const totalCantons = new Set(
      records.map(record => record.canton).filter(Boolean)
    ).size;
    
    const totalDistricts = new Set(
      records.map(record => record.district).filter(Boolean)
    ).size;
    
    const result = {
      provinceCoverage: Math.round((coveredProvinces / totalProvinces) * 100),
      totalCantons,
      totalDistricts,
      coveredProvinces
    };
    
    return result;
  };

  const geographicData = extractGeographicData();
  const cantonDistribution = getCantonDistribution();
  const coverageStats = getCoverageStats();

  return (
    <div className="space-y-6">
      {/* Coverage Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Cobertura Geográfica</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{coverageStats.totalCantons}</div>
            <div className="text-sm text-green-800">Cantones</div>
            <div className="text-xs text-green-600">con beneficiarios</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{coverageStats.totalDistricts}</div>
            <div className="text-sm text-purple-800">Distritos</div>
            <div className="text-xs text-purple-600">con beneficiarios</div>
          </div>
        </div>
      </div>

      {/* Canton Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Distribución por Cantón</h3>
        </div>
        
        <div className="space-y-4">
          {cantonDistribution.slice(0, 15).map(({ canton, province, count }) => {
            const maxCount = Math.max(...cantonDistribution.map(c => c.count));
            const percentage = Math.round((count / maxCount) * 100);
            
            return (
              <div key={`${province}-${canton}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">{canton}</span>
                    <span className="text-xs text-gray-500 ml-2">({province})</span>
                  </div>
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
        
        {cantonDistribution.length > 15 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Mostrando 15 de {cantonDistribution.length} cantones
            </p>
          </div>
        )}
      </div>

      {/* District Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Distribución por Distrito</h3>
        </div>
        
        <div className="space-y-4">
          {geographicData.slice(0, 15).map(({ district, canton, province, count }) => {
            const maxCount = Math.max(...geographicData.map(d => d.count));
            const percentage = Math.round((count / maxCount) * 100);
            
            return (
              <div key={`${province}-${canton}-${district}`} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-gray-700">{district}</span>
                    <span className="text-xs text-gray-500 ml-2">({canton}, {province})</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{count} beneficiarios</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
        
        {geographicData.length > 15 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Mostrando 15 de {geographicData.length} distritos
            </p>
          </div>
        )}
      </div>

      {/* Detailed Geographic Data */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <CheckCircle className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Detalle Geográfico Completo</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provincia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantón
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distrito
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beneficiarios
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {geographicData.slice(0, 20).map((data, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {data.province}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {data.canton}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {data.district}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {data.count}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {geographicData.length > 20 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Mostrando 20 de {geographicData.length} ubicaciones
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeographicAnalytics;
