import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Image as ImageIcon,
  X,
  Copy,
  Check,
  FileText,
  Sliders,
  BookOpen,
  Key,
  Bot,
  User as UserIcon,
  Loader2
} from 'lucide-react';
import {
  sendGeminiPrompt,
  GeminiMessage,
  getGeminiApiKey,
  saveGeminiApiKey
} from '../../services/geminiService';

export const AdminAiAssistantPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<GeminiMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Hello! I am your **MindSparQ Gemini AI Creative Assistant** powered by Gemini 2.5 Flash.\n\nI can help you:\n* ✍️ **Draft STEAM & Robotics blog posts**\n* 🎠 **Write high-converting carousel headlines & alt text**\n* 🎓 **Structure course modules & lesson curricula**\n* 🎙️ **Transcribe your voice directly (Nepali / English)**\n* 🖼️ **Analyze uploaded flyer photos to generate marketing descriptions**\n\nHow can I assist your educational mission today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Multimodal image attachment state
  const [attachedImage, setAttachedImage] = useState<{ data: string; mimeType: string; previewUrl: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Speech Recognition / Voice-to-Text state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // API Key management state
  const [apiKey, setApiKey] = useState(getGeminiApiKey());
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState(apiKey);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US'; // Supports 'ne-NP' or 'en-US'

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert('Voice-to-text is not supported by your current browser. Chrome, Edge, or Safari are recommended.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setAttachedImage({
          data: dataUrl,
          mimeType: file.type || 'image/jpeg',
          previewUrl: dataUrl
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query && !attachedImage) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsgId = 'user-' + Date.now();
    const newUserMsg: GeminiMessage = {
      id: userMsgId,
      role: 'user',
      content: query || 'Analyze attached flyer image and create promotional content.',
      imageUrl: attachedImage?.previewUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputPrompt('');
    const imagePayload = attachedImage ? { data: attachedImage.data, mimeType: attachedImage.mimeType } : undefined;
    setAttachedImage(null);
    setIsGenerating(true);

    try {
      const systemInstruction = `You are the lead AI Creative & Curriculum Director for MindSparQ Education & Technology in Butwal-11, Kalikanagar, Nepal.
Our institution specializes in STEAM education, Abacus Mental Math, Coding, Robotics, Artificial Intelligence, Drone Technology, Vedic Math, DMIT, and Parent/Teacher Training.
Produce engaging, inspiring, and pedagogically sound responses. When formatting articles or course lessons, provide clean Markdown with headers and bullet points.`;

      const responseText = await sendGeminiPrompt(query, imagePayload, systemInstruction);

      const assistantMsg: GeminiMessage = {
        id: 'assistant-' + Date.now(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'error-' + Date.now(),
          role: 'assistant',
          content: `I encountered an unexpected issue: ${err.message || 'Network timeout'}. Please try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyMarkdown = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    saveGeminiApiKey(tempKeyInput);
    setApiKey(tempKeyInput);
    setIsKeyModalOpen(false);
  };

  const quickPrompts = [
    'Write a blog post about why Robotics & AI matter for young learners in Nepal',
    'Generate a hero carousel headline and subtitle for our Abacus & Mental Math course',
    'Draft a 4-week beginner curriculum module on Drone Technology and Flight Telemetry',
    'Write high-impact SEO meta title and description targeting Butwal students'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--space-4) 0',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: 'var(--space-4)',
          flexWrap: 'wrap',
          gap: 'var(--space-3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(36, 87, 214, 0.12)',
              color: 'var(--color-primary-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bot size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: 'var(--font-xl)', fontWeight: 800, margin: 0, color: 'var(--color-text)' }}>
                MindSparQ Gemini Assistant
              </h1>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}
              >
                Gemini 2.5 Flash
              </span>
            </div>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
              AI Content Engine for Blog Posts, Carousel Slides, Course Syllabi & Multimodal Flyer Analysis
            </p>
          </div>
        </div>

        {/* API Key Configure Button */}
        <button
          type="button"
          onClick={() => {
            setTempKeyInput(apiKey);
            setIsKeyModalOpen(true);
          }}
          className="btn btn-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', padding: '6px 14px' }}
        >
          <Key size={14} />
          <span>{apiKey ? 'API Key Active (Configured)' : 'Set Google Gemini API Key'}</span>
        </button>
      </div>

      {/* Chat Messages Viewport */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-4)'
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%'
            }}
          >
            {msg.role === 'assistant' && (
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-600)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Sparkles size={16} />
              </div>
            )}

            <div
              style={{
                backgroundColor: msg.role === 'user' ? 'var(--color-primary-600)' : 'var(--color-surface-elevated)',
                color: msg.role === 'user' ? '#ffffff' : 'var(--color-text)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-lg)',
                border: msg.role === 'user' ? 'none' : '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              {/* Optional User Uploaded Image Preview */}
              {msg.imageUrl && (
                <div style={{ marginBottom: '8px', maxWidth: '300px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <img src={msg.imageUrl} alt="Attached input asset" style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
              )}

              {/* Message Content Rendered */}
              <div
                style={{
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {msg.content}
              </div>

              {/* Timestamp & Direct Implementation Action Bar for Assistant Messages */}
              {msg.role === 'assistant' && msg.id !== 'welcome-msg' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: 'var(--space-3)',
                    paddingTop: 'var(--space-3)',
                    borderTop: '1px solid var(--color-border)',
                    flexWrap: 'wrap'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleCopyMarkdown(msg.content, msg.id)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedId === msg.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    <span>{copiedId === msg.id ? 'Copied!' : 'Copy Markdown'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/admin/blog')}
                    className="btn btn-primary"
                    style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    title="Transfer content to Blog editor"
                  >
                    <FileText size={12} />
                    <span>Create Blog Post</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/admin/carousel')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    title="Transfer content to Carousel slide"
                  >
                    <Sliders size={12} />
                    <span>Create Slide</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/admin/courses')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    title="Transfer content to Course catalog"
                  >
                    <BookOpen size={12} />
                    <span>Create Lesson</span>
                  </button>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <UserIcon size={16} />
              </div>
            )}
          </div>
        ))}

        {isGenerating && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
            <Loader2 size={16} className="spin" style={{ color: 'var(--color-primary-600)' }} />
            <span>Gemini 2.5 Flash is thinking & drafting educational content...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      {messages.length <= 2 && (
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '8px' }}>
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              style={{
                fontSize: '0.75rem',
                padding: '6px 12px',
                borderRadius: '9999px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
            >
              ✨ {q}
            </button>
          ))}
        </div>
      )}

      {/* Attached Image Preview Bar */}
      {attachedImage && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 14px',
            backgroundColor: 'var(--color-surface-elevated)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            marginBottom: '8px'
          }}
        >
          <img src={attachedImage.previewUrl} alt="Attached thumbnail" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text)', flex: 1 }}>
            Image flyer attached for multimodal analysis
          </span>
          <button
            type="button"
            onClick={() => setAttachedImage(null)}
            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Active Listening Voice Banner */}
      {isListening && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            borderRadius: 'var(--radius-md)',
            marginBottom: '8px',
            fontSize: '0.75rem',
            fontWeight: 600
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', animation: 'pulse 1s infinite' }} />
          <span>Listening... Speak your prompt in Nepali or English. Click mic to finish.</span>
        </div>
      )}

      {/* Input Formulation Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: '8px',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        {/* Hidden File Picker for Image Upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Attach flyer photo or graphic for multimodal AI analysis"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: attachedImage ? 'rgba(36, 87, 214, 0.15)' : 'transparent',
            color: attachedImage ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <ImageIcon size={18} />
        </button>

        <button
          type="button"
          onClick={toggleVoiceRecording}
          title={isListening ? 'Stop voice recording' : 'Speak to AI (Voice-to-Text)'}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: isListening ? '#ef4444' : 'transparent',
            color: isListening ? '#ffffff' : 'var(--color-text-secondary)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Ask Gemini to draft an article, syllabus, or social flyer..."
          disabled={isGenerating}
          style={{
            flex: 1,
            height: '42px',
            padding: '0 12px',
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            color: 'var(--color-text)',
            fontSize: '0.875rem'
          }}
        />

        <button
          type="submit"
          disabled={isGenerating || (!inputPrompt.trim() && !attachedImage)}
          className="btn btn-primary"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Send size={16} />
        </button>
      </form>

      {/* Gemini API Key Configuration Modal */}
      {isKeyModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
            padding: 'var(--space-4)'
          }}
        >
          <div
            className="card"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: 'var(--space-6)',
              borderRadius: 'var(--radius-xl)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={18} style={{ color: 'var(--color-primary-600)' }} />
                <h3 style={{ fontSize: 'var(--font-lg)', fontWeight: 800, margin: 0 }}>
                  Configure Google Gemini API Key
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsKeyModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
              Enter your Google AI Studio API key to enable direct, high-speed neural responses using <strong>Gemini 2.5 Flash</strong>. Keys are stored locally in your browser and used securely.
            </p>

            <form onSubmit={handleSaveApiKey}>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 600, marginBottom: '4px' }}>
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  value={tempKeyInput}
                  onChange={(e) => setTempKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="input-field"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                <button
                  type="button"
                  onClick={() => setIsKeyModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save API Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
