'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Paperclip, Mic, MicOff, StopCircle, RotateCcw, X, FileText, Copy, Check } from 'lucide-react';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import AnimatedBackground from '@/components/AnimatedBackground';
import { motion } from 'framer-motion';

// Available AI models for Chat Mode
const CHAT_MODELS = [
  { id: 'openai/gpt-oss-120b', name: 'GPT-5', provider: 'OpenAI', color: 'orange' },
  { id: 'provider-3/llama-4-scout', name: 'Llama-4 Scout', provider: 'Meta', color: 'red' },
  { id: 'deepseek/deepseek-chat-v3.1:free', name: 'DeepSeek v3.1', provider: 'DeepSeek', color: 'amber' },
  { id: 'gemini-2.5-flash-lite', name: 'Google Gemini 2.5 Pro', provider: 'Google', color: 'blue' },
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AttachedFile {
  file: File;
  preview?: string;
  type: 'image' | 'document';
}

export default function ChatModePage() {
  const { user, isLoaded } = useUser();
  const [selectedModel, setSelectedModel] = useState(CHAT_MODELS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');
  const isRecordingRef = useRef(false);
  const modelSelectorRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  // Close model selector on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(event.target as Node)) {
        setShowModelSelector(false);
      }
    };

    if (showModelSelector) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModelSelector]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          // Speech recognition started
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
          
          if (finalTranscript) {
            finalTranscriptRef.current += finalTranscript;
          }
          
          setInput(finalTranscriptRef.current + interimTranscript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            alert('Microphone access denied. Please allow microphone access.');
          }
          setIsRecording(false);
          isRecordingRef.current = false;
        };

        recognitionRef.current.onend = () => {
          if (isRecordingRef.current) {
            try {
              setTimeout(() => recognitionRef.current?.start(), 100);
            } catch {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsStreaming(true);
    setStreamingMessage('');

    // Process attachments
    const processedAttachments: Array<{type: string; data: string; filename: string}> = [];
    
    if (attachedFiles.length > 0) {
      for (const attachment of attachedFiles) {
        if (attachment.type === 'image' && attachment.preview) {
          processedAttachments.push({
            type: 'image',
            data: attachment.preview,
            filename: attachment.file.name
          });
        } else if (attachment.type === 'document') {
          const reader = new FileReader();
          const content = await new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsText(attachment.file);
          });
          processedAttachments.push({
            type: 'document',
            data: content,
            filename: attachment.file.name
          });
        }
      }
    }
    setAttachedFiles([]);

    // Create abort controller for stopping generation
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentInput,
          modelId: selectedModel.id,
          conversationHistory: messages.slice(-6), // Last 6 messages for context
          attachments: processedAttachments.length > 0 ? processedAttachments : undefined,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullMessage = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullMessage += parsed.content;
                  setStreamingMessage(fullMessage);
                }
              } catch (e) {
                console.error('Parse error:', e);
              }
            }
          }
        }
      }

      // Add complete message
      const assistantMessage: Message = {
        role: 'assistant',
        content: fullMessage,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setStreamingMessage('');

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Stream stopped by user');
      } else {
        console.error('Chat error:', error);
        // Show error message
        const errorMessage: Message = {
          role: 'assistant',
          content: `Error: ${error.message || 'Failed to get response. Please try again.'}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
      setStreamingMessage('');
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      
      // Save partial message if exists
      if (streamingMessage) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: streamingMessage + ' [Stopped by user]',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        setStreamingMessage('');
      }
    }
  };

  const handleClearChat = () => {
    if (confirm('Clear all messages? This cannot be undone.')) {
      setMessages([]);
      setStreamingMessage('');
      setAttachedFiles([]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (attachedFiles.length + files.length > 5) {
      alert('You can attach up to 5 files at a time');
      return;
    }

    const newAttachments: AttachedFile[] = [];

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      const fileType = file.type.startsWith('image/') ? 'image' : 'document';
      
      if (fileType === 'image') {
        const reader = new FileReader();
        const preview = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        newAttachments.push({ file, preview, type: 'image' });
      } else {
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
      finalTranscriptRef.current = input ? input + ' ' : '';
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

  const handleCopyMessage = async (content: string, index: number) => {
    console.log('handleCopyMessage called with index:', index);
    console.log('Content length:', content.length);
    
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        console.log('Using Clipboard API');
        await navigator.clipboard.writeText(content);
        console.log('Copy successful via Clipboard API');
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      } else {
        // Fallback for older browsers
        console.log('Using fallback method');
        const textArea = document.createElement('textarea');
        textArea.value = content;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          const successful = document.execCommand('copy');
          console.log('Fallback copy result:', successful);
          if (successful) {
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
          } else {
            alert('Failed to copy. Please try selecting and copying manually.');
          }
        } catch (err) {
          console.error('Fallback copy failed:', err);
          alert('Failed to copy. Please try selecting and copying manually.');
        }
        textArea.remove();
      }
    } catch (error) {
      console.error('Failed to copy:', error);
      alert('Failed to copy to clipboard. Please try again.');
    }
  };

  const getModelColor = (color: string) => {
    const colors = {
      orange: 'bg-accent',
      red: 'bg-red-500',
      amber: 'bg-amber-500',
      blue: 'bg-blue-500',
    };
    return colors[color as keyof typeof colors] || colors.orange;
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col">
        <AnimatedBackground />
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <AnimatedBackground />
      <Navbar />

      <main className="flex-1 flex flex-col items-center pt-20 pb-32">
        {/* Floating Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 sm:gap-3 px-4 sm:px-0"
        >
          {/* Model Selector Pill */}
          <div ref={modelSelectorRef} className="relative">
            <button
              onClick={() => setShowModelSelector(!showModelSelector)}
              className="flex items-center gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full hover:bg-white/10 transition-all shadow-lg"
            >
              <div className={`w-2 h-2 rounded-full ${getModelColor(selectedModel.color)}`} />
              <span className="text-xs sm:text-sm font-medium text-white truncate max-w-[120px] sm:max-w-none">{selectedModel.name}</span>
              <span className="text-white/50 text-xs">▼</span>
            </button>

            {showModelSelector && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="fixed sm:absolute top-[120px] sm:top-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 w-[85vw] max-w-[210px] sm:w-auto sm:min-w-[240px] sm:max-w-none bg-black/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
              >
                {CHAT_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model);
                      setShowModelSelector(false);
                    }}
                    className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-white/5 transition-colors ${
                      model.id === selectedModel.id ? 'bg-white/10' : ''
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getModelColor(model.color)}`} />
                    <div className="text-left min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-medium text-white truncate">{model.name}</div>
                      <div className="text-[10px] sm:text-xs text-white/40">{model.provider}</div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Clear Button */}
          {messages.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleClearChat}
              className="p-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full hover:bg-red-500/20 hover:border-red-500/30 transition-all shadow-lg group"
              title="Clear chat"
            >
              <RotateCcw size={16} className="text-white/70 group-hover:text-red-500 transition-colors" />
            </motion.button>
          )}
        </motion.div>

        {/* Messages Container */}
        <div className="w-full max-w-3xl px-4 sm:px-6 mt-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {messages.length === 0 && !streamingMessage && (
              <div className="text-center py-20">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-6xl mb-6"
                >
                  💬
                </motion.div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Start chatting</h2>
                <p className="text-sm sm:text-base text-white/50 mb-6 sm:mb-8">
                  with {selectedModel.name}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-xl mx-auto">
                  {[
                    'Explain quantum computing',
                    'Debug Python code',
                    'Write a creative story',
                    'Compare frameworks',
                  ].map((suggestion, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => setInput(suggestion)}
                      className="p-2.5 sm:p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-left text-xs sm:text-sm text-white/80"
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Message List */}
            {messages.map((message, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                style={{ pointerEvents: 'auto' }}
              >
                {message.role === 'assistant' && (
                  <div className={`w-8 h-8 rounded-full ${getModelColor(selectedModel.color)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-lg`}>
                    AI
                  </div>
                )}
                
                <div
                  className={`max-w-[75%] ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-accent/90 to-accent/70 text-white'
                      : 'bg-white/5 backdrop-blur-xl border border-white/10 text-white'
                  } rounded-2xl px-5 py-3 shadow-lg`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed text-sm select-text">{message.content}</p>
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <div className="text-xs text-white/30">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {message.role === 'assistant' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('Copy button clicked for message:', idx);
                          handleCopyMessage(message.content, idx);
                        }}
                        className="relative z-10 p-2 hover:bg-white/20 rounded-lg transition-colors group flex-shrink-0 cursor-pointer"
                        title="Copy message"
                      >
                        {copiedIndex === idx ? (
                          <Check size={16} className="text-green-500" />
                        ) : (
                          <Copy size={16} className="text-white/70 group-hover:text-white" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-lg">
                    {user?.firstName?.[0] || 'U'}
                  </div>
                )}
              </motion.div>
            ))}

            {/* Thinking Animation - Shows when AI is processing but hasn't started streaming */}
            {isStreaming && !streamingMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 justify-start"
              >
                <div className={`w-8 h-8 rounded-full ${getModelColor(selectedModel.color)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-lg`}>
                  AI
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-xs text-white/50">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Streaming Message */}
            {streamingMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 justify-start"
              >
                <div className={`w-8 h-8 rounded-full ${getModelColor(selectedModel.color)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-lg`}>
                  AI
                </div>
                <div className="max-w-[75%] bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-3 shadow-lg">
                  <p className="whitespace-pre-wrap leading-relaxed text-sm text-white select-text">
                    {streamingMessage}
                    <span className="inline-block w-1.5 h-4 bg-accent ml-1 animate-pulse rounded-sm" />
                  </p>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Copy button clicked for streaming message');
                        handleCopyMessage(streamingMessage, -1);
                      }}
                      className="relative z-10 p-2 hover:bg-white/20 rounded-lg transition-colors group flex-shrink-0 cursor-pointer"
                      title="Copy message"
                    >
                      {copiedIndex === -1 ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} className="text-white/70 group-hover:text-white" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </motion.div>
        </div>

        {/* Fixed Bottom Input */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent backdrop-blur-xl border-t border-white/5 z-10">
          <div className="max-w-3xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
            <form onSubmit={handleSubmit}>
              {/* Attached Files Preview */}
              {attachedFiles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {attachedFiles.map((attachment, index) => (
                    <div key={index} className="relative group">
                      {attachment.type === 'image' && attachment.preview ? (
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-white/20">
                          <Image
                            src={attachment.preview}
                            alt={attachment.file.name}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <div className="relative flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                          <FileText size={14} className="text-accent" />
                          <span className="text-xs text-white max-w-[80px] truncate">
                            {attachment.file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-400 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Action Buttons Left */}
                <div className="flex gap-0.5 sm:gap-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 sm:p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all"
                    disabled={isStreaming}
                    title="Attach files"
                  >
                    <Paperclip size={16} className="text-white/70 sm:w-[18px] sm:h-[18px]" />
                  </button>
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`p-2 sm:p-2.5 border rounded-lg transition-all ${
                      isRecording
                        ? 'bg-green-500/20 border-green-500/30 text-green-500'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-white/70'
                    }`}
                    disabled={isStreaming}
                    title={isRecording ? 'Stop recording' : 'Voice input'}
                  >
                    {isRecording ? <MicOff size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Mic size={16} className="sm:w-[18px] sm:h-[18px]" />}
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  multiple
                  accept="image/*,.pdf,.txt,.doc,.docx"
                  className="hidden"
                />

                {/* Input Field */}
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder={`Message ${selectedModel.name}...`}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 focus:outline-none focus:bg-white/10 focus:border-white/20 text-white text-xs sm:text-sm placeholder-white/40 transition-all"
                  disabled={isStreaming}
                />

                {/* Send Button */}
                {isStreaming ? (
                  <button
                    type="button"
                    onClick={handleStop}
                    className="p-2 sm:p-2.5 bg-red-500 hover:bg-red-600 border border-red-600 rounded-lg transition-colors"
                  >
                    <StopCircle size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="p-2 sm:p-2.5 bg-gradient-to-r from-accent to-orange-500 hover:shadow-lg hover:shadow-accent/20 disabled:from-white/5 disabled:to-white/5 disabled:cursor-not-allowed border border-transparent rounded-lg transition-all"
                  >
                    <Send size={16} className="text-white sm:w-[18px] sm:h-[18px]" />
                  </button>
                )}
              </div>
            </form>

            <p className="text-[10px] sm:text-xs text-white/30 text-center mt-1.5 sm:mt-2">
              Press <kbd className="px-1 sm:px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-white/50 text-[9px] sm:text-[10px]">Enter</kbd> to send
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
