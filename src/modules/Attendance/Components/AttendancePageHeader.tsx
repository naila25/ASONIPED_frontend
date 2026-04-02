import type { ReactNode } from 'react';
import AttendanceSubNav from './AttendanceSubNav';

export type AttendancePageHeaderProps = {
  icon: ReactNode;
  title: string;
  description: string;
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
  showSubNav = true,
}: AttendancePageHeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 py-4 sm:py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <div className="shrink-0 rounded-xl bg-teal-100 p-2.5 text-teal-700">{icon}</div>
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
