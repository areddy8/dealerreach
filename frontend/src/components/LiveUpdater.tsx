"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { API_URL, getToken } from "@/lib/api";

interface SSEEvent {
  type: string;
  data: Record<string, unknown>;
}

export function useSSE(quoteRequestId: string | null) {
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);
  const [connected, setConnected] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const connect = useCallback(() => {
    if (!quoteRequestId) return;

    const token = getToken();
    const url = `${API_URL}/events/${quoteRequestId}${
      token ? `?token=${encodeURIComponent(token)}` : ""
    }`;

    const es = new EventSource(url);
    sourceRef.current = es;

    es.onopen = () => setConnected(true);

    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setLastEvent(parsed);
      } catch {
        // ignore malformed events
      }
    };

    es.onerror = () => {
      es.close();
      setConnected(false);
      // Reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };
  }, [quoteRequestId]);

  useEffect(() => {
    connect();
    return () => {
      sourceRef.current?.close();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return { lastEvent, connected };
}

interface LiveUpdaterProps {
  quoteRequestId: string;
  onEvent: () => void;
}

export default function LiveUpdater({
  quoteRequestId,
  onEvent,
}: LiveUpdaterProps) {
  const { lastEvent, connected } = useSSE(quoteRequestId);

  useEffect(() => {
    if (lastEvent) {
      onEvent();
    }
  }, [lastEvent, onEvent]);

  return (
    <div className="flex items-center gap-2 text-xs text-slate-500">
      <span
        className={`inline-block h-2 w-2 rounded-full ${
          connected ? "bg-emerald-500" : "bg-slate-600"
        }`}
      />
      {connected ? "Live updates active" : "Reconnecting..."}
    </div>
  );
}
