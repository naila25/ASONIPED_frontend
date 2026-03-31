import { useState, useEffect } from 'react';
import { fetchWorkshopForms } from '../Services/fetchWorkshops';
import type { WorkshopForm, WorkshopOption } from '../Types/workshop';
import AttendancePageHeader from '../../Attendance/Components/AttendancePageHeader';
import {
  Users,
  Search,
  XCircle,
  Filter,
  Mail,
  Phone,
  Calendar,
  MapPin,
} from 'lucide-react';

/** Fila enriquecida tras el mapeo desde el backend */
type WorkshopEnrollmentRow = WorkshopForm & {
  workshopTitle?: string;
  fechaInscripcion?: string;
  workshopInfo?: {
    titulo?: string;
    descripcion?: string;
    ubicacion?: string;
    fecha?: string;
    hora?: string;
    capacidad?: number;
  };
};

const WorkshopFormsTallerPage = () => {
  const [forms, setForms] = useState<WorkshopEnrollmentRow[]>([]);
  const [options, setOptions] = useState<WorkshopOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const itemsPerPage = 6;

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const formsResponse = await fetchWorkshopForms();
        const rawForms = formsResponse.enrollments || formsResponse.inscripciones || [];

        const transformedForms: WorkshopEnrollmentRow[] = rawForms.map(
          (enrollment: {
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
            status: enrollment.status === 'cancelled' ? 'cancelled' : 'enrolled',
            enrollmentDate: enrollment.enrollment_date,
            fechaInscripcion: enrollment.enrollment_date,
            cancellationDate: enrollment.cancellation_date,
            notes: enrollment.notes,
            workshopOptionId: enrollment.workshop_id,
            workshopTitle: enrollment.workshop_titulo,
            asistencia: enrollment.asistencia || false,
            personalInfo: {
              nombre: enrollment.user_full_name,
              email: enrollment.user_email,
              username: enrollment.user_username,
              telefono: enrollment.user_phone || enrollment.user_telefono || '',
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
              imagen: enrollment.workshop_imagen,
            },
          })
        );

        setForms(transformedForms);

        const uniqueOptions: WorkshopOption[] = Array.from(
          new Set(transformedForms.map((f) => f.workshopTitle).filter(Boolean))
        ).map((title, index) => ({
          id: String(index + 1),
          title: (title as string) || 'Sin título',
        }));
        setOptions(uniqueOptions);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const filteredForms = (forms || []).filter((form) => {
    // Admin list should show only active enrollments.
    // When the user cancels, backend sets status to "cancelled",
    // so filtering here makes the cancellation immediately reflected.
    const isActive = form.status === 'enrolled';
    const matchesSearch =
      searchTerm === '' ||
      form.personalInfo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.personalInfo.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOption =
      selectedOption === 'all' || form.workshopTitle === selectedOption;
    return isActive && matchesSearch && matchesOption;
  });

  const totalPages = Math.max(1, Math.ceil(filteredForms.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentForms = filteredForms.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handlePreviousPage = () => {
    if (currentPage > 1) handlePageChange(currentPage - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) handlePageChange(currentPage + 1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedOption]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
    }
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return 'T';
  };

  const WorkshopEnrollmentCard = ({ form }: { form: WorkshopEnrollmentRow }) => {
    const initials = getInitials(form.personalInfo.nombre);
    const wi = form.workshopInfo;

    return (
      <article className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500" aria-hidden />

        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-sm font-extrabold text-teal-700 ring-1 ring-teal-100">
              {initials}
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-base font-semibold text-gray-900">{form.personalInfo.nombre}</h4>
              <p className="truncate text-xs text-gray-500">
                {form.fechaInscripcion ? formatDate(form.fechaInscripcion) : '—'}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700">
                <Mail className="h-4 w-4 text-gray-400" aria-hidden />
                <span className="max-w-[18rem] truncate">{form.personalInfo.email}</span>
              </span>
              {form.personalInfo.telefono && (
                <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700">
                  <Phone className="h-4 w-4 text-gray-400" aria-hidden />
                  <span className="truncate">{form.personalInfo.telefono}</span>
                </span>
              )}
            </div>
          </div>

          {(wi?.ubicacion || wi?.fecha || wi?.hora) && (
            <div className="mt-4 space-y-2 rounded-2xl border border-gray-100 bg-gray-50/60 p-4 text-sm text-gray-700">
              {wi?.ubicacion && (
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                  <span>{wi.ubicacion}</span>
                </p>
              )}
              {(wi?.fecha || wi?.hora) && (
                <p className="flex items-start gap-2">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" aria-hidden />
                  <span>
                    {[wi?.fecha, wi?.hora].filter(Boolean).join(' · ') || '—'}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
      </article>
    );
  };

  if (loading && forms.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-8xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <div className="h-24 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-40 animate-pulse rounded-xl bg-gray-200" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && forms.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="mb-4 flex items-center space-x-3 text-red-600">
            <XCircle className="h-6 w-6" />
            <h3 className="text-lg font-medium">Error</h3>
          </div>
          <p className="mb-4 text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AttendancePageHeader
        icon={<Users className="h-6 w-6" />}
        title="Inscripciones a talleres"
        description="Consulta inscripciones y filtra por taller o búsqueda."
        actions={
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2"
          >
            {viewMode === 'cards' ? <Filter className="h-4 w-4" /> : <Users className="h-4 w-4" />}
            {viewMode === 'cards' ? 'Ver tabla' : 'Ver tarjetas'}
          </button>
        }
        showSubNav={false}
      />

      <div className="mx-auto max-w-8xl px-4 py-6 sm:px-6 lg:px-8">
        {error && (
          <div
            className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
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

        <div className="mb-8 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-medium text-gray-900">Filtros y búsqueda</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Buscar inscritos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <select
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">Todos los talleres</option>
              {options.map((option) => (
                <option key={option.id} value={option.title}>
                  {option.title}
                </option>
              ))}
            </select>

            <div className="flex items-center text-sm text-gray-500">
              <span className="font-medium text-gray-700">{filteredForms.length}</span>
              <span className="ml-1">inscripciones encontradas</span>
            </div>
          </div>
        </div>

        {viewMode === 'cards' ? (
          <div className="space-y-6">
            {filteredForms.length === 0 && (
              <div className="rounded-xl border border-gray-100 bg-white px-4 py-12 text-center text-sm text-gray-600 shadow-sm">
                No hay inscripciones con los filtros actuales.
              </div>
            )}
            {options.map((option) => {
              const optionForms = filteredForms.filter((form) => form.workshopTitle === option.title);
              if (optionForms.length === 0) return null;

              return (
                <section key={option.id} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                  <div className="border-b border-gray-100 bg-white px-4 py-4 sm:px-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-base font-semibold text-gray-900 sm:text-lg">{option.title}</h3>
                      <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-semibold text-gray-700">
                        {optionForms.length} inscripciones
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {optionForms.map((form) => (
                        <WorkshopEnrollmentCard key={form.id} form={form} />
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}

            <div className="pt-2 text-center text-sm text-gray-600">
              {filteredForms.length} inscripciones encontradas
            </div>
          </div>
        ) : (
          <section className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gradient-to-r from-teal-50/80 to-white px-4 py-4 sm:px-6">
              <h3 className="text-base font-semibold text-gray-900">Vista tabla</h3>
              <p className="mt-1 text-sm text-gray-600">
                {filteredForms.length} inscripciones
                {totalPages > 0 && (
                  <span className="text-gray-500">
                    {' '}
                    · Página {currentPage} de {totalPages}
                  </span>
                )}
              </p>
            </div>

            <ul className="divide-y divide-gray-100 md:hidden" aria-label="Lista de inscripciones">
              {currentForms.map((form) => {
                const initials = getInitials(form.personalInfo.nombre);
                return (
                  <li key={form.id} className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-xs font-bold text-teal-800 ring-1 ring-teal-100">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1 space-y-2">
                        <p className="text-sm font-semibold text-gray-900">{form.personalInfo.nombre}</p>
                        <div className="space-y-1 text-xs text-gray-600">
                          <p className="truncate">
                            <span className="font-medium text-gray-500">Correo: </span>
                            {form.personalInfo.email}
                          </p>
                          {form.personalInfo.telefono && (
                            <p>
                              <span className="font-medium text-gray-500">Tel: </span>
                              {form.personalInfo.telefono}
                            </p>
                          )}
                        </div>
                        <div className="rounded-lg border border-gray-100 bg-gray-50/80 px-3 py-2">
                          <p className="text-xs font-medium text-gray-500">Taller</p>
                          <p className="text-sm font-medium text-gray-900">{form.workshopTitle ?? '—'}</p>
                          <p className="mt-0.5 text-[11px] text-gray-500">
                            {form.fechaInscripcion ? formatDate(form.fechaInscripcion) : '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="hidden md:block">
              <div className="max-h-[min(70vh,680px)] overflow-auto">
                <table className="min-w-full border-collapse text-left">
                  <thead>
                    <tr className="sticky top-0 z-10 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/80">
                      <th
                        scope="col"
                        className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:px-6"
                      >
                        Inscrito
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
                        Taller
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {currentForms.map((form) => {
                      const initials = getInitials(form.personalInfo.nombre);
                      return (
                        <tr key={form.id} className="transition-colors hover:bg-teal-50/40">
                          <td className="whitespace-nowrap px-4 py-4 sm:px-6">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-xs font-bold text-teal-800 ring-1 ring-teal-100">
                                {initials}
                              </div>
                              <p className="text-sm font-semibold text-gray-900">{form.personalInfo.nombre}</p>
                            </div>
                          </td>
                          <td className="max-w-[14rem] px-4 py-4 sm:max-w-xs sm:px-6">
                            <p className="truncate text-sm text-gray-900">{form.personalInfo.email}</p>
                            {form.personalInfo.telefono && (
                              <p className="mt-0.5 text-xs text-gray-500">{form.personalInfo.telefono}</p>
                            )}
                          </td>
                          <td className="min-w-[12rem] px-4 py-4 sm:px-6">
                            <p className="text-sm font-medium text-gray-900">{form.workshopTitle ?? '—'}</p>
                            <p className="mt-0.5 text-xs text-gray-500">
                              {form.fechaInscripcion ? formatDate(form.fechaInscripcion) : '—'}
                            </p>
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
                  className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
                    currentPage === 1
                      ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
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
                      className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl px-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
                        currentPage === page
                          ? 'bg-teal-600 text-white'
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
                  className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
                    currentPage === totalPages
                      ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
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

export default WorkshopFormsTallerPage;
