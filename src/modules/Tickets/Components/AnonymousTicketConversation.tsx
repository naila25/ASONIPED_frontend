import React, { useState, useEffect, useRef, useCallback, startTransition, memo } from 'react';
import { FaPaperPlane, FaArrowLeft, FaUserShield, FaCheck, FaCopy } from 'react-icons/fa';
import { getAnonymousTicketMessages, sendAnonymousTicketMessage } from '../Services/anonymousTicketService';
import type { AnonymousTicketMessage } from '../Services/anonymousTicketService';
import { socketService } from '../../../shared/Services/socketService';

interface AnonymousTicketConversationProps {
  ticket: {
    id: number;
    ticket_id: string;
    asunto?: string;
    mensaje?: string;
    status: 'open' | 'closed' | 'archived';
  };
  onClose: () => void;
  onTicketUpdate: () => void;
}

const ANON_TA_MIN = 44;
const ANON_TA_MAX = 120;

function formatAnonMessageDate(dateString: string) {
  return new Date(dateString).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const AnonymousMessageList = memo(function AnonymousMessageList({
  messages,
}: {
  messages: AnonymousTicketMessage[];
}) {
  return (
    <div className="space-y-4">
      {messages.map(message => (
        <div
          key={message.id}
          className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div className={`max-w-[75%] ${message.sender_type === 'user' ? 'order-2' : 'order-1'}`}>
            {message.sender_type !== 'user' && (
              <div className="flex items-center gap-2 mb-1 ml-1">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <FaUserShield className="text-blue-500" />
                </div>
                <span className="text-xs font-medium text-gray-600">Administrador</span>
              </div>
            )}
            <div
              className={`rounded-2xl px-4 py-3 ${
                message.sender_type === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
              <div
                className={`flex items-center justify-between mt-2 ${
                  message.sender_type === 'user' ? 'text-blue-100' : 'text-gray-400'
                }`}
              >
                <span className="text-xs">{formatAnonMessageDate(message.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

const AnonymousMessageComposer = memo(function AnonymousMessageComposer({
  onSend,
  disabled,
  loading: busy,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
  loading: boolean;
}) {
  const [value, setValue] = useState('');
  const taRef = useRef<HTMLTextAreaElement>(null);
  const rafRef = useRef(0);

  const scheduleResize = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const el = taRef.current;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, ANON_TA_MAX)}px`;
    });
  }, []);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = value.trim();
    if (!t || disabled || busy) return;
    onSend(t);
    setValue('');
    requestAnimationFrame(() => {
      const el = taRef.current;
      if (el) el.style.height = `${ANON_TA_MIN}px`;
    });
  };

  return (
    <div className="bg-white border-t border-gray-100 p-4 flex-shrink-0">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <textarea
            ref={taRef}
            value={value}
            onChange={e => {
              setValue(e.target.value);
              scheduleResize();
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Escribe tu mensaje..."
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            rows={1}
            disabled={disabled || busy}
            style={{ minHeight: ANON_TA_MIN, maxHeight: ANON_TA_MAX }}
          />
        </div>
        <button
          type="submit"
          disabled={!value.trim() || disabled || busy}
          className={`p-3 rounded-full transition-all ${
            !value.trim() || disabled || busy
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl'
          }`}
        >
          {busy ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <FaPaperPlane className="text-sm" />
          )}
        </button>
      </form>
    </div>
  );
});

const AnonymousTicketConversation: React.FC<AnonymousTicketConversationProps> = ({
  ticket,
  onClose,
  onTicketUpdate
}) => {
  const [messages, setMessages] = useState<AnonymousTicketMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyHint, setCopyHint] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const copyTicketCode = async () => {
    const code = ticket.ticket_id;
    setCopyHint(null);
    try {
      await navigator.clipboard.writeText(code);
      startTransition(() => setCopied(true));
      window.setTimeout(() => startTransition(() => setCopied(false)), 2500);
    } catch {
      try {
        const ta = document.createElement('textarea');
        ta.value = code;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        startTransition(() => setCopied(true));
        window.setTimeout(() => startTransition(() => setCopied(false)), 2500);
      } catch {
        setCopyHint('No se pudo copiar automáticamente. Selecciona el código y usa Ctrl+C (o Cmd+C).');
        window.setTimeout(() => setCopyHint(null), 6000);
      }
    }
  };

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedMessages = await getAnonymousTicketMessages(ticket.ticket_id);
      setMessages(fetchedMessages);
    } catch (error) {
      setError('Error loading messages');
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }, [ticket.ticket_id]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      const setupSocket = async () => {
        try {
          await socketService.connect();
          if (cancelled) return;
          socketService.joinAnonymousTicketRoom(ticket.ticket_id);

          socketService.onAnonymousMessageReceived((message) => {
            setMessages(prev => {
              const createdAt =
                message.timestamp ||
                message.created_at ||
                new Date().toISOString();
              const messageExists = prev.some(
                msg =>
                  msg.message === message.message && msg.sender_type === message.sender_type
              );

              if (messageExists) {
                return prev;
              }

              const uniqueId = `${ticket.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

              return [
                ...prev,
                {
                  id: parseInt(uniqueId.split('-')[1], 10),
                  ticket_id: ticket.id,
                  sender_type: message.sender_type,
                  message: message.message,
                  created_at: createdAt
                }
              ];
            });
          });
        } catch (error) {
          console.error('Failed to connect to Socket.io:', error);
        }
      };

      void setupSocket();
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      socketService.leaveAnonymousTicketRoom(ticket.ticket_id);
      socketService.removeListener('anonymous_message_received');
    };
  }, [ticket.id, ticket.ticket_id]);

  const scrollToBottom = () => {
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);


  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    if (ticket.status !== 'open') {
      setError(`No puedes enviar mensajes en un ticket ${ticket.status === 'closed' ? 'cerrado' : 'archivado'}`);
      return;
    }

    const messageData = {
      ticket_id: ticket.ticket_id,
      message: text.trim(),
      sender_type: 'user' as const
    };

    try {
      const tempMessage: AnonymousTicketMessage = {
        id: Date.now(),
        ticket_id: ticket.id,
        message: text.trim(),
        sender_type: 'user',
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, tempMessage]);

      // Send via WebSocket for real-time delivery
      const isConnected = socketService.getConnectionStatus();
      let messageSentViaWebSocket = false;
      
      if (isConnected) {
        socketService.sendAnonymousMessage(ticket.ticket_id, messageData);
        messageSentViaWebSocket = true;
      } else {
        try {
          await socketService.connect();
          if (socketService.getConnectionStatus()) {
            socketService.sendAnonymousMessage(ticket.ticket_id, messageData);
            messageSentViaWebSocket = true;
          }
        } catch (reconnectError) {
          console.error('Failed to reconnect:', reconnectError);
        }
      }
      
      // Always send via API for persistence
      await sendAnonymousTicketMessage(messageData);
      
      // Only reload messages if WebSocket failed, to prevent duplicates
      if (!messageSentViaWebSocket) {
        await loadMessages();
      }
      
      onTicketUpdate();
    } catch (error) {
      setError('Error sending message');
      console.error('Error sending message:', error);
    }
  }, [ticket.status, ticket.ticket_id, ticket.id, loadMessages, onTicketUpdate]);

  return (
    <div className="bg-white flex flex-col border border-gray-100 rounded-lg overflow-hidden h-full min-h-0">
      {/* Header - Minimalista */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaArrowLeft className="text-gray-600 text-sm" />
            </button>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                Ticket Anónimo: {ticket.ticket_id}
              </h3>
              <p className="text-gray-500 text-sm">{ticket.asunto}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              ticket.status === 'open' 
                ? 'bg-green-100 text-green-700' 
                : ticket.status === 'closed'
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {ticket.status === 'open' ? 'Abierto' : 
               ticket.status === 'closed' ? 'Cerrado' : 'Archivado'}
            </span>
          </div>
        </div>
      </div>

      <div
        className="flex-shrink-0 border-b border-amber-200 bg-amber-50 px-4 py-3 sm:px-6"
        role="region"
        aria-label="Código de acceso al ticket"
      >
        <p className="text-sm text-amber-950 mb-2">
          <strong>Importante:</strong> este es tu código de acceso. Si cierras esta ventana, lo necesitarás en
          &quot;Abrir ticket&quot; para seguir la conversación.{' '}
          <span className="whitespace-nowrap">Cópialo y guárdalo.</span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <code className="font-mono text-sm font-semibold tracking-wide bg-white border border-amber-200 rounded-lg px-3 py-2 text-gray-900 select-all break-all">
            {ticket.ticket_id}
          </code>
          <button
            type="button"
            onClick={copyTicketCode}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
          >
            {copied ? (
              <>
                <FaCheck className="text-sm" aria-hidden />
                Copiado
              </>
            ) : (
              <>
                <FaCopy className="text-sm" aria-hidden />
                Copiar código
              </>
            )}
          </button>
        </div>
        {copyHint && (
          <p className="mt-2 text-xs text-amber-900" role="status">
            {copyHint}
          </p>
        )}
      </div>

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-gray-50 px-4 py-6 min-h-0 messages-container"
      >
        {loading ? (
          <div className="text-center text-gray-500">Cargando mensajes...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500">
            <p className="mb-2">No hay mensajes aún</p>
            {ticket.mensaje && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  <strong>Mensaje inicial:</strong> {ticket.mensaje}
                </p>
              </div>
            )}
            {ticket.status !== 'open' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                <p className="text-yellow-800 text-sm">
                  <strong>⚠️ Ticket {ticket.status === 'closed' ? 'cerrado' : 'archivado'}:</strong>{' '}
                  {ticket.status === 'closed'
                    ? ' Este ticket ha sido cerrado por un administrador.'
                    : ' Este ticket ha sido archivado.'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {ticket.mensaje && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-blue-800 text-sm">
                  <strong>Mensaje inicial:</strong> {ticket.mensaje}
                </p>
              </div>
            )}

            {ticket.status !== 'open' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-yellow-800 text-sm">
                  <strong>⚠️ Ticket {ticket.status === 'closed' ? 'cerrado' : 'archivado'}:</strong>{' '}
                  {ticket.status === 'closed'
                    ? ' Este ticket ha sido cerrado por un administrador.'
                    : ' Este ticket ha sido archivado.'}
                </p>
              </div>
            )}

            <AnonymousMessageList messages={messages} />
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {ticket.status === 'open' ? (
        <AnonymousMessageComposer
          onSend={handleSendMessage}
          disabled={loading}
          loading={loading}
        />
      ) : (
        <div className="bg-gray-50 border-t border-gray-100 p-6 text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <FaCheck className="text-green-500" />
            <p className="text-sm font-medium">Este ticket está cerrado. No se pueden enviar más mensajes.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnonymousTicketConversation;
