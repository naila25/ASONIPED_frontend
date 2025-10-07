import quienessomos from "../../../assets/quienessomos.png";
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import VolunteerModal from "../Components/VolunteerModal";
import { fetchVolunteerOptions } from "../Services/fetchVolunteers";
import type { VolunteerOption } from "../Types/volunteer";
import { FaRegCalendarAlt, FaCheckCircle, FaArrowRight, FaClock, FaUsers } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { submitVolunteerProposal } from "../Services/fetchVolunteers";
import { formatTime12Hour } from "../../../shared/Utils/timeUtils";

interface VolunteerCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  location: string;
  skills?: string;
  tools?: string;
  hour?: string;
  spots?: number;
  available_spots?: number;
  registered_count?: number;
  is_registered?: boolean;
}

const VolunteerCard = ({
  id,
  title,
  description,
  imageUrl,
  date,
  location,
  skills,
  tools,
  hour,
  spots,
  available_spots,
  registered_count,
  is_registered,
}: VolunteerCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const displayImageUrl = imageUrl?.startsWith('http') ? imageUrl : `http://localhost:3000${imageUrl}`;

  return (
    <>
      <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow flex flex-col h-full">
        <img
          src={displayImageUrl}
          alt={title}
          className="w-full h-48 object-cover rounded-t-lg flex-shrink-0"
        />
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">{title}</h3>
          <p className="text-neutral-700 text-sm mb-4 line-clamp-3 flex-grow">
            {description}
          </p>
          <div className="flex flex-col text-sm text-neutral-700 mb-4 space-y-2 flex-shrink-0">
            <span className="flex items-center">
              <FaRegCalendarAlt className="w-4 h-4 mr-2 text-gray-800" />
              {date}
            </span>
            {hour && (
              <span className="flex items-center">
                <FaClock className="w-4 h-4 mr-2 text-gray-800" />
                {formatTime12Hour(hour)}
              </span>
            )}
            <span className="flex items-center">
              <MdLocationOn className="w-4 h-4 mr-2 text-gray-800" />
              {location}
            </span>
            {available_spots !== undefined ? (
              <span className="flex items-center">
                <FaUsers className="w-4 h-4 mr-2 text-gray-800" />
                <span className={available_spots > 0 ? 'text-green-600' : 'text-red-600'}>
                  {available_spots}
                </span>
                <span className="text-gray-600 ml-1">
                  / {spots} cupos disponibles
                </span>
              </span>
            ) : spots && (
              <span className="flex items-center">
                <FaUsers className="w-4 h-4 mr-2 text-gray-800" />
                {spots} cupos disponibles
              </span>
            )}
          </div>

          <div className="flex justify-center items-center mt-auto">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-500 transition"
            >
              Ver más
            </button>
          </div>
        </div>
      </div>

      <VolunteerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        volunteer={{
          id,
          title,
          description,
          imageUrl: displayImageUrl,
          date,
          location,
          skills,
          tools,
          hour,
          spots,
          available_spots,
          registered_count,
          is_registered,
        }}
      />
    </>
  );
};

const Voluntariados = () => {
  const [volunteers, setVolunteers] = useState<VolunteerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [proposalSubmitted, setProposalSubmitted] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // proposal form state
  const [pTitle, setPTitle] = useState("");
  const [pProposal, setPProposal] = useState("");
  const [pLocation, setPLocation] = useState("");
  const [pDate, setPDate] = useState("");
  const [pTools, setPTools] = useState("");
  const [pHour, setPHour] = useState("");
  const [pSpots, setPSpots] = useState("1");
  const [pFile, setPFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");

  // Fetch volunteer options from backend - refreshes on every mount
  useEffect(() => {
    const loadVolunteers = async () => {
      try {
        setLoading(true);
        const options = await fetchVolunteerOptions();
        setVolunteers(Array.isArray(options) ? options : []);
        setError(null);
        setCurrentPage(1); // Reset to first page when data loads
    } catch {
      setError("Error al cargar las oportunidades de voluntariado");
      setVolunteers([]);
    } finally {
        setLoading(false);
      }
    };

    loadVolunteers();
  }, []); // Empty dependency array means this runs on every mount

  // Pagination calculations
  const totalPages = Math.ceil(volunteers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVolunteers = volunteers.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of volunteer section when page changes
    const volunteerSection = document.getElementById('volunteer-section');
    if (volunteerSection) {
      volunteerSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const handleProposalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    
    // Validation - Check required fields
    if (!pTitle.trim()) {
      alert("El título del voluntariado es requerido");
      return;
    }
    if (!pProposal.trim()) {
      alert("La descripción de la propuesta es requerida");
      return;
    }
    if (!pLocation.trim()) {
      alert("La ubicación es requerida");
      return;
    }
    if (!pDate.trim()) {
      alert("La fecha del voluntariado es requerida");
      return;
    }
    if (!pTools.trim()) {
      alert("Las herramientas necesarias son requeridas");
      return;
    }
    if (!pHour.trim()) {
      alert("La hora del voluntariado es requerida");
      return;
    }
    if (!pSpots.trim()) {
      alert("Los cupos disponibles son requeridos");
      return;
    }
    
    // Character limit validation
    if (pTitle.length > 100) {
      alert("El título no puede exceder 100 caracteres");
      return;
    }
    if (pProposal.length > 500) {
      alert("La propuesta no puede exceder 500 caracteres");
      return;
    }
    if (pLocation.length > 100) {
      alert("La ubicación no puede exceder 100 caracteres");
      return;
    }
    if (pTools.length > 500) {
      alert("Las herramientas no pueden exceder 500 caracteres");
      return;
    }
    if (pDate) {
      // Validate DD/MM/YYYY format
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      const match = pDate.match(dateRegex);
      
      if (!match) {
        alert("Por favor ingresa la fecha en formato DD/MM/YYYY");
        return;
      }
      
      const day = parseInt(match[1]);
      const month = parseInt(match[2]);
      const year = parseInt(match[3]);
      
      // Validate date values
      if (day < 1 || day > 31 || month < 1 || month > 12) {
        alert("Por favor ingresa una fecha válida");
        return;
      }
      
      const inputDate = new Date(year, month - 1, day);
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      const inputDateString = inputDate.toISOString().split('T')[0];
      
      if (inputDateString < todayString) {
        alert("La fecha del voluntariado no puede ser anterior a hoy");
        return;
      }
    }
    
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("title", pTitle);
      formData.append("proposal", pProposal);
      formData.append("location", pLocation);
      formData.append("date", pDate);
      formData.append("tools", pTools);
      formData.append("hour", pHour);
      formData.append("spots", pSpots);
      if (pFile) formData.append("document", pFile);

      await submitVolunteerProposal(formData);
      setPTitle("");
      setPProposal("");
      setPLocation("");
      setPDate("");
      setPTools("");
      setPHour("");
      setPSpots("");
      setPFile(null);
      setFileName("");
      setProposalSubmitted(true);
    } catch {
      alert("No se pudo enviar la propuesta. Inténtalo nuevamente.");
    } finally {
      setSubmitting(false);
    }
  };

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
      <div id="volunteer-section" className="max-w-7xl p-2 mb-12 mt-16 mx-auto">
        <div className=" text-center items-center mb-6">

          <h2 className="text-orange-600 text-4xl font-semibold">
            Áreas de voluntariado en ASONIPED
          </h2>
        </div>

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
          <>
            {/* Pagination Info */}
            <div className="mb-6 text-center">
              <p className="text-gray-600">
                Mostrando {startIndex + 1} - {Math.min(endIndex, volunteers.length)} de {volunteers.length} oportunidades
              </p>
            </div>

            {/* Volunteer Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {currentVolunteers.map((volunteer) => (
                <VolunteerCard 
                  key={volunteer.id} 
                  {...volunteer}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                {/* Previous Button */}
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  Anterior
                </button>

                {/* Page Numbers */}
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <h2 className="text-center text-3xl font-extrabold text-orange-600 mb-6 mt-20">
          ¿No encontraste un voluntariado para ti?
        </h2>

        {/* Texto introductorio */}
        <p className="max-w-2xl mx-auto text-center text-neutral-700">
          En ASONIPED también recibimos propuestas nuevas. Completa este
          formulario para contarnos tu idea o área de interés, y nuestro equipo
          se pondrá en contacto contigo para valorar cómo integrarla.
        </p>

      {/* Bloque final con formulario */}
      <div
        className="w-full max-w-7xl bg-white border border-gray-200 rounded-xl shadow-xl p-10 mb-12 mt-16 mx-auto"
      >
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 items-start">
          {/* Preguntas frecuentes */}
          <div>
            <h3 className="text-xl font-bold text-black mb-6">
              Preguntas frecuentes
            </h3>
            <div className="space-y-4">
              <details className="group rounded-lg px-4 py-3">
                <summary className="flex justify-between items-center cursor-pointer font-semibold text-gray-800">
                  ¿Qué pasa si no encuentro un voluntariado que se ajuste a mí?
                  <span className="transition-transform group-open:rotate-180">
                    ⌄
                  </span>
                </summary>
                <p className="mt-2 text-gray-700">
                  Puedes proponernos una nueva iniciativa a través de este
                  formulario y nuestro equipo la revisará.
                </p>
              </details>

              <details className="group rounded-lg px-4 py-3">
                <summary className="flex justify-between items-center cursor-pointer font-semibold text-gray-800">
                  ¿Qué tipo de propuestas aceptan?
                  <span className="transition-transform group-open:rotate-180">
                    ⌄
                  </span>
                </summary>
                <p className="mt-2 text-gray-700">
                  Aceptamos propuestas relacionadas con educación, apoyo
                  comunitario, inclusión, formación y más.
                </p>
              </details>

              <details className="group rounded-lg px-4 py-3">
                <summary className="flex justify-between items-center cursor-pointer font-semibold text-gray-800">
                  ¿Mi propuesta será aprobada automáticamente?
                  <span className="transition-transform group-open:rotate-180">
                    ⌄
                  </span>
                </summary>
                <p className="mt-2 text-gray-700">
                  No. Nuestro equipo revisará tu solicitud y te dará respuesta
                  sobre su viabilidad y próximos pasos.
                </p>
              </details>
            </div>
          </div>

          {/* Formulario lado derecho */}
          {proposalSubmitted ? (
            <div className="text-black bg-white p-8 rounded-lg text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Propuesta Enviada Exitosamente!
              </h3>
              <p className="text-gray-600 mb-6">
                Tu propuesta de voluntariado ha sido enviada. Nuestro equipo la revisará y te contactaremos pronto.
              </p>
              <div className="space-y-3">
                <Link
                  to="/user/voluntariado"
                  className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  <FaRegCalendarAlt className="w-4 h-4" />
                  Ver Mis Voluntariados
                  <FaArrowRight className="w-4 h-4" />
                </Link>
                <div>
                  <button
                    onClick={() => setProposalSubmitted(false)}
                    className="text-gray-500 hover:text-gray-700 text-sm underline"
                  >
                    Enviar otra propuesta
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleProposalSubmit} className="text-black grid grid-cols-1 gap-4 bg-white">
              <h3 className="text-xl font-bold text-orange-600 mb-2">
                Deja tu voluntariado
              </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del voluntariado *
              </label>
              <input
                type="text"
                placeholder="Nombre del voluntariado"
                className="w-full border border-gray-300 rounded px-4 py-2"
                value={pTitle}
                onChange={(e) => setPTitle(e.target.value)}
                maxLength={100}
              />
              <div className="flex justify-between text-xs mt-1">
                <span className={pTitle.length > 90 ? 'text-red-500' : pTitle.length > 80 ? 'text-yellow-500' : 'text-gray-500'}>
                  {pTitle.length}/100
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Qué propones? *
              </label>
              <textarea
                placeholder="¿Qué propones?"
                className="w-full border border-gray-300 rounded px-4 py-2"
                value={pProposal}
                onChange={(e) => setPProposal(e.target.value)}
                maxLength={500}
                rows={4}
              ></textarea>
              <div className="flex justify-between text-xs mt-1">
                <span className={pProposal.length > 250 ? 'text-red-500' : pProposal.length > 200 ? 'text-yellow-500' : 'text-gray-500'}>
                  {pProposal.length}/500
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ¿Dónde será? *
              </label>
              <input
                type="text"
                placeholder="¿Dónde será?"
                className="w-full border border-gray-300 rounded px-4 py-2"
                value={pLocation}
                onChange={(e) => setPLocation(e.target.value)}
                maxLength={100}
              />
              <div className="flex justify-between text-xs mt-1">
                <span className={pLocation.length > 90 ? 'text-red-500' : pLocation.length > 80 ? 'text-yellow-500' : 'text-gray-500'}>
                  {pLocation.length}/100
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha del voluntariado *
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded px-4 py-2"
                value={pDate ? new Date(pDate.split('/').reverse().join('-')).toISOString().split('T')[0] : ''}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  const selectedDate = e.target.value;
                  if (selectedDate) {
                    // Convert from YYYY-MM-DD to DD/MM/YYYY format
                    const [year, month, day] = selectedDate.split('-');
                    const formattedDate = `${day}/${month}/${year}`;
                    setPDate(formattedDate);
                  } else {
                    setPDate('');
                  }
                }}
              />
            </div>

            {/* New fields: Hour and Spots */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora del Voluntariado *
                </label>
                <input
                  type="time"
                  className="w-full border border-gray-300 rounded px-4 py-2"
                  value={pHour}
                  onChange={(e) => setPHour(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cupos Disponibles *
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded px-4 py-2"
                  value={pSpots}
                  onChange={(e) => setPSpots(e.target.value)}
                  min="1"
                  max="999"
                  placeholder="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Herramientas o materiales necesarios *
              </label>
              <textarea
                placeholder="Herramientas o materiales necesarios"
                className="w-full border border-gray-300 rounded px-4 py-2"
                value={pTools}
                onChange={(e) => setPTools(e.target.value)}
                maxLength={500}
                rows={3}
              ></textarea>
              <div className="flex justify-between text-xs mt-1">

                <span className={pTools.length > 270 ? 'text-red-500' : pTools.length > 240 ? 'text-yellow-500' : 'text-gray-500'}>
                  {pTools.length}/500
                </span>
              </div>
            </div>

            {/* Texto explicativo antes de adjuntar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Documento adjunto (Opcional)
              </label>
              <p className="text-sm text-gray-600 mb-2">
                Adjunta un documento que nos ayude a conocerte mejor, como tu
                currículum, título académico o una referencia profesional.
              </p>

              <div>
              <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-gray-500 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-4-4l-4 4m0 0l-4-4m4 4V10"
                  />
                </svg>
                <span className="text-gray-600">Adjuntar archivo</span>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setPFile(file);
                    setFileName(file ? file.name : "");
                  }} 
                />
              </label>
              {fileName && (
                <div className="mt-2 text-sm text-green-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {fileName}
                </div>
              )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-500 transition self-start disabled:opacity-60"
            >
              {submitting ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </form>
          )}
        </div>
      </div>
       {/* Texto motivador abajo */}
        <div className="max-w-3xl mx-auto mt-8 text-center text-neutral-700 mb-20 ">
          <p>
            👉 Ser voluntario en ASONIPED significa aportar tu tiempo y energía
            para transformar vidas, pero también crecer en experiencia, empatía
            y liderazgo.
          </p>
        </div>
    </div>
  );
};

export default Voluntariados;
