import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Monitor,
  MonitorOff,
  Send,
  Loader2,
  Trash2,
  AlertCircle,
  Sparkles,
  MessageCircle,
  Mic,
  MicOff,
  Globe,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";

type MediaTrackConstraints = {
  cursor?: "always" | "motion" | "never";
};

type DisplayMediaStreamOptions = {
  video?: boolean | MediaTrackConstraints;
  audio?: boolean;
  systemAudio?: "include" | "exclude";
  surfaceSwitching?: "include" | "exclude";
  preferCurrentTab?: boolean;
  selfBrowserSurface?: "exclude" | "include";
};

// Speech Recognition types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// Supported languages for voice input
const VOICE_LANGUAGES: Record<string, string> = {
  "en-US": "English (US)",
  "en-GB": "English (UK)",
  "es-ES": "Spanish",
  "fr-FR": "French",
  "de-DE": "German",
  "it-IT": "Italian",
  "pt-BR": "Portuguese",
  "ru-RU": "Russian",
  "ja-JP": "Japanese",
  "ko-KR": "Korean",
  "zh-CN": "Chinese",
  "ar-SA": "Arabic",
  "hi-IN": "Hindi",
  "nl-NL": "Dutch",
  "pl-PL": "Polish",
  "tr-TR": "Turkish",
};

export default function Chat() {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // Voice input states
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState("en-US");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  // tRPC mutations and queries
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const getHistoryQuery = trpc.chat.getHistory.useQuery({ sessionId });

  // Load chat history when component mounts
  useEffect(() => {
    if (getHistoryQuery.data?.messages) {
      setMessages(getHistoryQuery.data.messages);
    }
  }, [getHistoryQuery.data?.messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update video preview when screen stream changes
  useEffect(() => {
    if (videoPreviewRef.current && screenStream) {
      videoPreviewRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = voiceLanguage;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setInputText((prev) => prev + finalTranscript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error !== "no-speech") {
          setLastError("Voice recognition error. Please try again.");
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [voiceLanguage]);

  const toggleVoiceInput = () => {
    if (!speechSupported || !recognitionRef.current) {
      setLastError("Voice input is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setLastError(null);
      recognitionRef.current.lang = voiceLanguage;
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const startScreenShare = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        setLastError("Screen sharing is not supported in your browser.");
        return;
      }

      const displayMediaOptions: DisplayMediaStreamOptions = {
        video: {
          cursor: "always",
        },
        audio: false,
        preferCurrentTab: false,
        selfBrowserSurface: "exclude",
      };

      const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions as DisplayMediaStreamOptions & MediaStreamConstraints);

      setScreenStream(stream);
      setIsScreenSharing(true);

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          setIsScreenSharing(false);
          setScreenStream(null);
        };
      }
    } catch (error) {
      const err = error as Error;
      if (err.name === "NotAllowedError") {
        return;
      }
      setLastError("Failed to start screen sharing. Please grant permission.");
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
      setLastError(null);
    }
  };

  const captureScreen = async (): Promise<string | null> => {
    if (!screenStream) {
      return null;
    }

    try {
      const video = document.createElement("video");
      video.srcObject = screenStream;
      video.play();

      return new Promise((resolve) => {
        video.onloadedmetadata = () => {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0);
          }

          canvas.toBlob((blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64data = (reader.result as string).split(",")[1];
                resolve(base64data);
              };
              reader.readAsDataURL(blob);
            } else {
              resolve(null);
            }
          }, "image/jpeg", 0.8);
        };
      });
    } catch (error) {
      return null;
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) {
      return;
    }

    setIsLoading(true);
    setLastError(null);

    try {
      let imageData: string | undefined;

      // Auto-capture screen if screen sharing is active
      if (isScreenSharing) {
        imageData = await captureScreen() || undefined;
      }

      const response = await sendMessageMutation.mutateAsync({
        text: inputText.trim(),
        image: imageData,
        sessionId,
      });

      setMessages((prev) => [
        ...prev,
        { role: "user", content: inputText },
        { role: "assistant", content: response.response },
      ]);

      setInputText("");
    } catch (error) {
      setLastError("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const clearContext = () => {
    setMessages([]);
    setLastError(null);
  };

  // Chat Panel Component (reusable for both layouts)
  const ChatPanel = ({ compact = false }: { compact?: boolean }) => (
    <Card className={`shadow-xl border-0 bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden ${compact ? 'h-full flex flex-col' : ''}`}>
      <CardHeader className="border-b border-purple-100 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3">
        <CardTitle className="flex items-center gap-2 m-0 text-base">
          <MessageCircle className="w-4 h-4" />
          Chat
        </CardTitle>
      </CardHeader>
      <CardContent className={`p-0 ${compact ? 'flex-1 flex flex-col' : ''}`}>
        {/* Messages Area */}
        <div className={`overflow-y-auto p-3 space-y-3 bg-gradient-to-b from-white/50 to-purple-50/30 ${compact ? 'flex-1' : 'h-[350px]'}`}>
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageCircle className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs">No messages yet</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[90%] px-3 py-2 rounded-xl text-sm shadow-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-sm"
                    : "bg-white text-gray-800 border border-purple-100 rounded-bl-sm"
                }`}
              >
                <Streamdown>{msg.content}</Streamdown>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-purple-100 space-y-3">
          {lastError && (
            <div className="flex items-center gap-2 p-2 bg-red-50 text-red-600 rounded-lg border border-red-200">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs">{lastError}</span>
            </div>
          )}

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-purple-500" />
            <select
              value={voiceLanguage}
              onChange={(e) => setVoiceLanguage(e.target.value)}
              className="flex-1 text-xs p-2 border border-purple-200 rounded-lg bg-purple-50/50 focus:outline-none focus:ring-2 focus:ring-purple-300"
            >
              {Object.entries(VOICE_LANGUAGES).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </div>

          {/* Message Input */}
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if ((e as any).nativeEvent?.isComposing) {
                return;
              }
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type or speak your message..."
            className="w-full p-3 border border-purple-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent bg-purple-50/50 placeholder-gray-400 transition-all text-sm"
            rows={2}
          />

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !inputText.trim()}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl shadow-lg shadow-purple-500/25 text-sm"
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
              Send
            </Button>

            <Button
              onClick={toggleVoiceInput}
              disabled={!speechSupported}
              className={`rounded-xl transition-all ${
                isListening
                  ? "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg shadow-red-500/25 animate-pulse"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25"
              }`}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>

            <Button
              onClick={clearContext}
              variant="outline"
              className="border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-xl"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {isListening && (
            <div className="p-2 bg-gradient-to-r from-red-50 to-orange-50 text-red-600 rounded-lg border border-red-200 text-xs flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Listening in {VOICE_LANGUAGES[voiceLanguage]}...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Screen Sharing Layout (screen as main, chat as sidebar)
  if (isScreenSharing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-purple-700">Talk Screen AI</span>
            </div>
          </div>
          <Button
            onClick={stopScreenShare}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl shadow-lg"
          >
            <MonitorOff className="w-4 h-4 mr-2" />
            Stop Sharing
          </Button>
        </div>

        {/* Main Content - Screen + Chat Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-120px)]">
          {/* Screen Preview - Main Area */}
          <div className="lg:col-span-3">
            <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-2xl h-full bg-gray-900">
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
              />
              {/* Live indicator */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-white text-sm font-medium">LIVE</span>
              </div>
              {/* Screen info */}
              <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-white text-sm">Screen will be captured when you send a message</p>
              </div>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="lg:col-span-1 h-full">
            <ChatPanel compact />
          </div>
        </div>
      </div>
    );
  }

  // Default Layout (no screen sharing)
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-4">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-purple-700">AI-Powered Assistant</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
            Talk Screen AI
          </h1>
          <p className="text-gray-500 mt-2">Share your screen and chat with AI</p>
        </div>

        {/* Start Screen Share Button */}
        <div className="mb-6">
          <Button
            onClick={startScreenShare}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl shadow-lg shadow-purple-500/25 py-6 text-lg"
          >
            <Monitor className="w-5 h-5 mr-2" />
            Start Screen Share
          </Button>
        </div>

        {/* Chat Card */}
        <ChatPanel />

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-400">
          Powered by AI Support Team
        </div>
      </div>
    </div>
  );
}
