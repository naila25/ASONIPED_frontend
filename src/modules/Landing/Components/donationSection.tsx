import  { useState, useEffect } from 'react';
import { donationService, type DonationSection } from '../../Dashboards/Services/donationService';
import fallbackImg from '../../../assets/fondoasoniped.jpg';

const DonationSection = () => {
  const [donationData, setDonationData] = useState<DonationSection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDonationsData();
  }, []);

  const loadDonationsData = async () => {
    try {
      setLoading(true);
      const data = await donationService.getSection();
      setDonationData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading donations data');
    } finally {
      setLoading(false);
    }
  };

  const fallbackData: DonationSection = {
    header: {
      titulo: "¿Por qué ayudar a ASONIPED?",
      descripcion: "Las donaciones permiten ofrecer paseos recreativos a los niños, renovar el mobiliario y mantener en buen estado las instalaciones de la organización.",
    },
    cards: [
      {
        titulo_card: "Paseos y actividades",
        descripcion_card: "Creamos experiencias recreativas para que los chicos disfruten y creen recuerdos inolvidables fuera del aula.",
        URL_imagen: fallbackImg,
        texto_boton: "Quiero donar",
        color_boton: "#ff6600"
      },
      {
        titulo_card: "Compra de pupitres",
        descripcion_card: "Renovamos el mobiliario para garantizar un espacio cómodo y digno para estudiar.",
        URL_imagen: fallbackImg,
        texto_boton: "Quiero donar",
        color_boton: "#ff6600"
      },
      {
        titulo_card: "Mantenimiento institucional",
        descripcion_card: "Contribuyes al buen funcionamiento de ASONIPED, asegurando espacios limpios y adecuados.",
        URL_imagen: fallbackImg,
        texto_boton: "Quiero donar",
        color_boton: "#ff6600"
      }
    ]
  };

  if (loading) {
    return (
      <section className="w-full py-20 bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-xl text-gray-600">Cargando...</div>
      </section>
    );
  }

  if (error && !donationData) {
    const data = fallbackData;
    return (
      <section className="w-full py-20 bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-orange-600 mb-4">
            {data.header.titulo}
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            {data.header.descripcion}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {data.cards.map((card, idx) => (
            <div key={idx} className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col items-center">
              <img
                src={card.URL_imagen || fallbackImg}
                alt={card.titulo_card}
                className="w-full h-40 object-cover"
              />
              <div className="p-6 flex-1 flex flex-col justify-between w-full">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">{card.titulo_card}</h3>
                <p className="text-gray-700 mb-4 text-center">{card.descripcion_card}</p>
                <a
                  href="/donaciones/formulario"
                  className="w-full py-2 font-bold text-white rounded transition text-center block"
                  style={{
                    backgroundColor: card.color_boton,
                  }}
                >
                  {card.texto_boton}
                </a>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center text-red-500">{error}</div>
      </section>
    );
  }

  const data = donationData || fallbackData;

  return (
    <section className="w-full py-20 bg-gray-50">
      <div className="text-center mb-12">
        <h2 className="text-4xl sm:text-5xl font-bold text-orange-600 mb-4">
          {data?.header?.titulo || fallbackData.header.titulo}
        </h2>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          {data?.header?.descripcion || fallbackData.header.descripcion}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {(data?.cards || fallbackData.cards).map((card, idx) => (
          <div key={idx} className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col items-center">
            <img
              src={card.URL_imagen || fallbackImg}
              alt={card.titulo_card}
              className="w-full h-40 object-cover"
            />
            <div className="p-6 flex-1 flex flex-col justify-between w-full">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">{card.titulo_card}</h3>
              <p className="text-gray-700 mb-4 text-center">{card.descripcion_card}</p>
              <a
                href="/donaciones/formulario"
                className="w-full py-2 font-bold text-white rounded transition text-center block"
                style={{
                  backgroundColor: card.color_boton,
                }}
              >
                {card.texto_boton}
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DonationSection;