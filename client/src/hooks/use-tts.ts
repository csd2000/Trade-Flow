import { useState, useRef, useCallback } from 'react';

interface TTSState {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useTTS() {
  const [state, setState] = useState<TTSState>({
    isPlaying: false,
    isLoading: false,
    error: null,
  });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (utteranceRef.current) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState({ isPlaying: false, isLoading: false, error: null });
  }, []);

  const speakWithBrowserTTS = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      setState({ isPlaying: false, isLoading: false, error: 'Speech not supported in this browser' });
      return;
    }
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => 
      v.name.toLowerCase().includes('female') || 
      v.name.toLowerCase().includes('samantha') ||
      v.name.toLowerCase().includes('victoria') ||
      v.name.toLowerCase().includes('karen')
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    
    if (femaleVoice) utterance.voice = femaleVoice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    utterance.onstart = () => setState({ isPlaying: true, isLoading: false, error: null });
    utterance.onend = () => {
      utteranceRef.current = null;
      setState({ isPlaying: false, isLoading: false, error: null });
    };
    utterance.onerror = () => {
      utteranceRef.current = null;
      setState({ isPlaying: false, isLoading: false, error: 'Browser speech failed' });
    };
    
    window.speechSynthesis.speak(utterance);
  }, []);

  const speak = useCallback(async (text: string) => {
    if (state.isPlaying) {
      stop();
      return;
    }

    if (!text || text.trim().length === 0) {
      setState(prev => ({ ...prev, error: 'No text to read' }));
      return;
    }

    const cleanedText = text
      .replace(/<[^>]*>/g, '')
      .replace(/\*\*/g, '')
      .replace(/##/g, '')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanedText.length > 5000) {
      setState(prev => ({ ...prev, error: 'Text too long for reading' }));
      return;
    }

    setState({ isPlaying: false, isLoading: true, error: null });
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/tts/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: cleanedText }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        console.log('ElevenLabs unavailable, falling back to browser TTS');
        speakWithBrowserTTS(cleanedText);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setState({ isPlaying: true, isLoading: false, error: null });
      };

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        setState({ isPlaying: false, isLoading: false, error: null });
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        audioRef.current = null;
        setState({ isPlaying: false, isLoading: false, error: 'Audio playback failed' });
      };

      await audio.play();
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }
      console.log('ElevenLabs error, falling back to browser TTS:', error.message);
      speakWithBrowserTTS(cleanedText);
    }
  }, [state.isPlaying, stop, speakWithBrowserTTS]);

  const getSelectedText = useCallback((): string => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      return selection.toString().trim();
    }
    return '';
  }, []);

  const speakSelected = useCallback(() => {
    const selectedText = getSelectedText();
    if (selectedText) {
      speak(selectedText);
    } else {
      setState(prev => ({ ...prev, error: 'Please highlight some text first' }));
    }
  }, [getSelectedText, speak]);

  return {
    speak,
    speakSelected,
    stop,
    getSelectedText,
    isPlaying: state.isPlaying,
    isLoading: state.isLoading,
    error: state.error,
  };
}
