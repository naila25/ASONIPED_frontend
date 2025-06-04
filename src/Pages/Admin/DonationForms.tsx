import { useState, useEffect } from 'react';
import type { DonationForm } from '../../Utils/donationForms';
import { fetchDonationForms, updateDonationForm, deleteDonationForm } from '../../Utils/donationForms';

/**
 * Admin page for managing donation forms.
 * Allows viewing, updating status, and deleting donations.
 */
const DonationForms = () => {
  // State for donation forms, loading, error, pagination
  const [forms, setForms] = useState<DonationForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  // Fetch donation forms on mount and when page changes
  useEffect(() => {
    const loadForms = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchDonationForms(page, itemsPerPage);
        if (response.error) {
          setError(response.error.message);
          return;
        }
        if (response.data) {
          setForms(response.data);
          if (response.metadata) {
            setTotalPages(Math.ceil(response.metadata.total / itemsPerPage));
          }
        }
      } catch {
        setError('Failed to load donation forms');
      } finally {
        setLoading(false);
      }
    };
    loadForms();
  }, [page]);

 
  const handleStatusChange = async (correo: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      setError(null);
      const response = await updateDonationForm(correo, newStatus);
      if (response.error) {
        setError(response.error.message);
        return;
      }
      // Update local state
      setForms(forms.map(form =>
        form.correo === correo ? { ...form, status: newStatus } : form
      ));
    } catch {
      setError('Failed to update donation form status');
    }
  };

 
  const handleDelete = async (correo: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta donación?')) return;
    setError(null);
    try {
      const response = await deleteDonationForm(correo);
      if (response.error) {
        setError(response.error.message);
        return;
      }
      setForms(forms.filter(form => form.correo !== correo));
    } catch {
      setError('Error al eliminar la donación');
    }
  };

  // Loading state
  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  // Error state
  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl  mb-6">Formularios de Donaciones</h2>
      
      {forms.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No donation forms found</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 border-b text-left">Nombre</th>
                  <th className="px-6 py-3 border-b text-left">Teléfono</th>
                  <th className="px-6 py-3 border-b text-left">Correo</th>
                  <th className="px-6 py-3 border-b text-left">Tipo</th>
                  <th className="px-6 py-3 border-b text-left">Método</th>
                  <th className="px-6 py-3 border-b text-left">Monto</th>
                  <th className="px-6 py-3 border-b text-left">Status</th>
                  <th className="px-6 py-3 border-b text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => (
                  <tr key={form.correo} className="hover:bg-gray-50">
                    <td className="px-6 py-4 border-b">{form.nombre}</td>
                    <td className="px-6 py-4 border-b">{form.telefono}</td>
                    <td className="px-6 py-4 border-b">{form.correo}</td>
                    <td className="px-6 py-4 border-b">{form.tipo}</td>
                    <td className="px-6 py-4 border-b">{form.metodo}</td>
                    <td className="px-6 py-4 border-b">${form.monto}</td>
                    <td className="px-6 py-4 border-b">
                      <span className={`px-2 py-1 rounded text-sm ${
                        form.status === 'approved' ? 'bg-green-100 text-green-800' :
                        form.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {form.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 border-b">
                      <select
                        value={form.status || 'pending'}
                        onChange={(e) => handleStatusChange(form.correo, e.target.value as 'pending' | 'approved' | 'rejected')}
                        className="border rounded px-2 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <button
                        onClick={() => handleDelete(form.correo)}
                        className="ml-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-700"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DonationForms;