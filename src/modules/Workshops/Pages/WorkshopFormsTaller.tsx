import { useState, useEffect } from 'react';
import { 
  fetchWorkshopForms, // <-- IMPLEMENTA este servicio para tu backend
  updateWorkshopFormStatus // <-- IMPLEMENTA este servicio para tu backend
} from '../Services/fetchWorkshops';
import type { WorkshopForm, WorkshopOption } from '../Types/workshop';
import { 
  Users, 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Filter,
  Eye,
  User,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Workshop forms admin page component
const WorkshopFormsTallerPage = () => {
  // State for forms, options, loading, error, pagination, filters
  const [forms, setForms] = useState<WorkshopForm[]>([]);
  const [options, setOptions] = useState<WorkshopOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'enrolled' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('all');
  const [expandedForms, setExpandedForms] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Load forms on mount or page change
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const formsResponse = await fetchWorkshopForms();
        // Transform backend data to frontend format
        console.log('Forms response:', formsResponse);
        const rawForms = formsResponse.enrollments || formsResponse.inscripciones || [];
        
        // Transform the data to match the expected format
        const transformedForms = rawForms.map((enrollment: {
          id: string;
          status: string;
          enrollment_date: string;
          cancellation_date?: string;
          notes?: string;
          workshop_id: string;
          user_full_name: string;
          user_email: string;
          user_username?: string;
          user_phone?: string;
          user_telefono?: string;
          workshop_titulo: string;
          workshop_descripcion?: string;
          workshop_ubicacion?: string;
          workshop_fecha?: string;
          workshop_hora?: string;
          workshop_capacidad?: number;
          workshop_materiales?: string | string[];
          workshop_aprender?: string;
          workshop_imagen?: string;
          asistencia?: boolean;
        }) => ({
          id: enrollment.id,
          // Map backend status to frontend status
          status: enrollment.status === 'cancelled' ? 'cancelled' : 'enrolled',
          enrollmentDate: enrollment.enrollment_date,
          fechaInscripcion: enrollment.enrollment_date, // Add this for the formatDate function
          cancellationDate: enrollment.cancellation_date,
          notes: enrollment.notes,
          workshopOptionId: enrollment.workshop_id,
          workshopTitle: enrollment.workshop_titulo, // Add this for display
          asistencia: enrollment.asistencia || false, // Add asistencia field
          personalInfo: {
            nombre: enrollment.user_full_name,
            email: enrollment.user_email,
            username: enrollment.user_username,
            telefono: enrollment.user_phone || '' // Add phone number
          },
          workshopInfo: {
            titulo: enrollment.workshop_titulo,
            descripcion: enrollment.workshop_descripcion,
            ubicacion: enrollment.workshop_ubicacion,
            fecha: enrollment.workshop_fecha,
            hora: enrollment.workshop_hora,
            capacidad: enrollment.workshop_capacidad,
            materiales: enrollment.workshop_materiales,
            aprender: enrollment.workshop_aprender,
            imagen: enrollment.workshop_imagen
          }
        }));
        
        setForms(transformedForms);
        
        // Create options from unique workshop titles
        const uniqueOptions = Array.from(new Set(transformedForms.map((form: WorkshopForm) => form.workshopTitle)))
          .map((title, index) => ({
            id: String(index + 1),
            title: (title as string) || 'Sin título'
          }));
        setOptions(uniqueOptions);
        
        setTotalPages(Math.ceil((formsResponse.pagination?.pages || formsResponse.total || 0)));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [currentPage]);

  // Handle status change for a workshop form
  const handleStatusChange = async (formId: number, newStatus: 'pending' | 'approved' | 'rejected' | 'enrolled' | 'cancelled') => {
    try {
      // Map frontend status to backend status
      const backendStatus = newStatus === 'cancelled' ? 'cancelled' : 'enrolled';
      
      await updateWorkshopFormStatus(formId, backendStatus);
      setForms(forms.map(form => 
        Number(form.id) === formId ? { ...form, status: newStatus } : form
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating form status');
    }
  };

  // Filter forms by status, search, and option
  const filteredForms = (forms || []).filter(form => {
    const matchesStatus = statusFilter === 'all' || form.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      form.personalInfo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOption = selectedOption === 'all' || form.workshopTitle === selectedOption;
    return matchesStatus && matchesSearch && matchesOption;
  });

  // Calculate statistics
  const stats = {
    total: (forms || []).length,
    enrolled: (forms || []).filter(f => f.status === 'enrolled').length,
    cancelled: (forms || []).filter(f => f.status === 'cancelled').length,
  };

  // Toggle form expansion
  const toggleFormExpansion = (formId: string) => {
    const newExpanded = new Set(expandedForms);
    if (newExpanded.has(formId)) {
      newExpanded.delete(formId);
    } else {
      newExpanded.add(formId);
    }
    setExpandedForms(newExpanded);
  };

  // Get status color and text
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'enrolled':
        return { color: 'bg-green-100 text-green-800 border-green-200', text: 'Inscrito', icon: CheckCircle };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800 border-red-200', text: 'Cancelado', icon: XCircle };
      default:
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Pendiente', icon: Clock };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    <div className="max-w-8xl mx-auto px-8 py-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 truncate">Gestión de Inscripciones a Talleres</h2>
            
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm font-medium text-gray-700"
            >
              {viewMode === 'cards' ? <Users className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
              {viewMode === 'cards' ? 'Vista de tabla' : 'Vista de tarjetas'}
            </button>
          </div>
        </div>
      </div>



      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-medium text-gray-900">Filtros y Búsqueda</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar inscritos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          
          <select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
          >
            <option value="all">Todos los talleres</option>
            {options.map(option => (
              <option key={option.id} value={option.id}>{option.title}</option>
            ))}
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
          >
            <option value="all">Todos los estados</option>
            <option value="enrolled">Inscrito</option>
            <option value="cancelled">Cancelado</option>
          </select>
          
          <div className="text-sm text-gray-500 flex items-center">
            <span className="font-medium text-gray-700">{filteredForms.length}</span>
            <span className="ml-1">inscripciones encontradas</span>
          </div>
        </div>
      </div>

      {/* Workshop Forms */}
      {viewMode === 'cards' ? (
        <div className="space-y-8">
          {options.map(option => {
            const optionForms = filteredForms.filter(form => form.workshopTitle === option.title);
            if (optionForms.length === 0) return null;

            return (
              <div key={option.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{option.title}</h3>
                    <span className="bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">
                      {optionForms.length} inscripciones
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {optionForms.map(form => {
                      const statusInfo = getStatusInfo(form.status);
                      const StatusIcon = statusInfo.icon;
                      const isExpanded = expandedForms.has(form.id);
                      
                      return (
                        <div key={form.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
                          {/* Card Header */}
                          <div className="p-5">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                  <User className="w-5 h-5 text-slate-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 text-base">
                                    {form.personalInfo.nombre}
                                  </h4>
                                  <p className="text-xs text-gray-500">{formatDate(form.fechaInscripcion)}</p>
                                </div>
                              </div>
                              <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusInfo.color}`}>
                                <StatusIcon className="w-3 h-3 inline mr-1" />
                                {statusInfo.text}
                              </span>
                            </div>

                            {/* Basic Info */}
                            <div className="space-y-2 mb-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="truncate">{form.personalInfo.email}</span>
                              </div>
                              {form.personalInfo.telefono && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  <span>{form.personalInfo.telefono}</span>
                                </div>
                              )}
                            </div>

                            {/* Expandable Details (puedes agregar más campos si tu modelo lo requiere) */}
                            {isExpanded && (
                              <div className="border-t border-gray-200 pt-4 space-y-3">
                                {/* Otros detalles */}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                              <button
                                onClick={() => toggleFormExpansion(form.id)}
                                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-800 font-medium"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                {isExpanded ? 'Ver menos' : 'Ver detalles'}
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                              
                              <select
                                value={form.status}
                                onChange={(e) => handleStatusChange(Number(form.id), e.target.value as 'pending' | 'approved' | 'rejected' | 'enrolled' | 'cancelled')}
                                className="px-2.5 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                              >
                                <option value="enrolled">Inscrito</option>
                                <option value="cancelled">Cancelado</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taller</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredForms.map(form => {
                  const statusInfo = getStatusInfo(form.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <tr key={form.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-slate-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {form.personalInfo.nombre}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{form.personalInfo.email}</div>
                        <div className="text-xs text-gray-500">{form.personalInfo.telefono}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{form.workshopTitle || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{formatDate(form.fechaInscripcion)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={form.status}
                          onChange={(e) => handleStatusChange(Number(form.id), e.target.value as 'pending' | 'approved' | 'rejected' | 'enrolled' | 'cancelled')}
                          className="px-2.5 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                          <option value="enrolled">Inscrito</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
            >
              Primera
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
            >
              Anterior
            </button>
            <span className="px-4 py-2 text-gray-700 bg-gray-50 rounded-md text-sm font-medium border border-gray-200">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
            >
              Siguiente
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
            >
              Última
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default WorkshopFormsTallerPage;