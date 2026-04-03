import { useState, useEffect } from 'react';
import { fetchVolunteerForms, fetchVolunteerOptions } from '../Services/fetchVolunteers';
import type { VolunteerForm, VolunteerOption } from '../Types/volunteer';
import AttendancePageHeader from '../../Attendance/Components/AttendancePageHeader';
import { 
  Users, 
  Search, 
  XCircle, 
  Filter,
  Mail,
  Phone,
  Calendar,
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  
  // Client-side pagination settings
  const itemsPerPage = 6;

  // Load forms and options on mount
  useEffect(() => {
    // Defer initial data loading to improve initial render
    const timer = setTimeout(async () => {
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
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  // Filter forms by search and option
  const filteredForms = forms.filter(form => {
    const matchesSearch = searchTerm === '' || 
      form.personalInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.personalInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOption = selectedOption === 'all' || String(form.volunteerOptionId) === selectedOption;
    return matchesSearch && matchesOption;
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
  }, [searchTerm, selectedOption]);

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

  const getInitials = (firstName?: string, lastName?: string) => {
    const f = (firstName ?? '').trim();
    const l = (lastName ?? '').trim();
    const first = f ? f[0] : '';
    const last = l ? l[0] : '';
    const initials = `${first}${last}`.toUpperCase();
    return initials || 'V';
  };

  const VolunteerFormCard = ({ form }: { form: VolunteerForm }) => {
    const initials = getInitials(form.personalInfo.firstName, form.personalInfo.lastName);

    return (
      <article className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 to-sky-600" aria-hidden />

        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sm font-extrabold text-sky-700 ring-1 ring-sky-100">
              {initials}
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-base font-semibold text-gray-900">
                {form.personalInfo.firstName} {form.personalInfo.lastName}
              </h4>
              <p className="truncate text-xs text-gray-500">{formatDate(form.submissionDate)}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700">
                <Mail className="h-4 w-4 text-gray-400" aria-hidden />
                <span className="max-w-[18rem] truncate">{form.personalInfo.email}</span>
              </span>
              {form.personalInfo.phone && (
                <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700">
                  <Phone className="h-4 w-4 text-gray-400" aria-hidden />
                  <span className="truncate">{form.personalInfo.phone}</span>
                </span>
              )}
              {form.personalInfo.age && (
                <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700">
                  <Calendar className="h-4 w-4 text-gray-400" aria-hidden />
                  <span>{form.personalInfo.age} años</span>
                </span>
              )}
            </div>
          </div>

          {(form.availability.days.length > 0 || form.skills || form.motivation) && (
            <div className="mt-4 space-y-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
              {form.availability.days.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Disponibilidad</h5>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {form.availability.days.map((day, index) => (
                      <span key={index} className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700">
                        {day}
                      </span>
                    ))}
                  </div>
                  {form.availability.timeSlots.length > 0 && (
                    <p className="mt-2 text-sm text-gray-700">
                      <span className="font-semibold">Horarios:</span> {form.availability.timeSlots.join(', ')}
                    </p>
                  )}
                </div>
              )}

              {form.skills && (
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Habilidades</h5>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700">{form.skills}</p>
                </div>
              )}

              {form.motivation && (
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Motivación</h5>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700">{form.motivation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </article>
    );
  };

  // Show skeleton UI instead of full loading screen for better perceived performance
  if (loading && forms.length === 0) {
    return (
      <div className="space-y-6 min-w-0">
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
            <div className="h-6 bg-gray-200 rounded w-64 animate-pulse"></div>
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 space-y-3">
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
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
    <div className="min-h-screen bg-gray-50">
      <AttendancePageHeader
        accent="sky"
        icon={<Users className="h-6 w-6" />}
        title="Formularios de voluntariado"
        description="Revisa postulaciones y filtra por voluntariado o búsqueda."
        actions={
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
            >
              {viewMode === 'cards' ? <Filter className="h-4 w-4" /> : <Users className="h-4 w-4" />}
              {viewMode === 'cards' ? 'Ver tabla' : 'Ver tarjetas'}
            </button>
          </div>
        }
        showSubNav={false}
      />

      <div className="mx-auto max-w-8xl px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            <div className="flex items-start gap-2">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              aria-label="Cerrar mensaje"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        )}

      {/* Filters and Search */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-medium text-gray-900">Filtros y Búsqueda</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar voluntarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          
          <select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Todos los voluntariados</option>
            {options.map(option => (
              <option key={option.id} value={option.id}>{option.title}</option>
            ))}
          </select>
          
          <div className="flex items-center text-sm text-gray-500">
            <span className="font-medium text-gray-700">{filteredForms.length}</span>
            <span className="ml-1">voluntarios encontrados</span>
          </div>
        </div>
      </div>

      {/* Volunteer Forms */}
      {viewMode === 'cards' ? (
        <>
         

          <div className="space-y-6">
            {/* Unassigned Forms Section */}
            {(() => {
              const unassignedForms = filteredForms.filter(form => !form.volunteerOptionId || form.volunteerOptionId === 'null');
              if (unassignedForms.length === 0) return null;
              
              return (
                <section key="unassigned" className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                  <div className="border-b border-gray-100 bg-white px-4 py-4 sm:px-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Voluntariados</p>
                        <h3 className="text-base font-semibold text-gray-900 sm:text-lg">Sin asignar</h3>
                      </div>
                      <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-800">
                        {unassignedForms.length} voluntarios
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {unassignedForms.map((form) => (
                        <VolunteerFormCard key={form.id} form={form} />
                      ))}
                    </div>
                  </div>
                </section>
              );
            })()}

            {/* Assigned Forms by Volunteer Option */}
            {options.map(option => {
              const optionForms = filteredForms.filter(form => String(form.volunteerOptionId) === String(option.id));
              if (optionForms.length === 0) return null;

            return (
              <section key={option.id} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="border-b border-gray-100 bg-white px-4 py-4 sm:px-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-gray-900 sm:text-lg">{option.title}</h3>
                    <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-semibold text-gray-700">
                      {optionForms.length} voluntarios
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {optionForms.map((form) => (
                      <VolunteerFormCard key={form.id} form={form} />
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
           {/* Info for Cards */}
          <div className="pt-2 text-center text-sm text-gray-600">
            {filteredForms.length} voluntarios encontrados
          </div>
          </div>
        </>
      ) : (
        <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gradient-to-r from-sky-50/80 to-white px-4 py-4 sm:px-6">
            <h3 className="text-base font-semibold text-gray-900">Vista tabla</h3>
            <p className="mt-1 text-sm text-gray-600">
              {filteredForms.length} postulaciones
              {totalPages > 0 && (
                <span className="text-gray-500">
                  {' '}
                  · Página {currentPage} de {Math.max(1, totalPages)}
                </span>
              )}
            </p>
          </div>

          {/* Mobile: tarjetas compactas */}
          <ul className="divide-y divide-gray-100 md:hidden" aria-label="Lista de postulaciones">
            {currentForms.map((form) => {
              const option = options.find((opt) => String(opt.id) === String(form.volunteerOptionId));
              const initials = getInitials(form.personalInfo.firstName, form.personalInfo.lastName);
              return (
                <li key={form.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-xs font-bold text-sky-800 ring-1 ring-sky-100">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {form.personalInfo.firstName} {form.personalInfo.lastName}
                        </p>
                        {form.personalInfo.age && (
                          <p className="text-xs text-gray-500">{form.personalInfo.age} años</p>
                        )}
                      </div>
                      <div className="space-y-1 text-xs text-gray-600">
                        <p className="truncate">
                          <span className="font-medium text-gray-500">Correo: </span>
                          {form.personalInfo.email}
                        </p>
                        {form.personalInfo.phone && (
                          <p>
                            <span className="font-medium text-gray-500">Tel: </span>
                            {form.personalInfo.phone}
                          </p>
                        )}
                      </div>
                      <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2">
                        <p className="text-xs font-medium text-gray-500">Voluntariado</p>
                        <p className="text-sm font-medium text-gray-900">{option?.title ?? 'Sin asignar'}</p>
                        <p className="mt-0.5 text-[11px] text-gray-500">{formatDate(form.submissionDate)}</p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Desktop: tabla con cabecera fija */}
          <div className="hidden md:block">
            <div className="max-h-[min(70vh,680px)] overflow-auto">
              <table className="min-w-full border-collapse text-left">
                <thead>
                  <tr className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
                    <th
                      scope="col"
                      className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-6"
                    >
                      Voluntario
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-6"
                    >
                      Contacto
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-6"
                    >
                      Voluntariado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {currentForms.map((form) => {
                    const option = options.find((opt) => String(opt.id) === String(form.volunteerOptionId));
                    const initials = getInitials(form.personalInfo.firstName, form.personalInfo.lastName);
                    return (
                      <tr
                        key={form.id}
                        className="transition-colors hover:bg-sky-50/40"
                      >
                        <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-xs font-bold text-sky-800 ring-1 ring-sky-100">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900">
                                {form.personalInfo.firstName} {form.personalInfo.lastName}
                              </p>
                              {form.personalInfo.age && (
                                <p className="text-xs text-gray-500">{form.personalInfo.age} años</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="max-w-[14rem] px-4 py-4 sm:max-w-xs sm:px-6">
                          <p className="truncate text-sm text-gray-900">{form.personalInfo.email}</p>
                          {form.personalInfo.phone && (
                            <p className="mt-0.5 text-xs text-gray-500">{form.personalInfo.phone}</p>
                          )}
                        </td>
                        <td className="min-w-[12rem] px-4 py-4 sm:px-6">
                          <p className="text-sm font-medium text-gray-900">{option?.title ?? 'Sin asignar'}</p>
                          <p className="mt-0.5 text-xs text-gray-500">{formatDate(form.submissionDate)}</p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {currentForms.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-gray-600 sm:px-6">
              No hay resultados con los filtros actuales.
            </div>
          )}
        </section>
      )}

      {/* Pagination for Table View */}
      {viewMode === 'table' && filteredForms.length > 0 && (
        <>
          <div className="mt-6 text-center text-sm text-gray-600">
            Mostrando {startIndex + 1}–{Math.min(endIndex, filteredForms.length)} de {filteredForms.length}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${
                  currentPage === 1
                    ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                    : 'bg-sky-600 text-white hover:bg-sky-700'
                }`}
              >
                Anterior
              </button>

              <div className="flex flex-wrap justify-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => handlePageChange(page)}
                    className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl px-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${
                      currentPage === page
                        ? 'bg-sky-600 text-white'
                        : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${
                  currentPage === totalPages
                    ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                    : 'bg-sky-600 text-white hover:bg-sky-700'
                }`}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
};

export default VolunteerFormsPage;