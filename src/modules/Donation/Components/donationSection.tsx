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
      <section className="my-12 px-6 text-gray-800">
        <h2 className="text-orange-600 text-4xl sm:text-5xl lg:text-6xl text-center tracking-wide mt-40 mb-5">
          {data.header.titulo}
        </h2>
        <p className="text-neutral-700 max-w-3xl mx-auto text-center text-lg mb-12">
          {data.header.descripcion}
        </p>

        {/* Tarjetas de inversión del dinero */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {data.cards.map((card, idx) => (
            <div key={idx} className="bg-white shadow-2xl rounded-xl overflow-hidden flex flex-col">
              <img
                src={card.URL_imagen || fallbackImg}
                alt={card.titulo_card}
                className="w-full h-48 object-cover"
              />
              <div className="p-6 text-center flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{card.titulo_card}</h3>
                  <p className="text-sm text-gray-600 mb-4">{card.descripcion_card}</p>
                </div>
                <a
                  href="/donaciones/formulario"
                  className="mt-auto bg-orange-500 text-white py-2 px-4 rounded-full border hover:bg-orange-600 transition"
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
    <section className="my-12 px-6 text-gray-800">
      <h2 className="text-orange-600 text-4xl sm:text-5xl lg:text-6xl text-center tracking-wide mt-40 mb-5">
        {data?.header?.titulo || fallbackData.header.titulo}
      </h2>
      <p className="text-neutral-700 max-w-3xl mx-auto text-center text-lg mb-12">
        {data?.header?.descripcion || fallbackData.header.descripcion}
      </p>

      {/* Tarjetas de inversión del dinero */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        {(data?.cards || fallbackData.cards).map((card, idx) => (
          <div key={idx} className="bg-white shadow-2xl rounded-xl overflow-hidden flex flex-col">
            <img
              src={card.URL_imagen || fallbackImg}
              alt={card.titulo_card}
              className="w-full h-48 object-cover"
            />
            <div className="p-6 text-center flex-grow flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">{card.titulo_card}</h3>
                <p className="text-sm text-gray-600 mb-4">{card.descripcion_card}</p>
              </div>
              <a
                href="/donaciones/formulario"
                className="mt-auto bg-orange-500 text-white py-2 px-4 rounded-full border hover:bg-orange-600 transition"
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