import { useState, useEffect } from 'react';
import { fetchVolunteerForms, updateVolunteerFormStatus, fetchVolunteerOptions } from '../Services/fetchVolunteers';
import type { VolunteerForm, VolunteerOption } from '../Types/volunteer';
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
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

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
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('all');
  const [expandedForms, setExpandedForms] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showUnassigned, setShowUnassigned] = useState(false);
  
  // Client-side pagination settings
  const itemsPerPage = 6;

  // Load forms and options on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [formsResponse, optionsResponse] = await Promise.all([
          fetchVolunteerForms(1, 1000), // Fetch all forms
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
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

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

  // Client-side pagination calculations
  const totalPages = Math.ceil(filteredForms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentForms = filteredForms.slice(startIndex, endIndex);


  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, selectedOption]);

  // Calculate statistics
  const stats = {
    total: forms.length,
    pending: forms.filter(f => f.status === 'pending').length,
    approved: forms.filter(f => f.status === 'approved').length,
    rejected: forms.filter(f => f.status === 'rejected').length,
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
      case 'approved':
        return { color: 'bg-green-100 text-green-800 border-green-200', text: 'Aprobado', icon: CheckCircle };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800 border-red-200', text: 'Rechazado', icon: XCircle };
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
    <div className="max-w-8xl mx-auto px-8 py-8 bg-white rounded-lg shadow-sm p-4 sm:p-6">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Gestión de Voluntarios</h2>
            
          </div>
          <div className="flex items-center gap-3">
            {viewMode === 'cards' && (
              <button
                onClick={() => setShowUnassigned(!showUnassigned)}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-all duration-200 text-sm font-medium ${
                  showUnassigned 
                    ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300' 
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <Eye className="w-4 h-4" />
                {showUnassigned ? 'Ocultar Sin Asignar' : 'Mostrar Sin Asignar'}
              </button>
            )}
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
              placeholder="Buscar voluntarios..."
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
            <option value="all">Todos los voluntariados</option>
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
            <option value="pending">Pendiente</option>
            <option value="approved">Aprobado</option>
            <option value="rejected">Rechazado</option>
          </select>
          
          <div className="text-sm text-gray-500 flex items-center">
            <span className="font-medium text-gray-700">{filteredForms.length}</span>
            <span className="ml-1">voluntarios encontrados</span>
          </div>
        </div>
      </div>

      {/* Volunteer Forms */}
      {viewMode === 'cards' ? (
        <>
         

          <div className="space-y-8">
            {/* Unassigned Forms Section */}
            {showUnassigned && (() => {
              const unassignedForms = filteredForms.filter(form => !form.volunteerOptionId || form.volunteerOptionId === 'null');
              if (unassignedForms.length === 0) return null;
              
              return (
                <div key="unassigned" className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Formularios Sin Asignar</h3>
                      <span className="bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">
                        {unassignedForms.length} voluntarios
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {unassignedForms.map(form => {
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
                                      {form.personalInfo.firstName} {form.personalInfo.lastName}
                                    </h4>
                                    <p className="text-xs text-gray-500">{formatDate(form.submissionDate)}</p>
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
                                {form.personalInfo.phone && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span>{form.personalInfo.phone}</span>
                                  </div>
                                )}
                                {form.personalInfo.age && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span>{form.personalInfo.age} años</span>
                                  </div>
                                )}
                              </div>

                              {/* Expandable Details */}
                              {isExpanded && (
                                <div className="border-t border-gray-200 pt-4 space-y-3">
                                  {form.availability.days.length > 0 && (
                                    <div>
                                      <h5 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Disponibilidad</h5>
                                      <div className="flex flex-wrap gap-1.5">
                                        {form.availability.days.map((day, index) => (
                                          <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md">
                                            {day}
                                          </span>
                                        ))}
                                      </div>
                                      {form.availability.timeSlots.length > 0 && (
                                        <div className="mt-2 text-xs text-gray-500">
                                          Horarios: {form.availability.timeSlots.join(', ')}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {form.skills && (
                                    <div>
                                      <h5 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Habilidades</h5>
                                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200">
                                        {form.skills}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {form.motivation && (
                                    <div>
                                      <h5 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Motivación</h5>
                                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200">
                                        {form.motivation}
                                      </p>
                                    </div>
                                  )}
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
                                  onChange={(e) => handleStatusChange(Number(form.id), e.target.value as 'pending' | 'approved' | 'rejected')}
                                  className="px-2.5 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                >
                                  <option value="pending">Pendiente</option>
                                  <option value="approved">Aprobar</option>
                                  <option value="rejected">Rechazar</option>
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
            })()}

            {/* Assigned Forms by Volunteer Option */}
            {options.map(option => {
              const optionForms = filteredForms.filter(form => String(form.volunteerOptionId) === String(option.id));
              if (optionForms.length === 0) return null;

            return (
              <div key={option.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">{option.title}</h3>
                    <span className="bg-gray-200 text-gray-700 text-sm font-medium px-3 py-1 rounded-full">
                      {optionForms.length} voluntarios
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
                                    {form.personalInfo.firstName} {form.personalInfo.lastName}
                                  </h4>
                                  <p className="text-xs text-gray-500">{formatDate(form.submissionDate)}</p>
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
                              {form.personalInfo.phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  <span>{form.personalInfo.phone}</span>
                                </div>
                              )}
                              {form.personalInfo.age && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span>{form.personalInfo.age} años</span>
                                </div>
                              )}
                            </div>

                            {/* Expandable Details */}
                            {isExpanded && (
                              <div className="border-t border-gray-200 pt-4 space-y-3">
                                {form.availability.days.length > 0 && (
                                  <div>
                                    <h5 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Disponibilidad</h5>
                                    <div className="flex flex-wrap gap-1.5">
                                      {form.availability.days.map((day, index) => (
                                        <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md">
                                          {day}
                                        </span>
                                      ))}
                                    </div>
                                    {form.availability.timeSlots.length > 0 && (
                                      <div className="mt-2 text-xs text-gray-500">
                                        Horarios: {form.availability.timeSlots.join(', ')}
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {form.skills && (
                                  <div>
                                    <h5 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Habilidades</h5>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200">
                                      {form.skills}
                                    </p>
                                  </div>
                                )}
                                
                                {form.motivation && (
                                  <div>
                                    <h5 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Motivación</h5>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border border-gray-200">
                                      {form.motivation}
                                    </p>
                                  </div>
                                )}
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
                                onChange={(e) => handleStatusChange(Number(form.id), e.target.value as 'pending' | 'approved' | 'rejected')}
                                className="px-2.5 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                              >
                                <option value="pending">Pendiente</option>
                                <option value="approved">Aprobar</option>
                                <option value="rejected">Rechazar</option>
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
           {/* Info for Cards */}
           <div className="mb-6 text-center">
            <p className="text-gray-600">
              {filteredForms.length} voluntarios encontrados
            </p>
          </div>
          </div>
        </>
      ) : (
        /* Table View */
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voluntario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voluntariado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentForms.map(form => {
                  const statusInfo = getStatusInfo(form.status);
                  const StatusIcon = statusInfo.icon;
                  const option = options.find(opt => String(opt.id) === String(form.volunteerOptionId));
                  
                  return (
                    <tr key={form.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-slate-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {form.personalInfo.firstName} {form.personalInfo.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {form.personalInfo.age && `${form.personalInfo.age} años`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{form.personalInfo.email}</div>
                        <div className="text-xs text-gray-500">{form.personalInfo.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{option?.title || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{formatDate(form.submissionDate)}</div>
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
                          onChange={(e) => handleStatusChange(Number(form.id), e.target.value as 'pending' | 'approved' | 'rejected')}
                          className="px-2.5 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="approved">Aprobar</option>
                          <option value="rejected">Rechazar</option>
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

      {/* Pagination for Table View */}
      {viewMode === 'table' && (
        <>
          {/* Pagination Info for Table */}
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              Mostrando {startIndex + 1} - {Math.min(endIndex, filteredForms.length)} de {filteredForms.length} voluntarios
            </p>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          {/* Previous Button */}
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentPage === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            Anterior
          </button>

          {/* Page Numbers */}
          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentPage === totalPages
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            Siguiente
          </button>
        </div>
          )}
        </>
      )}
    </div>
  );
};

export default VolunteerFormsPage;