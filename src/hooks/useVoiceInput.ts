import { useState, useRef, useEffect, useCallback } from 'react';
import { transcribeAudioWithGemini, getGeminiApiKey } from '../services/geminiService';

export type VoiceMode = 'browser' | 'gemini';
export type SpeechLang = 'ne-NP' | 'en-US';

export interface UseVoiceInputProps {
  currentPrompt: string;
  onTranscript: (newPrompt: string) => void;
}

export function useVoiceInput({ currentPrompt, onTranscript }: UseVoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [speechLang, setSpeechLang] = useState<SpeechLang>('ne-NP');
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('browser');
  const [speechStatusText, setSpeechStatusText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // References
  const baseTextRef = useRef<string>('');
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  // Check if browser native SpeechRecognition is supported
  const isBrowserSpeechSupported = typeof window !== 'undefined' && 
    !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  // Clean timer
  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setElapsedSeconds(0);
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    setElapsedSeconds(0);
    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  }, [stopTimer]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopTimer();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stopTimer]);

  const clearError = () => {
    setErrorMessage(null);
  };

  /**
   * Stop active recording session cleanly
   */
  const stopVoiceRecording = useCallback(() => {
    // Stop Web Speech
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    // Stop MediaRecorder (Gemini AI voice)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }

    // Release microphone hardware
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }

    setIsListening(false);
    stopTimer();
  }, [stopTimer]);

  /**
   * Start MediaRecorder and transcribe with Gemini Multimodal Audio
   */
  const startGeminiVoiceRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setErrorMessage('Your browser does not allow microphone recording.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        // Stop stream hardware immediately
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((t) => t.stop());
          audioStreamRef.current = null;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size < 100) {
          setIsListening(false);
          setSpeechStatusText('');
          return;
        }

        setIsTranscribing(true);
        setSpeechStatusText(
          speechLang === 'ne-NP'
            ? '✨ Gemini AI मार्फत अडियो रूपान्तरण हुँदैछ...'
            : '✨ Transcribing voice with Gemini AI...'
        );

        try {
          const transcribedText = await transcribeAudioWithGemini(audioBlob, speechLang);
          if (transcribedText.trim()) {
            const base = baseTextRef.current.trim();
            onTranscript(base ? `${base} ${transcribedText.trim()}` : transcribedText.trim());
            setSpeechStatusText('');
          } else {
            setErrorMessage('कुनै बोली पहिचान हुन सकेन। कृपया माइक नजिक गएर स्पष्ट बोल्नुहोस्।');
          }
        } catch (err: any) {
          console.error('[Gemini Voice Error]', err);
          setErrorMessage(
            err.message?.includes('API Key')
              ? 'Gemini API Key फेला परेन। कृपया माथि API Key राख्नुहोस् वा Browser Voice मोड प्रयोग गर्नुहोस्।'
              : `Gemini ट्रान्सक्रिप्सन त्रुटि: ${err.message || 'Error transcribing audio'}`
          );
        } finally {
          setIsTranscribing(false);
          setIsListening(false);
          setSpeechStatusText('');
        }
      };

      recorder.start(250);
      setIsListening(true);
      setSpeechStatusText(
        speechLang === 'ne-NP'
          ? 'रेकर्डिङ हुँदैछ (Gemini AI)... नेपालीमा बोल्नुहोस्'
          : 'Recording audio (Gemini AI)... Speak in English'
      );
      startTimer();
    } catch (err: any) {
      console.warn('[Gemini Voice Start Error]', err);
      setIsListening(false);
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? 'माइक्रोफोन अनुमति अस्वीकार गरिएको छ। कृपया ब्राउजरको सेटिङमा माइक अन गर्नुहोस्।'
          : 'माइक्रोफोन सक्रिय गर्न सकिएन।'
      );
    }
  };

  /**
   * Start Web Speech API Real-time Voice Typing
   */
  const startBrowserVoiceRecording = async () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Automatic fallback to Gemini Voice if browser lacks SpeechRecognition
      setVoiceMode('gemini');
      await startGeminiVoiceRecording();
      return;
    }

    try {
      // Test mic permission cleanly, then immediately release tracks so hardware is free
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          testStream.getTracks().forEach((track) => track.stop());
        } catch (permErr: any) {
          setErrorMessage('माइक्रोफोन अनुमति अस्वीकार गरिएको छ। कृपया एड्रेस बारमा गएर माइक अनुमति दिनुहोस् (Microphone blocked).');
          return;
        }
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLang;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechStatusText(
          speechLang === 'ne-NP'
            ? 'सुन्दैछ (Browser Live)... नेपालीमा बोल्नुहोस्'
            : 'Listening (Browser Live)... Speak in English'
        );
        startTimer();
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const spoken = (finalTranscript + interimTranscript).trim();
        if (spoken) {
          const base = baseTextRef.current.trim();
          onTranscript(base ? `${base} ${spoken}` : spoken);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('[SpeechRecognition] error:', e.error);
        const errCode = e.error;

        if (errCode === 'not-allowed') {
          setErrorMessage(
            'माइक्रोफोन अनुमति अस्वीकार गरियो। कृपया ब्राउजर सेटिङमा माइक अनुमति दिनुहोस् (Microphone permission blocked).'
          );
        } else if (errCode === 'network') {
          setErrorMessage(
            'गुगल भ्वाइस नेटवर्क त्रुटि आयो। कृपया तलको "✨ Gemini AI Voice" मोड छान्नुहोस् (Google speech network error. Switch to Gemini Voice).'
          );
          // Auto switch to Gemini Voice option on network failure
          setVoiceMode('gemini');
        } else if (errCode === 'no-speech') {
          setErrorMessage('कुनै बोली सुनिएन। कृपया माइक नजिक गएर स्पष्ट बोल्नुहोस् (No speech detected).');
        } else if (errCode === 'language-not-supported') {
          setErrorMessage(
            'यस ब्राउजरमा छानिएको भाषा समर्थित छैन। अंग्रेजी वा Gemini AI छान्नुहोस् (Language not supported).'
          );
        } else if (errCode !== 'aborted') {
          setErrorMessage(`आवाज पहिचानमा समस्या आयो: ${errCode}`);
        }

        setIsListening(false);
        stopTimer();
      };

      recognition.onend = () => {
        setIsListening(false);
        stopTimer();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('[SpeechRecognition] start error:', err);
      setIsListening(false);
      stopTimer();
      setErrorMessage('आवाज प्रणाली सुरु गर्न सकिएन। कृपया Gemini AI Voice मोड प्रयोग गर्नुहोस्।');
    }
  };

  /**
   * Main toggle button action
   */
  const toggleVoiceRecording = async () => {
    clearError();

    if (isListening) {
      stopVoiceRecording();
      setSpeechStatusText('');
      return;
    }

    // Save prompt baseline before recording begins
    baseTextRef.current = currentPrompt;

    if (voiceMode === 'gemini') {
      await startGeminiVoiceRecording();
    } else {
      await startBrowserVoiceRecording();
    }
  };

  return {
    isListening,
    isTranscribing,
    speechLang,
    setSpeechLang,
    voiceMode,
    setVoiceMode,
    speechStatusText,
    errorMessage,
    clearError,
    elapsedSeconds,
    isBrowserSpeechSupported,
    toggleVoiceRecording,
    stopVoiceRecording,
    hasApiKey: !!getGeminiApiKey()
  };
}
