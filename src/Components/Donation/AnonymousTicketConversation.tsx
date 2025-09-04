import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaPaperPlane, FaArrowLeft, FaUserShield, FaSmile, FaImage, FaCheck } from 'react-icons/fa';
import { getAnonymousTicketMessages, sendAnonymousTicketMessage } from '../../Utils/anonymousTicketService';
import type { AnonymousTicketMessage } from '../../Utils/anonymousTicketService';
import { socketService } from '../../Utils/socketService';

interface AnonymousTicketConversationProps {
  ticket: {
    id: number;
    ticket_id: string;
    asunto: string;
    mensaje?: string;
    status: 'open' | 'closed' | 'archived';
  };
  onClose: () => void;
  onTicketUpdate: () => void;
}

const AnonymousTicketConversation: React.FC<AnonymousTicketConversationProps> = ({
  ticket,
  onClose,
  onTicketUpdate
}) => {
  const [messages, setMessages] = useState<AnonymousTicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    
    // Setup WebSocket connection for real-time chat
    const setupSocket = async () => {
      try {
        await socketService.connect();
        socketService.joinAnonymousTicketRoom(ticket.ticket_id);
        
        // Listen for new messages
        socketService.onAnonymousMessageReceived((message) => {
          // Check if message already exists to prevent duplicates
          setMessages(prev => {
            const messageExists = prev.some(msg => 
              msg.message === message.message && 
              msg.sender_type === message.sender_type
            );
            
            if (messageExists) {
              return prev;
            }
            
            // Generate unique ID to prevent React key conflicts
            const uniqueId = `${ticket.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            return [...prev, {
              id: parseInt(uniqueId.split('-')[1]), // Use timestamp as ID
              ticket_id: ticket.id,
              sender_type: message.sender_type,
              message: message.message,
              created_at: message.timestamp || message.created_at
            }];
          });
        });
      } catch (error) {
        console.error('Failed to connect to Socket.io:', error);
      }
    };

    setupSocket();

    // Cleanup function
    return () => {
      socketService.leaveAnonymousTicketRoom(ticket.ticket_id);
      socketService.removeListener('anonymous_message_received');
    };
  }, [ticket.id, ticket.ticket_id, loadMessages]); // Include all dependencies

  const scrollToBottom = () => {
    // Scroll within the messages container only, not the whole page
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer && messagesEndRef.current) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollToBottom();
  }, [messages.length]); // Only trigger when message count changes


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // Check if ticket is closed or archived
    if (ticket.status !== 'open') {
      setError(`No puedes enviar mensajes en un ticket ${ticket.status === 'closed' ? 'cerrado' : 'archivado'}`);
      return;
    }

    const messageData = {
      ticket_id: ticket.ticket_id,
      message: newMessage.trim(),
      sender_type: 'user' as const
    };

    try {
      // Add optimistic update
      const tempMessage: AnonymousTicketMessage = {
        id: Date.now(),
        ticket_id: ticket.id,
        message: newMessage.trim(),
        sender_type: 'user',
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');

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
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white flex flex-col border border-gray-100 rounded-lg overflow-hidden">
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

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-6 min-h-0 messages-container" style={{ maxHeight: '400px' }}>
        {loading ? (
          <div className="text-center text-gray-500">Cargando mensajes...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
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
                  <strong>⚠️ Ticket {ticket.status === 'closed' ? 'cerrado' : 'archivado'}:</strong> 
                  {ticket.status === 'closed' 
                    ? ' Este ticket ha sido cerrado por un administrador.' 
                    : ' Este ticket ha sido archivado.'
                  }
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Initial message if exists */}
            {ticket.mensaje && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-blue-800 text-sm">
                  <strong>Mensaje inicial:</strong> {ticket.mensaje}
                </p>
              </div>
            )}
            
            {/* Status warning if ticket is closed/archived */}
            {ticket.status !== 'open' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-yellow-800 text-sm">
                  <strong>⚠️ Ticket {ticket.status === 'closed' ? 'cerrado' : 'archivado'}:</strong> 
                  {ticket.status === 'closed' 
                    ? ' Este ticket ha sido cerrado por un administrador.' 
                    : ' Este ticket ha sido archivado.'
                  }
                </p>
              </div>
            )}
            
            {/* Messages */}
            <div className="space-y-4">
              {messages.map((message) => (
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
                        <span className="text-xs font-medium text-gray-600">
                          Administrador
                        </span>
                      </div>
                    )}
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.sender_type === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
                      <div className={`flex items-center justify-between mt-2 ${
                        message.sender_type === 'user' ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        <span className="text-xs">
                          {formatDate(message.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Minimalista */}
      {ticket.status === 'open' ? (
        <div className="bg-white border-t border-gray-100 p-4 flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Escribe tu mensaje..."
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                rows={1}
                disabled={loading}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />

            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || loading}
              className={`p-3 rounded-full transition-all ${
                !newMessage.trim() || loading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <FaPaperPlane className="text-sm" />
              )}
            </button>
          </form>
        </div>
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
