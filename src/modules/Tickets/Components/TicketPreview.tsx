import React, { useState, useEffect, useCallback } from 'react';
import { getTicketMessages } from '../Services/ticketService';
import type { TicketMessage } from '../Services/ticketService';
import { FaComments, FaUser, FaUserShield } from 'react-icons/fa';

interface TicketPreviewProps {
  ticketId: number;
  maxMessages?: number;
}

const TicketPreview: React.FC<TicketPreviewProps> = ({ 
  ticketId, 
  maxMessages = 2 
}) => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <FaComments />
        <span>Últimos mensajes:</span>
      </div>
      {messages.map((message) => (
        <div key={message.id} className="text-xs bg-gray-50 rounded p-2">
          <div className="flex items-center gap-2 mb-1">
            {getSenderIcon(message)}
            <span className="font-medium text-gray-700">
              {message.sender_name || 'Usuario'}
            </span>
            <span className="text-gray-500">
              {formatDate(message.timestamp)}
            </span>
          </div>
          <p className="text-gray-600 line-clamp-2">
            {message.message.length > 100 
              ? `${message.message.substring(0, 100)}...` 
              : message.message
            }
          </p>
        </div>
      ))}
    </div>
  );
};

export default TicketPreview;
