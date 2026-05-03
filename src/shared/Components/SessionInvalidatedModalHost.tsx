import { useEffect, useMemo, useState } from 'react';

type SessionInvalidatedDetail = {
  title?: string;
  message?: string;
  redirectTo?: string;
};

const SESSION_INVALIDATED_EVENT = 'asoniped:session-invalidated';

export default function SessionInvalidatedModalHost() {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<SessionInvalidatedDetail>({});

  const title = useMemo(() => detail.title ?? 'Sesión invalidada', [detail.title]);
  const message = useMemo(
    () =>
      detail.message ??
      'Tu sesión ha sido invalidada porque has iniciado sesión desde otro navegador o dispositivo.',
    [detail.message]
  );
  const redirectTo = useMemo(() => detail.redirectTo ?? '/admin/login', [detail.redirectTo]);

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<SessionInvalidatedDetail>;
      setDetail(custom.detail ?? {});
      setOpen(true);
    };

    window.addEventListener(SESSION_INVALIDATED_EVENT, handler as EventListener);
    return () => window.removeEventListener(SESSION_INVALIDATED_EVENT, handler as EventListener);
  }, []);

  const goToLogin = () => {
    setOpen(false);
    window.location.href = redirectTo;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={goToLogin} />

      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="mt-3 text-sm text-gray-600 leading-relaxed">{message}</p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={goToLogin}
              className="px-4 py-2 rounded-lg bg-green-200 text-green-900 font-semibold hover:bg-green-300 transition-colors"
            >
              Ir al login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
