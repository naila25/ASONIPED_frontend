import React, { useState, useEffect, useRef } from 'react';
import { DonationTicket, TicketMessage, getTicketMessages, sendMessage } from '../../Utils/ticketService';
import { useAuth } from '../../Utils/useAuth';
import { FaPaperPlane, FaTimes, FaUser, FaUserShield, FaClock } from 'react-icons/fa';

interface TicketConversationProps {
  ticket: DonationTicket;
  onClose: () => void;
  onTicketUpdate?: () => void;
}

const TicketConversation: React.FC<TicketConversationProps> = ({ 
  ticket, 
  onClose, 
  onTicketUpdate 
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAdmin = user?.roles?.some((role: any) => 
    typeof role === 'string' ? role === 'admin' : role.name === 'admin'
  );

  useEffect(() => {
    loadMessages();
  }, [ticket.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const ticketMessages = await getTicketMessages(ticket.id);
      setMessages(ticketMessages);
      setError(null);
    } catch (err) {
      setError('Error al cargar los mensajes');
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;

    try {
      setSending(true);
      
      await sendMessage({
        module_type: 'donations',
        module_id: ticket.id,
        sender_id: user.id,
        message: newMessage.trim()
      });

      setNewMessage('');
      await loadMessages(); // Recargar mensajes
      
      if (onTicketUpdate) {
        onTicketUpdate(); // Actualizar lista de tickets si es necesario
      }
    } catch (err) {
      setError('Error al enviar el mensaje');
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOwnMessage = (message: TicketMessage) => {
    return message.sender_id === user?.id;
  };

  const getSenderName = (message: TicketMessage) => {
    if (message.sender_name) return message.sender_name;
    
    // Si no hay nombre del remitente, usar lógica basada en roles
    const isMessageFromAdmin = message.sender_id === ticket.assigned_admin_id;
    return isMessageFromAdmin ? 'Administrador' : 'Usuario';
  };

  const getSenderIcon = (message: TicketMessage) => {
    const isMessageFromAdmin = message.sender_id === ticket.assigned_admin_id;
    return isMessageFromAdmin ? <FaUserShield /> : <FaUser />;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Ticket #{ticket.id} - {ticket.asunto}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                ticket.status === 'open' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {ticket.status === 'open' ? 'Abierto' : 'Cerrado'}
              </span>
              <span className="flex items-center gap-1">
                <FaClock className="text-gray-400" />
                {formatDate(ticket.created_at)}
              </span>
              {ticket.admin_name && (
                <span>Asignado a: {ticket.admin_name}</span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay mensajes en este ticket.</p>
              <p className="text-sm">Sé el primero en enviar un mensaje.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    isOwnMessage(message)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs opacity-75">
                      {getSenderIcon(message)}
                    </span>
                    <span className="text-xs font-medium">
                      {getSenderName(message)}
                    </span>
                    <span className="text-xs opacity-75">
                      {formatDate(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        {ticket.status === 'open' && (
          <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-200">
            <div className="flex gap-3">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={2}
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  !newMessage.trim() || sending
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
              >
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <FaPaperPlane />
                )}
                Enviar
              </button>
            </div>
          </form>
        )}

        {ticket.status === 'closed' && (
          <div className="p-6 border-t border-gray-200 bg-gray-50 text-center text-gray-600">
            <p>Este ticket está cerrado. No se pueden enviar más mensajes.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketConversation;
