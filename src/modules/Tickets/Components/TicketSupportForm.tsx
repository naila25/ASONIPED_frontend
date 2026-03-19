import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../Login/Hooks/useAuth';
import type { DonationFormData } from '../../Donation/Services/donationService';
import { submitDonation, validateDonationForm, formatPhoneNumber } from '../../Donation/Services/donationService';
import { getTicketsByUserId, getTicketById, type DonationTicket } from '../Services/ticketService';
import { getAnonymousTicketByTicketId, type AnonymousTicket } from '../Services/anonymousTicketService';

type TicketSupportFormProps = {
  onAnonymousCreated: (ticket: AnonymousTicket) => void;
  onAuthenticatedCreated: (ticket: DonationTicket) => void;
};

const DEFAULT_FORM: DonationFormData = {
  nombre: '',
  correo: '',
  telefono: '',
  asunto: '',
  mensaje: '',
  aceptacion_privacidad: false,
  aceptacion_comunicacion: false,
};

const TicketSupportForm: React.FC<TicketSupportFormProps> = ({
  onAnonymousCreated,
  onAuthenticatedCreated,
}) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState<DonationFormData>(DEFAULT_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  // Only meaningful for anonymous users.
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Keep authenticated users from being anonymous (matches existing donation behavior).
  useEffect(() => {
    if (!user) return;
    setIsAnonymous(false);

    setFormData(prev => ({
      ...prev,
      nombre: prev.nombre || user.full_name || '',
      correo: prev.correo || user.email || '',
      telefono: prev.telefono || (user.phone ? formatPhoneNumber(user.phone) : ''),
    }));
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors = validateDonationForm(formData, isAnonymous);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof DonationFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const beforeSubmitSnapshot = useMemo(() => {
    if (!user) return null;
    return new Set<number>();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      // Snapshot user's current tickets to detect "newly created" ticket after submit.
      if (user) {
        const before = await getTicketsByUserId(user.id);
        beforeSubmitSnapshot?.clear();
        for (const t of before) beforeSubmitSnapshot?.add(t.id);
      }

      const result = await submitDonation(formData, isAnonymous);

      if (!result.success) {
        setSubmitStatus('error');
        setSubmitMessage(result.message || 'Error creando ticket');
        return;
      }

      if (!user || isAnonymous) {
        if (!result.ticketId) {
          setSubmitStatus('success');
          setSubmitMessage('Ticket creado, pero no se recibió el ID de acceso.');
          return;
        }

        const anonTicket = await getAnonymousTicketByTicketId(result.ticketId);
        setSubmitStatus('success');
        setSubmitMessage(result.message);
        onAnonymousCreated(anonTicket as AnonymousTicket);
        return;
      }

      // Authenticated flow: submitDonation may not return a ticket id; re-fetch tickets and select the newest one.
      if (!user) return;

      const after = await getTicketsByUserId(user.id);

      const beforeIds = beforeSubmitSnapshot ? Array.from(beforeSubmitSnapshot) : [];
      const beforeIdSet = new Set<number>(beforeIds);

      const candidates = after
        .filter(t => !beforeIdSet.has(t.id))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      const selected = candidates[0] || after.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

      if (!selected) {
        setSubmitStatus('success');
        setSubmitMessage('Ticket creado, pero no se pudo cargar la conversación.');
        return;
      }

      // Ensure we have fresh data (status may change server-side).
      const refreshed = await getTicketById(selected.id);
      setSubmitStatus('success');
      setSubmitMessage(result.message);
      onAuthenticatedCreated(refreshed);
    } catch (err) {
      setSubmitStatus('error');
      setSubmitMessage(err instanceof Error ? err.message : 'Error creando ticket');
      console.error('TicketSupportForm submit error:', err);
    } finally {
      setIsSubmitting(false);
      setFormData(DEFAULT_FORM);
      setErrors({});
      setIsAnonymous(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Crear ticket de soporte</h2>
      <p className="text-gray-600 mb-6">
        Completa el sujeto y tu mensaje. Puedes enviarlo anónimo (solo sin cuenta) o con tu cuenta.
      </p>

      <form onSubmit={handleSubmit} className="text-black grid grid-cols-1 gap-4">
        {!user && (
          <div className="flex items-start">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="mr-2 mt-1"
            />
            <label htmlFor="anonymous" className="text-sm text-gray-700">
              Enviar de forma anónima (sin nombre, correo ni teléfono)
            </label>
          </div>
        )}

        {user && !isAnonymous && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded text-sm">
            ✓ Tus datos han sido autocompletados automáticamente
          </div>
        )}

        {!isAnonymous && (
          <div className="grid grid-cols-1 gap-4">
            <div>
              <input
                type="text"
                placeholder="Nombre completo"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                className={`border ${errors.nombre ? 'border-red-500' : 'border-gray-300'} rounded px-4 py-2 w-full`}
              />
              {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
            </div>

            <div>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={formData.correo}
                onChange={(e) => handleInputChange('correo', e.target.value)}
                className={`border ${errors.correo ? 'border-red-500' : 'border-gray-300'} rounded px-4 py-2 w-full`}
              />
              {errors.correo && <p className="text-red-500 text-sm mt-1">{errors.correo}</p>}
            </div>

            <div>
              <input
                type="tel"
                placeholder="Teléfono (88888888)"
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', formatPhoneNumber(e.target.value))}
                className={`border ${errors.telefono ? 'border-red-500' : 'border-gray-300'} rounded px-4 py-2 w-full`}
              />
              {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
            </div>
          </div>
        )}

        <div>
          <input
            type="text"
            placeholder="Asunto (mínimo 10 caracteres)"
            value={formData.asunto}
            onChange={(e) => handleInputChange('asunto', e.target.value)}
            className={`border ${errors.asunto ? 'border-red-500' : 'border-gray-300'} rounded px-4 py-2 w-full`}
          />
          {errors.asunto && <p className="text-red-500 text-sm mt-1">{errors.asunto}</p>}
        </div>

        <div>
          <textarea
            placeholder="Mensaje (mínimo 10 caracteres)"
            value={formData.mensaje}
            onChange={(e) => handleInputChange('mensaje', e.target.value)}
            className={`border ${errors.mensaje ? 'border-red-500' : 'border-gray-300'} rounded px-4 py-2 min-h-[100px] w-full`}
          />
          {errors.mensaje && <p className="text-red-500 text-sm mt-1">{errors.mensaje}</p>}
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            id="privacy"
            checked={formData.aceptacion_privacidad}
            onChange={(e) => handleInputChange('aceptacion_privacidad', e.target.checked)}
            className="mr-2 mt-1"
          />
          <label htmlFor="privacy" className="text-sm text-gray-700">
            He leído y acepto el aviso de privacidad
          </label>
        </div>
        {errors.aceptacion_privacidad && <p className="text-red-500 text-sm mt-1">{errors.aceptacion_privacidad}</p>}

        <div className="flex items-start">
          <input
            type="checkbox"
            id="comunicacion"
            checked={formData.aceptacion_comunicacion}
            onChange={(e) => handleInputChange('aceptacion_comunicacion', e.target.checked)}
            className="mr-2 mt-1"
          />
          <label htmlFor="comunicacion" className="text-sm text-gray-700">
            Acepto recibir comunicación de parte de ASONIPED
          </label>
        </div>
        {errors.aceptacion_comunicacion && <p className="text-red-500 text-sm mt-1">{errors.aceptacion_comunicacion}</p>}

        {submitStatus === 'success' && submitMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {submitMessage}
          </div>
        )}

        {submitStatus === 'error' && submitMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {submitMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`${
            isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-500'
          } text-white font-semibold py-2 px-6 rounded transition self-start`}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar ticket'}
        </button>
      </form>
    </div>
  );
};

export default TicketSupportForm;

