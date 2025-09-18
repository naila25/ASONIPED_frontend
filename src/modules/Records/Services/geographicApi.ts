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
  try {
    console.log('Fetching provinces...');
    const response = await fetch(`${API_BASE_URL}/provincias?limit=100`);
    if (!response.ok) {
      throw new Error(`Error fetching provinces: ${response.status}`);
    }
    const result = await response.json();
    console.log('API response:', result);
    console.log(`API returned ${result.data.length} provinces`);
    console.log('Meta info:', result.meta);
    
    // Transform API response to our format
    const provinces: Province[] = result.data.map((apiProvince: ApiProvince) => ({
      id: apiProvince.idProvincia,
      name: apiProvince.descripcion,
      code: apiProvince.descripcion.substring(0, 2).toUpperCase() // Generate code from first 2 letters
    }));
    
    console.log('Transformed provinces:', provinces);
    return provinces;
  } catch (error) {
    console.error('Error fetching provinces:', error);
    throw error; // Re-throw to let the component handle it
  }
};

// Get cantons by province
export const getCantonsByProvince = async (provinceId: number): Promise<Canton[]> => {
  try {
    console.log(`Fetching cantons for province ${provinceId}...`);
    
    // Try to get all cantons by using a high limit or pagination
    const response = await fetch(`${API_BASE_URL}/provincias/${provinceId}/cantones?limit=100`);
    if (!response.ok) {
      throw new Error(`Error fetching cantons: ${response.status}`);
    }
    const result = await response.json();
    console.log('API response:', result);
    console.log(`API returned ${result.data.length} cantons for province ${provinceId}`);
    console.log('Meta info:', result.meta);
    
    // Transform API response to our format
    const cantons: Canton[] = result.data.map((apiCanton: ApiCanton) => ({
      id: apiCanton.idCanton,
      name: apiCanton.descripcion,
      code: apiCanton.descripcion.substring(0, 3).toUpperCase(), // Generate code from first 3 letters
      province_id: apiCanton.idProvincia
    }));
    
    return cantons;
  } catch (error) {
    console.error('Error fetching cantons:', error);
    throw error; // Re-throw to let the component handle it
  }
};

// Get districts by canton
export const getDistrictsByCanton = async (cantonId: number): Promise<District[]> => {
  try {
    console.log(`Fetching districts for canton ${cantonId}...`);
    
    // Try to get all districts by using a high limit or pagination
    const response = await fetch(`${API_BASE_URL}/cantones/${cantonId}/distritos?limit=100`);
    if (!response.ok) {
      throw new Error(`Error fetching districts: ${response.status}`);
    }
    const result = await response.json();
    console.log('API response:', result);
    console.log(`API returned ${result.data.length} districts for canton ${cantonId}`);
    console.log('Meta info:', result.meta);
    
    // Transform API response to our format
    const districts: District[] = result.data.map((apiDistrict: ApiDistrict) => ({
      id: apiDistrict.idDistrito,
      name: apiDistrict.descripcion,
      code: apiDistrict.descripcion.substring(0, 3).toUpperCase(), // Generate code from first 3 letters
      canton_id: apiDistrict.idCanton
    }));
    
    return districts;
  } catch (error) {
    console.error('Error fetching districts:', error);
    throw error; // Re-throw to let the component handle it
  }
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
  } catch (error) {
    console.error('Error searching location:', error);
    return { provinces: [], cantons: [], districts: [] };
  }
};
