import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getTicketMessages, sendMessage } from '../Services/ticketService';
import type { DonationTicket, TicketMessage } from '../Services/ticketService';
import { useAuth } from '../../Login/Hooks/useAuth';
import { FaPaperPlane, FaUser, FaUserShield, FaCheck, FaCheckDouble, FaSmile, FaArrowLeft } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import socketService from '../../../shared/Services/socketService';

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
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadMessages = useCallback(async () => {
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
  }, [ticket.id]);

  const scrollToBottom = () => {
    // Scroll within the messages container, not the whole page
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer && messagesEndRef.current) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  const setupSocketConnection = useCallback(async () => {
    try {
      await socketService.connect();
      setIsConnected(true);
      
      // Join ticket room
      socketService.joinTicketRoom(ticket.id);
      
      // Listen for new messages
      socketService.onMessageReceived((message) => {
        setMessages(prev => [...prev, message]);
      });
      
    } catch (error) {
      console.error('Failed to connect to Socket.io:', error);
      setIsConnected(false);
    }
  }, [ticket.id]);

  const cleanupSocketConnection = useCallback(() => {
    socketService.leaveTicketRoom(ticket.id);
    socketService.removeAllListeners();
    socketService.disconnect();
    setIsConnected(false);
  }, [ticket.id]);



  useEffect(() => {
    loadMessages();
    setupSocketConnection();
    
    return () => {
      cleanupSocketConnection();
    };
  }, [ticket.id, loadMessages, setupSocketConnection, cleanupSocketConnection]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [newMessage]);



  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;

    try {
      setSending(true);
      
      // Create message object
      const messageData = {
        module_type: 'donations' as const,
        module_id: ticket.id,
        sender_id: user.id,
        message: newMessage.trim()
      };

      // Send via API first
      await sendMessage(messageData);
      
      // Reload messages to ensure admin message appears
      await loadMessages();

      // Send via Socket.io for real-time delivery
      if (isConnected) {
        socketService.sendMessage(ticket.id, {
          ...messageData,
          sender_name: user.full_name || 'Usuario',
          timestamp: new Date().toISOString()
        });
      }

      setNewMessage('');
      

      
      if (onTicketUpdate) {
        onTicketUpdate();
      }
    } catch (err) {
      setError('Error al enviar el mensaje');
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const isOwnMessage = (message: TicketMessage) => {
    return message.sender_id === user?.id;
  };

  const getSenderName = (message: TicketMessage) => {
    if (message.sender_name) return message.sender_name;
    
    const isMessageFromAdmin = message.sender_id === ticket.assigned_admin_id;
    return isMessageFromAdmin ? 'Administrador' : 'Usuario';
  };

  const getSenderIcon = (message: TicketMessage) => {
    const isMessageFromAdmin = message.sender_id === ticket.assigned_admin_id;
    return isMessageFromAdmin ? <FaUserShield className="text-blue-500" /> : <FaUser className="text-gray-500" />;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as React.FormEvent);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-500"></div>
          <p className="text-gray-500 text-sm">Cargando conversación...</p>
        </div>
      </div>
    );
  }

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
                Ticket #{ticket.id}
              </h3>
              <p className="text-gray-500 text-sm">{ticket.asunto}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              ticket.status === 'open' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {ticket.status === 'open' ? 'Abierto' : 'Cerrado'}
            </span>
            
            
            
            {ticket.admin_name && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <FaUserShield className="text-blue-500" />
                <span>{ticket.admin_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

             {/* Messages - Diseño limpio */}
       <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-6 min-h-0 messages-container" style={{ maxHeight: '400px' }}>
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm"
            >
              {error}
            </motion.div>
          )}

          {messages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaSmile className="text-gray-400 text-xl" />
              </div>
              <p className="text-gray-500 font-medium mb-1">No hay Tickets aún</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] ${isOwnMessage(message) ? 'order-2' : 'order-1'}`}>
                    {!isOwnMessage(message) && (
                      <div className="flex items-center gap-2 mb-1 ml-1">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                          {getSenderIcon(message)}
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {getSenderName(message)}
                        </span>
                      </div>
                    )}
                    <div className={`rounded-2xl px-4 py-3 ${
                      isOwnMessage(message)
                        ? 'bg-blue-500 text-white'
                        : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
                      <div className={`flex items-center justify-between mt-2 ${
                        isOwnMessage(message) ? 'text-blue-100' : 'text-gray-400'
                      }`}>
                        <span className="text-xs">
                          {formatDate(message.timestamp)}
                        </span>
                        {isOwnMessage(message) && (
                          <div className="flex items-center gap-1">
                            <FaCheck className="text-xs" />
                            <FaCheckDouble className="text-xs" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          

        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

             {/* Message Input - Minimalista */}
       {ticket.status === 'open' ? (
         <div className="bg-white border-t border-gray-100 p-4 flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={newMessage}
                                 onChange={(e) => {
                   setNewMessage(e.target.value);
                 }}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                rows={1}
                disabled={sending}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className={`p-3 rounded-full transition-all ${
                !newMessage.trim() || sending
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl'
              }`}
            >
              {sending ? (
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

export default TicketConversation;
