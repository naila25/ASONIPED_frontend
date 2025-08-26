
import { useState } from 'react';
import { Map, Marker, Overlay } from 'pigeon-maps';

const LocationMap = () => {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="mt-20 tracking-wide">
     
      <h2 className="text-2xl sm:text-4xl lg:text-5xl text-center font-bold text-orange-500 mb-10 tracking-wide mt-10">
        Nuestra ubicación
      </h2>

      {/* Contenedor del mapa */}
      <div className="flex justify-center mb-25">
        <div className="w-full max-w-5xl bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <Map
            height={450}
            defaultCenter={[10.14601, -85.45791]}
            defaultZoom={14}
            
          >
            <Marker
              anchor={[10.14601, -85.45791]}
              width={60}
              onClick={() => setShowPopup(!showPopup)} 
            />
            {showPopup && (
              <Overlay anchor={[10.14601, -85.45791]} offset={[120, 40]}>
                <div className="bg-white border border-gray-300 shadow-md rounded-md px-3 py-1 text-sm text-gray-700 font-semibold">
                  <p className="font-semibold">ASONIPED</p>
                  <p className="text-gray-500 text-xs">Nicoya, Guanacaste, Costa Rica</p>
                </div>
                
              </Overlay>
            )}
          </Map>
        </div>
      </div>
    </div>
  );
};

export default LocationMap;
