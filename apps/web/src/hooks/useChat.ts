"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAccessToken } from "@/lib/api";

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

function chatHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

const fetchOpts: RequestInit = {
  credentials: "include",
};

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const newSession = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setSessionId(undefined);
    setError(null);
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/sessions", {
        ...fetchOpts,
        headers: chatHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();
      setSessions(data.sessions ?? []);
    } catch {
      /* silently ignore */
    }
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    setError(null);
    setLoading(true);

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setMessages((prev) => [...prev, { role: "assistant", content: "", streaming: true }]);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        ...fetchOpts,
        headers: chatHeaders(),
        body: JSON.stringify({ message: text, sessionId }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        let detail = `Request failed (${res.status})`;
        try {
          const body = await res.json();
          if (body?.message) detail = body.message;
          else if (body?.error) detail = body.error;
        } catch {
          if (res.status === 401) detail = "Please sign in again to use Copilot.";
          else if (res.status === 429) detail = "Rate limit reached — try again later.";
        }
        throw new Error(detail);
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
              if (payload.type === "error") {
                setError(payload.message ?? "LLM service error — please retry");
              }
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === "assistant") {
                  updated[updated.length - 1] = { ...last, streaming: false };
                }
                return updated;
              });
            }
          } catch {
            /* ignore malformed SSE chunks */
          }
        }
      }

      void fetchSessions();
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setError((err as Error).message || "Failed to send message — please try again");
        setMessages((prev) => prev.filter((m) => !(m.role === "assistant" && m.streaming)));
      }
    } finally {
      setLoading(false);
    }
  }, [loading, sessionId, fetchSessions]);

  const loadSession = useCallback(async (sid: string) => {
    try {
      const res = await fetch(`/api/chat/sessions/${sid}`, {
        ...fetchOpts,
        headers: chatHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load session");
      const data = await res.json();
      setMessages(data.messages ?? []);
      setSessionId(sid);
      setError(null);
    } catch {
      setError("Failed to load session");
    }
  }, []);

  const deleteSession = useCallback(async (sid: string) => {
    await fetch(`/api/chat/sessions/${sid}`, {
      method: "DELETE",
      ...fetchOpts,
      headers: chatHeaders(),
    });
    setSessions((prev) => prev.filter((s) => s.sessionId !== sid));
    if (sessionId === sid) newSession();
  }, [sessionId, newSession]);

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

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return {
    messages,
    sessions,
    sessionId,
    loading,
    error,
    sendMessage,
    fetchSessions,
    loadSession,
    deleteSession,
    newSession,
    stopStreaming,
  };
}
