import { EventEmitter } from 'events';
import type { Response } from 'express';

export type RealtimeEventType = 
  | 'property' 
  | 'task' 
  | 'booking' 
  | 'finance' 
  | 'service' 
  | 'serviceBooking'
  | 'staff' 
  | 'utility' 
  | 'document'
  | 'owner'
  | 'settings'
  | 'automation'
  | 'inventory'
  | 'vendor'
  | 'investment'
  | 'review'
  | 'certification'
  | 'securityDeposit'
  | 'sustainability'
  | 'sharedCost'
  | 'chat';

export type RealtimeAction = 'create' | 'update' | 'delete' | 'bulk';

export interface RealtimeEvent {
  type: RealtimeEventType;
  action: RealtimeAction;
  entityId?: number | string;
  organizationId?: number;
  payload?: Record<string, any>;
  timestamp: number;
}

class RealtimeEventEmitter extends EventEmitter {
  private clients: Map<string, Response> = new Map();
  private clientCounter = 0;

  constructor() {
    super();
    this.setMaxListeners(100);
  }

  addClient(res: Response, organizationId?: number): string {
    const clientId = `client_${++this.clientCounter}_${Date.now()}`;
    
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'X-Accel-Buffering': 'no',
    });

    res.write(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`);

    const heartbeat = setInterval(() => {
      if (!res.writableEnded) {
        res.write(`: heartbeat\n\n`);
      }
    }, 30000);

    (res as any).__clientId = clientId;
    (res as any).__organizationId = organizationId;
    (res as any).__heartbeat = heartbeat;

    this.clients.set(clientId, res);

    res.on('close', () => {
      clearInterval(heartbeat);
      this.clients.delete(clientId);
      console.log(`[SSE] Client ${clientId} disconnected. Active clients: ${this.clients.size}`);
    });

    console.log(`[SSE] Client ${clientId} connected (org: ${organizationId}). Active clients: ${this.clients.size}`);
    return clientId;
  }

  broadcast(event: Omit<RealtimeEvent, 'timestamp'>): void {
    const fullEvent: RealtimeEvent = {
      ...event,
      timestamp: Date.now(),
    };

    const eventData = `data: ${JSON.stringify(fullEvent)}\n\n`;
    let sentCount = 0;

    this.clients.forEach((res, clientId) => {
      try {
        const clientOrgId = (res as any).__organizationId;
        
        if (event.organizationId && clientOrgId && event.organizationId !== clientOrgId) {
          return;
        }

        if (!res.writableEnded) {
          res.write(eventData);
          sentCount++;
        }
      } catch (error) {
        console.error(`[SSE] Error sending to client ${clientId}:`, error);
        this.clients.delete(clientId);
      }
    });

    if (sentCount > 0) {
      console.log(`[SSE] Broadcast ${event.type}:${event.action} to ${sentCount} clients`);
    }
  }

  getClientCount(): number {
    return this.clients.size;
  }
}

export const realtimeEvents = new RealtimeEventEmitter();

export function emitRealtimeEvent(
  type: RealtimeEventType,
  action: RealtimeAction,
  entityId?: number | string,
  organizationId?: number,
  payload?: Record<string, any>
): void {
  realtimeEvents.broadcast({
    type,
    action,
    entityId,
    organizationId,
    payload,
  });
}
