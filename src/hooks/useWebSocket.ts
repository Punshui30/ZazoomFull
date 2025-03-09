import { useEffect, useCallback } from 'react';
import { websocketService, WebSocketEvent } from '../lib/websocket';
import { logger } from '../utils/logger';

export function useWebSocket(
  eventTypes: WebSocketEvent['type'][],
  callback: (event: WebSocketEvent) => void
) {
  const handleEvent = useCallback((event: WebSocketEvent) => {
    if (eventTypes.includes(event.type)) {
      try {
        callback(event);
      } catch (error) {
        logger.error('Error handling WebSocket event:', error);
      }
    }
  }, [eventTypes, callback]);

  useEffect(() => {
    const unsubscribe = websocketService.subscribe(handleEvent);
    return () => unsubscribe();
  }, [handleEvent]);
}