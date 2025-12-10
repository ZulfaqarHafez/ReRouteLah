import { useCallback, useRef, useState } from "react";

interface VoiceNavigationOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
}

export const useVoiceNavigation = (options: VoiceNavigationOptions = {}) => {
  const { rate = 0.9, pitch = 1, volume = 1 } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.lang = "en-US";

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [rate, pitch, volume]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const speakStep = useCallback((stepNumber: number, instruction: string) => {
    speak(`Step ${stepNumber}: ${instruction}`);
  }, [speak]);

  return {
    speak,
    speakStep,
    stop,
    isSpeaking,
  };
};
