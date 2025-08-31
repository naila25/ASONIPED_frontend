import { useState } from 'react';
import { Map, Marker, Overlay } from 'pigeon-maps';
import { FaPlus, FaMinus, FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const LocationMap = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [center, setCenter] = useState<[number, number]>([10.14601, -85.45791]);
  const [zoom, setZoom] = useState(14);

  // Funciones para mover el mapa
  const move = (direction: string) => {
    const step = 0.003; 
    if (direction === "up") setCenter([center[0] + step, center[1]]);
    if (direction === "down") setCenter([center[0] - step, center[1]]);
    if (direction === "left") setCenter([center[0], center[1] - step]);
    if (direction === "right") setCenter([center[0], center[1] + step]);
  };

  return (
    <div className="mt-20 tracking-wide">
      <h2 className="text-orange-600 text-4xl sm:text-5xl lg:text-6xl text-center mb-10 tracking-wide mt-10 ">
        Nuestra ubicación
      </h2>

      {/* Contenedor del mapa */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-5xl bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 mb-25">
          <Map
            height={450}
            center={center}
            zoom={zoom}
            onBoundsChanged={({ center, zoom }) => {
              setCenter(center);
              setZoom(zoom);
            }}
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

          {/* Controles de Zoom */}
          <div className="absolute top-5 left-3 flex flex-col items-center space-y-2">
            <button
              onClick={() => setZoom(zoom + 1)}
              className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 shadow rounded-md hover:bg-gray-100"
            >
              <FaPlus className="text-black" />
            </button>
            <button
              onClick={() => setZoom(zoom - 1)}
              className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 shadow rounded-md hover:bg-gray-100"
            >
              <FaMinus className="text-black" />
            </button>
          </div>

          {/* Controles de navegación  */}
          <div className="absolute bottom-5 left-3 flex flex-col items-center space-y-2">
            <button
              onClick={() => move("up")}
              className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 shadow rounded-md hover:bg-gray-100"
            >
              <FaArrowUp className="text-black" />
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => move("left")}
                className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 shadow rounded-md hover:bg-gray-100"
              >
                <FaArrowLeft className="text-black" />
              </button>
              <button
                onClick={() => move("right")}
                className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 shadow rounded-md hover:bg-gray-100"
              >
                <FaArrowRight className="text-black" />
              </button>
            </div>
            <button
              onClick={() => move("down")}
              className="w-10 h-10 flex items-center justify-center bg-white border border-gray-300 shadow rounded-md hover:bg-gray-100"
            >
              <FaArrowDown className="text-black" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationMap;
