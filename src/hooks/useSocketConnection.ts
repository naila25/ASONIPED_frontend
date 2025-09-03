import { useEffect, useState } from 'react';
import socketService from '../Utils/socketService';

/**
 * Hook to manage Socket.io connection globally
 * Automatically connects on mount and disconnects on unmount
 */
export const useSocketConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const connectToSocket = async () => {
      try {
        setIsConnecting(true);
        await socketService.connect();
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect to Socket.io:', error);
        setIsConnected(false);
      } finally {
        setIsConnecting(false);
      }
    };

    // Connect on mount
    connectToSocket();

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
      setIsConnected(false);
    };
  }, []);

  const reconnect = async () => {
    try {
      setIsConnecting(true);
      await socketService.connect();
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to reconnect:', error);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  return {
    isConnected,
    isConnecting,
    reconnect,
    socketService
  };
};
