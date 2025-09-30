import React from 'react';
import { MapPin, Users, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface Record {
  id: number;
  personal_data?: {
    province?: string;
    canton?: string;
    district?: string;
    address?: string;
  };
  complete_personal_data?: {
    province?: string;
    canton?: string;
    district?: string;
    exact_address?: string;
  };
}

interface GeographicAnalyticsProps {
  records: Record[];
}

// Function to extract geographic information from address text
const extractGeographicFromAddress = (address: string): { province: string | null; canton: string | null; district: string | null } => {
  if (!address) return { province: null, canton: null, district: null };
  
  const addressLower = address.toLowerCase();
  
  // Known Costa Rican locations mapping
  const locationMap: { [key: string]: { province: string; canton: string; district: string } } = {
    'curridabat': { province: 'San José', canton: 'Curridabat', district: 'Curridabat' },
    'dulce nombre de cartago': { province: 'Cartago', canton: 'Cartago', district: 'Dulce Nombre' },
    'san rafael de ojo de agua': { province: 'Alajuela', canton: 'Alajuela', district: 'San Rafael' },
    'cartago': { province: 'Cartago', canton: 'Cartago', district: 'Oriental' },
    'san josé': { province: 'San José', canton: 'San José', district: 'Carmen' },
    'alajuela': { province: 'Alajuela', canton: 'Alajuela', district: 'Alajuela' },
    'heredia': { province: 'Heredia', canton: 'Heredia', district: 'Heredia' },
    'puntarenas': { province: 'Puntarenas', canton: 'Puntarenas', district: 'Puntarenas' },
    'limón': { province: 'Limón', canton: 'Limón', district: 'Limón' },
    'guanacaste': { province: 'Guanacaste', canton: 'Liberia', district: 'Liberia' }
  };
  
  // Try to find matches in the address
  for (const [location, geo] of Object.entries(locationMap)) {
    if (addressLower.includes(location)) {
      return geo;
    }
  }
  
  // If no specific match, try to extract province from common patterns
  if (addressLower.includes('san josé') || addressLower.includes('sanjose')) {
    return { province: 'San José', canton: 'Desconocido', district: 'Desconocido' };
  }
  if (addressLower.includes('cartago')) {
    return { province: 'Cartago', canton: 'Desconocido', district: 'Desconocido' };
  }
  if (addressLower.includes('alajuela')) {
    return { province: 'Alajuela', canton: 'Desconocido', district: 'Desconocido' };
  }
  if (addressLower.includes('heredia')) {
    return { province: 'Heredia', canton: 'Desconocido', district: 'Desconocido' };
  }
  if (addressLower.includes('puntarenas')) {
    return { province: 'Puntarenas', canton: 'Desconocido', district: 'Desconocido' };
  }
  if (addressLower.includes('limón') || addressLower.includes('limon')) {
    return { province: 'Limón', canton: 'Desconocido', district: 'Desconocido' };
  }
  if (addressLower.includes('guanacaste')) {
    return { province: 'Guanacaste', canton: 'Desconocido', district: 'Desconocido' };
  }
  
  return { province: null, canton: null, district: null };
};

interface GeographicData {
  province: string;
  canton: string;
  district: string;
  count: number;
}

const GeographicAnalytics: React.FC<GeographicAnalyticsProps> = ({ records }) => {
  // Debug: Log records structure
  console.log('🌍 GeographicAnalytics - Total records:', records.length);
  console.log('🌍 Sample record structure:', records[0]);
  
  // Extract geographic data from records
  const extractGeographicData = (): GeographicData[] => {
    const geographicMap = new Map<string, GeographicData>();
    
    records.forEach((record, index) => {
      const personalData = record.personal_data || record.complete_personal_data;
      
      // Debug: Log first few records
      if (index < 3) {
        console.log(`🌍 Record ${index}:`, {
          hasPersonalData: !!record.personal_data,
          hasCompletePersonalData: !!record.complete_personal_data,
          personalData: personalData,
          allPersonalDataKeys: personalData ? Object.keys(personalData) : [],
          province: personalData?.province,
          canton: personalData?.canton,
          district: personalData?.district
        });
        
        // Log the actual keys to see what's available
        if (personalData) {
          console.log(`🌍 Record ${index} - Available keys:`, Object.keys(personalData));
          console.log(`🌍 Record ${index} - Full personalData object:`, personalData);
        }
      }
      
      // Extract geographic data from exact_address field
      const exactAddress = personalData?.exact_address;
      let province = personalData?.province || personalData?.provincia;
      let canton = personalData?.canton || personalData?.cantón;
      let district = personalData?.district || personalData?.distrito;
      
      // If structured fields are null, try to extract from exact_address
      if (exactAddress && (!province || !canton || !district)) {
        const extractedGeo = extractGeographicFromAddress(exactAddress);
        province = province || extractedGeo.province;
        canton = canton || extractedGeo.canton;
        district = district || extractedGeo.district;
      }
      
      // Debug: Log what we found
      if (index < 3) {
        console.log(`🌍 Record ${index} geographic fields:`, {
          exactAddress,
          province,
          canton,
          district,
          hasProvince: !!province,
          hasCanton: !!canton,
          hasDistrict: !!district
        });
      }
      
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
    
    const result = Array.from(geographicMap.values()).sort((a, b) => b.count - a.count);
    console.log('🌍 Extracted geographic data:', result);
    return result;
  };

  // Analyze province distribution
  const getProvinceDistribution = () => {
    const provinceMap = new Map<string, number>();
    
    records.forEach(record => {
      const personalData = record.personal_data || record.complete_personal_data;
      let province = personalData?.province || personalData?.provincia;
      
      // If no province in structured fields, try to extract from address
      if (!province && personalData?.exact_address) {
        const extractedGeo = extractGeographicFromAddress(personalData.exact_address);
        province = extractedGeo.province;
      }
      
      if (province) {
        const count = provinceMap.get(province) || 0;
        provinceMap.set(province, count + 1);
      }
    });
    
    const result = Array.from(provinceMap.entries())
      .map(([province, count]) => ({ province, count }))
      .sort((a, b) => b.count - a.count);
    
    console.log('🌍 Province distribution:', result);
    return result;
  };

  // Analyze canton distribution
  const getCantonDistribution = () => {
    const cantonMap = new Map<string, { canton: string; province: string; count: number }>();
    
    records.forEach(record => {
      const personalData = record.personal_data || record.complete_personal_data;
      let province = personalData?.province || personalData?.provincia;
      let canton = personalData?.canton || personalData?.cantón;
      
      // If no structured fields, try to extract from address
      if ((!province || !canton) && personalData?.exact_address) {
        const extractedGeo = extractGeographicFromAddress(personalData.exact_address);
        province = province || extractedGeo.province;
        canton = canton || extractedGeo.canton;
      }
      
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
    
    const result = Array.from(cantonMap.values()).sort((a, b) => b.count - a.count);
    console.log('🌍 Canton distribution:', result);
    return result;
  };

  // Identify coverage gaps
  const getCoverageGaps = () => {
    const allProvinces = [
      'San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 
      'Puntarenas', 'Limón'
    ];
    
    const coveredProvinces = new Set(
      records.map(record => {
        const personalData = record.personal_data || record.complete_personal_data;
        return personalData?.province;
      }).filter(Boolean)
    );
    
    return allProvinces.filter(province => !coveredProvinces.has(province));
  };

  // Calculate coverage statistics
  const getCoverageStats = () => {
    const totalProvinces = 7;
    
    const coveredProvinces = new Set(
      records.map(record => {
        const personalData = record.personal_data || record.complete_personal_data;
        let province = personalData?.province || personalData?.provincia;
        
        if (!province && personalData?.exact_address) {
          const extractedGeo = extractGeographicFromAddress(personalData.exact_address);
          province = extractedGeo.province;
        }
        
        return province;
      }).filter(Boolean)
    ).size;
    
    const totalCantons = new Set(
      records.map(record => {
        const personalData = record.personal_data || record.complete_personal_data;
        let canton = personalData?.canton || personalData?.cantón;
        
        if (!canton && personalData?.exact_address) {
          const extractedGeo = extractGeographicFromAddress(personalData.exact_address);
          canton = extractedGeo.canton;
        }
        
        return canton;
      }).filter(Boolean)
    ).size;
    
    const totalDistricts = new Set(
      records.map(record => {
        const personalData = record.personal_data || record.complete_personal_data;
        let district = personalData?.district || personalData?.distrito;
        
        if (!district && personalData?.exact_address) {
          const extractedGeo = extractGeographicFromAddress(personalData.exact_address);
          district = extractedGeo.district;
        }
        
        return district;
      }).filter(Boolean)
    ).size;
    
    const result = {
      provinceCoverage: Math.round((coveredProvinces / totalProvinces) * 100),
      totalCantons,
      totalDistricts,
      coveredProvinces
    };
    
    console.log('🌍 Coverage stats:', result);
    return result;
  };

  const geographicData = extractGeographicData();
  const provinceDistribution = getProvinceDistribution();
  const cantonDistribution = getCantonDistribution();
  const coverageGaps = getCoverageGaps();
  const coverageStats = getCoverageStats();

  return (
    <div className="space-y-6">
      {/* Coverage Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Cobertura Geográfica</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{coverageStats.provinceCoverage}%</div>
            <div className="text-sm text-orange-800">Cobertura</div>
            <div className="text-xs text-orange-600">provincial</div>
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
          {cantonDistribution.slice(0, 15).map(({ canton, province, count }, index) => {
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
          {geographicData.slice(0, 15).map(({ district, canton, province, count }, index) => {
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
      {/* Top Cantons */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Cantones con Mayor Cobertura</h3>
        </div>
        
        <div className="space-y-3">
          {cantonDistribution.slice(0, 10).map(({ canton, province, count }, index) => (
            <div key={`${province}-${canton}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-green-600">{index + 1}</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{canton}</div>
                  <div className="text-sm text-gray-500">{province}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{count}</div>
                <div className="text-xs text-gray-500">beneficiarios</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Districts */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Distritos con Mayor Cobertura</h3>
        </div>
        
        <div className="space-y-3">
          {geographicData.slice(0, 10).map(({ district, canton, province, count }, index) => (
            <div key={`${province}-${canton}-${district}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-purple-600">{index + 1}</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{district}</div>
                  <div className="text-sm text-gray-500">{canton}, {province}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{count}</div>
                <div className="text-xs text-gray-500">beneficiarios</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coverage Gaps */}
      {coverageGaps.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Oportunidades de Expansión</h3>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium text-orange-800 mb-2">Provincias sin cobertura:</h4>
            <div className="flex flex-wrap gap-2">
              {coverageGaps.map(province => (
                <span 
                  key={province}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800"
                >
                  {province}
                </span>
              ))}
            </div>
            <p className="text-sm text-orange-700 mt-2">
              Considerar expandir servicios a estas provincias para aumentar la cobertura nacional.
            </p>
          </div>
        </div>
      )}

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
