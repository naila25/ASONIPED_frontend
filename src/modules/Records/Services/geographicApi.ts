// Service for Costa Rica geographic data API
// Based on https://api-geo-cr.vercel.app/#/

// API Response interfaces (what the API actually returns)
interface ApiProvince {
  idProvincia: number;
  descripcion: string;
}

interface ApiCanton {
  idCanton: number;
  descripcion: string;
  idProvincia: number;
}

interface ApiDistrict {
  idDistrito: number;
  descripcion: string;
  idCanton: number;
}

// Our application interfaces (what we use in the app)
export interface Province {
  id: number;
  name: string;
  code: string;
}

export interface Canton {
  id: number;
  name: string;
  code: string;
  province_id: number;
}

export interface District {
  id: number;
  name: string;
  code: string;
  canton_id: number;
}

const API_BASE_URL = 'https://api-geo-cr.vercel.app';

// Get all provinces
export const getProvinces = async (): Promise<Province[]> => {
  const response = await fetch(`${API_BASE_URL}/provincias?limit=100`);
  if (!response.ok) {
    throw new Error(`Error fetching provinces: ${response.status}`);
  }
  const result = await response.json();

  return result.data.map((apiProvince: ApiProvince) => ({
    id: apiProvince.idProvincia,
    name: apiProvince.descripcion,
    code: apiProvince.descripcion.substring(0, 2).toUpperCase(),
  }));
};

// Get cantons by province
export const getCantonsByProvince = async (provinceId: number): Promise<Canton[]> => {
  const response = await fetch(`${API_BASE_URL}/provincias/${provinceId}/cantones?limit=100`);
  if (!response.ok) {
    throw new Error(`Error fetching cantons: ${response.status}`);
  }
  const result = await response.json();

  return result.data.map((apiCanton: ApiCanton) => ({
    id: apiCanton.idCanton,
    name: apiCanton.descripcion,
    code: apiCanton.descripcion.substring(0, 3).toUpperCase(),
    province_id: apiCanton.idProvincia,
  }));
};

// Get districts by canton
export const getDistrictsByCanton = async (cantonId: number): Promise<District[]> => {
  const response = await fetch(`${API_BASE_URL}/cantones/${cantonId}/distritos?limit=100`);
  if (!response.ok) {
    throw new Error(`Error fetching districts: ${response.status}`);
  }
  const result = await response.json();

  return result.data.map((apiDistrict: ApiDistrict) => ({
    id: apiDistrict.idDistrito,
    name: apiDistrict.descripcion,
    code: apiDistrict.descripcion.substring(0, 3).toUpperCase(),
    canton_id: apiDistrict.idCanton,
  }));
};

// Search for location by name (useful for autocomplete)
export const searchLocation = async (query: string): Promise<{
  provinces: Province[];
  cantons: Canton[];
  districts: District[];
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Error searching location');
    }
    return await response.json();
  } catch {
    return { provinces: [], cantons: [], districts: [] };
  }
};
