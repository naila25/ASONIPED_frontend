import { useState } from "react";

interface TallerFormData {
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  duracion: number | ""; // puede ser vacío mientras el usuario escribe
  ubicacion: string;
  objetivos: string;
  materiales: string;
}

export default function TallerForm() {
  const [form, setForm] = useState<TallerFormData>({
    titulo: "",
    descripcion: "",
    fecha: "",
    hora: "",
    duracion: "",
    ubicacion: "",
    objetivos: "",
    materiales: "",
  });

  const [mensaje, setMensaje] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "duracion"
          ? value === "" ? "" : Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const camposObligatorios: (keyof TallerFormData)[] = [
      "titulo",
      "descripcion",
      "fecha",
      "hora",
      "duracion",
      "ubicacion",
    ];

    const faltantes = camposObligatorios.filter(
      (campo) => form[campo] === "" || form[campo] === 0
    );

    if (faltantes.length > 0) {
      setMensaje("⚠️ Todos los campos obligatorios deben estar llenos.");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/talleres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setMensaje("✅ Taller creado exitosamente.");
        setForm({
          titulo: "",
          descripcion: "",
          fecha: "",
          hora: "",
          duracion: "",
          ubicacion: "",
          objetivos: "",
          materiales: "",
        });
      } else {
        setMensaje("❌ Error al crear taller.");
      }
    } catch (error: unknown) {
      console.error(error);
      setMensaje("❌ No se pudo conectar al servidor.");
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Crear/Editar Taller</h2>
      {mensaje && <p className="mb-3 text-sm">{mensaje}</p>}
      <form onSubmit={handleSubmit} className="grid gap-3">
        <input
          name="titulo"
          placeholder="Título"
          value={form.titulo}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <textarea
          name="descripcion"
          placeholder="Descripción"
          value={form.descripcion}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="date"
          name="fecha"
          value={form.fecha}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="time"
          name="hora"
          value={form.hora}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="duracion"
          placeholder="Duración (min)"
          value={form.duracion}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <input
          name="ubicacion"
          placeholder="Ubicación"
          value={form.ubicacion}
          onChange={handleChange}
          required
          className="border p-2 rounded"
        />
        <textarea
          name="objetivos"
          placeholder="Objetivos"
          value={form.objetivos}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <textarea
          name="materiales"
          placeholder="Materiales"
          value={form.materiales}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Guardar
        </button>
      </form>
    </div>
  );
}
