import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { adminFetchAllProposals, adminSetProposalStatus } from '../Services/fetchVolunteers';
import AttendancePageHeader from '../../Attendance/Components/AttendancePageHeader';
import {
  FileText,
  User,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Archive,
  Search,
  Phone,
  Users,
  Mail,
  Filter,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface VolunteerProposal {
  id: number;
  user_id: number;
  title: string;
  proposal: string;
  location: string;
  date: string;
  hour?: string;
  spots?: number;
  tools?: string;
  document_path?: string;
  status: string;
  admin_note?: string;
  created_at: string;
  full_name?: string;
  email?: string;
  phone?: string;
}

const isArchivedProposal = (p: VolunteerProposal) =>
  p.status === 'filed' || (p.admin_note?.includes('[ARCHIVED]') ?? false);

/** Activity calendar day in local time; null if missing or invalid. */
function parseProposalActivityDate(dateString: string): Date | null {
  if (!dateString?.trim()) return null;
  try {
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/');
      const d = parseInt(day, 10);
      const m = parseInt(month, 10);
      const y = parseInt(year, 10);
      if (!Number.isFinite(d) || !Number.isFinite(m) || !Number.isFinite(y)) return null;
      return new Date(y, m - 1, d);
    }
    const dt = new Date(dateString);
    return Number.isNaN(dt.getTime()) ? null : dt;
  } catch {
    return null;
  }
}

/** True when the activity date (local calendar day) is strictly before today. */
function isProposalActivityDatePast(proposal: VolunteerProposal): boolean {
  const activity = parseProposalActivityDate(proposal.date);
  if (!activity) return false;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const activityStart = new Date(activity.getFullYear(), activity.getMonth(), activity.getDate());
  return activityStart < todayStart;
}

const PROPOSALS_PER_SECTION_PAGE = 9;

const SECTION_FILTER_IDS = ['pending', 'approved', 'rejected', 'filed'] as const;
type SectionFilterId = (typeof SECTION_FILTER_IDS)[number];

function ProposalMetaRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-1 border-b border-gray-100 py-3 last:border-b-0 sm:grid-cols-[minmax(0,7.5rem)_1fr] sm:items-start sm:gap-x-4 sm:border-b-0 sm:py-2.5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <Icon className="h-4 w-4 shrink-0 text-gray-400 sm:hidden" aria-hidden />
        {label}
      </div>
      <div className="min-w-0 pl-6 text-sm text-gray-900 sm:pl-0 sm:text-base [overflow-wrap:anywhere]">{children}</div>
    </div>
  );
}

export default function VolunteerProposalsAdmin() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proposals, setProposals] = useState<VolunteerProposal[]>([]);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProposal, setSelectedProposal] = useState<VolunteerProposal | null>(null);
  const [sectionPages, setSectionPages] = useState<Record<string, number>>({});
  const [visibleStates, setVisibleStates] = useState<Record<SectionFilterId, boolean>>({
    pending: true,
    approved: true,
    rejected: true,
    filed: true,
  });
  const [estadoMenuOpen, setEstadoMenuOpen] = useState(false);
  const estadoDropdownRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await adminFetchAllProposals();
      setProposals(res.proposals || []);
      setError(null);
    } catch {
      setError('No se pudieron cargar las propuestas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSetStatus = async (id: number, status: 'approved' | 'rejected' | 'filed') => {
    try {
      setUpdatingId(id);
      setError(null);
      await adminSetProposalStatus(id, status);
      await load();
      setSelectedProposal((cur) => (cur?.id === id ? null : cur));
    } catch {
      setError('No se pudo actualizar el estado. Intenta de nuevo.');
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    if (!selectedProposal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedProposal(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedProposal]);

  useEffect(() => {
    setSelectedProposal((cur) => {
      if (!cur) return null;
      const next = proposals.find((p) => p.id === cur.id);
      return next ?? null;
    });
  }, [proposals]);

  useEffect(() => {
    setSectionPages({});
  }, [searchTerm, showArchived, visibleStates]);

  useEffect(() => {
    if (!estadoMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (estadoDropdownRef.current && !estadoDropdownRef.current.contains(e.target as Node)) {
        setEstadoMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setEstadoMenuOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [estadoMenuOpen]);

  const setEstadoVisible = (id: SectionFilterId, visible: boolean) => {
    setVisibleStates((prev) => {
      if (!visible) {
        const activeCount = SECTION_FILTER_IDS.filter((k) => prev[k]).length;
        if (prev[id] && activeCount <= 1) return prev;
      }
      return { ...prev, [id]: visible };
    });
  };

  const formatProposalDate = (dateString: string) => {
    if (!dateString) return 'No especificada';
    try {
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      }
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatSubmissionDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (fullName?: string) => {
    const parts = (fullName ?? '').trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'P';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'border-emerald-200 bg-emerald-50 text-emerald-800';
      case 'rejected':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'filed':
        return 'border-gray-200 bg-gray-50 text-gray-700';
      default:
        return 'border-amber-200 bg-amber-50 text-amber-900';
    }
  };

  const getStatusBorderClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'border-l-emerald-500';
      case 'rejected':
        return 'border-l-red-500';
      case 'filed':
        return 'border-l-slate-400';
      default:
        return 'border-l-amber-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprobada';
      case 'rejected':
        return 'Rechazada';
      case 'filed':
        return 'Archivada';
      default:
        return 'Pendiente';
    }
  };

  const filteredProposals = proposals.filter((p) => {
    const archived = isArchivedProposal(p);
    const isArchivedVisible = showArchived ? true : !archived;

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        p.full_name?.toLowerCase().includes(searchLower) ||
        p.phone?.toLowerCase().includes(searchLower) ||
        p.title?.toLowerCase().includes(searchLower) ||
        p.proposal?.toLowerCase().includes(searchLower) ||
        p.email?.toLowerCase().includes(searchLower);

      return isArchivedVisible && matchesSearch;
    }

    return isArchivedVisible;
  });

  const statusSections: { id: string; label: string; match: (p: VolunteerProposal) => boolean }[] = [
    {
      id: 'pending',
      label: 'Pendientes',
      match: (p) => p.status === 'pending' && !isArchivedProposal(p),
    },
    {
      id: 'approved',
      label: 'Aprobadas',
      match: (p) => p.status === 'approved' && !isArchivedProposal(p),
    },
    {
      id: 'rejected',
      label: 'Rechazadas',
      match: (p) => p.status === 'rejected' && !isArchivedProposal(p),
    },
    {
      id: 'filed',
      label: 'Archivadas',
      match: (p) => isArchivedProposal(p),
    },
  ];

  const anyVisibleSectionHasProposals = statusSections.some(
    (section) =>
      visibleStates[section.id as SectionFilterId] && filteredProposals.some((p) => section.match(p)),
  );

  const activeEstadoCount = SECTION_FILTER_IDS.filter((k) => visibleStates[k]).length;
  const estadoDropdownLabel =
    activeEstadoCount === SECTION_FILTER_IDS.length
      ? 'Todos'
      : activeEstadoCount === 1
        ? (statusSections.find((s) => visibleStates[s.id as SectionFilterId])?.label ?? 'Estado')
        : `${activeEstadoCount} estados`;


  const ProposalDetailModal = ({
    proposal,
    onClose,
  }: {
    proposal: VolunteerProposal;
    onClose: () => void;
  }) => {
    const archived = isArchivedProposal(proposal);
    const activityPast = isProposalActivityDatePast(proposal);
    const canArchiveAfterDate =
      !archived &&
      activityPast &&
      (proposal.status === 'pending' || proposal.status === 'approved');
    const canArchiveRejected = proposal.status === 'rejected' && !archived;
    const showArchiveButton = canArchiveRejected || canArchiveAfterDate;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="proposal-modal-title"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="relative flex max-h-[min(90vh,880px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex shrink-0 items-start gap-3 border-b border-gray-100 bg-gradient-to-br from-slate-50 to-white px-5 py-4 sm:px-6">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500">Propuesta #{proposal.id}</p>
              <h2 id="proposal-modal-title" className="mt-1 text-lg font-semibold text-gray-900 sm:text-xl [overflow-wrap:anywhere]">
                {proposal.title}
              </h2>
              <p className="mt-1 text-sm text-gray-500">Enviada el {formatSubmissionDate(proposal.created_at)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className={`rounded-lg border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(proposal.status)}`}>
                {getStatusLabel(proposal.status)}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                aria-label="Cerrar"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6">
            <h3 className="border-b border-gray-100 pb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
              Datos de contacto y actividad
            </h3>
            <ProposalMetaRow icon={User} label="Solicitante">
              {proposal.full_name || `Usuario #${proposal.user_id}`}
            </ProposalMetaRow>
            {proposal.email ? (
              <ProposalMetaRow icon={Mail} label="Correo">
                {proposal.email}
              </ProposalMetaRow>
            ) : null}
            {proposal.phone ? (
              <ProposalMetaRow icon={Phone} label="Teléfono">
                {proposal.phone}
              </ProposalMetaRow>
            ) : null}
            <ProposalMetaRow icon={MapPin} label="Ubicación">
              {proposal.location || 'Sin ubicación'}
            </ProposalMetaRow>
            <ProposalMetaRow icon={Calendar} label="Fecha actividad">
              {formatProposalDate(proposal.date)}
            </ProposalMetaRow>
            {canArchiveAfterDate ? (
              <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-xs leading-relaxed text-amber-950">
                La fecha de esta actividad ya pasó. Puedes usar <span className="font-semibold">Archivar</span> abajo
                para moverla a archivadas.
              </p>
            ) : null}
            {proposal.hour ? (
              <ProposalMetaRow icon={Clock} label="Hora">
                {proposal.hour}
              </ProposalMetaRow>
            ) : null}
            {proposal.spots != null && proposal.spots > 0 ? (
              <ProposalMetaRow icon={Users} label="Cupos">
                {proposal.spots}
              </ProposalMetaRow>
            ) : null}

            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50/80 p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-sky-900">Descripción completa</h4>
              <p className="mt-2 text-sm leading-relaxed text-gray-800 [overflow-wrap:anywhere] sm:text-base">{proposal.proposal}</p>
              {proposal.tools ? (
                <>
                  <h4 className="mt-5 text-xs font-bold uppercase tracking-wider text-gray-600">Herramientas necesarias</h4>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700 [overflow-wrap:anywhere]">{proposal.tools}</p>
                </>
              ) : null}
            </div>

            {proposal.admin_note ? (
              <div className="mt-4 rounded-lg border border-indigo-100 bg-indigo-50/70 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900">Nota del administrador</h4>
                <p className="mt-2 text-sm leading-relaxed text-indigo-950 [overflow-wrap:anywhere]">{proposal.admin_note}</p>
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-gray-200 bg-slate-50/90 px-5 py-4 sm:gap-3 sm:px-6">
            <button
              type="button"
              onClick={() => onSetStatus(proposal.id, 'approved')}
              disabled={updatingId === proposal.id || proposal.status === 'approved'}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              {updatingId === proposal.id ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Aprobar
            </button>
            <button
              type="button"
              onClick={() => onSetStatus(proposal.id, 'rejected')}
              disabled={updatingId === proposal.id || proposal.status === 'rejected'}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            >
              {updatingId === proposal.id ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Rechazar
            </button>
            {showArchiveButton ? (
              <button
                type="button"
                onClick={() => onSetStatus(proposal.id, 'filed')}
                disabled={updatingId === proposal.id}
                title={
                  canArchiveAfterDate
                    ? 'La fecha de la actividad ya pasó; puedes archivar esta propuesta.'
                    : undefined
                }
                className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
              >
                {updatingId === proposal.id ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                ) : (
                  <Archive className="h-4 w-4" />
                )}
                Archivar
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  const ProposalCard = ({ proposal }: { proposal: VolunteerProposal }) => {
    const initials = getInitials(proposal.full_name);

    return (
      <article
        className={`flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 border-l-4 bg-white shadow-sm transition-shadow hover:shadow-md ${getStatusBorderClass(proposal.status)}`}
      >
        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-1 gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700 ring-1 ring-gray-200/80">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <span
                  className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getStatusBadgeClass(proposal.status)}`}
                >
                  {getStatusLabel(proposal.status)}
                </span>
                <h3 className="mt-2 text-base font-semibold leading-snug text-gray-900 [overflow-wrap:anywhere] sm:text-lg">
                  {proposal.title}
                </h3>
              </div>
            </div>
          </div>
          <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-gray-600 [overflow-wrap:anywhere]">
            {proposal.proposal || 'Sin descripción.'}
          </p>
          <p className="mt-3 text-xs text-gray-400">
            {proposal.full_name || `Usuario #${proposal.user_id}`} · {formatSubmissionDate(proposal.created_at)}
          </p>
        </div>
        <div className="border-t border-gray-100 bg-slate-50/60 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={() => setSelectedProposal(proposal)}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-800 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            Ver detalles
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </article>
    );
  };

  if (loading && proposals.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AttendancePageHeader
          accent="sky"
          icon={<FileText className="h-6 w-6" />}
          title="Propuestas de voluntariado"
          description="Revisa, filtra y aprueba propuestas enviadas por usuarios."
          showSubNav={false}
        />
        <div className="mx-auto max-w-8xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="h-6 w-64 animate-pulse rounded bg-gray-200" />
              <div className="flex w-full flex-col gap-4 sm:flex-row lg:w-auto">
                <div className="h-10 flex-1 animate-pulse rounded-lg bg-gray-200 sm:max-w-md" />
                <div className="h-10 w-40 animate-pulse rounded-lg bg-gray-200" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col overflow-hidden rounded-xl border border-gray-200 border-l-4 border-l-gray-300 bg-white shadow-sm"
              >
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-gray-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                      <div className="h-5 w-full animate-pulse rounded bg-gray-200" />
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="h-3 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-11/12 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
                  </div>
                  <div className="mt-3 h-3 w-40 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="border-t border-gray-100 bg-slate-50/60 px-4 py-3">
                  <div className="h-11 w-full animate-pulse rounded-xl bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AttendancePageHeader
        accent="sky"
        icon={<FileText className="h-6 w-6" />}
        title="Propuestas de voluntariado"
        description="Revisa, filtra y aprueba propuestas enviadas por usuarios."
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

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <div className="flex min-w-0 flex-1 flex-row flex-wrap items-center gap-3">
              <div className="relative min-h-[44px] min-w-0 flex-1 basis-[min(100%,12rem)]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, correo, título, propuesta..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-full min-h-[44px] w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div ref={estadoDropdownRef} className="relative w-full min-w-[11rem] shrink-0 sm:w-auto">
                <button
                  type="button"
                  onClick={() => setEstadoMenuOpen((o) => !o)}
                  aria-expanded={estadoMenuOpen}
                  aria-haspopup="listbox"
                  className="inline-flex min-h-[44px] w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-left text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 sm:min-w-[11rem]"
                >
                  <span className="min-w-0 truncate">
                    <span className="text-gray-500">Estado</span>
                    <span className="ml-1 font-semibold text-gray-900">{estadoDropdownLabel}</span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${estadoMenuOpen ? 'rotate-180' : ''}`}
                    aria-hidden
                  />
                </button>
                {estadoMenuOpen ? (
                  <div
                    className="absolute left-0 right-0 z-30 mt-1 rounded-lg border border-gray-200 bg-white py-1 shadow-lg sm:left-auto sm:right-0 sm:min-w-[240px]"
                    role="listbox"
                    aria-label="Filtrar por estado"
                  >
                    {statusSections.map((section) => {
                      const id = section.id as SectionFilterId;
                      const checked = visibleStates[id];
                      const onlyOneActive = activeEstadoCount === 1;
                      const disableUncheck = checked && onlyOneActive;
                      return (
                        <label
                          key={section.id}
                          className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50 ${disableUncheck ? 'cursor-not-allowed opacity-70' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={disableUncheck}
                            onChange={(e) => setEstadoVisible(id, e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500 disabled:cursor-not-allowed"
                          />
                          <span className="font-medium text-gray-800">{section.label}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:ml-auto sm:shrink-0">
              <button
                type="button"
                onClick={() => setShowArchived((v) => !v)}
                className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
              >
                {showArchived ? 'Ocultar archivadas' : 'Mostrar archivadas'}
              </button>

              <div className="flex min-h-[44px] shrink-0 items-center text-sm text-gray-500">
                <span className="font-medium text-gray-700">{filteredProposals.length}</span>
                <span className="ml-1 whitespace-nowrap">propuestas encontradas</span>
              </div>
            </div>
          </div>
        </div>

        {filteredProposals.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 ring-1 ring-sky-100">
              <FileText className="h-8 w-8 text-sky-500" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">No hay propuestas</h3>
            <p className="text-gray-600">
              {searchTerm.trim()
                ? 'No hay resultados con los filtros actuales.'
                : 'No se han enviado propuestas de voluntariado aún.'}
            </p>
          </div>
        ) : !anyVisibleSectionHasProposals ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 ring-1 ring-amber-100">
              <Filter className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Nada que mostrar en estos estados</h3>
            <p className="text-gray-600">
              Hay propuestas que coinciden con la búsqueda, pero ninguna pertenece a los estados que dejaste
              visibles. Activa otro estado o amplía los filtros.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {statusSections.map((section) => {
              if (!visibleStates[section.id as SectionFilterId]) return null;
              const list = filteredProposals.filter(section.match);
              if (list.length === 0) return null;

              const totalPages = Math.max(1, Math.ceil(list.length / PROPOSALS_PER_SECTION_PAGE));
              const rawPage = sectionPages[section.id] ?? 1;
              const currentPage = Math.min(Math.max(1, rawPage), totalPages);
              const startIdx = (currentPage - 1) * PROPOSALS_PER_SECTION_PAGE;
              const endIdx = startIdx + PROPOSALS_PER_SECTION_PAGE;
              const pageSlice = list.slice(startIdx, endIdx);

              const setSectionPage = (page: number) => {
                setSectionPages((prev) => ({ ...prev, [section.id]: page }));
              };

              return (
                <section
                  key={section.id}
                  className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
                >
                  <div className="border-b border-gray-100 bg-white px-4 py-4 sm:px-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Estado</p>
                        <h3 className="text-base font-semibold text-gray-900 sm:text-lg">{section.label}</h3>
                      </div>
                      <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-800">
                        {list.length} {list.length === 1 ? 'propuesta' : 'propuestas'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {pageSlice.map((proposal) => (
                        <ProposalCard key={proposal.id} proposal={proposal} />
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <>
                        <div className="mt-6 text-center text-sm text-gray-600">
                          Mostrando {startIdx + 1}–{Math.min(endIdx, list.length)} de {list.length} en {section.label}
                          <span className="text-gray-500">
                            {' '}
                            · Página {currentPage} de {totalPages}
                          </span>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSectionPage(currentPage - 1)}
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
                                onClick={() => setSectionPage(page)}
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
                            onClick={() => setSectionPage(currentPage + 1)}
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
                      </>
                    )}
                  </div>
                </section>
              );
            })}

            <div className="pt-2 text-center text-sm text-gray-600">
              {filteredProposals.length} propuestas encontradas
            </div>
          </div>
        )}

        {selectedProposal && (
          <ProposalDetailModal proposal={selectedProposal} onClose={() => setSelectedProposal(null)} />
        )}
      </div>
    </div>
  );
}
