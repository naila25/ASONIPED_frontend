import React, { useState, useEffect } from 'react';
import { fetchVolunteerOptions, addVolunteerOption, deleteVolunteerOption, updateVolunteerOption } from '../Services/fetchVolunteers';
import type { VolunteerOption } from '../Types/volunteer';
import { Settings, Search, Plus, Edit, Trash2, Calendar, MapPin, Image, FileText } from 'lucide-react';

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
  });
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);

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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Start adding a new option
  const handleAdd = () => {
    setIsAdding(true);
    setForm({ title: '', description: '', imageUrl: '', date: '', location: '' });
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
      if (editingId) {
        await updateVolunteerOption(Number(editingId), form);
      } else {
        await addVolunteerOption(form);
      }
      await loadOptions();
      setForm({ title: '', description: '', imageUrl: '', date: '', location: '' });
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
    setForm({ title: '', description: '', imageUrl: '', date: '', location: '' });
  };

  // Filter options by search term
  const filteredOptions = (options ?? []).filter(option =>
    option.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="bg-white  p-4 sm:p-6">
        <div className="flex items-center gap-4">

          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Gestión de Opciones de Voluntariado</h1>
            <p className="text-gray-600 text-sm sm:text-base">Administra y configura las opciones de voluntariado disponibles</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 p-6">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600">Total Opciones</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{options.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600">Activas</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{options.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg flex-shrink-0">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600">Con Imagen</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{options.filter(o => o.imageUrl).length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg flex-shrink-0">
              <Image className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600">Ubicaciones</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{new Set(options.map(o => o.location)).size}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg flex-shrink-0">
              <MapPin className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
          <h2 className="text-lg font-semibold text-gray-900">Opciones de Voluntariado</h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
      <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        
        Habilidades necesarias
      </label>
      <textarea
        name="skills"
        value={(form as any).skills || ""}
        onChange={handleChange}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      />
    </div>

     <div>
      <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        
        Herramientas necesarias
      </label>
      <textarea
        name="tools"
        value={(form as any).tools || ""}
        onChange={handleChange}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
      />
    </div>
    </div>

              <div className="grid grid-cols-3  gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de la Imagen
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700">Subir Imagen</label>
                <input
                 type="file"
                 accept="image/*"
                 className="mt-1 block w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 
                    file:rounded-md file:border-0 file:text-sm file:font-medium
                   file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha
                  </label>
                  <input
                    type="text"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    placeholder="Ej: 15 de Marzo, 2024"
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

        {/* Options Table */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle">

            <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr className="divide-x divide-gray-200"> 
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Img</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Título</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Descripción</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Habilidades</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Herramientas</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Fecha</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Ubicación</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOptions.map((option) => (
                    <tr key={option.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-2 py-7 whitespace-nowrap w-30">
                        <img
                          src={option.imageUrl}
                          alt={option.title}
                          className="h-10 w-10 object-cover rounded border border-gray-200 flex-shrink-0"
                        />
                      </td>
                      <td className="px-2 py-3  w-32">
                        <div className="text-sm font-medium text-gray-900 line-clamp-2" title={option.title}>
                          {(option.title)}
                        </div>
                      </td>
                      <td className="px-2 py-3 w-48">
                        <div className="text-sm text-gray-900 line-clamp-2" title={option.description}>
                          {option.description}
                        </div>
                      </td>

                       <td className="px-2 py-3 w-48">
                        <div className="text-sm text-gray-900 line-clamp-2" >
                        </div>
                      </td>

                       <td className="px-2 py-3 w-48">
                        <div className="text-sm text-gray-900 line-clamp-2">
                        </div>
                      </td>

                      <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-900 w-20">
                        <div className="truncate" title={option.date}>
                          {truncateText(option.date, 12)}
                        </div>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-900 w-24">
                        <div className="truncate" title={option.location}>
                          {option.location}
                        </div>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap w-20">
                        <div className="flex flex-col gap-3">
                          <button
                            onClick={() => handleEdit(option)}
                            className="flex items-center justify-center gap-1 px-1 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                          >
                            <Edit className="w-2.5 h-2.5" />
                            <span>Editar</span>
                          </button>
                          <button
                            onClick={() => handleDelete(option.id)}
                            className="flex items-center justify-center gap-1 px-1 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                            <span>Eliminar</span>
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