
import { useState, useEffect } from 'react';
import  { DonationForm, fetchDonationForms, updateDonationForm } from '../../Utils/donationForms';

const DonationForms = () => {
  const [forms, setForms] = useState<DonationForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadForms = async () => {
      try {
        console.log('Starting to fetch donation forms...');
        setLoading(true);
        setError(null);
        const response = await fetchDonationForms(page, itemsPerPage);
        console.log('Fetch response:', response);
        
        if (response.error) {
          console.error('Error in response:', response.error);
          setError(response.error.message);
          return;
        }

        if (response.data) {
          console.log('Setting forms:', response.data);
          setForms(response.data);
          if (response.metadata) {
            setTotalPages(Math.ceil(response.metadata.total / itemsPerPage));
          }
        }
      } catch (err) {
        console.error('Error in loadForms:', err);
        setError('Failed to load donation forms');
      } finally {
        setLoading(false);
      }
    };

    loadForms();
  }, [page]);

  const handleStatusChange = async (correo: string, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      console.log('Updating form status:', { correo, newStatus });
      setError(null);
      const response = await updateDonationForm(correo, newStatus);
      console.log('Update response:', response);
      
      if (response.error) {
        console.error('Error in update:', response.error);
        setError(response.error.message);
        return;
      }

      // Update local state
      setForms(forms.map(form => 
        form.correo === correo ? { ...form, status: newStatus } : form
      ));
    } catch (err) {
      console.error('Error in handleStatusChange:', err);
      setError('Failed to update donation form status');
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

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
      <h2 className="text-2xl font-bold mb-6">Donation Forms Management</h2>
      
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