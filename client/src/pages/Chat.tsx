import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Monitor,
  MonitorOff,
  Send,
  Loader2,
  Trash2,
  Languages,
  Volume2,
  VolumeX,
  AlertCircle,
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

const SUPPORTED_LANGUAGES: Record<string, string> = {
  en: "English",
  ja: "Japanese",
  es: "Spanish",
  zh: "Chinese",
  fr: "French",
  it: "Italian",
  ko: "Korean",
  ar: "Arabic",
  hi: "Hindi",
  ru: "Russian",
  id: "Indonesian",
  pt: "Portuguese",
};

const SPEECH_LANGUAGE_CODES: Record<string, string> = {
  en: "en-US",
  ja: "ja-JP",
  es: "es-ES",
  zh: "zh-CN",
  fr: "fr-FR",
  it: "it-IT",
  ko: "ko-KR",
  ar: "ar-SA",
  hi: "hi-IN",
  ru: "ru-RU",
  id: "id-ID",
  pt: "pt-BR",
};

export default function Chat() {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  // Translation states
  const [translationEnabled, setTranslationEnabled] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("ja");
  const [translations, setTranslations] = useState<Array<{ original: string; translated: string }>>([]);
  const [isTranslating, setIsTranslating] = useState(false);

  // Speech synthesis states
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const translationsEndRef = useRef<HTMLDivElement>(null);
  const speechSynthRef = useRef<SpeechSynthesis | null>(null);

  // tRPC mutations and queries
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const translateMutation = trpc.chat.translate.useMutation();
  const getHistoryQuery = trpc.chat.getHistory.useQuery({ sessionId });

  // Load chat history when component mounts
  useEffect(() => {
    if (getHistoryQuery.data?.messages) {
      setMessages(getHistoryQuery.data.messages);
    }
  }, [getHistoryQuery.data?.messages]);

  // Initialize speech synthesis
  useEffect(() => {
    if ("speechSynthesis" in window) {
      setSpeechSupported(true);
      speechSynthRef.current = window.speechSynthesis;

      const loadVoices = () => {
        const voices = speechSynthRef.current?.getVoices() || [];
        setAvailableVoices(voices);
      };

      loadVoices();
      speechSynthRef.current.onvoiceschanged = loadVoices;

      return () => {
        if (speechSynthRef.current) {
          speechSynthRef.current.cancel();
        }
      };
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Update messages when new message is sent
  useEffect(() => {
    if (sendMessageMutation.data?.response) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: sendMessageMutation.data.response },
      ]);
    }
  }, [sendMessageMutation.data?.response]);

  useEffect(() => {
    translationsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [translations]);

  const speakText = (text: string, languageCode: string) => {
    if (!speechSupported || !speechSynthRef.current || !text.trim()) {
      return;
    }

    speechSynthRef.current.cancel();

    const cleanText = text
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/#{1,6}\s/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/\n+/g, " ")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const speechLangCode = SPEECH_LANGUAGE_CODES[languageCode] || "en-US";
    utterance.lang = speechLangCode;

    const preferredVoice = availableVoices.find((voice) => voice.lang.startsWith(speechLangCode.split("-")[0]));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = 1.3;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    speechSynthRef.current.speak(utterance);
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

      // Auto-translate if enabled
      if (translationEnabled && response.response) {
        handleTranslate(response.response);
      }
    } catch (error) {
      setLastError("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async (textToTranslate: string) => {
    if (!textToTranslate.trim()) {
      return;
    }

    setIsTranslating(true);

    try {
      const response = await translateMutation.mutateAsync({
        text: textToTranslate,
        targetLanguage: selectedLanguage,
        sessionId,
      });

      setTranslations((prev) => [
        ...prev,
        {
          original: response.originalText,
          translated: response.translatedText,
        },
      ]);

      // Auto-speak if enabled
      if (speechEnabled) {
        speakText(response.translatedText, selectedLanguage);
      }
    } catch (error) {
      setLastError("Failed to translate text");
    } finally {
      setIsTranslating(false);
    }
  };

  const toggleSpeech = () => {
    if (speechEnabled && isSpeaking) {
      speechSynthRef.current?.cancel();
      setIsSpeaking(false);
    }
    setSpeechEnabled(!speechEnabled);
  };

  const clearContext = () => {
    setMessages([]);
    setTranslations([]);
    setLastError(null);
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Main Chat Area - Expanded */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle>Talk Screen AI</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-lg px-4 py-2 rounded-lg ${
                        msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-900"
                      }`}
                    >
                      <Streamdown>{msg.content}</Streamdown>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>
            </Card>

            {/* Input Area */}
            <Card>
              <CardContent className="p-4 space-y-4">
                {lastError && (
                  <div className="flex items-center gap-2 p-3 bg-red-100 text-red-700 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span>{lastError}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  {!isScreenSharing ? (
                    <Button onClick={startScreenShare} variant="outline" className="flex-1">
                      <Monitor className="w-4 h-4 mr-2" />
                      Start Screen Share
                    </Button>
                  ) : (
                    <Button onClick={stopScreenShare} variant="destructive" className="flex-1">
                      <MonitorOff className="w-4 h-4 mr-2" />
                      Stop Screen Share
                    </Button>
                  )}
                </div>

                {isScreenSharing && (
                  <div className="p-3 bg-green-100 text-green-700 rounded-lg text-sm">
                    ✓ Screen sharing active. Your screen will be captured when you send a message.
                  </div>
                )}

                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    // Check if IME composition is in progress
                    if ((e as any).nativeEvent?.isComposing) {
                      return;
                    }
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  onCompositionStart={() => {
                    // Mark IME composition as active
                  }}
                  onCompositionEnd={() => {
                    // IME composition ended
                  }}
                  placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={3}
                />

                <Button onClick={handleSendMessage} disabled={isLoading || !inputText.trim()} className="w-full">
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  Send
                </Button>

                <Button onClick={clearContext} variant="outline" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Context
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Translation Panel */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  Translation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="flex gap-2">
                  <input
                    type="checkbox"
                    id="translation-toggle"
                    checked={translationEnabled}
                    onChange={(e) => setTranslationEnabled(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="translation-toggle" className="text-sm">
                    Enable Translation
                  </label>
                </div>

                {translationEnabled && (
                  <>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="w-full p-2 border rounded-lg text-sm"
                    >
                      {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-2">
                      <input
                        type="checkbox"
                        id="speech-toggle"
                        checked={speechEnabled}
                        onChange={toggleSpeech}
                        disabled={!speechSupported}
                        className="w-4 h-4"
                      />
                      <label htmlFor="speech-toggle" className="text-sm flex items-center gap-2">
                        {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        Text-to-Speech
                      </label>
                    </div>
                  </>
                )}

                <div className="h-[500px] overflow-y-auto border rounded-lg p-3 bg-gray-50 space-y-2">
                  {translations.length === 0 ? (
                    <p className="text-sm text-gray-500">No translations yet</p>
                  ) : (
                    translations.map((trans, idx) => (
                      <div key={idx} className="p-3 bg-white rounded border border-indigo-200">
                        <Streamdown>{trans.translated}</Streamdown>
                      </div>
                    ))
                  )}
                  <div ref={translationsEndRef} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
