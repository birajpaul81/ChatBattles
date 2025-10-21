"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Sparkles, Paperclip, X, FileText } from "lucide-react";
import Image from "next/image";

export interface AttachedFile {
  file: File;
  preview?: string;
  type: 'image' | 'document';
}

interface ChatInputProps {
  onSubmit: (prompt: string, attachments?: AttachedFile[]) => void;
  isLoading: boolean;
  showClearButton?: boolean;
  onClear?: () => void;
}

const SUGGESTED_PROMPTS = [
  "Explain quantum computing in simple terms",
  "Write a creative short story about AI",
  "Help me debug this Python code",
  "What are the best practices for React?",
  "Explain the theory of relativity",
  "Write a haiku about technology",
];

const MAX_CHARACTERS = 4000;

export default function ChatInput({ onSubmit, isLoading, showClearButton, onClear }: ChatInputProps) {
  const [prompt, setPrompt] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>("");
  const isRecordingRef = useRef(false);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading && prompt.length <= MAX_CHARACTERS) {
      onSubmit(prompt.trim(), attachedFiles.length > 0 ? attachedFiles : undefined);
      setPrompt("");
      setAttachedFiles([]);
      finalTranscriptRef.current = "";
      setShowSuggestions(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 5 files
    if (attachedFiles.length + files.length > 5) {
      alert('You can attach up to 5 files at a time');
      return;
    }

    const newAttachments: AttachedFile[] = [];

    for (const file of files) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      const fileType = file.type.startsWith('image/') ? 'image' : 'document';
      
      if (fileType === 'image') {
        // Create preview for images
        const reader = new FileReader();
        const preview = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        newAttachments.push({ file, preview, type: 'image' });
      } else {
        // For documents, just store the file
        newAttachments.push({ file, type: 'document' });
      }
    }

    setAttachedFiles([...attachedFiles, ...newAttachments]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  const isOverLimit = prompt.length > MAX_CHARACTERS;
  const charCountColor = isOverLimit
    ? "text-red-500"
    : prompt.length > MAX_CHARACTERS * 0.9
    ? "text-amber-500"
    : "text-softGray/60";

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        recognitionRef.current.maxAlternatives = 1;
        
        // Request microphone access on initialization
        navigator.mediaDevices?.getUserMedia({ audio: true })
          .then(() => console.log('Microphone access granted'))
          .catch(err => console.error('Microphone access denied:', err));

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          console.log('Speech recognition started');
        };

        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
          
          // Update finalized transcript accumulator
          if (finalTranscript) {
            finalTranscriptRef.current += finalTranscript;
          }
          
          // Update prompt with accumulated final + current interim
          setPrompt(finalTranscriptRef.current + interimTranscript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          
          // Handle different error types
          if (event.error === 'no-speech') {
            console.log('No speech detected, continuing to listen...');
            // Don't stop recording, just continue listening
          } else if (event.error === 'audio-capture') {
            alert('No microphone detected. Please check your microphone connection.');
            setIsRecording(false);
          } else if (event.error === 'not-allowed') {
            alert('Microphone access denied. Please allow microphone access in your browser settings.');
            setIsRecording(false);
          } else if (event.error === 'network') {
            console.log('Network error, attempting to restart...');
            // Network errors can be temporary, try to restart
            if (isRecordingRef.current) {
              setTimeout(() => {
                try {
                  recognitionRef.current?.start();
                } catch (e) {
                  console.error('Failed to restart recognition:', e);
                }
              }, 100);
            }
          } else {
            setIsRecording(false);
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          // Auto-restart if still in recording mode and it ended unexpectedly
          if (isRecordingRef.current) {
            try {
              console.log('Restarting speech recognition...');
              setTimeout(() => recognitionRef.current?.start(), 100);
            } catch (e) {
              console.error('Failed to restart recognition:', e);
              setIsRecording(false);
              isRecordingRef.current = false;
            }
          }
        };
      }
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      isRecordingRef.current = false;
    } else {
      // Initialize with any existing prompt text
      finalTranscriptRef.current = prompt ? prompt + ' ' : '';
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        isRecordingRef.current = true;
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        alert('Failed to start voice input. Please try again.');
      }
    }
  };

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Suggested Prompts */}
      {!prompt && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="text-sm text-softGray hover:text-accent transition-colors flex items-center gap-2 mb-2"
          >
            <Sparkles size={16} />
            {showSuggestions ? "Hide" : "Show"} suggested prompts
          </button>
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2"
              >
                {SUGGESTED_PROMPTS.map((suggestion, i) => (
                  <motion.button
                    key={i}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-4 py-2 bg-black/50 backdrop-blur-sm border border-accent/30 rounded-lg text-sm text-softGray hover:text-white hover:border-accent transition-all duration-200"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <form onSubmit={handleSubmit}>
      <div
        className={`relative bg-black/50 backdrop-blur-sm rounded-2xl border-2 transition-all duration-300 ${
          isFocused
            ? "border-accent glow-orange-strong"
            : "border-accent/30"
        }`}
      >
        {/* Attached Files Preview - Inside Chat Box */}
        {attachedFiles.length > 0 && (
          <div className="px-4 pt-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {attachedFiles.map((attachment, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group"
                >
                  {attachment.type === 'image' && attachment.preview ? (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-accent/50">
                      <Image
                        src={attachment.preview}
                        alt={attachment.file.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="relative flex items-center gap-2 px-3 py-2 bg-accent/10 border border-accent/30 rounded-lg">
                      <FileText size={16} className="text-accent" />
                      <span className="text-xs text-white max-w-[100px] truncate">
                        {attachment.file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-400 transition-colors ml-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Enter your prompt to battle the AIs..."
          className={`w-full bg-transparent text-white placeholder-softGray/50 px-6 py-4 resize-none focus:outline-none min-h-[60px] max-h-[200px] ${
            showClearButton ? 'pr-56' : 'pr-32'
          }`}
          rows={1}
          disabled={isLoading}
          maxLength={MAX_CHARACTERS}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          aria-label="Chat input"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            multiple
            accept="image/*,.pdf,.txt,.doc,.docx"
            className="hidden"
            aria-label="File upload"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg border bg-accent/10 hover:bg-accent/20 border-accent/30 text-accent transition-all duration-200"
            title="Attach files or images"
            disabled={isLoading}
          >
            <Paperclip size={18} />
          </button>
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-2 rounded-lg border transition-all duration-200 relative ${
              isRecording
                ? isListening
                  ? 'bg-green-500/20 border-green-500 text-green-500 animate-pulse'
                  : 'bg-red-500/20 border-red-500 text-red-500 animate-pulse'
                : 'bg-accent/10 hover:bg-accent/20 border-accent/30 text-accent'
            }`}
            title={
              isRecording 
                ? isListening 
                  ? 'Listening... Click to stop' 
                  : 'Ready to listen... Click to stop'
                : 'Click to start voice input'
            }
            disabled={isLoading}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            {isRecording && isListening && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
            )}
          </button>
          {showClearButton && (
            <button
              type="button"
              onClick={onClear}
              className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 font-semibold transition-all duration-200"
              title="Clear conversation history"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading || isOverLimit}
            className={`px-6 py-2 rounded-xl font-semibold transition-all duration-200 ${
              prompt.trim() && !isLoading && !isOverLimit
                ? "gradient-orange text-white glow-orange hover:scale-105"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
            aria-label="Submit prompt"
          >
            {isLoading ? "..." : "Battle"}
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex flex-col gap-1">
          <p className="text-xs text-softGray/60">
            Press Enter to send • Shift+Enter for new line
          </p>
          {isRecording && (
            <p className={`text-xs font-medium ${isListening ? 'text-green-500' : 'text-amber-500'}`}>
              {isListening ? '🎤 Listening... Speak now!' : '⏸️ Ready to capture your voice...'}
            </p>
          )}
        </div>
        <p className={`text-xs font-mono ${charCountColor}`}>
          {prompt.length} / {MAX_CHARACTERS}
        </p>
      </div>
      </form>
    </motion.div>
  );
}

