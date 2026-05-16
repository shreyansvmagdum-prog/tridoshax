import { useState, useRef, useEffect, useCallback } from "react";
import type { KeyboardEvent } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface ChatSession {
    id: string;
    title: string;
    lastMessage: string;
    timestamp: Date;
    messages: Message[];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SUGGESTED_PROMPTS = [
    { label: "What diet suits Vata?", icon: "🌬️" },
    { label: "Pitta calming foods", icon: "🔥" },
    { label: "Improve digestion naturally", icon: "🌿" },
    { label: "Daily routine for Kapha", icon: "🌊" },
];

function generateId(): string {
    return Math.random().toString(36).slice(2, 10);
}

function formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatSessionDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ─── Design tokens — exact TriDoshaX palette ─────────────────────────────────
const T = {
    green: "#2F6F4E",
    greenDark: "#1F4D36",
    greenLight: "#E8F3EC",
    greenAccent: "#4CAF7D",
    pageBg: "#F5F2E8",
    cardBg: "#FFFFFF",
    border: "#E6E0D4",
    textPrimary: "#1B1B1B",
    textSecondary: "#6B7280",
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function LeafAvatar({ size = 32 }: { size?: number }) {
    return (
        <div
            style={{
                width: size, height: size, flexShrink: 0,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${T.green} 0%, ${T.greenAccent} 100%)`,
                boxShadow: "0 2px 8px rgba(47,111,78,0.22)",
                display: "flex", alignItems: "center", justifyContent: "center",
            }}
        >
            <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 20 20" fill="none">
                <path d="M10 2C10 2 3 6 3 12C3 15.3 6.1 18 10 18C13.9 18 17 15.3 17 12C17 6 10 2 10 2Z"
                    fill="white" fillOpacity="0.92" />
                <path d="M10 2C10 2 10 8 10 18" stroke="rgba(47,111,78,0.45)" strokeWidth="1" strokeLinecap="round" />
                <path d="M10 8C10 8 7 10 6 12" stroke="rgba(47,111,78,0.35)" strokeWidth="0.8" strokeLinecap="round" />
                <path d="M10 11C10 11 13 13 14 15" stroke="rgba(47,111,78,0.35)" strokeWidth="0.8" strokeLinecap="round" />
            </svg>
        </div>
    );
}

function TypingIndicator() {
    return (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 16px" }}>
            <LeafAvatar size={34} />
            <div style={{
                background: T.greenLight, border: `1px solid ${T.border}`,
                borderRadius: "16px 16px 16px 4px", padding: "10px 14px",
                display: "flex", alignItems: "center", gap: 6, maxWidth: 76,
            }}>
                {[0, 1, 2].map((i) => (
                    <span key={i} style={{
                        display: "block", width: 7, height: 7, borderRadius: "50%",
                        background: T.green,
                        animation: "tdx-bounce 1.2s infinite",
                        animationDelay: `${i * 0.2}s`,
                    }} />
                ))}
            </div>
        </div>
    );
}

function MessageBubble({ msg }: { msg: Message }) {
    const isUser = msg.role === "user";

    if (isUser) {
        return (
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "flex-end", gap: 8, padding: "6px 16px" }}>
                <div style={{ maxWidth: "72%" }}>
                    <div style={{
                        background: `linear-gradient(135deg, ${T.greenDark} 0%, ${T.green} 100%)`,
                        color: "#fff", padding: "11px 16px",
                        borderRadius: "18px 18px 4px 18px",
                        boxShadow: "0 2px 10px rgba(47,111,78,0.18)",
                        fontSize: 14, lineHeight: 1.65,
                        fontFamily: "system-ui, -apple-system, sans-serif",
                    }}>
                        {msg.content}
                    </div>
                    <p style={{ textAlign: "right", marginTop: 4, fontSize: 11, color: T.textSecondary }}>
                        {formatTime(msg.timestamp)}
                    </p>
                </div>
                <div style={{
                    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                    background: T.greenLight, color: T.green,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700,
                }}>U</div>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "6px 16px" }}>
            <LeafAvatar size={34} />
            <div style={{ maxWidth: "76%" }}>
                <div style={{
                    background: T.cardBg, border: `1px solid ${T.border}`,
                    color: T.textPrimary, padding: "11px 16px",
                    borderRadius: "18px 18px 18px 4px",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                    fontSize: 14, lineHeight: 1.65,
                    fontFamily: "system-ui, -apple-system, sans-serif",
                }}>
                    {msg.content}
                </div>
                <p style={{ marginTop: 4, fontSize: 11, color: T.textSecondary }}>
                    Ayurvedic AI · {formatTime(msg.timestamp)}
                </p>
            </div>
        </div>
    );
}

function WelcomeScreen({ onPrompt }: { onPrompt: (text: string) => void }) {
    return (
        <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: "100%",
            padding: "48px 24px", textAlign: "center",
            fontFamily: "system-ui, -apple-system, sans-serif",
        }}>
            {/* Mandala ring */}
            <div style={{ marginBottom: 24 }}>
                <div style={{
                    width: 80, height: 80, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${T.greenLight} 0%, #d4ebd8 100%)`,
                    border: "2px solid #c6dfc9",
                    boxShadow: "0 0 0 8px rgba(47,111,78,0.06), 0 0 0 16px rgba(47,111,78,0.03)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <LeafAvatar size={44} />
                </div>
            </div>

            <h2 style={{ fontSize: 26, fontWeight: 800, color: T.textPrimary, margin: "0 0 6px" }}>
                Namaste 🙏
            </h2>
            <h3 style={{ fontSize: 16, fontWeight: 500, color: T.green, margin: "0 0 12px" }}>
                I am your Ayurvedic AI Assistant
            </h3>
            <p style={{ fontSize: 14, color: T.textSecondary, lineHeight: 1.65, maxWidth: 360, margin: "0 0 32px" }}>
                Ask about diet, lifestyle, herbs, or your Dosha balance. I provide
                personalized Ayurvedic guidance rooted in ancient wisdom.
            </p>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", maxWidth: 440, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 1, background: T.border }} />
                <span style={{ fontSize: 12, color: T.textSecondary }}>Suggested questions</span>
                <div style={{ flex: 1, height: 1, background: T.border }} />
            </div>

            {/* Prompt cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%", maxWidth: 440 }}>
                {SUGGESTED_PROMPTS.map((p) => (
                    <button
                        key={p.label}
                        onClick={() => onPrompt(p.label)}
                        style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "12px 16px", borderRadius: 12,
                            background: T.cardBg, border: `1.5px solid ${T.border}`,
                            color: T.textPrimary, cursor: "pointer", textAlign: "left",
                            fontSize: 13.5, fontWeight: 500,
                            fontFamily: "system-ui, -apple-system, sans-serif",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                            transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                            const b = e.currentTarget as HTMLButtonElement;
                            b.style.background = T.greenLight;
                            b.style.borderColor = T.greenAccent;
                            b.style.transform = "translateY(-2px)";
                            b.style.boxShadow = "0 6px 16px rgba(47,111,78,0.12)";
                        }}
                        onMouseLeave={(e) => {
                            const b = e.currentTarget as HTMLButtonElement;
                            b.style.background = T.cardBg;
                            b.style.borderColor = T.border;
                            b.style.transform = "translateY(0)";
                            b.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
                        }}
                    >
                        <span style={{ fontSize: 18 }}>{p.icon}</span>
                        <span style={{ lineHeight: 1.35 }}>{p.label}</span>
                    </button>
                ))}
            </div>

            <p style={{ marginTop: 32, fontSize: 11, color: "#adb5bd" }}>
                ✦ Powered by TriDoshaX RAG · Responses are for wellness guidance only
            </p>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AIAssistant() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;
    const messages = activeSession?.messages ?? [];

    const filteredSessions = sessions.filter(
        (s) =>
            !searchQuery ||
            s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height =
                Math.min(textareaRef.current.scrollHeight, 140) + "px";
        }
    }, [inputValue]);

    const createNewSession = useCallback((): ChatSession => ({
        id: generateId(),
        title: "New Conversation",
        lastMessage: "",
        timestamp: new Date(),
        messages: [],
    }), []);

    const handleNewChat = useCallback(() => {
        const session = createNewSession();
        setSessions((prev) => [session, ...prev]);
        setActiveSessionId(session.id);
        setInputValue("");
    }, [createNewSession]);

    const handleSend = useCallback(
        async (text?: string) => {
            const token = localStorage.getItem("token");
            const content = (text ?? inputValue).trim();
            if (!content || isLoading) return;

            let sessionId = activeSessionId;
            if (!sessionId) {
                const newSession = createNewSession();
                setSessions((prev) => [newSession, ...prev]);
                setActiveSessionId(newSession.id);
                sessionId = newSession.id;
            }

            const userMsg: Message = {
                id: generateId(), role: "user", content, timestamp: new Date(),
            };

            setSessions((prev) =>
                prev.map((s) =>
                    s.id === sessionId
                        ? {
                            ...s, messages: [...s.messages, userMsg], lastMessage: content,
                            title: s.title === "New Conversation"
                                ? content.slice(0, 38) + (content.length > 38 ? "…" : "")
                                : s.title,
                            timestamp: new Date(),
                        }
                        : s
                )
            );

            setInputValue("");
            setIsLoading(true);

            // 🔹 Call backend /chat API
            let aiText = "Sorry, I couldn't process your request.";

            try {
                const res = await fetch("http://127.0.0.1:8000/chat/", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`, // ⭐ IMPORTANT
                    },
                    body: JSON.stringify({
                        message: content,
                    }),
                });

                const data = await res.json();

                // Your API returns: { reply: "..." }
                aiText = data.reply || aiText;

            } catch (err) {
                console.error("Chat API error:", err);
                aiText = "Server error. Please try again.";
            }

            // 🔹 Create assistant message
            const aiMsg: Message = {
                id: generateId(),
                role: "assistant",
                content: aiText,
                timestamp: new Date(),
            };

            setSessions((prev) =>
                prev.map((s) =>
                    s.id === sessionId
                        ? { ...s, messages: [...s.messages, aiMsg], lastMessage: aiMsg.content.slice(0, 60) + "…", timestamp: new Date() }
                        : s
                )
            );

            setIsLoading(false);
        },
        [inputValue, isLoading, activeSessionId, createNewSession]
    );

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    return (
        <>
            <style>{`
        @keyframes tdx-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.55; }
          40%            { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes tdx-fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .tdx-msg-in { animation: tdx-fadeIn 0.25s ease forwards; }
        .tdx-sb-scroll::-webkit-scrollbar        { width: 3px; }
        .tdx-sb-scroll::-webkit-scrollbar-thumb  { background: #c6dfc9; border-radius: 4px; }
        .tdx-chat-scroll::-webkit-scrollbar       { width: 4px; }
        .tdx-chat-scroll::-webkit-scrollbar-thumb { background: #d4e5d8; border-radius: 4px; }
        .tdx-textarea { resize: none; }
        .tdx-textarea:focus { outline: none; }
        .tdx-textarea::placeholder { color: #9ca3af; }
        .tdx-input-wrap:focus-within {
          border-color: ${T.green} !important;
          box-shadow: 0 0 0 3px rgba(47,111,78,0.10) !important;
        }
      `}</style>

            <div style={{
                display: "flex", height: "100vh", overflow: "hidden",
                background: T.pageBg,
                fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            }}>

                {/* ═══════════════════════ SIDEBAR ═══════════════════════ */}
                <aside
                    className="tdx-sb-scroll"
                    style={{
                        width: sidebarOpen ? 272 : 0,
                        minWidth: sidebarOpen ? 272 : 0,
                        overflow: sidebarOpen ? "hidden" : "hidden",
                        display: "flex", flexDirection: "column",
                        background: T.cardBg,
                        borderRight: `1.5px solid ${T.border}`,
                        boxShadow: "2px 0 10px rgba(0,0,0,0.04)",
                        transition: "width 0.3s ease, min-width 0.3s ease",
                    }}
                >
                    {/* Brand */}
                    <div style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "20px 20px 16px",
                        borderBottom: `1px solid ${T.border}`,
                    }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                            background: `linear-gradient(135deg, ${T.greenDark}, ${T.green})`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                                <path d="M10 2C10 2 3 6 3 12C3 15.3 6.1 18 10 18C13.9 18 17 15.3 17 12C17 6 10 2 10 2Z" fill="white" fillOpacity="0.9" />
                                <path d="M10 2C10 2 10 8 10 18" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, lineHeight: 1.2, letterSpacing: "0.3px" }}>
                                TriDoshaX
                            </p>
                            <p style={{ fontSize: 11, color: T.textSecondary }}>AI Assistant</p>
                        </div>
                    </div>

                    {/* New Chat */}
                    <div style={{ padding: "14px 16px 10px" }}>
                        <button
                            onClick={handleNewChat}
                            style={{
                                width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                                gap: 8, padding: "10px 16px", borderRadius: 10,
                                background: `linear-gradient(135deg, ${T.greenDark}, ${T.green})`,
                                color: "#fff", border: "none", cursor: "pointer",
                                fontSize: 13.5, fontWeight: 600, letterSpacing: "0.2px",
                                boxShadow: "0 2px 8px rgba(47,111,78,0.28)",
                                transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                                const b = e.currentTarget as HTMLButtonElement;
                                b.style.boxShadow = "0 4px 14px rgba(47,111,78,0.38)";
                                b.style.transform = "translateY(-1px)";
                            }}
                            onMouseLeave={(e) => {
                                const b = e.currentTarget as HTMLButtonElement;
                                b.style.boxShadow = "0 2px 8px rgba(47,111,78,0.28)";
                                b.style.transform = "translateY(0)";
                            }}
                        >
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                            </svg>
                            New Consultation
                        </button>
                    </div>

                    {/* Search */}
                    <div style={{ padding: "0 16px 10px" }}>
                        <div style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "8px 12px", borderRadius: 8,
                            background: T.pageBg, border: `1px solid ${T.border}`,
                        }}>
                            <svg width="13" height="13" fill="none" stroke={T.textSecondary} strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="7" />
                                <path d="m21 21-4.35-4.35" strokeLinecap="round" />
                            </svg>
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search conversations…"
                                style={{
                                    flex: 1, background: "transparent", border: "none", outline: "none",
                                    fontSize: 12, color: T.textPrimary,
                                    fontFamily: "system-ui, -apple-system, sans-serif",
                                }}
                            />
                        </div>
                    </div>

                    {/* Recent label */}
                    <p style={{
                        fontSize: 10.5, fontWeight: 700, color: T.textSecondary,
                        letterSpacing: "0.8px", textTransform: "uppercase",
                        padding: "0 20px 6px",
                    }}>
                        Recent
                    </p>

                    {/* Session list */}
                    <div
                        className="tdx-sb-scroll"
                        style={{ flex: 1, overflowY: "auto", padding: "0 12px 16px" }}
                    >
                        {filteredSessions.length === 0 ? (
                            <div style={{ textAlign: "center", paddingTop: 32 }}>
                                <p style={{ fontSize: 12, color: "#adb5bd" }}>No conversations yet</p>
                                <p style={{ fontSize: 11, color: "#ced4da", marginTop: 4 }}>
                                    Start a new consultation above
                                </p>
                            </div>
                        ) : (
                            filteredSessions.map((session) => {
                                const isActive = session.id === activeSessionId;
                                return (
                                    <button
                                        key={session.id}
                                        onClick={() => setActiveSessionId(session.id)}
                                        style={{
                                            width: "100%", textAlign: "left", padding: "10px 12px",
                                            borderRadius: 10, marginBottom: 4, cursor: "pointer",
                                            background: isActive ? T.greenLight : "transparent",
                                            border: `1px solid ${isActive ? "#c6dfc9" : "transparent"}`,
                                            transition: "all 0.1s ease",
                                            display: "block",
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = T.pageBg;
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                                            <svg style={{ marginTop: 1, flexShrink: 0 }} width="13" height="13" fill="none"
                                                stroke={isActive ? T.green : T.textSecondary} strokeWidth="1.5" viewBox="0 0 24 24">
                                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinejoin="round" />
                                            </svg>
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <p style={{
                                                    fontSize: 12.5, fontWeight: isActive ? 600 : 500,
                                                    color: isActive ? T.textPrimary : T.textSecondary,
                                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                                    fontFamily: "system-ui, -apple-system, sans-serif",
                                                }}>
                                                    {session.title}
                                                </p>
                                                <p style={{ fontSize: 10.5, color: "#adb5bd", marginTop: 2 }}>
                                                    {formatSessionDate(session.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* Profile footer */}
                    <div style={{ padding: "12px 16px 16px", borderTop: `1px solid ${T.border}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                                background: T.greenLight, color: T.green,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 12, fontWeight: 700,
                            }}>U</div>
                            <div>
                                <p style={{ fontSize: 12.5, fontWeight: 600, color: T.textPrimary }}>
                                    Wellness Profile
                                </p>
                                <p style={{ fontSize: 11, color: T.textSecondary }}>Dosha: Vata-Pitta</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ═══════════════════════ MAIN ═══════════════════════ */}
                <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>

                    {/* Header */}
                    <header style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "0 20px", height: 60, flexShrink: 0,
                        background: T.cardBg,
                        borderBottom: `1.5px solid ${T.border}`,
                        boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            {/* Hamburger */}
                            <button
                                onClick={() => setSidebarOpen((v) => !v)}
                                style={{
                                    background: "transparent", border: "none", cursor: "pointer",
                                    padding: 6, borderRadius: 8, display: "flex",
                                    transition: "background 0.1s",
                                }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = T.pageBg)}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                            >
                                <svg width="18" height="18" fill="none" stroke={T.green} strokeWidth="2" viewBox="0 0 24 24">
                                    <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
                                </svg>
                            </button>

                            {/* Title */}
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                                    background: T.greenLight, border: "1.5px solid #c6dfc9",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                                        <path d="M10 2C10 2 3 6 3 12C3 15.3 6.1 18 10 18C13.9 18 17 15.3 17 12C17 6 10 2 10 2Z"
                                            fill={T.green} fillOpacity="0.85" />
                                        <path d="M10 2C10 2 10 8 10 18" stroke="rgba(255,255,255,0.55)" strokeWidth="1" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary, lineHeight: 1.2, margin: 0 }}>
                                        Ayurvedic AI Assistant
                                    </h1>
                                    <p style={{ fontSize: 11.5, color: T.textSecondary, margin: 0 }}>
                                        Personalized guidance based on your Dosha profile
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Active badge */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: 6,
                            padding: "6px 12px", borderRadius: 20,
                            background: T.greenLight, border: `1px solid #c6dfc9`,
                        }}>
                            <span style={{
                                width: 8, height: 8, borderRadius: "50%",
                                background: T.greenAccent,
                                boxShadow: `0 0 0 2px rgba(76,175,125,0.25)`,
                            }} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: T.green }}>Active</span>
                        </div>
                    </header>

                    {/* Messages */}
                    <div
                        className="tdx-chat-scroll"
                        style={{ flex: 1, overflowY: "auto", background: T.pageBg }}
                    >
                        {messages.length === 0 && !isLoading ? (
                            <WelcomeScreen onPrompt={(t) => handleSend(t)} />
                        ) : (
                            <div style={{ maxWidth: 768, margin: "0 auto", width: "100%", paddingTop: 16, paddingBottom: 16 }}>
                                {messages.map((msg) => (
                                    <div key={msg.id} className="tdx-msg-in">
                                        <MessageBubble msg={msg} />
                                    </div>
                                ))}
                                {isLoading && <TypingIndicator />}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div style={{
                        padding: "12px 16px 14px", flexShrink: 0,
                        background: T.cardBg,
                        borderTop: `1.5px solid ${T.border}`,
                        boxShadow: "0 -3px 14px rgba(0,0,0,0.05)",
                    }}>
                        <div style={{ maxWidth: 768, margin: "0 auto" }}>
                            <div
                                className="tdx-input-wrap"
                                style={{
                                    display: "flex", alignItems: "flex-end", gap: 8,
                                    padding: "10px 14px", borderRadius: 12,
                                    background: T.pageBg, border: `1.5px solid ${T.border}`,
                                    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                                    transition: "border-color 0.15s, box-shadow 0.15s",
                                }}
                            >
                                <textarea
                                    ref={textareaRef}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask about diet, herbs, lifestyle, or your Dosha…"
                                    rows={1}
                                    className="tdx-textarea"
                                    style={{
                                        flex: 1, background: "transparent", border: "none",
                                        color: T.textPrimary,
                                        fontFamily: "system-ui, -apple-system, sans-serif",
                                        fontSize: 14, lineHeight: 1.6,
                                        maxHeight: 140, overflowY: "auto",
                                    }}
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!inputValue.trim() || isLoading}
                                    style={{
                                        width: 36, height: 36, flexShrink: 0, borderRadius: 10,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        background: inputValue.trim() && !isLoading
                                            ? `linear-gradient(135deg, ${T.greenDark}, ${T.green})`
                                            : T.border,
                                        border: "none",
                                        cursor: inputValue.trim() && !isLoading ? "pointer" : "not-allowed",
                                        boxShadow: inputValue.trim() && !isLoading ? "0 2px 8px rgba(47,111,78,0.28)" : "none",
                                        transition: "all 0.15s ease",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (inputValue.trim() && !isLoading)
                                            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(47,111,78,0.38)";
                                    }}
                                    onMouseLeave={(e) => {
                                        if (inputValue.trim() && !isLoading)
                                            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(47,111,78,0.28)";
                                    }}
                                >
                                    <svg width="15" height="15" fill="none"
                                        stroke={inputValue.trim() && !isLoading ? "white" : T.textSecondary}
                                        strokeWidth="2" viewBox="0 0 24 24">
                                        <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}