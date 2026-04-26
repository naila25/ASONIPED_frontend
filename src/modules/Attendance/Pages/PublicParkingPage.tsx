import { useState, useEffect, useCallback } from 'react';
import { FaCar, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useParams } from '@tanstack/react-router';
import AttendancePageHeader from '../Components/AttendancePageHeader';
import { parkingPublicApi } from '../Services/attendanceNewApi';
import type { PublicParkingActivitySummary } from '../Types/attendanceNew';

export default function PublicParkingPage() {
  const remainingChars = (value: string, max: number) => max - value.length;

  const LIMITS = {
    plate: 20,
    fullName: 60,
    cedula: 13,
    phone: 8,
  } as const;

  const { token } = useParams({ strict: false }) as { token?: string };
  const [activity, setActivity] = useState<PublicParkingActivitySummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [plate, setPlate] = useState('');
  const [fullName, setFullName] = useState('');
  const [cedula, setCedula] = useState('');
  const [phone, setPhone] = useState('');

  const validateParkingForm = (): string | null => {
    const plateTrim = plate.trim();
    const fullNameTrim = fullName.trim();
    const cedulaTrim = cedula.trim();
    const phoneTrim = phone.trim();

    if (!plateTrim) return 'La placa es obligatoria.';
    if (plateTrim.length < 2) return 'La placa debe tener al menos 2 caracteres.';
    if (plateTrim.length > LIMITS.plate) return `La placa no puede superar ${LIMITS.plate} caracteres.`;
    // Keep it permissive but block obviously unsafe input
    if (!/^[A-Za-z0-9\s-]+$/.test(plateTrim)) return 'La placa solo puede contener letras, números, espacios y guiones.';

    if (fullNameTrim.length > LIMITS.fullName) return `El nombre no puede superar ${LIMITS.fullName} caracteres.`;

    if (cedulaTrim.length > LIMITS.cedula) return `La cédula no puede superar ${LIMITS.cedula} caracteres.`;
    if (cedulaTrim && !/^[0-9A-Za-z]+$/.test(cedulaTrim)) return 'La cédula no debe contener espacios ni símbolos.';

    if (phoneTrim.length > LIMITS.phone) return `El teléfono no puede superar ${LIMITS.phone} caracteres.`;
    if (phoneTrim && !/^\d+$/.test(phoneTrim)) return 'El teléfono solo debe contener números.';

    return null;
  };

  const loadActivity = useCallback(async () => {
    if (!token?.trim()) {
      setLoadError('Enlace no válido');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setLoadError(null);
      const res = await parkingPublicApi.getByToken(token);
      setActivity(res.activity);
    } catch (err: unknown) {
      setLoadError((err as Error).message || 'No se pudo cargar la actividad');
      setActivity(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadActivity();
  }, [loadActivity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token?.trim()) return;

    const validationError = validateParkingForm();
    if (validationError) {
      setSubmitError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);
      await parkingPublicApi.submit(token, {
        plate: plate.trim(),
        full_name: fullName.trim() || undefined,
        cedula: cedula.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      setSuccess('Vehículo registrado. Gracias.');
      setPlate('');
      setFullName('');
      setCedula('');
      setPhone('');
    } catch (err: unknown) {
      setSubmitError((err as Error).message || 'Error al enviar el registro');
    } finally {
      setSubmitting(false);
    }
  };

  const formatEventDate = (d: string) =>
    new Date(d).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <AttendancePageHeader
        accent="amber"
        showSubNav={false}
        icon={<FaCar className="h-6 w-6" />}
        title="Registro de estacionamiento"
        description="Un registro por vehículo. La placa es obligatoria; nombre, cédula y teléfono son opcionales."
      />

      <div className="mx-auto max-w-lg px-4 py-8 sm:px-6 lg:px-8">
        {loading && (
          <div className="flex items-center justify-center rounded-xl border border-gray-100 bg-white p-8 shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-amber-600" />
            <span className="ml-3 text-gray-600">Cargando…</span>
          </div>
        )}

        {!loading && loadError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="flex gap-3">
              <FaExclamationTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden />
              <div>
                <p className="font-medium text-red-900">No disponible</p>
                <p className="mt-1 text-sm text-red-800">{loadError}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && activity && (
          <>
            <div className="mb-6 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Actividad</p>
              <h2 className="mt-1 text-lg font-semibold text-gray-900">{activity.name}</h2>
              <dl className="mt-3 space-y-1 text-sm text-gray-600">
                <div>
                  <dt className="inline font-medium text-gray-700">Fecha: </dt>
                  <dd className="inline">{formatEventDate(activity.event_date)}</dd>
                </div>
                {activity.event_time && (
                  <div>
                    <dt className="inline font-medium text-gray-700">Hora: </dt>
                    <dd className="inline">{String(activity.event_time).slice(0, 5)}</dd>
                  </div>
                )}
                {activity.location && (
                  <div>
                    <dt className="inline font-medium text-gray-700">Lugar: </dt>
                    <dd className="inline">{activity.location}</dd>
                  </div>
                )}
              </dl>
            </div>

            {success && (
              <div className="mb-6 flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
                <FaCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" aria-hidden />
                <p className="text-green-900">{success}</p>
              </div>
            )}

            {!success && (
              <form
                onSubmit={handleSubmit}
                className="space-y-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                {submitError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{submitError}</div>
                )}

                <div>
                  <label htmlFor="parking-plate" className="mb-1 block text-sm font-medium text-gray-700">
                    Placa del vehículo *
                  </label>
                  <input
                    id="parking-plate"
                    type="text"
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 uppercase focus:border-transparent focus:ring-2 focus:ring-amber-500"
                    placeholder="Ej: ABC123"
                    autoComplete="off"
                    required
                    maxLength={LIMITS.plate}
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    {plate.length}/{LIMITS.plate} caracteres ({remainingChars(plate, LIMITS.plate)} restantes)
                  </div>
                </div>

                <div>
                  <label htmlFor="parking-name" className="mb-1 block text-sm font-medium text-gray-700">
                    Nombre (opcional)
                  </label>
                  <input
                    id="parking-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-amber-500"
                    placeholder="Quien registra o conductor"
                    autoComplete="name"
                    maxLength={LIMITS.fullName}
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    {fullName.length}/{LIMITS.fullName} caracteres ({remainingChars(fullName, LIMITS.fullName)} restantes)
                  </div>
                </div>

                <div>
                  <label htmlFor="parking-cedula" className="mb-1 block text-sm font-medium text-gray-700">
                    Cédula (opcional)
                  </label>
                  <input
                    id="parking-cedula"
                    type="text"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-amber-500"
                    placeholder="Sin guiones, si aplica"
                    autoComplete="off"
                    maxLength={LIMITS.cedula}
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    {cedula.length}/{LIMITS.cedula} caracteres ({remainingChars(cedula, LIMITS.cedula)} restantes)
                  </div>
                </div>

                <div>
                  <label htmlFor="parking-phone" className="mb-1 block text-sm font-medium text-gray-700">
                    Teléfono (opcional)
                  </label>
                  <input
                    id="parking-phone"
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 15))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-amber-500"
                    placeholder="Ej: 88881234"
                    autoComplete="tel"
                    maxLength={LIMITS.phone}
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    {phone.length}/{LIMITS.phone} caracteres ({remainingChars(phone, LIMITS.phone)} restantes)
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? 'Enviando…' : 'Registrar vehículo'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
