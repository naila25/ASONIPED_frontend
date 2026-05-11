import React, { useState, useEffect, useCallback, memo } from 'react';
import { getTicketMessages } from '../Services/ticketService';
import type { TicketMessage } from '../Services/ticketService';
import { FaComments, FaUser, FaUserShield } from 'react-icons/fa';
import { truncateTicketFieldPreview } from '../Hooks/useTicketFieldPreviewMax';

interface TicketPreviewProps {
  ticketId: number;
  maxMessages?: number;
  /** Same 20 (mobile) / 40 (sm+) cap as ticket list rows when passed from parent. */
  previewMax: number;
}

function formatPreviewDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const TicketPreview: React.FC<TicketPreviewProps> = memo(function TicketPreview({
  ticketId,
  maxMessages = 2,
  previewMax,
}) {
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const ticketMessages = await getTicketMessages(ticketId);
      // Tomar solo los últimos mensajes
      const recentMessages = ticketMessages.slice(-maxMessages);
      setMessages(recentMessages);
    } catch (err) {
      console.error('Error loading preview messages:', err);
    } finally {
      setLoading(false);
    }
  }, [ticketId, maxMessages]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const getSenderIcon = (message: TicketMessage) => {
    // Lógica simple: si tiene sender_name y contiene "admin", mostrar icono de admin
    const isAdmin = message.sender_name?.toLowerCase().includes('admin') || 
                   message.sender_name?.toLowerCase().includes('administrador');
    return isAdmin ? <FaUserShield className="text-blue-500" /> : <FaUser className="text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="text-sm text-gray-500 italic">
        Cargando mensajes...
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No hay mensajes en este ticket
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <FaComments className="shrink-0" />
        <span>Últimos mensajes:</span>
      </div>
      {messages.map((message) => {
        const senderLabel = message.sender_name || 'Usuario';
        const senderShown = truncateTicketFieldPreview(senderLabel, previewMax);
        const bodyShown = truncateTicketFieldPreview(message.message, previewMax * 3);
        return (
          <div key={message.id} className="min-w-0 max-w-full rounded bg-gray-50 p-2 text-xs">
            <div className="mb-1 flex min-w-0 flex-wrap items-center gap-2">
              <span className="shrink-0">{getSenderIcon(message)}</span>
              <span
                className="min-w-0 font-medium text-gray-700 [overflow-wrap:anywhere]"
                title={senderLabel}
              >
                {senderShown}
              </span>
              <span className="shrink-0 text-gray-500">{formatPreviewDate(message.timestamp)}</span>
            </div>
            <p
              className="min-w-0 text-gray-600 [overflow-wrap:anywhere] line-clamp-2 whitespace-pre-wrap"
              title={message.message}
            >
              {bodyShown}
            </p>
          </div>
        );
      })}
    </div>
  );
});

export default TicketPreview;
