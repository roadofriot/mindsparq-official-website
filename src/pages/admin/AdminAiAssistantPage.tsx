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
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import {
  sendGeminiPrompt,
  GeminiMessage,
  getGeminiApiKey,
  saveGeminiApiKey,
  getGeminiModel,
  saveGeminiModel,
  validateGeminiApiKey,
  SUPPORTED_GEMINI_MODELS
} from '../../services/geminiService';

export const AdminAiAssistantPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedModel, setSelectedModel] = useState<string>(getGeminiModel());
  const [messages, setMessages] = useState<GeminiMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Hello! I am your **MindSparQ Gemini AI Creative Assistant**.\n\nI can help you:\n* ✍️ **Draft STEAM, Robotics & Abacus blog posts**\n* 🎠 **Write high-converting carousel headlines & alt text**\n* 🎓 **Structure course modules & lesson curricula**\n* 🎙️ **Transcribe your voice directly in Nepali (नेपाली) or English**\n* 🖼️ **Analyze uploaded flyer photos to generate marketing descriptions**\n\nHow can I assist your educational mission today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Multimodal image attachment state
  const [attachedImage, setAttachedImage] = useState<{ data: string; mimeType: string; previewUrl: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // API Key management state
  const [apiKey, setApiKey] = useState(getGeminiApiKey());
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState(apiKey);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [validationResult, setValidationResult] = useState<{ valid: boolean; message: string } | null>(null);
  const [dynamicModels, setDynamicModels] = useState<Array<{ id: string; name: string; description?: string }>>([]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleTestValidateKey = async () => {
    setIsValidatingKey(true);
    setValidationResult(null);

    const res = await validateGeminiApiKey(tempKeyInput, selectedModel);
    setIsValidatingKey(false);

    if (res.valid) {
      if (res.availableModels && res.availableModels.length > 0) {
        setDynamicModels(res.availableModels);
      }
      setValidationResult({
        valid: true,
        message: res.error 
          ? `Verified! ${res.error}` 
          : `Verified! Successfully connected to Google Gemini using ${res.modelUsed}.`
      });
      setApiKey(tempKeyInput.trim());
      setSelectedModel(res.modelUsed);
    } else {
      setValidationResult({
        valid: false,
        message: res.error || 'Failed to authenticate with Google Gemini API.'
      });
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

    if (isListening) {
      stopVoiceRecording();
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

      const responseText = await sendGeminiPrompt(query, imagePayload, systemInstruction, selectedModel);

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
            </div>
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--color-text-secondary)', margin: 0 }}>
              AI Content Engine for Blog Posts, Carousel Slides, Course Syllabi & Multimodal Flyer Analysis
            </p>
          </div>
        </div>

        {/* Model Selector & Key Button Group */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label htmlFor="model-select" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
              Model:
            </label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => {
                const newModel = e.target.value;
                setSelectedModel(newModel);
                saveGeminiModel(newModel);
              }}
              style={{
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface-hover)',
                color: 'var(--color-text)',
                cursor: 'pointer'
              }}
            >
              {(dynamicModels.length > 0 ? dynamicModels : SUPPORTED_GEMINI_MODELS).map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
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

      {/* Voice Error Notification Banner */}
      {voiceError && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            padding: '8px 14px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '8px',
            color: '#ef4444',
            fontSize: '0.8125rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{voiceError}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {voiceMode === 'browser' && (
              <button
                type="button"
                onClick={() => {
                  clearVoiceError();
                  setVoiceMode('gemini');
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ✨ Try Gemini AI Voice
              </button>
            )}
            <button
              type="button"
              onClick={clearVoiceError}
              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Active Listening Voice Banner */}
      {isListening && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            padding: '8px 14px',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#ef4444',
            borderRadius: 'var(--radius-md)',
            marginBottom: '8px',
            fontSize: '0.8125rem',
            fontWeight: 600
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', animation: 'pulse 1s infinite' }} />
            <span>{speechStatusText || (speechLang === 'ne-NP' ? 'सुन्दैछ... नेपाली वा अंग्रेजीमा बोल्नुहोस्' : 'Listening... Speak in English or Nepali')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 700, backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: '2px 8px', borderRadius: '4px' }}>
              {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={stopVoiceRecording}
              style={{
                padding: '3px 10px',
                borderRadius: '6px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 700
              }}
            >
              Stop
            </button>
          </div>
        </div>
      )}

      {/* Transcribing Voice Banner (Gemini Multimodal AI) */}
      {isTranscribing && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            color: '#2563eb',
            borderRadius: 'var(--radius-md)',
            marginBottom: '8px',
            fontSize: '0.8125rem',
            fontWeight: 600
          }}
        >
          <Loader2 size={16} className="animate-spin" />
          <span>{speechStatusText || '✨ Gemini AI मार्फत अडियो रूपान्तरण हुँदैछ... / Transcribing audio...'}</span>
        </div>
      )}

      {/* Voice-to-Text Language Selection & Engine Mode */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', padding: '0 6px', fontSize: '0.75rem', flexWrap: 'wrap', gap: '8px' }}>
        {/* Language Selection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--color-text-secondary)', fontWeight: 600 }}>Voice Mic:</span>
          <button
            type="button"
            onClick={() => setSpeechLang('ne-NP')}
            style={{
              padding: '3px 8px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: speechLang === 'ne-NP' ? 'var(--color-primary-600)' : 'var(--color-surface-hover)',
              color: speechLang === 'ne-NP' ? '#ffffff' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontWeight: speechLang === 'ne-NP' ? 700 : 500
            }}
          >
            🇳🇵 नेपाली (Nepali)
          </button>
          <button
            type="button"
            onClick={() => setSpeechLang('en-US')}
            style={{
              padding: '3px 8px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: speechLang === 'en-US' ? 'var(--color-primary-600)' : 'var(--color-surface-hover)',
              color: speechLang === 'en-US' ? '#ffffff' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontWeight: speechLang === 'en-US' ? 700 : 500
            }}
          >
            🇬🇧 English
          </button>
        </div>

        {/* Engine Toggle: Browser Speech vs Gemini Multimodal */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.7rem' }}>Engine:</span>
          <button
            type="button"
            onClick={() => setVoiceMode('browser')}
            title="Real-time live typing directly in Chrome/Edge"
            style={{
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              backgroundColor: voiceMode === 'browser' ? 'var(--color-surface-hover)' : 'transparent',
              color: voiceMode === 'browser' ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontWeight: voiceMode === 'browser' ? 700 : 400
            }}
          >
            🌐 Browser Live
          </button>
          <button
            type="button"
            onClick={() => setVoiceMode('gemini')}
            title="High-accuracy Gemini Audio Whisper transcription (works on any browser)"
            style={{
              padding: '2px 8px',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              backgroundColor: voiceMode === 'gemini' ? 'rgba(124, 58, 237, 0.12)' : 'transparent',
              color: voiceMode === 'gemini' ? '#7c3aed' : 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontWeight: voiceMode === 'gemini' ? 700 : 400
            }}
          >
            ✨ Gemini AI Audio
          </button>
        </div>
      </div>

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
          disabled={isTranscribing}
          title={isListening ? 'Stop voice recording' : isTranscribing ? 'Transcribing with Gemini AI...' : 'Speak to AI (Voice-to-Text)'}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: isListening ? '#ef4444' : isTranscribing ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
            color: isListening ? '#ffffff' : isTranscribing ? '#2563eb' : 'var(--color-text-secondary)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: isTranscribing ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {isTranscribing ? <Loader2 size={18} className="animate-spin" /> : isListening ? <MicOff size={18} /> : <Mic size={18} />}
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
              Enter your Google AI Studio API key (from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary-600)', textDecoration: 'underline' }}>aistudio.google.com</a>) to power direct text and multimodal flyer generation.
            </p>

            <form onSubmit={handleSaveApiKey}>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 600, marginBottom: '4px' }}>
                  Default AI Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => {
                    const m = e.target.value;
                    setSelectedModel(m);
                    saveGeminiModel(m);
                  }}
                  className="input-field"
                  style={{ width: '100%', cursor: 'pointer' }}
                >
                  {(dynamicModels.length > 0 ? dynamicModels : SUPPORTED_GEMINI_MODELS).map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.description ? `— ${m.description}` : m.desc ? `— ${m.desc}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', fontSize: 'var(--font-xs)', fontWeight: 600, marginBottom: '4px' }}>
                  Google Gemini API Key
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="password"
                    value={tempKeyInput}
                    onChange={(e) => {
                      setTempKeyInput(e.target.value);
                      setValidationResult(null);
                    }}
                    placeholder="AIzaSy..."
                    className="input-field"
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleTestValidateKey}
                    disabled={isValidatingKey || !tempKeyInput.trim()}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    {isValidatingKey ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Testing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} /> Test & Validate
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Validation Result Notice */}
              {validationResult && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--space-4)',
                    fontSize: '0.8125rem',
                    lineHeight: 1.4,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    backgroundColor: validationResult.valid ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    border: `1px solid ${validationResult.valid ? '#10b981' : '#ef4444'}`,
                    color: validationResult.valid ? '#10b981' : '#ef4444'
                  }}
                >
                  {validationResult.valid ? <Check size={16} style={{ flexShrink: 0, marginTop: '2px' }} /> : <X size={16} style={{ flexShrink: 0, marginTop: '2px' }} />}
                  <div>
                    <strong>{validationResult.valid ? 'Key Verified Active' : 'Validation Error'}</strong>
                    <div style={{ marginTop: '2px' }}>{validationResult.message}</div>
                  </div>
                </div>
              )}

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
