import { useEffect, useState } from 'react';
import { adminFetchAllProposals, adminSetProposalStatus } from '../Services/fetchVolunteers';
import { API_BASE_URL } from '../../../shared/Services/config';

export default function VolunteerProposalsAdmin() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await adminFetchAllProposals();
      setProposals(res.proposals || []);
      setError(null);
    } catch (e) {
      setError('No se pudieron cargar las propuestas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSetStatus = async (id: number, status: 'approved' | 'rejected') => {
    try {
      setUpdatingId(id);
      await adminSetProposalStatus(id, status);
      await load();
    } catch (e) {
      alert('No se pudo actualizar el estado');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold text-orange-600 mb-6">Revisión de Propuestas</h1>

      {loading ? (
        <p className="text-gray-600">Cargando...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : proposals.length === 0 ? (
        <p className="text-gray-700">No hay propuestas.</p>
      ) : (
        <div className="overflow-x-auto bg-white border rounded-xl shadow">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Lugar</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Documento</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{p.title}</div>
                    <div className="text-gray-600 line-clamp-2 max-w-xl">{p.proposal}</div>
                  </td>
                  <td className="px-4 py-3">{p.user_id}</td>
                  <td className="px-4 py-3">{p.location}</td>
                  <td className="px-4 py-3">{p.date}</td>
                  <td className="px-4 py-3">
                    {p.document_path ? (
                      <a
                        href={p.document_path.startsWith('/uploads') ? `${API_BASE_URL}${p.document_path}` : p.document_path}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-500"
                      >
                        Ver archivo
                      </a>
                    ) : (
                      <span className="text-gray-400">Sin archivo</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${p.status === 'approved' ? 'bg-green-100 text-green-800' : p.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      onClick={() => onSetStatus(p.id, 'approved')}
                      disabled={updatingId === p.id}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-500 disabled:opacity-60"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => onSetStatus(p.id, 'rejected')}
                      disabled={updatingId === p.id}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500 disabled:opacity-60"
                    >
                      Rechazar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


