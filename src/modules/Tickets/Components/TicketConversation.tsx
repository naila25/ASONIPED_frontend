import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { getTicketMessages, sendMessage } from '../Services/ticketService';
import type { DonationTicket, TicketMessage } from '../Services/ticketService';
import { useAuth } from '../../Login/Hooks/useAuth';
import { FaPaperPlane, FaUser, FaUserShield, FaCheck, FaCheckDouble, FaSmile, FaArrowLeft } from 'react-icons/fa';
import socketService, {
  type TicketSocketIncomingMessage,
} from '../../../shared/Services/socketService';

interface TicketConversationProps {
  ticket: DonationTicket;
  onClose: () => void;
  onTicketUpdate?: () => void;
}

const TA_MIN_H = 44;
const TA_MAX_H = 120;

function formatMessageDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 24) {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return date.toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type MessageListProps = {
  messages: TicketMessage[];
  userId: number | undefined;
  assignedAdminId: number | null | undefined;
};

const TicketMessageList = memo(function TicketMessageList({
  messages,
  userId,
  assignedAdminId,
}: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map(message => {
        const own = message.sender_id === userId;
        const isFromAdmin = message.sender_id === assignedAdminId;
        const senderName =
          message.sender_name ||
          (isFromAdmin ? 'Administrador' : 'Usuario');

        return (
          <div
            key={message.id}
            className={`flex ${own ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[75%] ${own ? 'order-2' : 'order-1'}`}>
              {!own && (
                <div className="flex items-center gap-2 mb-1 ml-1">
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                    {isFromAdmin ? (
                      <FaUserShield className="text-blue-500" />
                    ) : (
                      <FaUser className="text-gray-500" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-600">{senderName}</span>
                </div>
              )}
              <div
                className={`rounded-2xl px-4 py-3 ${
                  own
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
                <div
                  className={`flex items-center justify-between mt-2 ${
                    own ? 'text-blue-100' : 'text-gray-400'
                  }`}
                >
                  <span className="text-xs">{formatMessageDate(message.timestamp)}</span>
                  {own && (
                    <div className="flex items-center gap-1">
                      <FaCheck className="text-xs" />
                      <FaCheckDouble className="text-xs" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

type MessageComposerProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
  sending: boolean;
};

const TicketMessageComposer = memo(function TicketMessageComposer({
  onSend,
  disabled,
  sending,
}: MessageComposerProps) {
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
      el.style.height = `${Math.min(el.scrollHeight, TA_MAX_H)}px`;
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
    if (!t || disabled || sending) return;
    onSend(t);
    setValue('');
    requestAnimationFrame(() => {
      const el = taRef.current;
      if (el) {
        el.style.height = `${TA_MIN_H}px`;
      }
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
            disabled={disabled || sending}
            style={{ minHeight: TA_MIN_H, maxHeight: TA_MAX_H }}
          />
        </div>
        <button
          type="submit"
          disabled={!value.trim() || disabled || sending}
          className={`p-3 rounded-full ${
            !value.trim() || disabled || sending
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg'
          }`}
        >
          {sending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <FaPaperPlane className="text-sm" />
          )}
        </button>
      </form>
    </div>
  );
});

const TicketConversation: React.FC<TicketConversationProps> = ({ 
  ticket, 
  onClose, 
  onTicketUpdate 
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageListenerRef = useRef<((message: TicketMessage) => void) | null>(null);
  const recentlySentMessagesRef = useRef<Set<string>>(new Set());

  const loadMessages = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent === true;
    try {
      if (!silent) setLoading(true);
      const ticketMessages = await getTicketMessages(ticket.id);
      setMessages(ticketMessages);
      setError(null);
    } catch (err) {
      if (!silent) {
        setError('Error al cargar los mensajes');
      }
      console.error('Error loading messages:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [ticket.id]);

  const scrollToBottom = () => {
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  };

  // Load messages separately from socket setup
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Setup WebSocket after paint (helps INP when opening the modal)
  useEffect(() => {
    const recentlySentMessages = recentlySentMessagesRef.current;
    let cancelled = false;

    const setupSocketConnection = async () => {
      try {
        await socketService.connect();
        if (cancelled) return;
        setIsConnected(true);

        socketService.joinTicketRoom(ticket.id);
        
        // Create message handler with improved duplicate detection
        const messageHandler = (message: TicketSocketIncomingMessage) => {
          // For messages from current user, check if this is a recently sent message
          if (user && message.sender_id === user.id) {
            // Check if we recently sent a message with this content
            const messageContentKey = `${message.message}-${message.sender_id}`;
            let foundMatch = false;
            
            // Check all recently sent message keys
            recentlySentMessagesRef.current.forEach(key => {
              if (key.startsWith(messageContentKey)) {
                foundMatch = true;
                recentlySentMessagesRef.current.delete(key);
              }
            });
            
            if (foundMatch) {
              return; // Skip this message as it was just sent by us
            }
          }
          
          // Check if message already exists to prevent duplicates
          setMessages(prev => {
            const messageExists = prev.some(msg => {
              // More robust duplicate check: compare message content, sender ID, and timestamp
              const msgTimestamp = new Date(msg.timestamp).getTime();
              const newTimestamp = new Date(message.timestamp || new Date()).getTime();
              const timeDiff = Math.abs(msgTimestamp - newTimestamp);
              
              return msg.message === message.message && 
                     msg.sender_id === message.sender_id &&
                     timeDiff < 2000; // Within 2 seconds = likely duplicate
            });
            
            if (messageExists) {
              return prev;
            }

            const normalized: TicketMessage = {
              id: message.id ?? Date.now(),
              module_type: message.module_type,
              module_id: message.module_id,
              sender_id: message.sender_id,
              message: message.message,
              timestamp: message.timestamp ?? new Date().toISOString(),
              sender_name: message.sender_name,
            };
            return [...prev, normalized];
          });
        };
        
        // Store the handler reference
        messageListenerRef.current = messageHandler;
        
        // Register the listener
        socketService.onMessageReceived(messageHandler);
        
      } catch (error) {
        console.error('Failed to connect to Socket.io:', error);
        if (!cancelled) setIsConnected(false);
      }
    };

    const timer = window.setTimeout(() => {
      void setupSocketConnection();
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      socketService.leaveTicketRoom(ticket.id);
      if (messageListenerRef.current) {
        socketService.removeListener('message_received');
        messageListenerRef.current = null;
      }
      // Clear recently sent messages when component unmounts
      recentlySentMessages.clear();
    };
  }, [ticket.id, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!messageText || !user) return;

    const messageData = {
      module_type: 'donations' as const,
      module_id: ticket.id,
      sender_id: user.id,
      message: messageText
    };

    const messageTimestamp = new Date().toISOString();
    const messageKey = `${messageText}-${user.id}-${messageTimestamp}`;
    const optimisticId = Date.now();
    const optimistic: TicketMessage = {
      id: optimisticId,
      module_type: 'donations',
      module_id: ticket.id,
      sender_id: user.id,
      message: messageText,
      timestamp: messageTimestamp,
      sender_name: user.full_name || 'Usuario',
    };

    try {
      setSending(true);
      setMessages(prev => [...prev, optimistic]);

      recentlySentMessagesRef.current.add(messageKey);
      setTimeout(() => {
        recentlySentMessagesRef.current.delete(messageKey);
      }, 3000);

      if (isConnected) {
        socketService.sendMessage(ticket.id, {
          ...messageData,
          sender_name: user.full_name || 'Usuario',
          timestamp: messageTimestamp,
        });
      }

      await sendMessage(messageData);
      await loadMessages({ silent: true });

      if (onTicketUpdate) {
        onTicketUpdate();
      }
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== optimisticId));
      setError('Error al enviar el mensaje');
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  }, [user, ticket.id, isConnected, loadMessages, onTicketUpdate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-500"></div>
          <p className="text-gray-500 text-sm">Cargando conversación...</p>
        </div>
      </div>
    );
  }

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
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-gray-50 px-4 py-6 min-h-0 messages-container"
      >
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {messages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaSmile className="text-gray-400 text-xl" />
            </div>
            <p className="text-gray-500 font-medium mb-1">No hay Tickets aún</p>
          </div>
        ) : (
          <TicketMessageList
            messages={messages}
            userId={user?.id}
            assignedAdminId={ticket.assigned_admin_id}
          />
        )}
        <div ref={messagesEndRef} />
      </div>

             {/* Message Input - Minimalista */}
      {ticket.status === 'open' ? (
        <TicketMessageComposer
          onSend={handleSendMessage}
          disabled={!user}
          sending={sending}
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

export default TicketConversation;
