import React, { useEffect, useState } from 'react';
import type { Workshop } from '../Services/workshop';
import {
  getAllWorkshops,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop
} from '../Services/workshopService';

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
  Table,
  Grid3X3
} from 'lucide-react';

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
  const [options, setOptions] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');

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
    
    detectZoomLevel();
    
    // Listen for zoom changes
    window.addEventListener('resize', detectZoomLevel);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', detectZoomLevel);
    };
  }, []);

  // Detect zoom level based on device pixel ratio and visual viewport
  const detectZoomLevel = () => {
    const zoom = window.visualViewport ? window.visualViewport.scale : window.devicePixelRatio;
    setZoomLevel(zoom);
  };

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

  // Get character limit based on zoom level
  const getCharacterLimit = (baseLimit: number) => {
    if (zoomLevel <= 0.8) return Math.floor(baseLimit * 1.5); // More characters at lower zoom
    if (zoomLevel <= 1.0) return baseLimit; // Normal at 100%
    if (zoomLevel <= 1.2) return Math.floor(baseLimit * 0.8); // Fewer characters at higher zoom
    if (zoomLevel <= 1.5) return Math.floor(baseLimit * 0.6); // Even fewer at very high zoom
    return Math.floor(baseLimit * 0.4); // Minimum at extreme zoom
  };

  // Truncate text based on zoom level
  const truncateText = (text: string, baseLimit: number) => {
    const limit = getCharacterLimit(baseLimit);
    return text.length > limit ? `${text.substring(0, limit)}...` : text;
  };

  const load = async () => {
    try {
      setLoading(true);
      const list = await getAllWorkshops();
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
      const sorted = [...list].sort((a, b) => {
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
    try {
      if (!form.titulo.trim()) throw new Error('Título requerido');
      if (form.titulo.length > 100) throw new Error('El título no puede exceder 100 caracteres');
      if (form.descripcion.length > 500) throw new Error('La descripción no puede exceder 500 caracteres');
      if (form.materiales.length > 500) throw new Error('Los materiales no pueden exceder 500 caracteres');
      if (form.aprender.length > 500) throw new Error('El campo aprender no puede exceder 500 caracteres');
      if (!form.fecha) throw new Error('La fecha es requerida');
      if (!form.hora) throw new Error('La hora es requerida');
      if (!form.capacidad) throw new Error('La capacidad es requerida');

      const capNum = parseInt(form.capacidad, 10);
      if (isNaN(capNum) || capNum <= 0) throw new Error('La capacidad debe ser un número mayor a 0');
      if (capNum > 10000) throw new Error('Capacidad demasiado alta');

      // Prevent past dates
      const today = new Date();
      today.setHours(0,0,0,0);
      const inputDate = new Date(form.fecha);
      if (!isNaN(inputDate.getTime()) && inputDate < today) throw new Error('La fecha no puede ser anterior a hoy');

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
      alert(err instanceof Error ? err.message : 'Error guardando taller');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este taller?')) return;
    try {
      await deleteWorkshop(id);
      await load();
    } catch {
      alert('Error eliminando');
    }
  };

  // Show skeleton UI instead of full loading screen for better perceived performance
  if (loading && options.length === 0) {
    return (
      <div className="space-y-6 min-w-0">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center gap-4 mb-20">
            <div className="min-w-0 flex-1">
              <div className="h-6 bg-gray-200 rounded w-64 animate-pulse"></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
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
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-medium">Error</h3>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex items-center gap-4 mb-20">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              Gestión de Opciones de Talleres
            </h1>
          </div>
               {/* Actions moved to header */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
           {/* View Mode Toggle */}
            <button
              onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm font-medium text-gray-700"
            >
              {viewMode === 'cards' ? <Table className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
              {viewMode === 'cards' ? 'Vista de tabla' : 'Vista de tarjetas'}
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar opciones..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={startAdd}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Opción</span>
              <span className="sm:hidden">Nuevo</span>
            </button>
        </div>
       </div>

        {/* Add/Edit Option Form */}
      {(isAdding || editingId) && (
          <div className="mb-6 bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {editingId ? 'Editar Taller' : 'Nuevo Taller'}
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
                  maxLength={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
                  <div className="text-xs text-gray-500 mt-1">{form.titulo.length}/100</div>
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
                  maxLength={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
                  <div className="text-xs text-gray-500 mt-1">{form.ubicacion.length}/100</div>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacidad
                  </label>
                  <input
                    type="number"
                    name="capacidad"
                    value={form.capacidad}
                    onChange={handleChange}
                    min="1"
                    max="999"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
                  <div className="text-xs text-gray-500 mt-1">{form.descripcion.length}/500</div>
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
                  maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                  <div className="text-xs text-gray-500 mt-1">{form.materiales.length}/500</div>
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
                  maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                  <div className="text-xs text-gray-500 mt-1">{form.aprender.length}/500</div>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Pega aquí la URL de la imagen desde Cloudinary
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}

        {/* Conditional Rendering: Table or Cards */}
        {viewMode === 'table' ? (
          /* Options Table - refined layout */
          <div className="-mx-4 sm:mx-0 overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <table className="min-w-full table-auto text-sm">
                  <thead className="bg-white sticky top-0 z-10 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 tracking-wider w-16">IMG</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 tracking-wider max-w-[12rem]">TÍTULO</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 tracking-wider max-w-[16rem]">DESCRIPCIÓN</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 tracking-wider max-w-[12rem]">MATERIALES</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 tracking-wider max-w-[12rem]">APRENDER</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 tracking-wider w-28">FECHA</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 tracking-wider w-24">HORA</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 tracking-wider w-32">UBICACIÓN</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 tracking-wider w-24">CAPACIDAD</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 tracking-wider w-32">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((opt, idx) => (
                      <tr key={opt.id} className={`border-b last:border-0 ${idx % 2 === 1 ? 'bg-gray-50/60' : ''} hover:bg-gray-50 transition-colors`}>
                        <td className="px-4 py-3 align-top">
                          <img
                            src={opt.imagen || '/placeholder-image.png'}
                            alt={opt.titulo}
                            className="h-11 w-11 object-cover rounded-md border border-gray-200"
                          />
                        </td>
                        <td className="px-4 py-3 align-top max-w-[12rem]">
                          <div className="font-semibold text-gray-900 leading-snug line-clamp-2 break-words" title={opt.titulo}>
                            {opt.titulo}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top max-w-[16rem]">
                          <div className="text-gray-700 leading-relaxed line-clamp-2 break-words" title={opt.descripcion}>
                            {opt.descripcion}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top max-w-[12rem]">
                          <div className="text-gray-700 leading-relaxed line-clamp-2 break-words" title={Array.isArray(opt.materiales) ? opt.materiales.join(', ') : opt.materiales || ''}>
                            {Array.isArray(opt.materiales) ? opt.materiales.join(', ') : opt.materiales || '—'}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top max-w-[12rem]">
                          <div className="text-gray-700 leading-relaxed line-clamp-2 break-words" title={opt.aprender || ''}>
                            {opt.aprender || '—'}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top whitespace-nowrap text-gray-900">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 border border-gray-200 text-xs" title={new Date(opt.fecha).toLocaleDateString('es-ES')}>
                            {new Date(opt.fecha).toLocaleDateString('es-ES')}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top whitespace-nowrap text-gray-900">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-700 border border-blue-200 text-xs font-medium" title={opt.hora || 'No especificada'}>
                            <Clock className="w-3 h-3 mr-1" />
                            {opt.hora ? formatHour12(opt.hora) : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top whitespace-nowrap text-gray-900">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 border border-gray-200 text-xs" title={opt.ubicacion}>
                            {truncateText(opt.ubicacion, 15)}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top whitespace-nowrap text-gray-900">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-700 border border-green-200 text-xs font-medium" title={`${opt.capacidad || 'N/A'} cupos disponibles`}>
                            <Users className="w-3 h-3 mr-1" />
                            {opt.capacidad || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => startEdit(opt)}
                              className="inline-flex items-center justify-center gap-1.5 px-2 py-1.5 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 transition-colors duration-200"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(opt.id)}
                              className="inline-flex items-center justify-center gap-1.5 px-2 py-1.5 bg-red-600 text-white rounded-md text-xs hover:bg-red-700 transition-colors duration-200"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <>
           
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
                        Activo
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
                    <div className="space-y-3 mb-4 flex-shrink-0">
                      {/* Date */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">Fecha:</span>
                        <span>{new Date(opt.fecha).toLocaleDateString('es-ES')}</span>
                      </div>

                      {/* Hour */}
                      {opt.hora && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">Hora:</span>
                          <span>{formatHour12(opt.hora)}</span>
                        </div>
                      )}

                      {/* Location */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">Ubicación:</span>
                        <span className="truncate" title={opt.ubicacion}>{opt.ubicacion}</span>
                      </div>

                      {/* Capacity */}
                      {opt.capacidad && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">Capacidad:</span>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {opt.capacidad} cupos
                          </span>
                        </div>
                      )}

                      {/* Materials */}
                      {opt.materiales && opt.materiales.length > 0 && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-700 block mb-1">Materiales:</span>
                          <p className="text-gray-600 text-xs line-clamp-2" title={Array.isArray(opt.materiales) ? opt.materiales.join(', ') : opt.materiales}>
                            {Array.isArray(opt.materiales) ? opt.materiales.join(', ') : opt.materiales}
                          </p>
                        </div>
                      )}

                      {/* Learning */}
                      {opt.aprender && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-700 block mb-1">Aprenderás:</span>
                          <p className="text-gray-600 text-xs line-clamp-2" title={opt.aprender}>
                            {opt.aprender}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-100 mt-auto">
                      <button
                        onClick={() => startEdit(opt)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors duration-200"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(opt.id)}
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
          </>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {search ? 'No se encontraron talleres que coincidan con la búsqueda' : 'No hay talleres disponibles'}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkshopOptionsPage;