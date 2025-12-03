import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateByResourceType, RealtimeResourceType } from '@/lib/queryKeys';

interface RealtimeEvent {
  type: RealtimeResourceType;
  action: 'create' | 'update' | 'delete' | 'bulk';
  entityId?: number | string;
  organizationId?: number;
  payload?: Record<string, any>;
  timestamp: number;
}

interface UseRealtimeUpdatesOptions {
  enabled?: boolean;
  organizationId?: number;
  onEvent?: (event: RealtimeEvent) => void;
  debounceMs?: number;
}

export function useRealtimeUpdates(options: UseRealtimeUpdatesOptions = {}) {
  const { 
    enabled = true, 
    organizationId,
    onEvent,
    debounceMs = 100 
  } = options;
  
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingInvalidationsRef = useRef<Set<RealtimeResourceType>>(new Set());
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 10;
  const baseReconnectDelay = 1000;

  const processPendingInvalidations = useCallback(async () => {
    const types = Array.from(pendingInvalidationsRef.current);
    pendingInvalidationsRef.current.clear();
    
    for (const type of types) {
      try {
        await invalidateByResourceType(queryClient, type);
      } catch (error) {
        console.error(`[RT] Error invalidating ${type}:`, error);
      }
    }
  }, [queryClient]);

  const scheduleInvalidation = useCallback((type: RealtimeResourceType) => {
    pendingInvalidationsRef.current.add(type);
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      processPendingInvalidations();
    }, debounceMs);
  }, [debounceMs, processPendingInvalidations]);

  const handleEvent = useCallback((event: RealtimeEvent) => {
    console.log(`[RT] Received event: ${event.type}:${event.action}`, event);
    
    if (onEvent) {
      onEvent(event);
    }
    
    scheduleInvalidation(event.type);
  }, [onEvent, scheduleInvalidation]);

  const connect = useCallback(() => {
    if (!enabled) return;
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    const url = new URL('/api/realtime/events', window.location.origin);
    if (organizationId) {
      url.searchParams.set('organizationId', organizationId.toString());
    }
    
    console.log('[RT] Connecting to SSE endpoint...');
    const eventSource = new EventSource(url.toString());
    eventSourceRef.current = eventSource;
    
    eventSource.onopen = () => {
      console.log('[RT] SSE connection established');
      reconnectAttemptsRef.current = 0;
    };
    
    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        
        if (data.type === 'connected') {
          console.log('[RT] SSE connected with clientId:', data.clientId);
          return;
        }
        
        handleEvent(data as RealtimeEvent);
      } catch (error) {
        console.error('[RT] Error parsing SSE message:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('[RT] SSE connection error:', error);
      eventSource.close();
      eventSourceRef.current = null;
      
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
        console.log(`[RT] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      } else {
        console.error('[RT] Max reconnection attempts reached');
      }
    };
  }, [enabled, organizationId, handleEvent]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    
    reconnectAttemptsRef.current = 0;
    console.log('[RT] SSE disconnected');
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }
    
    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  useEffect(() => {
    if (enabled && organizationId !== undefined) {
      disconnect();
      connect();
    }
  }, [organizationId]);

  return {
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN,
    disconnect,
    reconnect: connect,
  };
}

export default useRealtimeUpdates;
