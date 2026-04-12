import  { useState, useEffect } from 'react';
import { donationService, type DonationSection } from '../../Dashboards/Services/donationService';
import fallbackImg from '../../../assets/fondoasoniped.jpg';

const DonationSectionComponent = () => {
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

  if (loading) {
    return (
      <section className="w-full py-20 bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-xl text-gray-600">Cargando...</div>
      </section>
    );
  }

  if (error && !donationData) {
    return (
      <section className="w-full py-20 bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-lg text-red-600 text-center px-6">{error}</p>
      </section>
    );
  }

  if (!donationData) {
    return (
      <section className="w-full py-20 bg-gray-50 flex flex-col items-center justify-center">
        <p className="text-lg text-gray-600">No hay información de donaciones disponible.</p>
      </section>
    );
  }

  const data = donationData;

  return (
    <section className="my-12 text-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-orange-600 text-4xl sm:text-5xl lg:text-6xl text-center tracking-wide mt-40 mb-5">
          {data.header.titulo}
        </h2>
        <p className="text-neutral-700 max-w-3xl mx-auto text-center text-lg mb-12">
          {data.header.descripcion}
        </p>

        <div className="mb-12 w-full gap-8 flex overflow-x-auto space-x-4 px-4 scroll-smooth snap-x snap-mandatory sm:grid sm:grid-cols-2 sm:space-x-0 lg:grid-cols-3 sm:overflow-x-visible sm:px-0 justify-items-center">
          {data.cards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-lg overflow-hidden w-[320px] sm:w-[360px] shrink-0 snap-center flex flex-col border border-gray-200"
            >
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
                >
                  {card.texto_boton}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DonationSectionComponent;