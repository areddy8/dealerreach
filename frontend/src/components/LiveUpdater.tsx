"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { API_URL, getToken } from "@/lib/api";

export interface ActivityItem {
  id: number;
  event: string;
  message: string;
  timestamp: Date;
}

interface LiveUpdaterProps {
  quoteRequestId: string;
  onEvent: () => void;
  isActive: boolean; // true when pipeline is still running (not completed/monitoring)
}

export default function LiveUpdater({
  quoteRequestId,
  onEvent,
  isActive,
}: LiveUpdaterProps) {
  const [connected, setConnected] = useState(false);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const sourceRef = useRef<EventSource | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pollRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const idCounter = useRef(0);

  const addActivity = useCallback((event: string, message: string) => {
    setActivity((prev) => [
      { id: idCounter.current++, event, message, timestamp: new Date() },
      ...prev.slice(0, 19), // keep last 20
    ]);
  }, []);

  // SSE connection
  useEffect(() => {
    const token = getToken();
    if (!token || !quoteRequestId) return;

    const url = `${API_URL}/events/${quoteRequestId}?token=${encodeURIComponent(token)}`;

    function connect() {
      const es = new EventSource(url);
      sourceRef.current = es;

      es.addEventListener("connected", () => {
        setConnected(true);
      });

      // Listen for all named events from the backend
      for (const eventType of [
        "stage_started",
        "stage_completed",
        "dealer_found",
        "reply_received",
        "pipeline_completed",
        "pipeline_error",
        "pipeline_started",
        "debug_test",
      ]) {
        es.addEventListener(eventType, (e) => {
          try {
            const data = JSON.parse(e.data);
            const msg = data.message || data.stage || eventType;
            addActivity(eventType, msg);
            onEvent();
          } catch {
            onEvent();
          }
        });
      }

      // Also catch any unnamed events
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.message) addActivity("update", data.message);
          onEvent();
        } catch {
          // ignore
        }
      };

      es.onerror = () => {
        es.close();
        setConnected(false);
        reconnectRef.current = setTimeout(connect, 3000);
      };
    }

    connect();

    return () => {
      sourceRef.current?.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [quoteRequestId, addActivity, onEvent]);

  // Polling fallback — poll every 3s while pipeline is active
  useEffect(() => {
    if (isActive) {
      pollRef.current = setInterval(() => {
        onEvent();
      }, 3000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isActive, onEvent]);

  return (
    <div className="space-y-3">
      {/* Connection status */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            connected ? "bg-emerald-500 animate-pulse" : "bg-slate-600"
          }`}
        />
        {isActive
          ? connected
            ? "Processing — live updates active"
            : "Processing — reconnecting..."
          : "Monitoring for replies"}
      </div>

      {/* Activity log */}
      {activity.length > 0 && (
        <div className="space-y-1">
          {activity.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-2 text-xs animate-in fade-in slide-in-from-top-1 duration-300"
            >
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400" />
              <span className="text-slate-400">{item.message}</span>
              <span className="ml-auto flex-shrink-0 text-slate-600">
                {item.timestamp.toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
