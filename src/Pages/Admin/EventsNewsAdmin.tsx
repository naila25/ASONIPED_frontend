import { useEffect, useState } from 'react';
import type { EventNewsItem } from '../../types/eventsNews';
import { getEventsNews, addEventNews, updateEventNews, deleteEventNews } from '../../Utils/eventsNewsApi';

const initialForm: Omit<EventNewsItem, 'id'> = {
  title: '',
  description: '',
  date: '',
  imageUrl: '',
};

const EventsNewsAdmin: React.FC = () => {
  const [items, setItems] = useState<EventNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const data = await getEventsNews();
      setItems(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setError(null);
    } catch (err) {
      setError('Error fetching events/news.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newItem: EventNewsItem = {
        id: Date.now().toString(),
        ...form,
      };
      await addEventNews(newItem);
      setForm(initialForm);
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
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSubmitting(true);
    try {
      await updateEventNews({ id: editingId, ...editForm });
      setEditingId(null);
      setShowEditModal(false);
      fetchItems();
    } catch {
      setError('Error updating event/news.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este evento/noticia?')) return;
    setSubmitting(true);
    try {
      await deleteEventNews(id);
      fetchItems();
    } catch {
      setError('Error deleting event/news.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl  mb-8 text-center">Eventos y Noticias</h1>
      {/* Create Form */}
      <form onSubmit={handleCreate} className="bg-white rounded-xl shadow-lg p-6 mb-10 flex flex-col gap-4 border border-gray-100">
        <h2 className="font-semibold text-lg mb-2">Agregar nuevo evento/noticia</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="title" value={form.title} onChange={handleChange} placeholder="Título" className="border rounded p-2" required />
          <input name="date" value={form.date} onChange={handleChange} type="date" className="border rounded p-2" required />
        </div>
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Descripción" className="border rounded p-2" required rows={2} />
        <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="URL de la imagen (opcional)" className="border rounded p-2" />
        <button type="submit" disabled={submitting} className="self-end bg-gradient-to-r from-blue-400 to-blue-700 text-white px-6 py-2 rounded shadow hover:scale-105 transition-transform">
          {submitting ? 'Agregando...' : 'Agregar'}
        </button>
      </form>
      {/* Error */}
      {error && <div className="text-red-500 text-center mb-4">{error}</div>}
      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative">
            <button
              onClick={() => { setShowEditModal(false); setEditingId(null); }}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              aria-label="Cerrar"
            >
              ×
            </button>
            <h2 className="text-lg font-semibold mb-4">Editar evento/noticia</h2>
            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <input name="title" value={editForm.title} onChange={handleEditChange} placeholder="Título" className="border rounded p-2" required />
              <input name="date" value={editForm.date} onChange={handleEditChange} type="date" className="border rounded p-2" required />
              <textarea name="description" value={editForm.description} onChange={handleEditChange} placeholder="Descripción" className="border rounded p-2" required rows={2} />
              <input name="imageUrl" value={editForm.imageUrl} onChange={handleEditChange} placeholder="URL de la imagen (opcional)" className="border rounded p-2" />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => { setShowEditModal(false); setEditingId(null); }} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors">Cancelar</button>
                <button type="submit" disabled={submitting} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors">
                  {submitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* List Table */}
      {loading ? (
        <div className="text-center">Cargando...</div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-100 bg-white">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-gray-50">
              <tr>
                <th className="p-3 text-left">Título</th>
                <th className="p-3 text-left">Fecha</th>
                <th className="p-3 text-left">Descripción</th>
                <th className="p-3 text-left">Imagen</th>
                <th className="p-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className={
                  `border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}  hover:bg-zinc-100 transition-colors`
                }>
                  <td className="p-3 font-semibold max-w-[160px] truncate" title={item.title}>{item.title}</td>
                  <td className="p-3">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="p-3 max-w-[220px] truncate" title={item.description}>{item.description}</td>
                  <td className="p-3">{item.imageUrl && <img src={item.imageUrl} alt={item.title} className="h-12 w-12 object-cover rounded" />}</td>
                  <td className="p-3 flex gap-2">
                    <button onClick={() => handleEdit(item)} className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors flex items-center gap-1"><span></span>Editar</button>
                    <button onClick={() => handleDelete(item.id)} className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors flex items-center gap-1"><span></span>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default EventsNewsAdmin;
