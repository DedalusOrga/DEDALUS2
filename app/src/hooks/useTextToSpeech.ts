// src/hooks/useTextToSpeech.ts
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

type Options = {
  lang?: string;
  rate?: number;
  pitch?: number;
};

export function useTextToSpeech(text: string, options: Options = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const location = useLocation();

  const { lang = "de-DE", rate = 1.0, pitch = 1.0 } = options;

  const toggleSpeak = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Dein Browser unterstützt Vorlesen leider nicht.");
      return;
    }

    const synth = window.speechSynthesis;

    // Wenn gerade gesprochen wird → stoppen
    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!text || text.trim().length === 0) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synth.cancel(); // alte Wiedergabe abbrechen
    synth.speak(utterance);
    setIsSpeaking(true);
  };

  const stop = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Route-Wechsel → immer stoppen
  useEffect(() => {
    stop();
  }, [location.pathname]);

  // Unmount → stoppen (Fallback)
  useEffect(() => {
    return () => {
      stop();
    };
  }, []);

  return {
    isSpeaking,
    toggleSpeak,
    stop,
  };
}
