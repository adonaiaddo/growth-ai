"use client";

import { useState, useRef, useCallback } from "react";

type VoiceState = "idle" | "recording" | "transcribing";

type MicButtonProps = {
  onTranscript: (text: string) => void;
  onStateChange?: (state: VoiceState) => void;
  disabled?: boolean;
};

export function MicButton({ onTranscript, onStateChange, disabled }: MicButtonProps) {
  const [state, _setState] = useState<VoiceState>("idle");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const setState = useCallback((s: VoiceState) => {
    _setState(s);
    onStateChange?.(s);
  }, [onStateChange]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());

        const blob = new Blob(chunksRef.current, {
          type: mediaRecorder.mimeType,
        });
        chunksRef.current = [];

        if (blob.size === 0) {
          setState("idle");
          return;
        }

        setState("transcribing");
        try {
          const form = new FormData();
          form.append("file", blob, "audio.webm");
          const res = await fetch("/api/transcribe", {
            method: "POST",
            body: form,
          });
          const data = await res.json();
          if (data.text) onTranscript(data.text);
        } catch (err) {
          console.warn("Transcription failed:", err);
        } finally {
          setState("idle");
        }
      };

      mediaRecorder.start();
      setState("recording");
    } catch {
      console.warn("Microphone access denied or unavailable");
    }
  }, [onTranscript, setState]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
  }, []);

  const toggle = () => {
    if (state === "recording") {
      stopRecording();
    } else if (state === "idle") {
      startRecording();
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled || state === "transcribing"}
      title={
        state === "recording"
          ? "Stop recording"
          : state === "transcribing"
            ? "Transcribing..."
            : "Voice input"
      }
      className={`glass rounded-lg px-3 py-3 transition-all duration-200 focus-glow ${
        state === "recording"
          ? "text-red-400 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.4)]"
          : state === "transcribing"
            ? "text-violet-400 cursor-wait"
            : "text-foreground-muted hover:text-foreground hover:bg-white/5"
      }`}
    >
      {state === "transcribing" ? (
        <svg
          className="h-5 w-5 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
          />
        </svg>
      )}
    </button>
  );
}
