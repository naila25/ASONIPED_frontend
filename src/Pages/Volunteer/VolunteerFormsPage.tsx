import { useState, useEffect } from 'react';
import { fetchVolunteerForms, updateVolunteerFormStatus, fetchVolunteerOptions } from '../../Utils/fetchVolunteers';
import type { VolunteerForm, VolunteerOption } from '../../types/volunteer';
import { Users, Search, Clock, CheckCircle, XCircle } from 'lucide-react';

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

  // Calculate statistics
  const stats = {
    total: forms.length,
    pending: forms.filter(f => f.status === 'pending').length,
    approved: forms.filter(f => f.status === 'approved').length,
    rejected: forms.filter(f => f.status === 'rejected').length,
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <XCircle className="h-6 w-6" />
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

  // Main render
  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-lg flex-shrink-0">
            <Users className="w-6 h-6 text-orange-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Gestión de Voluntarios</h1>
            <p className="text-gray-600 text-sm sm:text-base">Administra y revisa todos los formularios de voluntariado</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600">Total Voluntarios</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg flex-shrink-0">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600">Aprobados</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.approved}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600">Rechazados</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.rejected}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg flex-shrink-0">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
          <h2 className="text-lg font-semibold text-gray-900">Filtros y Búsqueda</h2>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar voluntarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Todos los voluntariados</option>
              {options.map(option => (
                <option key={option.id} value={option.id}>{option.title}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendiente</option>
              <option value="approved">Aprobado</option>
              <option value="rejected">Rechazado</option>
            </select>
          </div>
        </div>

        {/* Forms by Category */}
        <div className="space-y-6">
          {options.map(option => {
            const optionForms = filteredForms.filter(form => String(form.volunteerOptionId) === String(option.id));
            if (optionForms.length === 0) return null;

            return (
              <div key={option.id} className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">{option.title}</h3>
                  <span className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full flex-shrink-0">
                    {optionForms.length} voluntarios
                  </span>
                </div>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Nombre</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">Email</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Teléfono</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[60px]">Edad</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">Disponibilidad</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Habilidades</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Estado</th>
                            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {optionForms.map(form => (
                            <tr key={form.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-3 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900 min-w-[120px]" title={`${form.personalInfo.firstName} ${form.personalInfo.lastName}`}>
                                  {form.personalInfo.firstName} {form.personalInfo.lastName}
                                </div>
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 min-w-[180px]" title={form.personalInfo.email}>
                                  {form.personalInfo.email}
                                </div>
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[100px]">
                                {form.personalInfo.phone}
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 min-w-[60px]">
                                {form.personalInfo.age}
                              </td>
                              <td className="px-3 py-4">
                                <div className="text-sm text-gray-900 min-w-[150px]">
                                  <div className="font-medium" title={form.availability.days.join(', ')}>
                                    {form.availability.days.join(', ')}
                                  </div>
                                  <div className="text-gray-600" title={form.availability.timeSlots.join(', ')}>
                                    {form.availability.timeSlots.join(', ')}
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-4">
                                <div className="min-w-[120px] text-sm text-gray-900" title={form.skills}>
                                  {form.skills}
                                </div>
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium min-w-[100px] inline-block text-center ${
                                  form.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  form.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {form.status === 'approved' ? 'Aprobado' :
                                   form.status === 'rejected' ? 'Rechazado' :
                                   'Pendiente'}
                                </span>
                              </td>
                              <td className="px-3 py-4 whitespace-nowrap">
                                <select
                                  value={form.status}
                                  onChange={(e) => handleStatusChange(Number(form.id), e.target.value as 'pending' | 'approved' | 'rejected')}
                                  className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 min-w-[100px]"
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
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                {'<<'}
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                {'<'}
              </button>
              <span className="px-4 py-2 text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                {'>'}
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                {'>>'}
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerFormsPage;