import React, { useState, useEffect } from 'react';
import { fetchVolunteerOptions, addVolunteerOption, deleteVolunteerOption, updateVolunteerOption } from '../Services/fetchVolunteers';
import type { VolunteerOption } from '../Types/volunteer';
import {  Search, Plus, Edit, Trash2, Calendar, MapPin, Image, FileText, Table, Grid3X3, Clock, Users } from 'lucide-react';

// Admin page for managing volunteer options (CRUD)
const VolunteerOptionsPage = () => {
  // State for options, form, loading, error, and UI
  const [options, setOptions] = useState<VolunteerOption[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<(Omit<VolunteerOption, 'id'> & { imageFile?: File | null })>({
    title: '',
    description: '',
    imageUrl: '',
    date: '',
    location: '',
    skills: '',
    tools: '',
    hour: '',
    spots: 1,
    imageFile: null,
  });
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  
  // Pagination state for card view
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Load volunteer options on mount
  useEffect(() => {
    loadOptions();
    detectZoomLevel();
    
    // Listen for zoom changes
    window.addEventListener('resize', detectZoomLevel);
    return () => window.removeEventListener('resize', detectZoomLevel);
  }, []);

  // Detect zoom level based on device pixel ratio and visual viewport
  const detectZoomLevel = () => {
    const zoom = window.visualViewport ? window.visualViewport.scale : window.devicePixelRatio;
    setZoomLevel(zoom);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm({ ...form, imageFile: file });
    if (file) {
      const url = URL.createObjectURL(file);
      setForm((prev: (Omit<VolunteerOption, 'id'> & { imageFile?: File | null })) => ({ ...prev, imageUrl: url }));
    }
  };

  // Start adding a new option
  const handleAdd = () => {
    setIsAdding(true);
    setForm({ title: '', description: '', imageUrl: '', date: '', location: '', skills: '', tools: '', hour: '', spots: 1, imageFile: null });
    setEditingId(null);
  };

  // Start editing an existing option
  const handleEdit = (option: VolunteerOption) => {
    setEditingId(option.id);
    setForm({
      title: option.title,
      description: option.description,
      imageUrl: option.imageUrl,
      date: option.date,
      location: option.location,
      skills: option.skills || '',
      tools: option.tools || '',
      hour: option.hour || '',
      spots: option.spots || 1,
      imageFile: null,
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
      const inputDate = new Date(form.date);
      if (!isNaN(inputDate.getTime()) && inputDate < today) throw new Error('La fecha no puede ser anterior a hoy');

      if (editingId) {
        await updateVolunteerOption(Number(editingId), form);
      } else {
        await addVolunteerOption(form);
      }
      await loadOptions();
      setForm({ title: '', description: '', imageUrl: '', date: '', location: '', skills: '', tools: '', hour: '', spots: 1, imageFile: null });
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
    setForm({ title: '', description: '', imageUrl: '', date: '', location: '', skills: '', tools: '', hour: '', spots: 1, imageFile: null });
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          <p className="text-gray-600">Cargando opciones de voluntariado...</p>
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

  // Main render
  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
     
      {/* Search and Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-20 space-y-4 lg:space-y-0">
          <h2 className="text-lg font-semibold text-gray-900">Opciones de Voluntariado</h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Opción</span>
              <span className="sm:hidden">Nueva</span>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      />
      <div className="text-xs text-gray-500 mt-1">{(form as { tools?: string }).tools?.length || 0}/500</div>
    </div>
    </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen del Voluntariado
                  </label>
                  <div className="space-y-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-500 file:mr-2 file:py-2 file:px-4 
                        file:rounded-md file:border-0 file:text-sm file:font-medium
                        file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                    />
                    <div className="text-xs text-gray-500">
                      Formatos: JPG, PNG. Máximo 5MB.
                    </div>
                    {form.imageUrl && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                          <img
                            src={form.imageUrl.startsWith('http') || form.imageUrl.startsWith('blob:') ? form.imageUrl : `http://localhost:3000${form.imageUrl}`}
                            alt="preview"
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 tracking-wider w-48">TÍTULO</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 tracking-wider w-64">DESCRIPCIÓN</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 tracking-wider w-48">HABILIDADES</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 tracking-wider w-48">HERRAMIENTAS</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 tracking-wider w-28">FECHA</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 tracking-wider w-24">HORA</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 tracking-wider w-32">UBICACIÓN</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 tracking-wider w-24">CUPOS</th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 tracking-wider w-32">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOptions.map((option, idx) => (
                      <tr key={option.id} className={`border-b last:border-0 ${idx % 2 === 1 ? 'bg-gray-50/60' : ''} hover:bg-gray-50 transition-colors`}>
                        <td className="px-4 py-3 align-top">
                          <img
                            src={option.imageUrl?.startsWith('http') ? option.imageUrl : `http://localhost:3000${option.imageUrl}`}
                            alt={option.title}
                            className="h-11 w-11 object-cover rounded-md border border-gray-200"
                          />
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="font-semibold text-gray-900 leading-snug line-clamp-2" title={option.title}>
                            {option.title}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="text-gray-700 leading-relaxed line-clamp-2" title={option.description}>
                            {option.description}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="text-gray-700 leading-relaxed line-clamp-2" title={(option as unknown as { skills?: string }).skills || ''}>
                            {(option as unknown as { skills?: string }).skills || '—'}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="text-gray-700 leading-relaxed line-clamp-2" title={(option as unknown as { tools?: string }).tools || ''}>
                            {(option as unknown as { tools?: string }).tools || '—'}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top whitespace-nowrap text-gray-900">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 border border-gray-200 text-xs" title={option.date}>
                            {truncateText(option.date, 12)}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top whitespace-nowrap text-gray-900">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-700 border border-blue-200 text-xs font-medium" title={(option as unknown as { hour?: string }).hour || 'No especificada'}>
                            <Clock className="w-3 h-3 mr-1" />
                            {(option as unknown as { hour?: string }).hour || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top whitespace-nowrap text-gray-900">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 border border-gray-200 text-xs" title={option.location}>
                            {truncateText(option.location, 15)}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top whitespace-nowrap text-gray-900">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-700 border border-green-200 text-xs font-medium" title={`${option.spots || 'N/A'} cupos disponibles`}>
                            <Users className="w-3 h-3 mr-1" />
                            {option.spots || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleEdit(option)}
                              className="inline-flex items-center justify-center gap-1.5 px-2 py-1.5 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 transition-colors duration-200"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(option.id)}
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
              {currentOptions.map((option) => (
              <div key={option.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col h-full">
                {/* Image Section */}
                <div className="relative h-48 bg-gray-100 flex-shrink-0">
                  {option.imageUrl ? (
                    <img
                      src={option.imageUrl.startsWith('http') ? option.imageUrl : `http://localhost:3000${option.imageUrl}`}
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
                      Activa
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
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow" title={option.description}>
                    {option.description}
                  </p>

                  {/* Meta Information */}
                  <div className="space-y-3 mb-4 flex-shrink-0">
                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">Fecha:</span>
                    <span>{new Date(option.date).toLocaleDateString('es-ES')}</span>
                  </div>

                  {/* Hour */}
                  {(option as unknown as { hour?: string }).hour && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Hora:</span>
                      <span>{(option as unknown as { hour?: string }).hour}</span>
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">Ubicación:</span>
                    <span className="truncate" title={option.location}>{option.location}</span>
                  </div>

                  {/* Spots */}
                  {option.spots && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Cupos:</span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {option.spots} disponibles
                      </span>
                    </div>
                  )}

                    {/* Skills */}
                    {(option as unknown as { skills?: string }).skills && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700 block mb-1">Habilidades:</span>
                        <p className="text-gray-600 text-xs line-clamp-2" title={(option as unknown as { skills?: string }).skills}>
                          {(option as unknown as { skills?: string }).skills}
                        </p>
                      </div>
                    )}

                    {/* Tools */}
                    {(option as unknown as { tools?: string }).tools && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700 block mb-1">Herramientas:</span>
                        <p className="text-gray-600 text-xs line-clamp-2" title={(option as unknown as { tools?: string }).tools}>
                          {(option as unknown as { tools?: string }).tools}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-gray-100 mt-auto">
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

        {filteredOptions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No se encontraron opciones que coincidan con la búsqueda' : 'No hay opciones de voluntariado disponibles'}
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerOptionsPage;