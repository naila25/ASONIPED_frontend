import React, { useState, useEffect } from 'react';
import { fetchVolunteerOptions, addVolunteerOption, deleteVolunteerOption, updateVolunteerOption } from '../../Utils/fetchVolunteers';
import type { VolunteerOption } from '../../types/volunteer';
// import VolunteerRegistrationForm from '../../Components/Volunteers/VolunteerRegistrationForm';

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

  // Load volunteer options on mount
  useEffect(() => {
    loadOptions();
  }, []);

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
      <div className="min-h-screen flex items-center justify-center">
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
      <div className="min-h-screen flex items-center justify-center">
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

  // Main render: search, add/edit form, and options table
  return (
    <div className="bg-gray-50 py-10">
      <main className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
            <h2 className="text-2xl font-bold text-gray-800">Opciones de Voluntariado</h2>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
              >
                Nueva Opción
              </button>
            </div>
          </div>

          {/* Add/Edit Option Form */}
          {(isAdding || editingId) && (
            <div className="mb-6 bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingId ? 'Editar Opción' : 'Nueva Opción'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ubicación
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL de la Imagen
                    </label>
                    <input
                      type="url"
                      name="imageUrl"
                      value={form.imageUrl}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha
                    </label>
                    <input
                      type="text"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      placeholder="Ej: 15 de Marzo, 2024"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 border rounded hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                  >
                    {editingId ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Options Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm font-medium text-gray-700">
                  <th className="px-4 py-2">Imagen</th>
                  <th className="px-4 py-2">Título</th>
                  <th className="px-4 py-2">Descripción</th>
                  <th className="px-4 py-2">Fecha</th>
                  <th className="px-4 py-2">Ubicación</th>
                  <th className="px-4 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOptions.map((option) => (
                  <tr key={option.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <img
                        src={option.imageUrl}
                        alt={option.title}
                        className="h-16 w-16 object-cover rounded"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{option.title}</td>
                    <td className="px-4 py-3">
                      <div className="max-w-md truncate text-gray-900">{option.description}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-900">{option.date}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-900">{option.location}</td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(option)}
                          className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(option.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
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
      </main>
    </div>
  );
};

export default VolunteerOptionsPage;