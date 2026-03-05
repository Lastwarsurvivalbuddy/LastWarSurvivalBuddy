'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase =
  typeof window !== 'undefined'
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
    : null;

const t = {
  bg: '#07080a',
  surface: '#0e1014',
  surfaceRaised: '#13161b',
  border: '#1e2229',
  borderHover: '#2a3040',
  gold: '#c9a84c',
  goldDim: '#7a6030',
  goldFaint: '#c9a84c18',
  red: '#c0281a',
  text: '#e8e6e0',
  textMuted: '#606878',
  textDim: '#9ca3af',
  green: '#22c55e',
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// ─── SUGGESTED PROMPTS ────────────────────────────────────────────────────────

const SUGGESTED_PROMPTS = [
  "What are my top 3 moves today?",
  "Should I open speedups today or wait?",
  "What should I focus on for Arms Race right now?",
  "Is today a good day to train troops?",
  "What's the best way to use my Alliance Duel points today?",
];

// ─── MESSAGE BUBBLE ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 16,
      padding: '0 4px',
    }}>
      {/* Buddy avatar */}
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${t.red}, ${t.gold})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, marginRight: 10, marginTop: 2,
        }}>
          💬
        </div>
      )}

      <div style={{
        maxWidth: '80%',
        padding: '12px 16px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        background: isUser ? t.gold : t.surfaceRaised,
        border: isUser ? 'none' : `1px solid ${t.border}`,
        color: isUser ? '#07080a' : t.text,
        fontSize: 14,
        lineHeight: 1.6,
        fontWeight: isUser ? 600 : 400,
      }}>
        {/* Render assistant messages with basic markdown-like formatting */}
        {!isUser ? (
          <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>
        ) : (
          message.content
        )}
      </div>
    </div>
  );
}

// ─── TYPING INDICATOR ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '0 4px' }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: `linear-gradient(135deg, ${t.red}, ${t.gold})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16,
      }}>
        💬
      </div>
      <div style={{
        padding: '12px 16px', borderRadius: '18px 18px 18px 4px',
        background: t.surfaceRaised, border: `1px solid ${t.border}`,
        display: 'flex', gap: 4, alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: t.textMuted,
            animation: 'bounce 1.2s infinite',
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── LIMIT REACHED BANNER ─────────────────────────────────────────────────────

function LimitBanner({ message }: { message: string }) {
  return (
    <div style={{
      margin: '16px 0',
      padding: '16px',
      background: `${t.gold}12`,
      border: `1px solid ${t.goldDim}`,
      borderRadius: 12,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>⚡</div>
      <p style={{ color: t.text, fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
        {message}
      </p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button style={{
          padding: '10px 20px', borderRadius: 8,
          background: t.gold, border: 'none',
          color: '#07080a', fontWeight: 700, fontSize: 13,
          cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase',
          fontFamily: '"Rajdhani", sans-serif',
        }}>
          Upgrade to Pro — $4.99/mo
        </button>
        <button style={{
          padding: '10px 20px', borderRadius: 8,
          background: 'transparent', border: `1px solid ${t.gold}`,
          color: t.gold, fontWeight: 700, fontSize: 13,
          cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase',
          fontFamily: '"Rajdhani", sans-serif',
        }}>
          Founding Member — $59
        </button>
      </div>
    </div>
  );
}

// ─── MAIN CHAT PAGE ───────────────────────────────────────────────────────────

export default function BuddyChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questionsRemaining, setQuestionsRemaining] = useState<number | null>(null);
  const [limitMessage, setLimitMessage] = useState<string | null>(null);
  const [commanderName, setCommanderName] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    async function init() {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/signin'); return; }
      setToken(session.access_token);

      // Get commander name
      const { data: profile } = await supabase
        .from('profiles')
        .select('commander_name')
        .eq('id', session.user.id)
        .single();
      if (profile?.commander_name) setCommanderName(profile.commander_name);

      // Create a new chat session
      const { data: chatSession } = await supabase
        .from('chat_sessions')
        .insert({ user_id: session.user.id, title: 'New Session' })
        .select()
        .single();
      if (chatSession) setSessionId(chatSession.id);

      // Check today's usage
      const today = new Date().toISOString().split('T')[0];
      const { data: usage } = await supabase
        .from('daily_usage')
        .select('question_count')
        .eq('user_id', session.user.id)
        .eq('usage_date', today)
        .single();
      const used = usage?.question_count || 0;
      setQuestionsRemaining(Math.max(0, 5 - used));
    }
    init();
  }, [router]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(content?: string) {
    const text = content || input.trim();
    if (!text || loading || !token) return;

    const userMessage: Message = { role: 'user', content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setLimitMessage(null);

    try {
      const res = await fetch('/api/buddy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: newMessages,
          sessionId,
        }),
      });

      const data = await res.json();

      if (res.status === 429) {
        setLimitMessage(data.message);
        setQuestionsRemaining(0);
        return;
      }

      if (!res.ok) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Something went wrong. Try again in a moment.',
        }]);
        return;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      if (data.questionsRemaining !== null) {
        setQuestionsRemaining(data.questionsRemaining);
      }

      // Update session title from first message
      if (messages.length === 0 && sessionId && supabase) {
        const title = text.slice(0, 50);
        await supabase
          .from('chat_sessions')
          .update({ title })
          .eq('id', sessionId);
      }

    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Connection error. Check your internet and try again.',
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const showSuggestions = messages.length === 0 && !loading;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${t.bg}; overflow: hidden; }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        textarea { resize: none; font-family: inherit; }
        textarea::placeholder { color: ${t.textMuted}; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 2px; }
      `}</style>

      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        background: t.bg, maxWidth: 640, margin: '0 auto',
      }}>

        {/* ── HEADER ── */}
        <div style={{
          padding: '12px 16px',
          background: `${t.bg}ee`, backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${t.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                background: 'transparent', border: 'none', color: t.textMuted,
                cursor: 'pointer', fontSize: 18, padding: '4px 8px 4px 0',
              }}
            >
              ←
            </button>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: `linear-gradient(135deg, ${t.red}, ${t.gold})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>
              💬
            </div>
            <div>
              <div style={{ fontFamily: '"Rajdhani", sans-serif', fontWeight: 700, fontSize: 15, color: t.text, letterSpacing: '0.04em' }}>
                Buddy AI
              </div>
              <div style={{ fontSize: 11, color: t.textMuted }}>
                {commanderName ? `Commander ${commanderName}` : 'Your personal Last War coach'}
              </div>
            </div>
          </div>

          {/* Questions remaining badge */}
          {questionsRemaining !== null && (
            <div style={{
              padding: '4px 10px', borderRadius: 20,
              background: questionsRemaining > 0 ? t.goldFaint : `${t.red}20`,
              border: `1px solid ${questionsRemaining > 0 ? t.goldDim : t.red}`,
              fontSize: 11, color: questionsRemaining > 0 ? t.gold : t.red,
              letterSpacing: '0.06em',
            }}>
              {questionsRemaining > 0 ? `${questionsRemaining} left today` : 'Limit reached'}
            </div>
          )}
        </div>

        {/* ── MESSAGES ── */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '20px 16px 8px',
        }}>

          {/* Welcome message */}
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px 0 28px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🎖️</div>
              <h2 style={{
                fontFamily: '"Rajdhani", sans-serif', fontSize: 22, fontWeight: 700,
                color: t.gold, letterSpacing: '0.06em', marginBottom: 8,
              }}>
                {commanderName ? `Ready, Commander ${commanderName}` : 'Buddy is ready'}
              </h2>
              <p style={{ color: t.textMuted, fontSize: 14, lineHeight: 1.6, maxWidth: 320, margin: '0 auto' }}>
                Ask me anything about today's strategy, events, pack value, or your next moves.
              </p>
            </div>
          )}

          {/* Suggested prompts */}
          {showSuggestions && (
            <div style={{ marginBottom: 24 }}>
              <p style={{ color: t.textMuted, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                Try asking...
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {SUGGESTED_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    style={{
                      padding: '11px 14px', background: t.surface,
                      border: `1px solid ${t.border}`, borderRadius: 10,
                      color: t.textDim, fontSize: 13, cursor: 'pointer',
                      textAlign: 'left', transition: 'all 0.15s',
                      fontFamily: 'inherit',
                    }}
                    onMouseEnter={e => {
                      (e.target as HTMLButtonElement).style.borderColor = t.goldDim;
                      (e.target as HTMLButtonElement).style.color = t.text;
                    }}
                    onMouseLeave={e => {
                      (e.target as HTMLButtonElement).style.borderColor = t.border;
                      (e.target as HTMLButtonElement).style.color = t.textDim;
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {/* Typing indicator */}
          {loading && <TypingIndicator />}

          {/* Limit reached */}
          {limitMessage && <LimitBanner message={limitMessage} />}

          <div ref={bottomRef} />
        </div>

        {/* ── INPUT BAR ── */}
        <div style={{
          padding: '12px 16px 24px',
          borderTop: `1px solid ${t.border}`,
          background: t.bg,
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-end',
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: 14, padding: '10px 12px',
            transition: 'border-color 0.15s',
          }}
            onFocusCapture={e => (e.currentTarget.style.borderColor = t.goldDim)}
            onBlurCapture={e => (e.currentTarget.style.borderColor = t.border)}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Buddy anything..."
              rows={1}
              disabled={loading || questionsRemaining === 0}
              style={{
                flex: 1, background: 'transparent', border: 'none',
                color: t.text, fontSize: 14, outline: 'none',
                lineHeight: 1.5, maxHeight: 120, overflowY: 'auto',
                padding: 0,
              }}
              onInput={e => {
                const el = e.target as HTMLTextAreaElement;
                el.style.height = 'auto';
                el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading || questionsRemaining === 0}
              style={{
                width: 36, height: 36, borderRadius: '50%', border: 'none',
                background: input.trim() && !loading && questionsRemaining !== 0
                  ? `linear-gradient(135deg, ${t.red}, ${t.gold})`
                  : t.border,
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, flexShrink: 0, transition: 'all 0.15s',
              }}
            >
              ↑
            </button>
          </div>
          <p style={{ color: t.textMuted, fontSize: 11, textAlign: 'center', marginTop: 8 }}>
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>

      </div>
    </>
  );
}'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string; // base64 data URL for display
  timestamp: Date;
}

const SUGGESTED_PROMPTS = [
  "What should I focus on today?",
  "Is my defense setup optimal?",
  "How do I maximize Arms Race points?",
  "What's the best use of my speedups right now?",
  "Help me plan for the next Kill Event",
];

export default function BuddyPage() {
  const router = useRouter();
  const supabase = createClient();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [pendingImage, setPendingImage] = useState<{ dataUrl: string; base64: string; mimeType: string } | null>(null);
  const [dailyLimit, setDailyLimit] = useState<{ used: number; limit: number } | null>(null);
  const [tier, setTier] = useState<string>('free');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    checkAuthAndLoadContext();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  async function checkAuthAndLoadContext() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/signin');
      return;
    }

    // Load subscription tier
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', session.user.id)
      .single();
    if (sub) setTier(sub.tier);

    // Load daily usage
    const today = new Date().toISOString().split('T')[0];
    const { data: usage } = await supabase
      .from('daily_usage')
      .select('question_count, screenshot_count')
      .eq('user_id', session.user.id)
      .eq('date', today)
      .single();

    const limits: Record<string, number> = {
      free: 5, pro: 30, elite: 100, founding: 20, alliance: 100
    };
    const userTier = sub?.tier || 'free';
    const userLimit = limits[userTier] || 5;
    const used = usage?.question_count || 0;
    setDailyLimit({ used, limit: userLimit });
  }

  function handleScreenshotClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }

    // Validate size — 5MB max
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      // Extract base64 portion
      const base64 = dataUrl.split(',')[1];
      const mimeType = file.type;
      setPendingImage({ dataUrl, base64, mimeType });
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-selected
    e.target.value = '';
  }

  function clearPendingImage() {
    setPendingImage(null);
  }

  async function sendMessage() {
    const trimmed = input.trim();
    if ((!trimmed && !pendingImage) || isLoading) return;

    // Check limit
    if (dailyLimit && dailyLimit.used >= dailyLimit.limit) {
      return; // handled by UI gate below
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed || (pendingImage ? '📸 Screenshot uploaded — please analyze this.' : ''),
      imageUrl: pendingImage?.dataUrl,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    const imageToSend = pendingImage;
    setPendingImage(null);
    setIsLoading(true);
    setIsTyping(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/signin'); return; }

      const body: Record<string, unknown> = {
        message: userMessage.content,
        history: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      };

      if (imageToSend) {
        body.image = {
          base64: imageToSend.base64,
          mimeType: imageToSend.mimeType,
        };
      }

      const res = await fetch('/api/buddy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });

      setIsTyping(false);

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 429) {
          // Daily limit hit
          setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: err.upgradeMessage || "You've hit your daily limit. Upgrade to keep going.",
            timestamp: new Date(),
          }]);
          setDailyLimit(prev => prev ? { ...prev, used: prev.limit } : prev);
          return;
        }
        throw new Error(err.error || 'Request failed');
      }

      const data = await res.json();
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      }]);

      // Update usage count
      setDailyLimit(prev => prev ? { ...prev, used: prev.used + 1 } : prev);

    } catch (err) {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "Something went wrong. Try again in a moment.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const isAtLimit = dailyLimit ? dailyLimit.used >= dailyLimit.limit : false;
  const isEmpty = messages.length === 0;

  return (
    <div className="buddy-wrap">
      {/* Header */}
      <header className="buddy-header">
        <button className="back-btn" onClick={() => router.push('/dashboard')}>
          ← Dashboard
        </button>
        <div className="header-center">
          <span className="buddy-logo">🎖️</span>
          <span className="buddy-title">BUDDY AI</span>
        </div>
        {dailyLimit && (
          <div className="usage-badge">
            <span className={dailyLimit.used >= dailyLimit.limit ? 'usage-maxed' : ''}>
              {dailyLimit.used}/{dailyLimit.limit}
            </span>
          </div>
        )}
      </header>

      {/* Messages area */}
      <main className="messages-area">
        {isEmpty ? (
          <div className="empty-state">
            <div className="empty-icon">🎖️</div>
            <h2 className="empty-heading">What's your situation, Commander?</h2>
            <p className="empty-sub">
              Ask anything. Upload a Hot Deal screenshot for buy/skip analysis.<br />
              Every answer knows your profile, server, and what's coming up.
            </p>
            <div className="suggested-prompts">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  className="prompt-chip"
                  onClick={() => setInput(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((msg) => (
              <div key={msg.id} className={`message-row ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="avatar assistant-avatar">🎖️</div>
                )}
                <div className={`bubble ${msg.role}`}>
                  {msg.imageUrl && (
                    <div className="image-preview-in-bubble">
                      <img src={msg.imageUrl} alt="Uploaded screenshot" />
                    </div>
                  )}
                  {msg.content && (
                    <div className="bubble-text">
                      {msg.content.split('\n').map((line, i) => (
                        <span key={i}>{line}{i < msg.content.split('\n').length - 1 && <br />}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message-row assistant">
                <div className="avatar assistant-avatar">🎖️</div>
                <div className="bubble assistant typing-bubble">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input area */}
      <footer className="input-area">
        {/* Upgrade banner */}
        {isAtLimit && (
          <div className="limit-banner">
            <span>
              {tier === 'free'
                ? "You've hit your daily limit (5 questions)."
                : `Daily limit reached (${dailyLimit?.limit} questions).`}
            </span>
            {tier === 'free' && (
              <a href="/upgrade" className="upgrade-link">
                Upgrade → Pro $9.99 · Elite $19.99 · Founding Member $99 lifetime
              </a>
            )}
          </div>
        )}

        {/* Pending image preview */}
        {pendingImage && (
          <div className="pending-image-bar">
            <div className="pending-thumb-wrap">
              <img src={pendingImage.dataUrl} alt="Screenshot ready to send" className="pending-thumb" />
              <button className="remove-image-btn" onClick={clearPendingImage} title="Remove">✕</button>
            </div>
            <span className="pending-label">Screenshot ready — add a question or just hit send</span>
          </div>
        )}

        {/* Screenshot upload button */}
        <div className="screenshot-row">
          <button
            className="screenshot-btn"
            onClick={handleScreenshotClick}
            disabled={isAtLimit || (tier === 'free')}
            title={tier === 'free' ? 'Screenshot analysis requires Pro or above' : 'Upload a pack screenshot'}
          >
            📸 Upload Screenshot
            {tier === 'free' && <span className="pro-badge">PRO</span>}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        {/* Text input row */}
        <div className="text-input-row">
          <textarea
            ref={textareaRef}
            className="chat-input"
            placeholder={
              isAtLimit
                ? 'Daily limit reached'
                : pendingImage
                ? 'Add a question about this screenshot, or just hit Send…'
                : 'Ask Buddy anything…'
            }
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isAtLimit || isLoading}
            rows={1}
          />
          <button
            className={`send-btn ${(!input.trim() && !pendingImage) || isAtLimit ? 'disabled' : ''}`}
            onClick={sendMessage}
            disabled={(!input.trim() && !pendingImage) || isAtLimit || isLoading}
          >
            {isLoading ? (
              <span className="spinner" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>
      </footer>

      <style jsx>{`
        /* ─── Layout ─── */
        .buddy-wrap {
          display: flex;
          flex-direction: column;
          height: 100dvh;
          background: #0a0c10;
          color: #e8e4d9;
          font-family: 'Georgia', 'Times New Roman', serif;
          max-width: 800px;
          margin: 0 auto;
          position: relative;
        }

        /* ─── Header ─── */
        .buddy-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          background: #0d1017;
          border-bottom: 1px solid #1e2535;
          flex-shrink: 0;
        }
        .back-btn {
          background: none;
          border: none;
          color: #8a9ab5;
          font-size: 13px;
          cursor: pointer;
          font-family: inherit;
          letter-spacing: 0.03em;
          padding: 4px 0;
          transition: color 0.2s;
        }
        .back-btn:hover { color: #c9b87a; }
        .header-center {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .buddy-logo { font-size: 18px; }
        .buddy-title {
          font-size: 13px;
          font-family: 'Courier New', monospace;
          letter-spacing: 0.18em;
          color: #c9b87a;
          font-weight: bold;
        }
        .usage-badge {
          font-size: 11px;
          font-family: 'Courier New', monospace;
          color: #5a6880;
          letter-spacing: 0.05em;
          min-width: 60px;
          text-align: right;
        }
        .usage-maxed { color: #c0392b; }

        /* ─── Messages ─── */
        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 24px 20px 16px;
          scroll-behavior: smooth;
        }
        .messages-area::-webkit-scrollbar { width: 4px; }
        .messages-area::-webkit-scrollbar-track { background: transparent; }
        .messages-area::-webkit-scrollbar-thumb { background: #1e2535; border-radius: 2px; }

        /* ─── Empty state ─── */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          text-align: center;
          padding: 0 20px;
        }
        .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.85; }
        .empty-heading {
          font-size: 22px;
          color: #e8e4d9;
          margin: 0 0 10px;
          font-weight: normal;
          letter-spacing: 0.02em;
        }
        .empty-sub {
          font-size: 14px;
          color: #5a6880;
          line-height: 1.7;
          margin: 0 0 28px;
          max-width: 420px;
        }
        .suggested-prompts {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 100%;
          max-width: 420px;
        }
        .prompt-chip {
          background: #0d1017;
          border: 1px solid #1e2535;
          color: #8a9ab5;
          padding: 10px 16px;
          border-radius: 6px;
          font-size: 13px;
          font-family: inherit;
          cursor: pointer;
          text-align: left;
          transition: border-color 0.2s, color 0.2s;
          letter-spacing: 0.01em;
        }
        .prompt-chip:hover {
          border-color: #c9b87a;
          color: #c9b87a;
        }

        /* ─── Message bubbles ─── */
        .messages-list { display: flex; flex-direction: column; gap: 18px; }
        .message-row {
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }
        .message-row.user { flex-direction: row-reverse; }
        .avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .assistant-avatar { background: #12182a; border: 1px solid #1e2535; }
        .bubble {
          max-width: 78%;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 14px;
          line-height: 1.7;
        }
        .bubble.user {
          background: #131d33;
          border: 1px solid #1e3060;
          color: #d4e0f5;
        }
        .bubble.assistant {
          background: #0d1017;
          border: 1px solid #1e2535;
          color: #d0c9b5;
        }
        .bubble-text { white-space: pre-wrap; word-break: break-word; }

        /* Image in bubble */
        .image-preview-in-bubble {
          margin-bottom: 10px;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #1e2535;
        }
        .image-preview-in-bubble img {
          width: 100%;
          max-height: 260px;
          object-fit: contain;
          display: block;
          background: #070a0f;
        }

        /* Typing indicator */
        .typing-bubble {
          display: flex;
          gap: 5px;
          align-items: center;
          padding: 14px 18px;
        }
        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #c9b87a;
          animation: blink 1.4s infinite;
        }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.9); }
          40% { opacity: 1; transform: scale(1.1); }
        }

        /* ─── Input area ─── */
        .input-area {
          background: #0d1017;
          border-top: 1px solid #1e2535;
          padding: 12px 16px 16px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* Limit banner */
        .limit-banner {
          background: #1a0e0e;
          border: 1px solid #5c2222;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 12px;
          color: #c0392b;
          display: flex;
          flex-direction: column;
          gap: 4px;
          font-family: 'Courier New', monospace;
        }
        .upgrade-link {
          color: #c9b87a;
          text-decoration: none;
          font-size: 11px;
          letter-spacing: 0.03em;
        }
        .upgrade-link:hover { text-decoration: underline; }

        /* Pending image preview bar */
        .pending-image-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #0a0e18;
          border: 1px solid #1e3060;
          border-radius: 8px;
          padding: 8px 12px;
        }
        .pending-thumb-wrap {
          position: relative;
          flex-shrink: 0;
        }
        .pending-thumb {
          width: 52px;
          height: 52px;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid #1e3060;
          display: block;
        }
        .remove-image-btn {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #c0392b;
          border: none;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 9px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }
        .pending-label {
          font-size: 12px;
          color: #5a6880;
          line-height: 1.4;
          font-style: italic;
        }

        /* Screenshot button row */
        .screenshot-row {
          display: flex;
          align-items: center;
        }
        .screenshot-btn {
          background: #0d1017;
          border: 1px dashed #2a3550;
          color: #8a9ab5;
          font-size: 12px;
          font-family: 'Courier New', monospace;
          letter-spacing: 0.05em;
          padding: 7px 14px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: border-color 0.2s, color 0.2s;
        }
        .screenshot-btn:hover:not(:disabled) {
          border-color: #c9b87a;
          color: #c9b87a;
        }
        .screenshot-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .pro-badge {
          background: #c9b87a;
          color: #0a0c10;
          font-size: 9px;
          font-weight: bold;
          padding: 2px 5px;
          border-radius: 3px;
          letter-spacing: 0.08em;
          margin-left: 2px;
        }

        /* Text input row */
        .text-input-row {
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }
        .chat-input {
          flex: 1;
          background: #0a0e18;
          border: 1px solid #1e2535;
          border-radius: 8px;
          color: #e8e4d9;
          font-size: 14px;
          font-family: inherit;
          padding: 10px 14px;
          resize: none;
          outline: none;
          line-height: 1.5;
          min-height: 42px;
          max-height: 120px;
          transition: border-color 0.2s;
        }
        .chat-input:focus { border-color: #2a3a60; }
        .chat-input::placeholder { color: #3a4560; }
        .chat-input:disabled { opacity: 0.5; cursor: not-allowed; }
        .send-btn {
          width: 42px;
          height: 42px;
          border-radius: 8px;
          background: #c9b87a;
          border: none;
          color: #0a0c10;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.2s, opacity 0.2s;
        }
        .send-btn:hover:not(.disabled) { background: #d9cc8e; }
        .send-btn.disabled { background: #1e2535; color: #3a4560; cursor: not-allowed; }
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #0a0c10;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ─── Responsive ─── */
        @media (max-width: 480px) {
          .messages-area { padding: 16px 12px 12px; }
          .input-area { padding: 10px 12px 14px; }
          .bubble { max-width: 90%; font-size: 13px; }
          .empty-heading { font-size: 18px; }
        }
      `}</style>
    </div>
  );
}

