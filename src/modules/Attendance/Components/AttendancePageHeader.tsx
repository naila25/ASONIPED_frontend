import type { ReactNode } from 'react';
import AttendanceSubNav from './AttendanceSubNav';

const accentIconClasses = {
  sky: 'bg-sky-100 text-sky-700',
  teal: 'bg-teal-100 text-teal-700',
  amber: 'bg-amber-100 text-amber-800',
  cyan: 'bg-cyan-200 text-cyan-900',

  orange: 'bg-orange-100 text-orange-800',
  violet: 'bg-violet-100 text-violet-800',
  /** Soft pink; prefer over `red` for module chrome (red reads as errors). */
  rose: 'bg-rose-100 text-rose-800',
  emerald: 'bg-emerald-100 text-emerald-800',
} as const;

export type PageHeaderAccent = keyof typeof accentIconClasses;

export type AttendancePageHeaderProps = {
  icon: ReactNode;
  title: string;
  description: string;
  /** Icon pill colors (default sky). Pass e.g. teal, emerald, or violet per module. */
  accent?: PageHeaderAccent;
  /** When false, back chevron is hidden (e.g. hub uses its own layout). */
  showBackLink?: boolean;
  backTo?: string;
  actions?: ReactNode;
  /** If false, sub-nav is not rendered here (hub may render it separately). */
  showSubNav?: boolean;
};

export default function AttendancePageHeader({
  icon,
  title,
  description,
  actions,
  accent = 'sky',
  showSubNav = true,
}: AttendancePageHeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 py-4 sm:py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className={`shrink-0 rounded-xl p-2.5 ${accentIconClasses[accent]}`}>{icon}</div>
                <div className="min-w-0">
                  <h1 className="text-xl font-semibold tracking-tight text-gray-900">{title}</h1>
                  <p className="mt-0.5 text-sm text-gray-600">{description}</p>
                </div>
              </div>
            </div>
            {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
          </div>
        </div>
        {showSubNav ? <AttendanceSubNav className="pb-4" /> : null}
      </div>
    </header>
  );
}
