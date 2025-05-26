
import React, { useState } from "react";

const FormularioMatricula = () => {
  const [form, setForm] = useState({
    id: "",
    correo: "",
    nombre: "",
    apellidos: "",
    direccion: "",
    telefono: "",
  });
  const [enviado, setEnviado] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviado(true);
    setForm({
      id: "",
      correo: "",
      nombre: "",
      apellidos: "",
      direccion: "",
      telefono: "",
    });
  };

  return (
    <div className="flex flex-col items-center mt-20 tracking-wide lg:mt-32">
      <h2 className="text-4xl sm:text-5xl lg:text-6xl text-center tracking-wide">
        Matrícula de Taller
        <span className="bg-gradient-to-r from-orange-500 to-red-800 text-transparent bg-clip-text">
          {" "} ASONIPED
        </span>
      </h2>
      <div className="flex flex-col items-center justify-center mt-10 w-full">
        <div className="w-full max-w-xl p-4">
          <div className="rounded-xl shadow-2xl bg-white p-8">
            {enviado ? (
              <div className="text-green-600 text-center text-lg font-semibold">
                ¡Matrícula enviada correctamente!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-neutral-700 mb-2 font-semibold">ID del Taller</label>
                  <input
                    type="text"
                    name="id"
                    value={form.id}
                    onChange={handleChange}
                    required
                    className="w-full border border-neutral-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 mb-2 font-semibold">Correo electrónico</label>
                  <input
                    type="email"
                    name="correo"
                    value={form.correo}
                    onChange={handleChange}
                    required
                    className="w-full border border-neutral-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 mb-2 font-semibold">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    required
                    className="w-full border border-neutral-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 mb-2 font-semibold">Apellidos</label>
                  <input
                    type="text"
                    name="apellidos"
                    value={form.apellidos}
                    onChange={handleChange}
                    required
                    className="w-full border border-neutral-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 mb-2 font-semibold">Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={form.direccion}
                    onChange={handleChange}
                    required
                    className="w-full border border-neutral-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 mb-2 font-semibold">Número de teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    required
                    className="w-full border border-neutral-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-800 py-3 px-6 rounded-md text-white font-semibold text-lg transition hover:scale-105"
                >
                  Matricularme
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormularioMatricula;