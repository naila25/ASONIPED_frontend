import { useEffect, useState } from 'react';
import type { EventNewsItem } from '../Types/eventsNews';
import { fetchEventsNews, createEventNews, updateEventNews, deleteEventNews } from '../Services/eventsNewsApi';
import { Plus, Edit, Trash2, Image, X, Search, Newspaper } from 'lucide-react';
import { formatTime12Hour } from '../../../shared/Utils/timeUtils';
import AttendancePageHeader from '../../Attendance/Components/AttendancePageHeader';

// Format date string safely (handles M/D/YYYY format and ISO/UTC without TZ shift)
const formatDisplayDate = (input: string): string => {
  try {
    if (!input) return '';
    // Slash input: assume M/D/YYYY and render as DD/MM/YYYY
    if (input.includes('/')) {
      const parts = input.split('/');
      if (parts.length === 3) {
        const [monthStr, dayStr, y] = parts;
        const month = parseInt(monthStr, 10);
        const day = parseInt(dayStr, 10);
        const dateObj = new Date(Number(y), month - 1, day);
        return dateObj.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
      }
      return input;
    }
    // Extract YYYY-MM-DD part if ISO with time or with space 'YYYY-MM-DD HH:MM:SS'
    const datePart = (input.includes('T') ? input.split('T')[0] : input.split(' ')[0]);
    const match = datePart.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const [, y, m, d] = match;
      // Build date using local timezone components to avoid UTC shift
      const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
      return dateObj.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }
    // Fallback: try native Date
    const fallback = new Date(input);
    if (!isNaN(fallback.getTime())) return fallback.toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' });
    return input;
  } catch {
    return input;
  }
};

const initialForm: Omit<EventNewsItem, 'id'> = {
  title: '',
  description: '',
  date: '',
  imageUrl: '',
  type: 'evento',
  hour: '',
};

const EventsNewsAdmin: React.FC = () => {
  const remainingChars = (value: string | undefined, max: number) => max - (value?.length ?? 0);

  const [items, setItems] = useState<EventNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<EventNewsItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await fetchEventsNews();
      setItems(data.sort((a: EventNewsItem, b: EventNewsItem) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setError(null);
    } catch {
      setError('Error fetching events/news.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const validateEventNewsForm = (data: Omit<EventNewsItem, 'id'>): string | null => {
    const title = data.title.trim();
    const description = data.description.trim();
    const date = data.date?.trim();
    const hour = data.hour?.trim();
    const imageUrl = data.imageUrl?.trim();

    if (!title) return 'El título es obligatorio.';
    if (title.length > 255) return 'El título no puede superar 255 caracteres.';

    if (!description) return 'La descripción es obligatoria.';

    if (!date) return 'La fecha es obligatoria.';
    if (date.length > 50) return 'La fecha no puede superar 50 caracteres.';

    if (hour) {
      if (hour.length > 10) return 'La hora no puede superar 10 caracteres.';
      if (!/^\d{2}:\d{2}$/.test(hour)) return 'La hora debe tener formato HH:MM.';
    }

    if (imageUrl) {
      if (imageUrl.length > 1000) return 'La URL de la imagen no puede superar 1000 caracteres.';
      try {
        const u = new URL(imageUrl);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') {
          return 'La URL de la imagen debe ser http(s).';
        }
      } catch {
        return 'La URL de la imagen no es válida.';
      }
    }

    if (data.type !== 'evento' && data.type !== 'noticia') {
      return 'El tipo debe ser "evento" o "noticia".';
    }

    return null;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateEventNewsForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await createEventNews({
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl?.trim() || '',
        hour: form.hour?.trim() || '',
      });
      setForm(initialForm);
      setShowCreateForm(false);
      fetchItems();
    } catch {
      setError('Error creating event/news.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: EventNewsItem) => {
    setEditingId(item.id);
    setEditForm({
      title: item.title,
      description: item.description,
      date: item.date,
      imageUrl: item.imageUrl || '',
      type: item.type || 'evento',
      hour: item.hour || ''
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setError(null);

    const validationError = validateEventNewsForm(editForm);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      await updateEventNews(editingId, {
        ...editForm,
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        imageUrl: editForm.imageUrl?.trim() || '',
        hour: editForm.hour?.trim() || '',
      });
      setEditingId(null);
      setShowEditModal(false);
      fetchItems();
    } catch {
      setError('Error updating event/news.');
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (item: EventNewsItem) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete?.id) return;
    setIsDeleting(true);
    try {
      await deleteEventNews(itemToDelete.id.toString());
      await fetchItems();
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch {
      setError('Error deleting event/news.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter items by search term
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pageHeaderActions = (
    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative w-full min-w-[12rem] sm:w-72">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Buscar eventos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>
      <button
        type="button"
        onClick={() => setShowCreateForm(true)}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
      >
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Nuevo Evento/Noticia</span>
        <span className="sm:hidden">Nuevo</span>
      </button>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50">
        <AttendancePageHeader
          accent="teal"
          icon={<Newspaper className="h-6 w-6" />}
          title="Eventos y Noticias"
          description="Administra eventos y noticias publicados en el sitio."
          actions={pageHeaderActions}
          showSubNav={false}
        />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            <p className="text-gray-600">Cargando eventos y noticias...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AttendancePageHeader
        accent="teal"
        icon={<Newspaper className="h-6 w-6" />}
        title="Eventos y Noticias"
        description="Administra eventos y noticias publicados en el sitio."
        actions={pageHeaderActions}
        showSubNav={false}
      />

      <div className="mx-auto max-w-8xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6 min-w-0">

      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">

        {/* Create Form */}
        {showCreateForm && (
          <div className="mb-6 bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Plus className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <h3 className="text-lg font-semibold text-gray-900 truncate">Nuevo Evento/Noticia</h3>
              </div>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setForm(initialForm);
                }}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Título del evento"
                    maxLength={255}
                    className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500 text-right">
                    {remainingChars(form.title, 255)} caracteres restantes
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                  <input
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    type="date"
                    maxLength={50}
                    className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hora</label>
                  <input
                    name="hour"
                    value={form.hour}
                    onChange={handleChange}
                    type="time"
                    maxLength={10}
                    className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Descripción del evento"
                  maxLength={8000}
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                  rows={3}
                />
                <p className="mt-1 text-xs text-gray-500 text-right">
                  {remainingChars(form.description, 8000)} caracteres restantes
                </p>
              </div>
              <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
               <select
                 name="type"
                 value={form.type}
                 onChange={handleChange}
                 className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                 <option value="evento">Evento</option>
                 <option value="noticia">Noticia</option>
               </select>
             </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL de la Imágen (opcional)</label>
                <input
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://ejemplo.com/imágen.jpg"
                  maxLength={1000}
                  className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500 text-right">
                  {remainingChars(form.imageUrl, 1000)} caracteres restantes
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setForm(initialForm);
                  }}
                  className="px-4 py-2 border border-gray-400 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
                >
                  {submitting ? 'Creando...' : 'Crear Evento'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

       {/* Edit Form (ya no es modal) */}
{showEditModal && (
  <div className="mb-6 bg-gray-50 rounded-lg p-4 sm:p-6 border border-gray-300">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Edit className="w-5 h-5 text-teal-600 flex-shrink-0" />
        <h3 className="text-lg font-semibold text-gray-900 truncate">Editar Evento o Noticia</h3>
      </div>
      <button
        onClick={() => {
          setShowEditModal(false);
          setEditingId(null);
        }}
        className="text-gray-400 hover:text-gray-600 flex-shrink-0"
      >
        <X className="w-5 h-5" />
      </button>
    </div>

    <form onSubmit={handleUpdate} className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
          <input
            name="title"
            value={editForm.title}
            onChange={handleEditChange}
            placeholder="Título del evento o noticia"
            maxLength={255}
            className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            required
          />
          <p className="mt-1 text-xs text-gray-500 text-right">
            {remainingChars(editForm.title, 255)} caracteres restantes
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
          <input
            name="date"
            value={editForm.date}
            onChange={handleEditChange}
            type="date"
            maxLength={50}
            className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hora</label>
          <input
            name="hour"
            value={editForm.hour}
            onChange={handleEditChange}
            type="time"
            maxLength={10}
            className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
        <textarea
          name="description"
          value={editForm.description}
          onChange={handleEditChange}
          placeholder="Escribe una breve descripción..."
          maxLength={8000}
          className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          rows={3}
          required
        />
        <p className="mt-1 text-xs text-gray-500 text-right">
          {remainingChars(editForm.description, 8000)} caracteres restantes
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
        <select
          name="type"
          value={editForm.type}
          onChange={handleEditChange}
          className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="evento">Evento</option>
          <option value="noticia">Noticia</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">URL de la Imágen</label>
        <input
          name="imageUrl"
          value={editForm.imageUrl}
          onChange={handleEditChange}
          placeholder="https://ejemplo.com/imágen.jpg"
          maxLength={1000}
          className="w-full px-3 py-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500 text-right">
          {remainingChars(editForm.imageUrl, 1000)} caracteres restantes
        </p>
        {editForm.imageUrl && (
          <img
            src={editForm.imageUrl}
            alt="Vista previa"
            className="mt-3 w-full h-40 object-cover rounded-lg border"
          />
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <button
          type="button"
          onClick={() => {
            setShowEditModal(false);
            setEditingId(null);
          }}
          className="px-4 py-2 border border-gray-400 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
        >
          {submitting ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  </div>
)}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-300 hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col">
              {/* Image */}
              <div className="relative h-48 bg-gray-100">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Image className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                    item.type === 'evento' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-green-100 text-green-800 border-green-300'
                  }`}>
                    {item.type === 'evento' ? 'Evento' : 'Noticia'}
                  </span>
                </div>
              </div>
              {/* Content */}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2" title={item.title}>{item.title}</h3>
                <div className="text-sm text-gray-600 mb-3">
                  {formatDisplayDate(item.date)}
                  {item.hour && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 border border-blue-300 text-xs font-medium">
                      {formatTime12Hour(item.hour)}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow" title={item.description}>{item.description}</p>
                <div className="flex gap-2 pt-4 border-t border-gray-100 mt-auto">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors duration-300"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => openDeleteModal(item)}
                    disabled={isDeleting}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-md transition-colors duration-300"
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
        {isDeleteModalOpen && itemToDelete && (
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
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="text-gray-700 mb-6">
                ¿Estás seguro de que deseas eliminar <strong>{itemToDelete.title}</strong>? Esta acción no se puede deshacer.
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

        {filteredItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No se encontraron eventos que coincidan con la búsqueda' : 'No hay eventos o noticias disponibles'}
          </div>
        )}
     </div>
        </div>
      </div>
    </div>
  );
};

export default EventsNewsAdmin;