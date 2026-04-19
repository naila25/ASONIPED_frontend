import React, { useState, useEffect } from 'react';
import { fetchVolunteerOptions, addVolunteerOption, deleteVolunteerOption, updateVolunteerOption } from '../Services/fetchVolunteers';
import type { VolunteerOption } from '../Types/volunteer';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Image,
  FileText,
  Clock,
  Users,
  ClipboardList,
  XCircle,
} from 'lucide-react';
import { getAPIBaseURLSync } from '../../../shared/Services/config';
import AttendancePageHeader from '../../Attendance/Components/AttendancePageHeader';

// Admin page for managing volunteer options (CRUD)
const VolunteerOptionsPage = () => {
  // State for options, form, loading, error, and UI
  const [options, setOptions] = useState<VolunteerOption[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<VolunteerOption, 'id'>>({
    title: '',
    description: '',
    imageUrl: '',
    date: '',
    location: '',
    skills: '',
    tools: '',
    hour: '',
    spots: 1,
  });
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  // Pagination state for card view
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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

  // Load volunteer options on mount
  useEffect(() => {
    // Defer initial data loading to improve initial render
    const timer = setTimeout(() => {
      loadOptions();
    }, 0);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  // (Previously used for table view truncation; table view removed.)
  // Remove noisy technical payloads rendered as plain text from API responses.
  const sanitizeTechnicalText = (value?: string) => {
    if (!value) return '';
    return value
      .replace(/\{\s*message\s*:\s*"[^"]*"\s*\}/gi, '')
      .replace(/message\s*:\s*"[^"]*"/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  };

  const formatDisplayDate = (rawDate: string) => {
    try {
      if (rawDate.includes('/')) {
        const [day, month, year] = rawDate.split('/');
        const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        if (!isNaN(dateObj.getTime())) return dateObj.toLocaleDateString('es-ES');
      }
      const dateObj = new Date(rawDate);
      if (!isNaN(dateObj.getTime())) return dateObj.toLocaleDateString('es-ES');
      return rawDate;
    } catch {
      return rawDate;
    }
  };

  const getSpotsSummary = (option: VolunteerOption) => {
    const available = option.available_spots;
    const total = option.spots;
    if (available !== undefined && total !== undefined) {
      return `${available}/${total} cupos disponibles`;
    }
    if (total !== undefined) {
      return `${total} cupos disponibles`;
    }
    return 'Cupos no definidos';
  };

  // Fetch all volunteer options from API
  const loadOptions = async () => {
    try {
      setLoading(true);
      const options = await fetchVolunteerOptions();
      setOptions(Array.isArray(options) ? options : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading options');
    } finally {
      setLoading(false);
    }
  };

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ 
      ...form, 
      [name]: name === 'spots' ? parseInt(value) || 1 : value 
    });
  };


  // Start adding a new option
  const handleAdd = () => {
    setIsAdding(true);
    setForm({ title: '', description: '', imageUrl: '', date: '', location: '', skills: '', tools: '', hour: '', spots: 1 });
    setEditingId(null);
  };

  // Start editing an existing option
  const handleEdit = (option: VolunteerOption) => {
    setEditingId(option.id);
    // Normalize DD/MM/YYYY to YYYY-MM-DD for date input compatibility
    const toISO = (d: string) => {
      try {
        if (d && d.includes('/')) {
          const [day, month, year] = d.split('/');
          if (day && month && year) return `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;
        }
      } catch {
        return d;
      }
      return d;
    };
    setForm({
      title: option.title,
      description: option.description,
      imageUrl: option.imageUrl,
      date: toISO(option.date),
      location: option.location,
      skills: option.skills || '',
      tools: option.tools || '',
      hour: option.hour || '',
      spots: option.spots || 1,
    });
    setIsAdding(false);
  };

  // Delete an option after confirmation
  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta opción de voluntariado?')) {
      return;
    }
    try {
      await deleteVolunteerOption(Number(id));
      await loadOptions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting option');
    }
  };

  // Submit add/edit form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Validations
      if (form.title.length > 100) throw new Error('El título no puede exceder 100 caracteres');
      if (form.description.length > 500) throw new Error('La descripción no puede exceder 500 caracteres');
      if ((form.skills || '').length > 500) throw new Error('Las habilidades no pueden exceder 500 caracteres');
      if ((form.tools || '').length > 500) throw new Error('Las herramientas no pueden exceder 500 caracteres');
      if (!form.date) throw new Error('La fecha es requerida');
      // Prevent past dates
      const today = new Date();
      today.setHours(0,0,0,0);
      let inputDate;
      try {
        // Handle DD/MM/YYYY format
        if (form.date.includes('/')) {
          const [day, month, year] = form.date.split('/');
          inputDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          inputDate = new Date(form.date);
        }
        if (!isNaN(inputDate.getTime()) && inputDate < today) throw new Error('La fecha no puede ser anterior a hoy');
      } catch {
        throw new Error('Formato de fecha inválido. Use DD/MM/YYYY');
      }

      if (editingId) {
        await updateVolunteerOption(Number(editingId), form);
      } else {
        await addVolunteerOption(form);
      }
      await loadOptions();
      setForm({ title: '', description: '', imageUrl: '', date: '', location: '', skills: '', tools: '', hour: '', spots: 1 });
      setIsAdding(false);
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving option');
    }
  };

  // Cancel add/edit
  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setForm({ title: '', description: '', imageUrl: '', date: '', location: '', skills: '', tools: '', hour: '', spots: 1 });
  };

  // Filter options by search term
  const filteredOptions = (options ?? []).filter(option =>
    option.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations for card view
  const totalPages = Math.ceil(filteredOptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOptions = filteredOptions.slice(startIndex, endIndex);

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
  }, [searchTerm]);

  const pageHeaderActions = (
    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative w-full min-w-[12rem] sm:w-72">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar opciones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className="inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-sky-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Nueva opción</span>
        <span className="sm:hidden">Nueva</span>
      </button>
    </div>
  );

  // Show skeleton UI instead of full loading screen for better perceived performance
  if (loading && options.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AttendancePageHeader
          accent="sky"
          icon={<ClipboardList className="h-6 w-6" />}
          title="Opciones de voluntariado"
          description="Crea, edita y organiza las opciones publicadas para los voluntarios."
          actions={pageHeaderActions}
          showSubNav={false}
        />
        <div className="mx-auto max-w-8xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="space-y-6 min-w-0">
            <div className="rounded-lg bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-8 h-10 max-w-2xl animate-pulse rounded-lg bg-gray-200" />
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                  <div className="h-48 animate-pulse bg-gray-200" />
                  <div className="space-y-3 p-6">
                    <div className="h-6 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
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
          accent="sky"
          icon={<ClipboardList className="h-6 w-6" />}
          title="Opciones de voluntariado"
          description="Crea, edita y organiza las opciones publicadas para los voluntarios."
          actions={pageHeaderActions}
          showSubNav={false}
        />
        <div className="mx-auto max-w-8xl px-4 py-6 sm:px-6 lg:px-8">
          <div
            className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            <div className="flex items-start gap-2">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex min-h-[44px] shrink-0 items-center rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      <AttendancePageHeader
        accent="sky"
        icon={<ClipboardList className="h-6 w-6" />}
        title="Opciones de voluntariado"
        description="Crea, edita y organiza las opciones publicadas para los voluntarios."
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
                <FileText className="w-5 h-5 text-sky-600 flex-shrink-0" />
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {editingId ? 'Editar Opción' : 'Nueva Opción'}
                </h3>
              </div>
              <button
                onClick={handleCancel}
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
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    maxLength={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">{form.title.length}/100</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    maxLength={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">{form.location.length}/100</div>
                </div>
              </div>

              {/* New fields: Hour and Spots */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora del Voluntariado
                  </label>
                  <input
                    type="time"
                    name="hour"
                    value={(form as { hour?: string }).hour || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cupos Disponibles
                  </label>
                  <input
                    type="number"
                    name="spots"
                    value={form.spots || 1}
                    onChange={handleChange}
                    min="1"
                    max="999"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              {/* Descripción, Habilidades y Herramientas en paralelo */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                    maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  required
                />
                  <div className="text-xs text-gray-500 mt-1">{form.description.length}/500</div>
              </div>

              <div>
      <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        
        Habilidades necesarias
      </label>
      <textarea
        name="skills"
        value={(form as { skills?: string }).skills || ""}
        onChange={handleChange}
        rows={3}
        maxLength={500}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
      />
      <div className="text-xs text-gray-500 mt-1">{(form as { skills?: string }).skills?.length || 0}/500</div>
    </div>

     <div>
      <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        
        Herramientas necesarias
      </label>
      <textarea
        name="tools"
        value={(form as { tools?: string }).tools || ""}
        onChange={handleChange}
        rows={3}
        maxLength={500}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
      />
      <div className="text-xs text-gray-500 mt-1">{(form as { tools?: string }).tools?.length || 0}/500</div>
    </div>
    </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de la Imagen (Cloudinary)
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={handleChange}
                    placeholder="https://res.cloudinary.com/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Pega aquí la URL de la imagen desde Cloudinary
                  </div>
                  {form.imageUrl && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
                      <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <img
                          src={form.imageUrl}
                          alt="preview"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha del Voluntariado
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                >
                  {editingId ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Options Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentOptions.map((option) => (
            <div key={option.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
                {/* Image Section */}
                <div className="relative h-48 bg-gray-100">
                  {option.imageUrl ? (
                    <img
                      src={option.imageUrl.startsWith('http') ? option.imageUrl : `${getAPIBaseURLSync()}${option.imageUrl}`}
                      alt={option.title}
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
                      Voluntariado
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 flex flex-col flex-grow">
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2" title={option.title}>
                    {option.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3" title={sanitizeTechnicalText(option.description)}>
                    {sanitizeTechnicalText(option.description) || 'Sin descripción'}
                  </p>

                  {/* Meta Information */}
                  <div className="mb-4 flex-shrink-0">
                    <div className="text-sm text-gray-600 mb-2 flex flex-wrap items-center gap-2" title={`Fecha: ${formatDisplayDate(option.date)}`}>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span><span className="font-medium text-gray-700">Fecha:</span> {formatDisplayDate(option.date)}</span>
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 border border-blue-200 text-xs font-medium" title={`Hora: ${formatHour12((option as unknown as { hour?: string }).hour) || 'Hora no definida'}`}>
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        {formatHour12((option as unknown as { hour?: string }).hour) || 'Hora no definida'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 min-w-0" title={option.location}>
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="truncate"><span className="font-medium text-gray-700">Ubicación:</span> {option.location}</span>
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 border border-blue-200 text-xs font-medium" title={getSpotsSummary(option)}>
                        <Users className="w-3.5 h-3.5 mr-1" />
                        {getSpotsSummary(option)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100 mt-auto">
                    <button
                      onClick={() => handleEdit(option)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(option.id)}
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

            {/* Pagination Info for Cards */}
            <div className="mb-6 text-center">
              <p className="text-gray-600">
                Mostrando {startIndex + 1} - {Math.min(endIndex, filteredOptions.length)} de {filteredOptions.length} opciones
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
                      : 'bg-sky-500 text-white hover:bg-sky-600'
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
                          ? 'bg-sky-500 text-white'
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
                      : 'bg-sky-500 text-white hover:bg-sky-600'
                  }`}
                >
                  Siguiente
                </button>
              </div>
            )}
        

        {filteredOptions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No se encontraron opciones que coincidan con la búsqueda' : 'No hay opciones de voluntariado disponibles'}
          </div>
        )}
      </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerOptionsPage;