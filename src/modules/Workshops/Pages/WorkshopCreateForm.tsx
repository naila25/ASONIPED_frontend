import React, { useState } from 'react';
import { createWorkshop } from '../Services/workshopService';
import type { Workshop } from '../Types/workshop';

interface Props {
  onCreated: (workshop: Workshop) => void;
}

// ¡Usa los campos en español, igual que en tu type Workshop!
const initialForm: Omit<Workshop, 'id'> = {
  titulo: '',
  ubicacion: '',
  descripcion: '',
  materiales: [],
  aprender: '',
  imagen: '',
  fecha: '',
  hora: '',
  capacidad: 0
};

const WorkshopCreateForm: React.FC<Props> = ({ onCreated }) => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'capacidad' ? Number(value) : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo) {
      setError('El título es obligatorio');
      return;
    }
    try {
      const newWorkshop = await createWorkshop(form);
      onCreated(newWorkshop);
      setForm(initialForm);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Error al crear taller');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
      <input name="titulo" value={form.titulo} onChange={handleChange} placeholder="Título*" required />
      <input name="ubicacion" value={form.ubicacion} onChange={handleChange} placeholder="Ubicación" />
      <textarea name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Descripción" />
      <textarea name="materiales" value={form.materiales} onChange={handleChange} placeholder="Materiales" />
      <textarea name="aprender" value={form.aprender} onChange={handleChange} placeholder="¿Qué aprenderás?" />
      <input name="imagen" value={form.imagen} onChange={handleChange} placeholder="URL de la imagen (Cloudinary)" type="url" />
      <input name="fecha" value={form.fecha} onChange={handleChange} placeholder="Fecha" type="date" />
      <input name="hora" value={form.hora} onChange={handleChange} placeholder="Hora" type="time" />
      <input name="capacidad" value={form.capacidad} onChange={handleChange} placeholder="Capacidad" type="number" min={1} />
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <button type="submit">Crear</button>
    </form>
  );
};

export default WorkshopCreateForm;