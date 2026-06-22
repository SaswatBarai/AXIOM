"use client";

import { useCallback, useRef, useState } from "react";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

export interface ChatSession {
  sessionId: string;
  title: string;
  updatedAt: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export function useChat() {
  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [sessions, setSessions]   = useState<ChatSession[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  // ── Send a message ──────────────────────────────────────────

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    setError(null);
    setLoading(true);

    // Append user bubble immediately
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    // Append empty assistant bubble (will stream into it)
    setMessages((prev) => [...prev, { role: "assistant", content: "", streaming: true }]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ message: text, sessionId }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.type === "session_id") {
              setSessionId(payload.session_id);
            } else if (payload.type === "token") {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === "assistant") {
                  updated[updated.length - 1] = {
                    ...last,
                    content: last.content + payload.content,
                  };
                }
                return updated;
              });
            } else if (payload.type === "done" || payload.type === "error") {
              if (payload.type === "error") setError(payload.message);
              // Mark streaming complete
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === "assistant") {
                  updated[updated.length - 1] = { ...last, streaming: false };
                }
                return updated;
              });
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError("Failed to send message — please try again");
        // Remove the empty streaming bubble
        setMessages((prev) => prev.filter((m) => !(m.role === "assistant" && m.streaming)));
      }
    } finally {
      setLoading(false);
    }
  }, [loading, sessionId]);

  // ── Session management ──────────────────────────────────────

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/chat/sessions`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setSessions(data.sessions ?? []);
    } catch { /* silently ignore */ }
  }, []);

  const loadSession = useCallback(async (sid: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/chat/sessions/${sid}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setMessages(data.messages ?? []);
      setSessionId(sid);
    } catch {
      setError("Failed to load session");
    }
  }, []);

  const deleteSession = useCallback(async (sid: string) => {
    await fetch(`${API_BASE}/api/chat/sessions/${sid}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    setSessions((prev) => prev.filter((s) => s.sessionId !== sid));
    if (sessionId === sid) newSession();
  }, [sessionId]);

  const newSession = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setSessionId(undefined);
    setError(null);
  }, []);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setLoading(false);
    setMessages((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last?.role === "assistant" && last.streaming) {
        updated[updated.length - 1] = { ...last, streaming: false };
      }
      return updated;
    });
  }, []);

  return {
    messages, sessions, sessionId, loading, error,
    sendMessage, fetchSessions, loadSession, deleteSession, newSession, stopStreaming,
  };
}
