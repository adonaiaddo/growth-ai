"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { MessageBubble } from "./message-bubble";
import { MetaConnectButton } from "./meta-connect-button";
import { MicButton } from "./mic-button";
import { SuggestedReplies } from "./suggested-replies";
import { parseSuggestions } from "@/lib/parse-suggestions";

const ACCEPTED_TYPES =
  "image/jpeg,image/png,image/gif,image/webp,application/pdf,text/csv,text/plain,video/*";

type VoiceState = "idle" | "recording" | "transcribing";

export function Chat() {
  const { messages, sendMessage, stop, status, error } = useChat();
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLoading = status === "streaming" || status === "submitted";

  // Extract suggested replies from the last AI message (only when idle)
  const suggestions = (() => {
    if (isLoading || messages.length === 0) return [];
    const last = messages[messages.length - 1];
    if (last.role !== "assistant") return [];
    // Collect suggestions from all text parts
    const all: string[] = [];
    for (const part of last.parts) {
      if (part.type === "text" && part.text) {
        all.push(...parseSuggestions(part.text).suggestions);
      }
    }
    return all;
  })();

  // Auto-scroll to bottom on new messages or voice state changes
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, voiceState]);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles);
    setFiles((prev) => [...prev, ...arr]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && files.length === 0) || isLoading) return;

    // Build a FileList-like DataTransfer to pass native FileList
    const dt = new DataTransfer();
    files.forEach((f) => dt.items.add(f));

    sendMessage({
      text: input || " ", // SDK requires text when using the text+files overload
      files: dt.files,
    });
    setInput("");
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  return (
    <div
      className="flex h-full flex-col"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-violet-500/10 backdrop-blur-sm border-2 border-dashed border-violet-500/40 rounded-lg">
          <p className="text-gradient text-lg font-medium">
            Drop files here
          </p>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 via-violet-500/20 to-cyan-500/20 border border-white/10">
              <svg className="h-7 w-7 text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Welcome to Growth AI
            </h2>
            <p className="text-foreground-muted max-w-md">
              I can help you create Meta ad campaigns with AI-generated copy,
              images, and targeting. Try saying:
            </p>
            <div className="space-y-2 text-sm">
              <p className="glass rounded-lg px-4 py-2 text-foreground hover:bg-white/5 transition-all duration-200 cursor-pointer">
                &ldquo;Create an ad for my online shoe store&rdquo;
              </p>
              <p className="glass rounded-lg px-4 py-2 text-foreground hover:bg-white/5 transition-all duration-200 cursor-pointer">
                &ldquo;Generate an ad image for a coffee shop&rdquo;
              </p>
              <p className="glass rounded-lg px-4 py-2 text-foreground hover:bg-white/5 transition-all duration-200 cursor-pointer">
                &ldquo;Suggest targeting for a fitness app&rdquo;
              </p>
            </div>
            <MetaConnectButton />
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
          />
        ))}

        {voiceState !== "idle" && (
          <div className="flex items-center gap-3 glass rounded-lg px-4 py-3">
            {voiceState === "recording" ? (
              <>
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                </span>
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
                <span className="text-sm text-red-400 font-medium">Listening...</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5 animate-spin text-violet-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-sm text-violet-400 font-medium">Transcribing your voice...</span>
              </>
            )}
          </div>
        )}

        {/* Show "Thinking..." while waiting for first visible text */}
        {isLoading && (() => {
          const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");
          const hasVisibleText = lastAssistant?.parts.some(
            p => p.type === "text" && p.text?.trim()
          );
          if (hasVisibleText) return null;
          return (
            <div className="flex items-center gap-2 text-foreground-muted">
              <div className="flex gap-1">
                <span className="animate-shimmer-pulse h-2 w-2 rounded-full bg-violet-400" />
                <span
                  className="animate-shimmer-pulse h-2 w-2 rounded-full bg-violet-400"
                  style={{ animationDelay: "0.15s" }}
                />
                <span
                  className="animate-shimmer-pulse h-2 w-2 rounded-full bg-violet-400"
                  style={{ animationDelay: "0.3s" }}
                />
              </div>
              <span className="text-sm">Thinking...</span>
            </div>
          );
        })()}

        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 backdrop-blur-sm p-3 text-sm text-red-400">
            Error: {error.message}
          </div>
        )}
      </div>

      {/* Suggested reply buttons */}
      {suggestions.length > 0 && (
        <SuggestedReplies
          suggestions={suggestions}
          onSelect={(text) => sendMessage({ text })}
        />
      )}

      {/* File previews */}
      {files.length > 0 && (
        <div className="border-t border-white/5 px-4 pt-3 pb-1">
          <div className="flex flex-wrap gap-2">
            {files.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="relative group flex items-center gap-2 glass rounded-lg px-3 py-2 text-xs"
              >
                {file.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="h-8 w-8 rounded object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded bg-white/5 text-foreground-muted text-[10px] font-medium uppercase">
                    {file.name.split(".").pop()}
                  </span>
                )}
                <span className="max-w-[120px] truncate text-foreground-muted">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="ml-1 text-foreground-muted hover:text-red-400 transition-colors"
                  aria-label={`Remove ${file.name}`}
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-white/5 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_TYPES}
            onChange={handleFileInput}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="glass rounded-lg px-3 py-3 text-foreground-muted hover:text-foreground hover:bg-white/5 focus-glow transition-all duration-200"
            title="Attach files"
          >
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
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>
          <MicButton
            onTranscript={(text) => sendMessage({ text })}
            onStateChange={setVoiceState}
            disabled={isLoading}
          />
          <div className="gradient-border flex-1">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                files.length > 0
                  ? "Add a message about your files..."
                  : "Describe the ad you want to create..."
              }
              className="w-full rounded-[0.7rem] bg-background px-4 py-3 text-sm text-foreground placeholder:text-foreground-muted focus:outline-none"
              disabled={isLoading}
            />
          </div>
          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              className="rounded-lg bg-red-500/80 backdrop-blur-sm px-6 py-3 text-sm font-medium text-white hover:bg-red-500 transition-all duration-200"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim() && files.length === 0}
              className="btn-gradient rounded-lg px-6 py-3 text-sm font-medium text-white"
            >
              Send
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
