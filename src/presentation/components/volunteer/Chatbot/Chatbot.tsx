"use client";
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  KeyboardEvent,
} from "react";
import {
  Send,
  ChevronDown,
  X,
  RotateCcw,
  Bot,
  Zap,
  Award,
  UserPlus,
  HelpCircle,
} from "lucide-react";
import styles from "./Chatbot.module.scss";
import { AiBotIcon } from "./AiBotIcon";

/* ─── Types ────────────────────────────────────────────────────────────────── */
interface Message {
  id:      string;
  role:    "user" | "assistant";
  content: string;
}

/* ─── Constants ─────────────────────────────────────────────────────────────── */
const WELCOME: Message = {
  id:      "welcome",
  role:    "assistant",
  content:
    "مرحباً! 👋 أنا مساعدك في منصة **بصمات شبابية**.\nاسألني عن التسجيل، الأنشطة، الشهادات، أو أي شيء آخر — أنا هنا لأساعدك! ✨",
};

const SUGGESTIONS = [
  { label: "كيف أنضم لنشاط؟",        Icon: Zap       },
  { label: "كيف أحصل على شهادة؟",     Icon: Award     },
  { label: "كيف أسجّل في المنصة؟",    Icon: UserPlus  },
  { label: "ما هي أنواع الأنشطة؟",    Icon: HelpCircle },
];

/* ─── Helpers ───────────────────────────────────────────────────────────────── */
function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function renderContent(text: string) {
  return text.split("\n").map((line, i, arr) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((seg, j) =>
      seg.startsWith("**") && seg.endsWith("**")
        ? <strong key={j}>{seg.slice(2, -2)}</strong>
        : seg
    );
    return (
      <span key={i}>
        {parts}
        {i < arr.length - 1 && <br />}
      </span>
    );
  });
}

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function Chatbot() {
  const [isOpen,      setIsOpen]      = useState(false);
  const [messages,    setMessages]    = useState<Message[]>([WELCOME]);
  const [input,       setInput]       = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasUnread,   setHasUnread]   = useState(false);
  const [isVisible,   setIsVisible]   = useState(false);
  const [particles,   setParticles]   = useState<{ id: number; x: number; y: number }[]>([]);

  const bottomRef    = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const abortRef     = useRef<AbortController | null>(null);
  const particleRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      requestAnimationFrame(() => setIsVisible(true));
      setTimeout(() => inputRef.current?.focus(), 350);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const spawnParticles = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      setParticles(
        Array.from({ length: 8 }, (_, i) => ({ id: Date.now() + i, x: cx, y: cy }))
      );
      if (particleRef.current) clearTimeout(particleRef.current);
      particleRef.current = setTimeout(() => setParticles([]), 900);
    },
    []
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      const userMsg: Message = { id: uid(), role: "user",      content: trimmed };
      const botId  = uid();
      const botMsg: Message  = { id: botId,  role: "assistant", content: ""     };

      setMessages((prev) => [...prev, userMsg, botMsg]);
      setInput("");
      setIsStreaming(true);

      const apiHistory = [...messages, userMsg]
        .filter((m) => m.id !== "welcome" && m.content.trim())
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        const res = await fetch("/api/chat", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ messages: apiHistory }),
          signal:  abortRef.current.signal,
        });

        if (!res.ok || !res.body) throw new Error("API error");

        const reader  = res.body.getReader();
        const decoder = new TextDecoder();
        let   acc = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          const snap = acc;
          setMessages((prev) =>
            prev.map((m) => (m.id === botId ? { ...m, content: snap } : m))
          );
        }

        if (!isOpen) setHasUnread(true);
      } catch (err: unknown) {
        if ((err as Error)?.name !== "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botId
                ? { ...m, content: "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مجدداً. 🔄" }
                : m
            )
          );
        }
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, messages, isOpen]
  );

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); sendMessage(input); };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const resetChat = () => {
    abortRef.current?.abort();
    setMessages([WELCOME]);
    setInput("");
    setIsStreaming(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const showSuggestions = messages.length === 1 && messages[0].id === "welcome";

  return (
    <>
      {/* Particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className={styles.particle}
          style={{ left: p.x, top: p.y }}
        />
      ))}

      <div className={styles.root} dir="rtl">

        {/* ── Window ───────────────────────────────────────────────────────── */}
        {isOpen && (
          <div
            className={`${styles.window} ${isVisible ? styles.windowVisible : ""}`}
            role="dialog"
            aria-label="مساعد بصمات الذكي"
            aria-modal="true"
          >
            <div className={styles.blob1} aria-hidden />
            <div className={styles.blob2} aria-hidden />

            {/* Header */}
            <header className={styles.header}>
              <div className={styles.headerLeft}>
                <div className={styles.avatarRing}>
                  <div className={styles.avatar}>
                    <Bot size={18} strokeWidth={1.8} />
                  </div>
                  <span className={styles.onlinePulse} />
                </div>
                <div className={styles.headerText}>
                  <p className={styles.botName}>مساعد بصمات شبابية</p>
                  <p className={styles.botSub}>
                    <span className={styles.onlineDot} />
                    متاح الآن · ذكاء اصطناعي
                  </p>
                </div>
              </div>
              <div className={styles.headerActions}>
                <button
                  className={styles.iconBtn}
                  onClick={resetChat}
                  aria-label="بدء محادثة جديدة"
                  title="بدء محادثة جديدة"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  className={styles.iconBtn}
                  onClick={() => setIsOpen(false)}
                  aria-label="تصغير"
                >
                  <ChevronDown size={17} />
                </button>
              </div>
            </header>

            {/* Messages */}
            <div className={styles.messages} aria-live="polite">
              {messages.map((msg, idx) => (
                <div
                  key={msg.id}
                  className={`${styles.row} ${msg.role === "user" ? styles.userRow : styles.botRow}`}
                  style={{ animationDelay: `${idx * 0.03}s` }}
                >
                  {msg.role === "assistant" && (
                    <div className={styles.botAvatarSm} aria-hidden>
                      <Bot size={13} strokeWidth={2} />
                    </div>
                  )}
                  <div
                    className={`${styles.bubble} ${
                      msg.role === "user" ? styles.userBubble : styles.botBubble
                    }`}
                  >
                    {msg.content === "" && msg.role === "assistant" ? (
                      <span className={styles.typing} aria-label="يكتب...">
                        <span /><span /><span />
                      </span>
                    ) : (
                      renderContent(msg.content)
                    )}
                  </div>
                </div>
              ))}

              {showSuggestions && (
                <div className={styles.chips}>
                  {SUGGESTIONS.map(({ label, Icon }, i) => (
                    <button
                      key={label}
                      className={styles.chip}
                      onClick={() => sendMessage(label)}
                      disabled={isStreaming}
                      style={{ animationDelay: `${0.15 + i * 0.07}s` }}
                    >
                      <Icon size={12} strokeWidth={2.2} />
                      {label}
                    </button>
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form className={styles.inputRow} onSubmit={handleSubmit} noValidate>
              <div className={styles.inputWrap}>
                <input
                  ref={inputRef}
                  className={styles.input}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="اكتب سؤالك هنا..."
                  disabled={isStreaming}
                  dir="auto"
                  autoComplete="off"
                  maxLength={500}
                  aria-label="رسالتك"
                />
                {isStreaming && (
                  <span className={styles.streamDots} aria-hidden>
                    <span /><span /><span />
                  </span>
                )}
              </div>
              <button
                type="submit"
                className={styles.sendBtn}
                disabled={!input.trim() || isStreaming}
                aria-label="إرسال"
              >
                <span className={styles.sendRipple} />
                <Send size={15} />
              </button>
            </form>

            <p className={styles.footerBrand}>
              مدعوم بالذكاء الاصطناعي · بصمات شبابية ©
            </p>
          </div>
        )}

        {/* ── FAB ─────────────────────────────────────────────────────────── */}
        <button
          className={`${styles.fab} ${isOpen ? styles.fabOpen : ""}`}
          onClick={(e) => {
            if (!isOpen) spawnParticles(e);
            setIsOpen((p) => !p);
          }}
          aria-label={isOpen ? "إغلاق المساعد" : "فتح المساعد الذكي"}
          aria-expanded={isOpen}
        >
          {!isOpen && (
            <>
              <span className={`${styles.ring} ${styles.ring1}`} />
              <span className={`${styles.ring} ${styles.ring2}`} />
            </>
          )}

          <span className={`${styles.fabIconWrap} ${isOpen ? styles.fabIconOpen : ""}`}>
            {isOpen ? (
              <X size={20} strokeWidth={2.5} />
            ) : (
              <AiBotIcon />
            )}
          </span>

          {!isOpen && hasUnread && (
            <span className={styles.unreadBadge} aria-label="رسالة جديدة" />
          )}
        </button>
      </div>
    </>
  );
}