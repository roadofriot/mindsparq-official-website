import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Copy,
  Check,
  Bot,
  Loader2,
  Mic,
  MicOff,
  AlertTriangle
} from 'lucide-react';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import {
  sendGeminiPrompt,
  GeminiMessage,
  getGeminiModel
} from '../../services/geminiService';

export const AdminAiCopilotDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<GeminiMessage[]>([
    {
      id: 'welcome-copilot',
      role: 'assistant',
      content: '👋 Need ideas or copy for this page? Ask me to write titles, descriptions, lesson plans, or summaries!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Speech Recognition & Gemini Voice-to-Text hook
  const {
    isListening,
    isTranscribing,
    speechLang,
    setSpeechLang,
    voiceMode,
    setVoiceMode,
    speechStatusText,
    errorMessage: voiceError,
    clearError: clearVoiceError,
    elapsedSeconds,
    toggleVoiceRecording,
    stopVoiceRecording
  } = useVoiceInput({
    currentPrompt: inputPrompt,
    onTranscript: setInputPrompt
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    if (isListening) {
      stopVoiceRecording();
    }
    const query = (textToSend || inputPrompt).trim();
    if (!query || isGenerating) return;

    const userMsg: GeminiMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsGenerating(true);

    try {
      const systemPrompt = `You are the MindSparQ AI Admin Copilot in Butwal-11, Kalikanagar.
1. Provide direct, concise, copy-paste-ready drafts for school administrators (titles, descriptions, excerpt teasers, SEO tags, workshop agendas, and announcements).
2. If asked general, conversational, or factual questions (such as weather, time, factual queries, tech definitions), answer directly, accurately, and concisely without lecturing or preaching.
3. Avoid unnecessary conversational filler. Deliver high-impact, inspiring content.`;

      const responseText = await sendGeminiPrompt(query, undefined, systemPrompt);

      setMessages((prev) => [
        ...prev,
        {
          id: 'copilot-' + Date.now(),
          role: 'assistant',
          content: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'error-' + Date.now(),
          role: 'assistant',
          content: `Error: ${err.message || 'Unable to generate response'}. Please verify API key.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <>
      {/* Floating Trigger Button in Bottom Right */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Open AI Content Copilot"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1200,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 18px',
          borderRadius: '30px',
          backgroundColor: 'var(--color-primary-600)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 8px 24px rgba(36, 87, 214, 0.35)',
          fontWeight: 700,
          fontSize: '0.875rem',
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
        }}
      >
        <Sparkles size={18} />
        <span>{isOpen ? 'Close Copilot' : 'AI Copilot'}</span>
      </button>

      {/* Slide-out Side Drawer Panel */}
      {isOpen && (
        <aside
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '380px',
            maxWidth: '90vw',
            backgroundColor: 'var(--color-surface)',
            borderLeft: '1px solid var(--color-border)',
            boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.25)',
            zIndex: 1250,
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideInRight 0.25s ease-out'
          }}
        >
          {/* Drawer Header */}
          <div
            style={{
              padding: '14px 18px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--color-surface-hover)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(36, 87, 214, 0.15)',
                  color: 'var(--color-primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Bot size={16} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                  AI Admin Copilot
                </h3>
                <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)' }}>
                  Model: {getGeminiModel()}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Draft Prompts */}
          <div
            style={{
              padding: '8px 12px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              backgroundColor: 'var(--color-surface)'
            }}
          >
            {[
              'Write catchy carousel headline',
              'Draft short blog excerpt',
              'Write workshop objective'
            ].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handleSendMessage(p)}
                style={{
                  fontSize: '0.6875rem',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface-hover)',
                  color: 'var(--color-text-secondary)',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer'
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '92%'
                }}
              >
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: msg.role === 'user' ? 'var(--color-primary-600)' : 'var(--color-surface-hover)',
                    color: msg.role === 'user' ? '#ffffff' : 'var(--color-text)',
                    fontSize: '0.8125rem',
                    lineHeight: 1.45,
                    border: msg.role === 'user' ? 'none' : '1px solid var(--color-border)'
                  }}
                >
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>

                  {msg.role === 'assistant' && (
                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="btn btn-secondary"
                        style={{
                          fontSize: '0.6875rem',
                          padding: '2px 8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check size={12} color="#10b981" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={12} /> Copy to Form
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isGenerating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
                <Loader2 size={16} className="animate-spin" /> Thinking & drafting...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Voice Error Notification */}
          {voiceError && (
            <div
              style={{
                padding: '6px 10px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderTop: '1px solid rgba(239, 68, 68, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '6px',
                fontSize: '0.725rem',
                color: '#ef4444'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                <span>{voiceError}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {voiceMode === 'browser' && (
                  <button
                    type="button"
                    onClick={() => {
                      clearVoiceError();
                      setVoiceMode('gemini');
                    }}
                    style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      fontSize: '0.675rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ✨ Try Gemini
                  </button>
                )}
                <button
                  type="button"
                  onClick={clearVoiceError}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          )}

          {/* Active Listening Voice Banner */}
          {isListening && (
            <div
              style={{
                padding: '6px 12px',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                borderTop: '1px solid rgba(239, 68, 68, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#ef4444',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', animation: 'pulse 1s infinite' }} />
                <span>{speechStatusText || (speechLang === 'ne-NP' ? 'सुन्दैछ... बोल्नुहोस्' : 'Listening... Speak now')}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: '1px 6px', borderRadius: '4px' }}>
                  {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
                </span>
                <button
                  type="button"
                  onClick={stopVoiceRecording}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    fontWeight: 700
                  }}
                >
                  Stop
                </button>
              </div>
            </div>
          )}

          {/* Transcribing Voice Banner */}
          {isTranscribing && (
            <div
              style={{
                padding: '6px 12px',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                borderTop: '1px solid rgba(59, 130, 246, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#2563eb',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              <Loader2 size={13} className="animate-spin" />
              <span>{speechStatusText || '✨ Transcribing voice with Gemini AI...'}</span>
            </div>
          )}

          {/* Drawer Quick Controls: Language & Engine Toggle Strip */}
          <div
            style={{
              padding: '4px 12px',
              backgroundColor: 'var(--color-surface)',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.7rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Mic:</span>
              <button
                type="button"
                onClick={() => setSpeechLang(speechLang === 'ne-NP' ? 'en-US' : 'ne-NP')}
                title={`Switch language. Currently: ${speechLang === 'ne-NP' ? 'Nepali' : 'English'}`}
                style={{
                  padding: '2px 6px',
                  borderRadius: '10px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface-hover)',
                  color: 'var(--color-text)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {speechLang === 'ne-NP' ? '🇳🇵 Nepali' : '🇬🇧 English'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setVoiceMode(voiceMode === 'browser' ? 'gemini' : 'browser')}
                title="Toggle between Browser Real-time Live Voice and Gemini Studio Multimodal AI"
                style={{
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: voiceMode === 'gemini' ? 'rgba(124, 58, 237, 0.12)' : 'var(--color-surface-hover)',
                  color: voiceMode === 'gemini' ? '#7c3aed' : 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.675rem'
                }}
              >
                {voiceMode === 'gemini' ? '✨ Gemini AI' : '🌐 Browser Live'}
              </button>
            </div>
          </div>

          {/* Drawer Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '10px 12px',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              backgroundColor: 'var(--color-surface)'
            }}
          >
            <button
              type="button"
              onClick={toggleVoiceRecording}
              disabled={isTranscribing}
              title={
                isListening
                  ? 'Stop voice recording'
                  : isTranscribing
                  ? 'Transcribing audio with Gemini...'
                  : `Speak to AI (${speechLang === 'ne-NP' ? 'Nepali' : 'English'} - ${voiceMode === 'gemini' ? 'Gemini AI' : 'Browser Live'})`
              }
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: isListening ? '#ef4444' : isTranscribing ? 'rgba(59, 130, 246, 0.15)' : 'var(--color-surface-hover)',
                color: isListening ? '#ffffff' : isTranscribing ? '#2563eb' : 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isTranscribing ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {isTranscribing ? <Loader2 size={15} className="animate-spin" /> : isListening ? <MicOff size={15} /> : <Mic size={15} />}
            </button>

            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask AI Copilot for text/copy..."
              style={{
                flex: 1,
                padding: '8px 12px',
                fontSize: '0.8125rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-hover)',
                color: 'var(--color-text)',
                outline: 'none'
              }}
            />

            <button
              type="submit"
              disabled={isGenerating || !inputPrompt.trim()}
              className="btn btn-primary"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </aside>
      )}

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};
