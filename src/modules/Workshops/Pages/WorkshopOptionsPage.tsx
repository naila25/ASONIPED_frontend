import React, { useEffect, useState } from 'react';
import type { WorkshopOption } from '../Services/workshop';
import {
  fetchWorkshopOptions,
  addWorkshopOption,
  updateWorkshopOption,
  deleteWorkshopOption,
  seedWorkshopsIfEmpty
} from '../Services/fetchWorkshopsMock';

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Image,
  X,
  Wrench,
  Settings,
  FileText,
  Users
} from 'lucide-react';

interface FormState {
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  time: string;
  location: string;
  skills: string;
  tools: string;
  capacity: string;
  imageFile?: File | null;
}

const blankForm: FormState = {
  title: '',
  description: '',
  imageUrl: '',
  date: '',
  time: '',
  location: '',
  skills: '',
  tools: '',
  capacity: '',
  imageFile: null,
};

const WorkshopOptionsPage: React.FC = () => {
  const [options, setOptions] = useState<WorkshopOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blankForm);

  useEffect(() => {
    seedWorkshopsIfEmpty();
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const list = await fetchWorkshopOptions();
      setOptions(list);
      setError(null);
    } catch {
      setError('No se pudieron cargar las opciones');
    } finally {
      setLoading(false);
    }
  };

  const filtered = options.filter(o =>
    o.title.toLowerCase().includes(search.toLowerCase()) ||
    o.location.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm(prev => ({ ...prev, imageFile: file }));
    if (file) {
      const url = URL.createObjectURL(file);
      setForm(prev => ({ ...prev, imageUrl: url }));
    }
  };

  const startAdd = () => {
    setForm(blankForm);
    setIsAdding(true);
    setEditingId(null);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  };

  const startEdit = (opt: WorkshopOption) => {
    setEditingId(opt.id);
    setIsAdding(false);
    setForm({
      title: opt.title,
      description: opt.description,
      imageUrl: opt.imageUrl,
      date: opt.date,
      time: opt.time || '',
      location: opt.location,
      skills: opt.skills || '',
      tools: opt.tools || '',
      capacity: opt.capacity?.toString() || '',
      imageFile: null,
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
      if (!form.title.trim()) throw new Error('Título requerido');
      if (form.title.length > 100) throw new Error('El título no puede exceder 100 caracteres');
      if (form.description.length > 500) throw new Error('La descripción no puede exceder 500 caracteres');
      if (form.skills.length > 500) throw new Error('Las habilidades no pueden exceder 500 caracteres');
      if (form.tools.length > 500) throw new Error('Las herramientas no pueden exceder 500 caracteres');
      if (!form.date) throw new Error('La fecha es requerida');
      if (!form.time) throw new Error('La hora es requerida');
      if (!form.capacity) throw new Error('La capacidad es requerida');

      const capNum = parseInt(form.capacity, 10);
      if (isNaN(capNum) || capNum <= 0) throw new Error('La capacidad debe ser un número mayor a 0');
      if (capNum > 10000) throw new Error('Capacidad demasiado alta');

      // Validar combinación fecha + hora
      const combined = new Date(`${form.date}T${form.time}:00`);
      const now = new Date();
      if (combined < now) {
        throw new Error('La fecha y hora no pueden estar en el pasado');
      }

      const payload = {
        ...form,
        capacity: capNum,
      };

      if (editingId) {
        await updateWorkshopOption(editingId, payload);
      } else {
        await addWorkshopOption(payload);
      }
      cancelModals();
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error guardando taller');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este taller?')) return;
    try {
      await deleteWorkshopOption(id);
      await load();
    } catch {
      alert('Error eliminando');
    }
  };

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="bg-white p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              Gestión de Opciones de Talleres
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Administra y configura las opciones de talleres disponibles
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 p-6">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-l-4 border-blue-500">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Opciones</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{options.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-l-4 border-green-500">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Activas</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{options.length}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-l-4 border-purple-500">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Con Imagen</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {options.filter(o => o.imageUrl).length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Image className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-l-4 border-orange-500">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ubicaciones</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {new Set(options.map(o => o.location)).size}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <MapPin className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
       
        </div>
   

      {/* Barra control */}
      <div className="px-6 pt-2 pb-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Opciones de Talleres
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                placeholder="Buscar opciones..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={startAdd}
              className="flex items-center justify-center gap-2 h-10 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Nuevo Taller
            </button>
          </div>
        </div>
      </div>

      {(isAdding || editingId) && (
        <div className="mx-6 mb-2 bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-200">
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
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">{form.title.length}/100</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">{form.location.length}/100</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">{form.description.length}/500</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Materiales</label>
                <textarea
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <div className="text-xs text-gray-500 mt-1">{form.skills.length}/500</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">¿Qué aprenderás?</label>
                <textarea
                  name="tools"
                  value={form.tools}
                  onChange={handleChange}
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
                <div className="text-xs text-gray-500 mt-1">{form.tools.length}/500</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagen</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 
                    file:rounded-md file:border-0 file:text-sm file:font-medium
                    file:bg-orange-500 file:text-white hover:file:bg-orange-600"
                />
                {form.imageUrl && (
                  <img
                    src={form.imageUrl}
                    alt="preview"
                    className="h-12 w-12 object-cover rounded border mt-2"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Subir Imagen</label>
                <p className="text-xs text-gray-500">Formatos: JPG, PNG. Máx 5MB.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hora</label>
                  <input
                    type="time"
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Capacidad</label>
                  <input
                    type="number"
                    name="capacity"
                    value={form.capacity}
                    onChange={handleChange}
                    min={1}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Ej: 25"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                type="button"
                onClick={cancelModals}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 px-6 pb-8">
        {loading && (
          <div className="col-span-full text-center text-gray-500">Cargando...</div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="col-span-full text-center text-gray-500">
            No se encontraron talleres.
          </div>
        )}
        {filtered.map(opt => (
          <div
            key={opt.id}
            className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow transition flex flex-col"
          >
            <div className="h-36 bg-neutral-200 flex items-center justify-center text-neutral-500 text-sm">
              {opt.imageUrl ? (
                <img
                  src={opt.imageUrl}
                  alt={opt.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>Sin imagen</span>
              )}
            </div>
            <div className="p-4 flex flex-col gap-2 flex-grow">
              <h3 className="font-semibold text-lg">{opt.title}</h3>
              <p className="text-sm text-neutral-700 line-clamp-3">{opt.description}</p>
              <div className="text-xs text-neutral-600 space-y-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> {opt.date || '—'}
                </span>
                {opt.time && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> {opt.time}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {opt.location || '—'}
                </span>
                {typeof opt.capacity === 'number' && (
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> Cupo: {opt.capacity}
                  </span>
                )}
              </div>
              {(opt.skills || opt.tools) && (
                <div className="mt-1 text-xs text-neutral-500 space-y-1">
                  {opt.skills && (
                    <div className="flex gap-1">
                      <Wrench className="w-3 h-3" /> <span>{opt.skills}</span>
                    </div>
                  )}
                  {opt.tools && (
                    <div className="flex gap-1">
                      <Image className="w-3 h-3" /> <span>{opt.tools}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-2 pt-2 mt-auto">
                <button
                  onClick={() => startEdit(opt)}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-500"
                >
                  <Edit className="w-4 h-4" /> Editar
                </button>
                <button
                  onClick={() => handleDelete(opt.id)}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-500"
                >
                  <Trash2 className="w-4 h-4" /> Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default WorkshopOptionsPage;