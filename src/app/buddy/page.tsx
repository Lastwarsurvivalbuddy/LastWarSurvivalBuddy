'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
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

  // Pre-fill from "Ask Buddy to go deeper" on dashboard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefill = sessionStorage.getItem('buddy_prefill');
      if (prefill) {
        setInput(prefill);
        sessionStorage.removeItem('buddy_prefill');
        setTimeout(() => textareaRef.current?.focus(), 100);
      }
    }
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

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('user_id', session.user.id)
      .single();
    if (sub) setTier(sub.tier);

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

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const base64 = dataUrl.split(',')[1];
      const mimeType = file.type;
      setPendingImage({ dataUrl, base64, mimeType });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function clearPendingImage() {
    setPendingImage(null);
  }

  async function sendMessage() {
    const trimmed = input.trim();
    if ((!trimmed && !pendingImage) || isLoading) return;

    if (dailyLimit && dailyLimit.used >= dailyLimit.limit) {
      return;
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

        {pendingImage && (
          <div className="pending-image-bar">
            <div className="pending-thumb-wrap">
              <img src={pendingImage.dataUrl} alt="Screenshot ready to send" className="pending-thumb" />
              <button className="remove-image-btn" onClick={clearPendingImage} title="Remove">✕</button>
            </div>
            <span className="pending-label">Screenshot ready — add a question or just hit send</span>
          </div>
        )}

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
        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 24px 20px 16px;
          scroll-behavior: smooth;
        }
        .messages-area::-webkit-scrollbar { width: 4px; }
        .messages-area::-webkit-scrollbar-track { background: transparent; }
        .messages-area::-webkit-scrollbar-thumb { background: #1e2535; border-radius: 2px; }
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
        .input-area {
          background: #0d1017;
          border-top: 1px solid #1e2535;
          padding: 12px 16px 16px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
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
