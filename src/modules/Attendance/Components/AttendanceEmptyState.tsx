import type { ReactNode } from 'react';

export type AttendanceEmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

/** Shared empty / “pick next step” pattern for the Attendance module. */
export default function AttendanceEmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: AttendanceEmptyStateProps) {
  return (
    <div
      className={`rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center sm:p-10 ${className}`}
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl text-gray-400">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">{description}</p>
      {action ? <div className="mt-6 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}
