import { useState, useEffect } from 'react';
import { fetchVolunteerForms, updateVolunteerFormStatus, fetchVolunteerOptions } from '../../Utils/fetchVolunteers';
import type { VolunteerForm, VolunteerOption } from '../../types/volunteer';

// Type for backend volunteer data
type BackendVolunteer = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  age?: string;
  availability_days?: string;
  availability_time_slots?: string;
  skills?: string;
  motivation?: string;
  status: 'pending' | 'approved' | 'rejected';
  submission_date: string;
  volunteer_option_id: string;
};

// Volunteer forms admin page component
const VolunteerFormsPage = () => {
  // State for forms, options, loading, error, pagination, filters
  const [forms, setForms] = useState<VolunteerForm[]>([]);
  const [options, setOptions] = useState<VolunteerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('all');

  // Load forms and options on mount or page change
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [formsResponse, optionsResponse] = await Promise.all([
          fetchVolunteerForms(currentPage, 10),
          fetchVolunteerOptions()
        ]);
        // Transform backend data to frontend format
        const transformedForms = (formsResponse.volunteers as BackendVolunteer[]).map((v) => ({
          id: String(v.id),
          personalInfo: {
            firstName: v.first_name,
            lastName: v.last_name,
            email: v.email,
            phone: v.phone || '',
            age: v.age || '',
          },
          availability: {
            days: v.availability_days ? v.availability_days.split(',').map((d) => d.trim()) : [],
            timeSlots: v.availability_time_slots ? v.availability_time_slots.split(',').map((t) => t.trim()) : [],
          },
          skills: v.skills || '',
          motivation: v.motivation || '',
          volunteerOptionId: String(v.volunteer_option_id),
          submissionDate: v.submission_date,
          status: v.status,
        }));
        setForms(transformedForms);
        setOptions(optionsResponse);
        setTotalPages(Math.ceil((formsResponse.total || 0) / 10));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentPage]);

  // Handle status change for a volunteer form
  const handleStatusChange = async (formId: number, newStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      await updateVolunteerFormStatus(formId, newStatus);
      setForms(forms.map(form => 
        Number(form.id) === formId ? { ...form, status: newStatus } : form
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating form status');
    }
  };

  // Filter forms by status, search, and option
  const filteredForms = forms.filter(form => {
    const matchesStatus = statusFilter === 'all' || form.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      form.personalInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.personalInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOption = selectedOption === 'all' || String(form.volunteerOptionId) === selectedOption;
    return matchesStatus && matchesSearch && matchesOption;
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          <p className="text-gray-600">Cargando formularios...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-medium">Error</h3>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  // Main render: filters and (currently commented) forms list
  return (
    <div className=" bg-gray-50">
      <main className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
            <h2 className="text-2xl font-bold text-gray-800">Formularios de Voluntariado</h2>
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <select
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="px-4 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="all">Todos los voluntariados</option>
                {options.map(option => (
                  <option key={option.id} value={option.id}>{option.title}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="px-4 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="approved">Aprobado</option>
                <option value="rejected">Rechazado</option>
              </select>
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>
          <div className="space-y-6">
            {options.map(option => {
              const optionForms = filteredForms.filter(form => String(form.volunteerOptionId) === String(option.id));
              if (optionForms.length === 0) return null;

              return (
                <div key={option.id} className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">{option.title}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm font-medium text-gray-700">
                          <th className="px-4 py-2">Nombre</th>
                          <th className="px-4 py-2">Email</th>
                          <th className="px-4 py-2">Teléfono</th>
                          <th className="px-4 py-2">Edad</th>
                          <th className="px-4 py-2">Disponibilidad</th>
                          <th className="px-4 py-2">Habilidades</th>
                          <th className="px-4 py-2">Estado</th>
                          <th className="px-4 py-2">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {optionForms.map(form => (
                          <tr key={form.id} className="hover:bg-gray-100">
                            <td className="px-4 py-3 text-gray-900">
                              {form.personalInfo.firstName} {form.personalInfo.lastName}
                            </td>
                            <td className="px-4 py-3 text-gray-900">{form.personalInfo.email}</td>
                            <td className="px-4 py-3 text-gray-900">{form.personalInfo.phone}</td>
                            <td className="px-4 py-3 text-gray-900">{form.personalInfo.age}</td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900">
                                <div>{form.availability.days.join(', ')}</div>
                                <div className="text-gray-600">{form.availability.timeSlots.join(', ')}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="max-w-xs truncate text-gray-900">{form.skills}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                                form.status === 'approved' ? 'bg-green-100 text-green-800' :
                                form.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {form.status === 'approved' ? 'Aprobado' :
                                 form.status === 'rejected' ? 'Rechazado' :
                                 'Pendiente'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={form.status}
                                onChange={(e) => handleStatusChange(Number(form.id), e.target.value as 'pending' | 'approved' | 'rejected')}
                                className="px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-orange-500 text-gray-900"
                              >
                                <option value="pending">Pendiente</option>
                                <option value="approved">Aprobar</option>
                                <option value="rejected">Rechazar</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  {'<<'}
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  {'<'}
                </button>
                <span className="px-3 py-1">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  {'>'}
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  {'>>'}
                </button>
              </nav>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default VolunteerFormsPage;