import quienessomos from "../../../assets/quienessomos.png";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import VolunteerModal from "../Components/VolunteerModal";
import { fetchVolunteerOptions } from "../Services/fetchVolunteers";
import type { VolunteerOption } from "../Types/volunteer";

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
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {description}
          </p>
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
        setError("Error al cargar las oportunidades de voluntariado");
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
        <h1 className="relative text-4xl sm:text-5xl lg:text-6xl font-semibold text-white z-10 tracking-wide">
          Voluntariados Disponibles
        </h1>
      </div>

      {/* Descripción centrada */}
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <p className="text-lg text-neutral-700">
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
        <h2 className="text-orange-600 text-4xl text-center font-semibold mb-20">
          Áreas de voluntariado en ASONIPED
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              Cargando oportunidades de voluntariado...
            </p>
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
<motion.div
  className="w-full max-w-6xl bg-white border border-gray-200 rounded-xl shadow-xl p-10 mb-12 mt-16 mx-auto"
  initial={{ opacity: 0, y: 100 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8, ease: "easeOut" }}
  viewport={{ once: true, amount: 0.2 }}
>
  <h2 className="text-center text-3xl font-extrabold text-orange-600 mb-6">
    ¿No encontraste un voluntariado para ti?
  </h2>

  {/* Texto introductorio */}
  <p className="max-w-2xl mx-auto text-center text-neutral-700 mb-20">
    En ASONIPED también recibimos propuestas nuevas. Completa este 
    formulario para contarnos tu idea o área de interés, y nuestro equipo se pondrá en 
    contacto contigo para valorar cómo integrarla.
  </p>

  <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 items-start">
    {/* Preguntas frecuentes estilo acordeón */}
    <div>
      <h3 className="text-xl font-bold text-black mb-6">Preguntas frecuentes</h3>

      <div className="space-y-4">
        <details className="group rounded-lg px-4 py-3">
          <summary className="flex justify-between items-center cursor-pointer font-semibold text-gray-800">
            ¿Qué pasa si no encuentro un voluntariado que se ajuste a mí?
            <span className="transition-transform group-open:rotate-180">⌄</span>
          </summary>
          <p className="mt-2 text-gray-700">
            Puedes proponernos una nueva iniciativa a través de este formulario y nuestro equipo la revisará.
          </p>
        </details>

        <details className="group rounded-lg px-4 py-3">
          <summary className="flex justify-between items-center cursor-pointer font-semibold text-gray-800">
            ¿Puedo combinar mi propuesta con programas ya existentes?
            <span className="transition-transform group-open:rotate-180">⌄</span>
          </summary>
          <p className="mt-2 text-gray-700">
            Sí, en muchos casos podemos adaptar o vincular tu idea con los voluntariados que ya tenemos.
          </p>
        </details>

        <details className="group rounded-lg px-4 py-3">
          <summary className="flex justify-between items-center cursor-pointer font-semibold text-gray-800">
            ¿Qué tipo de propuestas aceptan?
            <span className="transition-transform group-open:rotate-180">⌄</span>
          </summary>
          <p className="mt-2 text-gray-700">
            Aceptamos propuestas relacionadas con educación, apoyo comunitario, inclusión, formación y más.
          </p>
        </details>

        <details className="group rounded-lg px-4 py-3">
          <summary className="flex justify-between items-center cursor-pointer font-semibold text-gray-800">
            ¿Mi propuesta será aprobada automáticamente?
            <span className="transition-transform group-open:rotate-180">⌄</span>
          </summary>
          <p className="mt-2 text-gray-700">
            No. Nuestro equipo revisará tu solicitud y te dará respuesta sobre su viabilidad y próximos pasos.
          </p>
        </details>
      </div>
    </div>

    {/* Formulario lado derecho */}
    <form className="text-black grid grid-cols-1 gap-4 bg-white">
      <input
        type="text"
        placeholder="Nombre completo"
        className="w-full border border-gray-300 rounded px-4 py-2"
      />
      <input
        type="email"
        placeholder="Correo electrónico"
        className="w-full border border-gray-300 rounded px-4 py-2"
      />
      <textarea
        placeholder="Cuéntanos tu propuesta o interés"
        rows={4}
        className="w-full border border-gray-300 rounded px-4 py-2"
      ></textarea>
      <button
        type="submit"
        className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-500 transition self-start"
      >
        Enviar solicitud
      </button>
    </form>
  </div>

  {/* Texto motivador abajo */}
  <div className="max-w-3xl mx-auto mt-8 text-center text-gray-700">
    <p>
      👉 Ser voluntario en ASONIPED significa aportar tu tiempo y energía
      para transformar vidas, pero también crecer en experiencia, empatía
      y liderazgo.
    </p>
  </div>
</motion.div>
</div>
  );
};

export default Voluntariados;
