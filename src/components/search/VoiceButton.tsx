"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Mic, MicOff } from "lucide-react";

type Recognition = {
  lang: string;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  abort: () => void;
};

const engine = () => {
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};
const never = () => () => {};

const ERRORS: Record<string, string> = {
  "not-allowed": "মাইক্রোফোনের অনুমতি দেওয়া হয়নি।",
  "no-speech": "কিছু শোনা যায়নি। আবার চেষ্টা করুন।",
  network: "ভয়েস সার্চে ইন্টারনেট লাগে।",
};

/** Speak instead of typing. Hidden where the browser has no speech recognition. */
export function VoiceButton({ onText }: { onText: (text: string) => void }) {
  const supported = useSyncExternalStore(never, () => Boolean(engine()), () => false);
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState("");
  const current = useRef<Recognition | null>(null);
  useEffect(() => () => current.current?.abort(), []);
  if (!supported) return null;

  const press = () => {
    if (listening) return current.current?.abort();
    const Engine = engine()!;
    const recognition = new Engine();
    recognition.lang = "bn-BD";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const heard = event.results[0]?.[0]?.transcript.trim();
      if (heard) onText(heard);
    };
    recognition.onerror = (event) => setMessage(event.error === "aborted" ? "" : (ERRORS[event.error] ?? "ভয়েস সার্চ চালানো যায়নি।"));
    recognition.onend = () => setListening(false);
    current.current = recognition;
    try {
      recognition.start();
      setListening(true);
      setMessage("বলুন… (ব্রাউজার আপনার কথা চেনার জন্য তাদের সার্ভারে পাঠাতে পারে)");
    } catch {
      setMessage("ভয়েস সার্চ চালানো যায়নি।");
    }
  };

  return (
    <div className="contents">
      <button type="button" onClick={press} aria-pressed={listening} aria-label={listening ? "শোনা বন্ধ করুন" : "ভয়েস সার্চ"} className={`grid size-13 shrink-0 place-items-center rounded-full border text-accent ${listening ? "border-gold bg-active" : "border-line-strong bg-surface"}`}>
        {listening ? <MicOff aria-hidden className="size-5" /> : <Mic aria-hidden className="size-5" />}
      </button>
      <p role="status" className="order-last w-full text-sm text-muted empty:hidden">{message}</p>
    </div>
  );
}
