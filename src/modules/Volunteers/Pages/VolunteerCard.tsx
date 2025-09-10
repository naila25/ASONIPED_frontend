import quienessomos from "../../../assets/quienessomos.png";
import { useState, useEffect } from 'react';
import VolunteerModal from '../Components/VolunteerModal';
import { fetchVolunteerOptions } from '../Services/fetchVolunteers';
import type { VolunteerOption } from '../Types/volunteer';

interface VolunteerCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  location: string;
}

const VolunteerCard = ({
  id,
  title,
  description,
  imageUrl,
  date,
  location,
}: VolunteerCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span className="mr-4">{date}</span>
            <span>{location}</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="text-white w-full bg-gradient-to-r from-orange-400 to-orange-700 py-2 rounded hover:bg-orange-600 transition-colors hover:opacity-90"
          >
            Ver más
          </button>
        </div>
      </div>

      <VolunteerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        volunteer={{
          id,
          title,
          description,
          imageUrl,
          date,
          location,
        }}
      />
    </>
  );
};

const Voluntariados = () => {
  const [volunteers, setVolunteers] = useState<VolunteerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch volunteer options from backend
  useEffect(() => {
    const loadVolunteers = async () => {
      try {
        setLoading(true);
        const options = await fetchVolunteerOptions();
        setVolunteers(Array.isArray(options) ? options : []);
        setError(null);
      } catch (err) {
        setError('Error al cargar las oportunidades de voluntariado');
        setVolunteers([]);
      } finally {
        setLoading(false);
      }
    };

    loadVolunteers();
  }, []);

  return (
    <div className="w-full">
      {/* Hero con imagen de fondo */}
      <div
        className="relative h-72 flex items-center justify-center"
        style={{
          backgroundImage: `url(${quienessomos})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <h1 className="relative text-4xl md:text-5xl font-bold text-white text-center">
          Voluntariados Disponibles
        </h1>
      </div>

      {/* Descripción centrada */}
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <p className="text-lg text-gray-700">
          En ASONIPED creemos que el voluntariado es una forma poderosa de
          construir comunidad, solidaridad y oportunidades para todos.
          <br />
          Aquí podrás conocer los programas y áreas en las que actualmente
          necesitamos apoyo, así como enviar tu solicitud para ser parte del
          equipo de voluntariado.
        </p>
      </div>

      {/* Áreas de voluntariado */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-4xl font-bold text-center text-orange-500 mb-8 tracking-wide ">
          Áreas de voluntariado en ASONIPED
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando oportunidades de voluntariado...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg">{error}</p>
          </div>
        ) : volunteers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No hay oportunidades de voluntariado disponibles en este momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {volunteers.map((volunteer) => (
              <VolunteerCard key={volunteer.id} {...volunteer} />
            ))}
          </div>
        )}
      </div>

      {/* Bloque final con formulario */}
      <div className="bg-gray-200 py-12 px-6 mt-12">
        <h2 className="text-2xl font-bold text-center mb-8">
          ¿Quieres proponer un voluntariado?
        </h2>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Información lado izquierdo */}
          <div className="text-gray-700 space-y-4">
            <p>
              Si deseas formar parte del voluntariado en ASONIPED, puedes enviar
              tu solicitud directamente desde la plataforma. Nuestro equipo
              revisará tu propuesta y te contactará para guiarte en el proceso
              de integración.
            </p>
          </div>

          {/* Formulario lado derecho */}
          <div className="bg-white shadow-lg rounded-2xl p-6">
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Nombre completo"
                className="w-full p-3 border rounded-lg"
              />
              <input
                type="email"
                placeholder="Correo electrónico"
                className="w-full p-3 border rounded-lg"
              />
              <textarea
                placeholder="Cuéntanos por qué quieres ser voluntario"
                rows={4}
                className="w-full p-3 border rounded-lg"
              ></textarea>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Enviar solicitud
              </button>
            </form>
          </div>
        </div>

        {/* Texto motivador abajo */}
        <div className="max-w-3xl mx-auto mt-8 text-center text-gray-700">
          <p>
            👉 Ser voluntario en ASONIPED significa aportar tu tiempo y energía
            para transformar vidas, pero también crecer en experiencia, empatía
            y liderazgo.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Voluntariados;