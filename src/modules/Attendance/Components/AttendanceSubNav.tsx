import { Link, useLocation } from '@tanstack/react-router';

const ITEMS = [
  {
    to: '/admin/attendance/list',
    label: 'Reportes',
    isActive: (path: string) => path.startsWith('/admin/attendance/list'),
  },
  {
    to: '/admin/attendance/activities',
    label: 'Actividades',
    isActive: (path: string) => path.startsWith('/admin/attendance/activities'),
  },
  {
    to: '/admin/attendance/beneficiaries',
    label: 'Escanear QR',
    isActive: (path: string) => path.startsWith('/admin/attendance/beneficiaries'),
  },
  {
    to: '/admin/attendance/guests',
    label: 'Registro manual',
    isActive: (path: string) => path.startsWith('/admin/attendance/guests'),
  },


] as const;

type AttendanceSubNavProps = {
  className?: string;
};

export default function AttendanceSubNav({ className = '' }: AttendanceSubNavProps) {
  const { pathname } = useLocation();
  const path = pathname.replace(/\/$/, '') || '/';

  return (
    <nav
      className={`flex flex-wrap gap-2 border-t border-gray-100 pt-4 ${className}`}
      aria-label="Secciones del módulo de asistencia"
    >
      {ITEMS.map(({ to, label, isActive }) => {
        const active = isActive(path);
        return (
          <Link
            key={to}
            to={to}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
              active
                ? 'bg-emerald-100 text-emerald-900'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
