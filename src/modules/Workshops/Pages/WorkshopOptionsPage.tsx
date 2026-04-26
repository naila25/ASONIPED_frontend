import React, { useEffect, useState } from 'react';
import type { Workshop } from '../Services/workshop';
import {
  getAllWorkshops,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop
} from '../Services/workshopService';
import { getAvailableSpots } from '../Services/workshopEnrollments';

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Image,
  FileText,
  Users,
  Clock,
  ClipboardList,
  XCircle,
} from 'lucide-react';
import AttendancePageHeader from '../../Attendance/Components/AttendancePageHeader';

interface FormState {
  titulo: string;
  descripcion: string;
  imagen: string;
  fecha: string;
  hora: string;
  ubicacion: string;
  materiales: string; // User input as string, converted to array on submit
  aprender: string;
  capacidad: string;
}

const blankForm: FormState = {
  titulo: '',
  descripcion: '',
  imagen: '',
  fecha: '',
  hora: '',
  ubicacion: '',
  materiales: '',
  aprender: '',
  capacidad: '',
};

const WorkshopOptionsPage: React.FC = () => {
  const remainingChars = (value: string | undefined, max: number) => max - (value?.length ?? 0);

  const LIMITS = {
    title: 255,
    location: 255,
    description: 4000,
    materiales: 4000,
    aprender: 4000,
    imageUrl: 1000,
    hour: 10,
  } as const;

  const [options, setOptions] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [workshopToDelete, setWorkshopToDelete] = useState<Workshop | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(blankForm);
  
  // Pagination state for card view
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    // Defer initial data loading to improve initial render
    const timer = setTimeout(() => {
      load();
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Format HH:MM (24h) to 12-hour AM/PM for display
  const formatHour12 = (hhmm?: string): string => {
    if (!hhmm) return '';
    try {
      const [h, m] = hhmm.split(':');
      const d = new Date();
      d.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return hhmm;
    }
  };

  // (Previously used for table view truncation; table view removed.)

  const getCapacitySummary = (workshop: Workshop) => {
    const total = workshop.capacidad;
    const available = workshop.available_spots;
    const enrolled = workshop.enrolled_count;

    if (typeof total === 'number' && typeof available === 'number') {
      return `${available}/${total} cupos disponibles`;
    }

    if (typeof total === 'number' && typeof enrolled === 'number') {
      const availableFromEnrolled = Math.max(total - enrolled, 0);
      return `${availableFromEnrolled}/${total} cupos disponibles`;
    }

    if (typeof total === 'number') {
      return `${total} cupos`;
    }

    return 'Capacidad no definida';
  };

  const load = async () => {
    try {
      setLoading(true);
      const list = await getAllWorkshops();

      // Enrich workshops with real-time occupancy when endpoint is available.
      const workshopsWithSpots = await Promise.all(
        list.map(async (workshop) => {
          try {
            const spots = await getAvailableSpots(workshop.id);
            return {
              ...workshop,
              available_spots:
                typeof spots?.available_spots === 'number'
                  ? spots.available_spots
                  : workshop.available_spots,
              enrolled_count:
                typeof spots?.enrolled_count === 'number'
                  ? spots.enrolled_count
                  : workshop.enrolled_count,
            };
          } catch {
            return workshop;
          }
        })
      );

      // Sort newest first by date (supports YYYY-MM-DD and DD/MM/YYYY)
      const getTime = (d: string) => {
        try {
          if (!d) return -Infinity;
          if (d.includes('/')) {
            const [day, month, year] = d.split('/');
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getTime();
          }
          const datePart = (d.includes('T') ? d.split('T')[0] : d.split(' ')[0]);
          const m = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
          if (m) return new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3])).getTime();
          const f = new Date(d);
          return isNaN(f.getTime()) ? -Infinity : f.getTime();
        } catch { return -Infinity; }
      };
      const sorted = [...workshopsWithSpots].sort((a, b) => {
        const tb = getTime(b.fecha as unknown as string);
        const ta = getTime(a.fecha as unknown as string);
        if (tb !== ta) return tb - ta;
        // Tie-breaker by id desc if available
        return (b.id || 0) - (a.id || 0);
      });
      setOptions(sorted);
      setError(null);
    } catch {
      setError('No se pudieron cargar las opciones');
    } finally {
      setLoading(false);
    }
  };

  // Filter options by search term
  const filtered = options.filter(o =>
    o.titulo.toLowerCase().includes(search.toLowerCase()) ||
    o.descripcion.toLowerCase().includes(search.toLowerCase()) ||
    o.ubicacion.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination calculations for card view
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOptions = filtered.slice(startIndex, endIndex);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

  // Reset pagination when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, imagen: e.target.value }));
  };

  const startAdd = () => {
    setForm(blankForm);
    setIsAdding(true);
    setEditingId(null);
    // setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  };

  const startEdit = (opt: Workshop) => {
    console.log('Editing workshop data:', opt); // Debug log
    setEditingId(opt.id);
    setIsAdding(false);
    
    setForm({
      titulo: opt.titulo,
      descripcion: opt.descripcion,
      imagen: opt.imagen,
      fecha: opt.fecha,
      hora: opt.hora || '',
      ubicacion: opt.ubicacion,
      materiales: Array.isArray(opt.materiales) ? opt.materiales.join(', ') : (opt.materiales || ''),
      aprender: opt.aprender || '',
      capacidad: opt.capacidad?.toString() || '',
    });
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  };

  const cancelModals = () => {
    setIsAdding(false);
    setEditingId(null);
    setForm(blankForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const validationError = (() => {
        const titulo = form.titulo.trim();
        const descripcion = form.descripcion.trim();
        const ubicacion = form.ubicacion.trim();
        const fecha = form.fecha?.trim();
        const hora = form.hora?.trim();
        const imagen = form.imagen?.trim();
        const materiales = form.materiales.trim();
        const aprender = form.aprender.trim();
        const capacidadStr = form.capacidad?.trim();

        if (!titulo) return 'El título es obligatorio.';
        if (titulo.length > LIMITS.title) return `El título no puede superar ${LIMITS.title} caracteres.`;

        if (!ubicacion) return 'La ubicación es obligatoria.';
        if (ubicacion.length > LIMITS.location) return `La ubicación no puede superar ${LIMITS.location} caracteres.`;

        if (!descripcion) return 'La descripción es obligatoria.';
        if (descripcion.length > LIMITS.description) return `La descripción no puede superar ${LIMITS.description} caracteres.`;

        if (materiales.length > LIMITS.materiales) return `Los materiales no pueden superar ${LIMITS.materiales} caracteres.`;
        if (aprender.length > LIMITS.aprender) return `El campo aprender no puede superar ${LIMITS.aprender} caracteres.`;

        if (!fecha) return 'La fecha es requerida.';

        if (!hora) return 'La hora es requerida.';
        if (hora.length > LIMITS.hour) return `La hora no puede superar ${LIMITS.hour} caracteres.`;
        if (!/^\d{2}:\d{2}$/.test(hora)) return 'La hora debe tener formato HH:MM.';

        if (!capacidadStr) return 'La capacidad es requerida.';
        const capNum = parseInt(capacidadStr, 10);
        if (isNaN(capNum) || capNum <= 0) return 'La capacidad debe ser un número mayor a 0';
        if (capNum > 999) return 'La capacidad no puede ser mayor a 999.';

        if (imagen) {
          if (imagen.length > LIMITS.imageUrl) return `La URL de la imagen no puede superar ${LIMITS.imageUrl} caracteres.`;
          try {
            const u = new URL(imagen);
            if (u.protocol !== 'http:' && u.protocol !== 'https:') return 'La URL de la imagen debe ser http(s).';
          } catch {
            return 'La URL de la imagen no es válida.';
          }
        }

        // Prevent past dates (allow today)
        try {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const inputDate = new Date(fecha);
          if (!isNaN(inputDate.getTime()) && inputDate < today) return 'La fecha no puede ser anterior a hoy';
        } catch {
          // ignore
        }

        return null;
      })();

      if (validationError) {
        setError(validationError);
        return;
      }

      const capNum = parseInt(form.capacidad, 10);

      const payload = {
        titulo: form.titulo,
        descripcion: form.descripcion,
        imagen: form.imagen,
        fecha: form.fecha,
        hora: form.hora,
        ubicacion: form.ubicacion,
        materiales: form.materiales.split(',').map(m => m.trim()).filter(m => m.length > 0),
        aprender: form.aprender,
        capacidad: capNum,
      };

      if (editingId) {
        await updateWorkshop(editingId, payload);
      } else {
        await createWorkshop(payload);
      }
      cancelModals();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando taller');
    }
  };

  const openDeleteModal = (workshop: Workshop) => {
    setWorkshopToDelete(workshop);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!workshopToDelete?.id) return;
    try {
      setIsDeleting(true);
      await deleteWorkshop(workshopToDelete.id);
      await load();
      setIsDeleteModalOpen(false);
      setWorkshopToDelete(null);
    } catch {
      alert('Error eliminando');
    } finally {
      setIsDeleting(false);
    }
  };

  const pageHeaderActions = (
    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative w-full min-w-[12rem] sm:w-72">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar opciones..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
      <button
        type="button"
        onClick={startAdd}
        className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-teal-500 px-4 py-2 text-white transition-colors hover:bg-teal-600"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Nueva Opción</span>
        <span className="sm:hidden">Nuevo</span>
      </button>
    </div>
  );

  // Show skeleton UI instead of full loading screen for better perceived performance
  if (loading && options.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AttendancePageHeader
          accent="teal"
          icon={<ClipboardList className="h-6 w-6" />}
          title="Opciones de talleres"
          description="Administra los talleres publicados, cupos y detalles para inscripciones."
          actions={pageHeaderActions}
          showSubNav={false}
        />
        <div className="mx-auto max-w-8xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-6 min-w-0">
            <div className="rounded-lg bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-20 flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <div className="h-6 w-64 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                  <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
                  <div className="h-10 w-48 animate-pulse rounded bg-gray-200" />
                  <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AttendancePageHeader
          accent="teal"
          icon={<ClipboardList className="h-6 w-6" />}
          title="Opciones de talleres"
          description="Administra los talleres publicados, cupos y detalles para inscripciones."
          actions={pageHeaderActions}
          showSubNav={false}
        />
        <div className="mx-auto max-w-8xl px-4 py-6 sm:px-6 lg:px-8">
          <div
            className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            <div className="flex items-start gap-2">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="shrink-0 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AttendancePageHeader
        accent="teal"
        icon={<ClipboardList className="h-6 w-6" />}
        title="Opciones de talleres"
        description="Administra los talleres publicados, cupos y detalles para inscripciones."
        actions={pageHeaderActions}
        showSubNav={false}
      />

      <div className="mx-auto max-w-8xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6 min-w-0">
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">

        {/* Add/Edit Option Form */}
      {(isAdding || editingId) && (
          <div className="mb-6 bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600 flex-shrink-0" />
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {editingId ? 'Editar Taller' : 'Nueva Opción'}
              </h3>
            </div>
            <button
              onClick={cancelModals}
              className="p-1 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
            >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título
                  </label>
                <input
                  type="text"
                    name="titulo"
                    value={form.titulo}
                  onChange={handleChange}
                  maxLength={LIMITS.title}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  {form.titulo.length}/{LIMITS.title} caracteres ({remainingChars(form.titulo, LIMITS.title)} restantes)
                </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
                  </label>
                <input
                  type="text"
                    name="ubicacion"
                    value={form.ubicacion}
                  onChange={handleChange}
                  maxLength={LIMITS.location}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  {form.ubicacion.length}/{LIMITS.location} caracteres ({remainingChars(form.ubicacion, LIMITS.location)} restantes)
                </div>
                </div>
            </div>

              {/* New fields: Hour and Capacity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora del Taller
                  </label>
                  <input
                    type="time"
                    name="hora"
                    value={form.hora}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cupos Disponibles
                  </label>
                  <input
                    type="number"
                    name="capacidad"
                    value={form.capacidad || 1}
                    onChange={handleChange}
                    min="1"
                    max="999"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              {/* Descripción, Materiales y Aprender en paralelo */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Descripción */}
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                <textarea
                    name="descripcion"
                    value={form.descripcion}
                  onChange={handleChange}
                  rows={3}
                  maxLength={LIMITS.description}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  {form.descripcion.length}/{LIMITS.description} caracteres ({remainingChars(form.descripcion, LIMITS.description)} restantes)
                </div>
              </div>

              <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    Materiales necesarios
                  </label>
                <textarea
                    name="materiales"
                    value={form.materiales}
                  onChange={handleChange}
                  rows={3}
                  maxLength={LIMITS.materiales}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {form.materiales.length}/{LIMITS.materiales} caracteres ({remainingChars(form.materiales, LIMITS.materiales)} restantes)
                </div>
              </div>

              <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    ¿Qué aprenderás?
                  </label>
                <textarea
                    name="aprender"
                    value={form.aprender}
                  onChange={handleChange}
                  rows={3}
                  maxLength={LIMITS.aprender}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {form.aprender.length}/{LIMITS.aprender} caracteres ({remainingChars(form.aprender, LIMITS.aprender)} restantes)
                </div>
                </div>
            </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de la Imagen (Cloudinary)
                  </label>
                  <input
                    type="url"
                    name="imagen"
                    value={form.imagen}
                    onChange={handleImageChange}
                    placeholder="https://res.cloudinary.com/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    maxLength={LIMITS.imageUrl}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Pega aquí la URL de la imagen desde Cloudinary
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {form.imagen.length}/{LIMITS.imageUrl} caracteres ({remainingChars(form.imagen, LIMITS.imageUrl)} restantes)
                  </div>
                  {form.imagen && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
                      <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <img
                          src={form.imagen}
                          alt="preview"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha del Taller
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    value={form.fecha}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                type="button"
                onClick={cancelModals}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}

        {/* Options Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentOptions.map((opt) => (
            <div key={opt.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col h-full">
                  {/* Image Section */}
                  <div className="relative h-48 bg-gray-100 flex-shrink-0">
                    {opt.imagen ? (
                      <img
                        src={opt.imagen}
                        alt={opt.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Image className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        Taller
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex flex-col flex-grow">
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2" title={opt.titulo}>
                      {opt.titulo}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow" title={opt.descripcion}>
                      {opt.descripcion}
                    </p>

                    {/* Meta Information */}
                    <div className="mb-4 flex-shrink-0">
                      <div className="text-sm text-gray-600 mb-2 flex flex-wrap items-center gap-2" title={`Fecha: ${new Date(opt.fecha).toLocaleDateString('es-ES')}`}>
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span><span className="font-medium text-gray-700">Fecha:</span> {new Date(opt.fecha).toLocaleDateString('es-ES')}</span>
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 border border-blue-200 text-xs font-medium" title={`Hora: ${opt.hora ? formatHour12(opt.hora) : 'Hora no definida'}`}>
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          {opt.hora ? formatHour12(opt.hora) : 'Hora no definida'}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 flex flex-wrap items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 min-w-0" title={opt.ubicacion}>
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="truncate"><span className="font-medium text-gray-700">Ubicación:</span> {opt.ubicacion}</span>
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 border border-blue-200 text-xs font-medium" title={getCapacitySummary(opt)}>
                          <Users className="w-3.5 h-3.5 mr-1" />
                          {getCapacitySummary(opt)}
                        </span>
                      </div>

                      {opt.materiales && opt.materiales.length > 0 && (
                        <p className="text-xs text-gray-600 line-clamp-1 mb-1" title={Array.isArray(opt.materiales) ? opt.materiales.join(', ') : opt.materiales}>
                          <span className="font-medium text-gray-700">Materiales:</span> {Array.isArray(opt.materiales) ? opt.materiales.join(', ') : opt.materiales}
                        </p>
                      )}

                      {opt.aprender && (
                        <p className="text-xs text-gray-600 line-clamp-1" title={opt.aprender}>
                          <span className="font-medium text-gray-700">Aprenderás:</span> {opt.aprender}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-100 mt-auto">
                      <button
                        type="button"
                        onClick={() => startEdit(opt)}
                        disabled={isDeleting}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors duration-200"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteModal(opt)}
                        disabled={isDeleting}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
          ))}
        </div>

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && workshopToDelete && (
          <div
            className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4 bg-black/50"
            onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
          >
            <div
              className="bg-white p-6 rounded-lg w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Confirmar Eliminación</h2>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="p-1 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-gray-700 mb-6">
                ¿Estás seguro de que deseas eliminar el taller <strong>{workshopToDelete.titulo}</strong>? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Eliminando...
                    </>
                  ) : (
                    'Eliminar'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
             {/* Pagination Info for Cards */}
             <div className="mb-6 text-center">
              <p className="text-gray-600">
                Mostrando {startIndex + 1} - {Math.min(endIndex, filtered.length)} de {filtered.length} opciones
              </p>
            </div>

            {/* Pagination Controls for Cards */}
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
        

        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {search ? 'No se encontraron talleres que coincidan con la búsqueda' : 'No hay talleres disponibles'}
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  );
};

export default WorkshopOptionsPage;