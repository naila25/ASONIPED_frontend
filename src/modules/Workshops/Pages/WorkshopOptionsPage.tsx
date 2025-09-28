import { useState } from "react";

type Estado = "Aprobado" | "Rechazado" | "Pendiente";
type Asistencia = "Sí" | "No";

interface Inscripcion {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  taller: string;
  estado: Estado;
  asistencia: Asistencia;
}

export default function InscripcionesTaller() {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([
    {
      id: 1,
      nombre: "Ana Pérez",
      email: "ana@gmail.com",
      telefono: "8888-8888",
      taller: "Yoga",
      estado: "Pendiente",
      asistencia: "No",
    },
    {
      id: 2,
      nombre: "Carlos Ruiz",
      email: "carlos@gmail.com",
      telefono: "9999-9999",
      taller: "Pintura",
      estado: "Aprobado",
      asistencia: "Sí",
    },
  ]);

  const actualizarEstado = (id: number, nuevoEstado: Estado) => {
    setInscripciones((prev) =>
      prev.map((i) => (i.id === id ? { ...i, estado: nuevoEstado } : i))
    );
  };

  const actualizarAsistencia = (id: number, nuevaAsistencia: Asistencia) => {
    setInscripciones((prev) =>
      prev.map((i) => (i.id === id ? { ...i, asistencia: nuevaAsistencia } : i))
    );
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Inscripciones a Taller</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Teléfono</th>
            <th className="p-2 border">Taller</th>
            <th className="p-2 border">Estado</th>
            <th className="p-2 border">Asistencia</th>
          </tr>
        </thead>
        <tbody>
          {inscripciones.map((i) => (
            <tr key={i.id}>
              <td className="p-2 border">{i.nombre}</td>
              <td className="p-2 border">{i.email}</td>
              <td className="p-2 border">{i.telefono}</td>
              <td className="p-2 border">{i.taller}</td>
              <td className="p-2 border">
                <select
                  value={i.estado}
                  onChange={(e) =>
                    actualizarEstado(i.id, e.target.value as Estado)
                  }
                  className="border rounded p-1"
                >
                  <option>Pendiente</option>
                  <option>Aprobado</option>
                  <option>Rechazado</option>
                </select>
              </td>
              <td className="p-2 border">
                <select
                  value={i.asistencia}
                  onChange={(e) =>
                    actualizarAsistencia(i.id, e.target.value as Asistencia)
                  }
                  className="border rounded p-1"
                >
                  <option>Sí</option>
                  <option>No</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
