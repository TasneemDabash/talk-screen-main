import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const [, navigate] = useLocation();

  useEffect(() => {
    document.title = "Talk Screen AI - AI-Powered Screen Analysis & Translation Tool";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {APP_LOGO && <img src={APP_LOGO} alt="logo" className="h-8 w-8" />}
              <h1 className="text-2xl font-bold text-gray-900">{APP_TITLE}</h1>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => navigate("/chat")} variant="default">
                Open Chat
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-gray-900">Talk Screen AI</h2>
            <p className="text-xl text-gray-600">
              An intelligent AI assistant that understands your screen and provides real-time analysis and translation.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 mt-1">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Screen Sharing & Analysis</h3>
                  <p className="text-gray-600">Share your screen and get AI-powered insights about what you see</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 mt-1">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Real-time Translation</h3>
                  <p className="text-gray-600">Translate AI responses into 12 languages instantly</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 mt-1">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Text-to-Speech</h3>
                  <p className="text-gray-600">Listen to translations with natural-sounding voice synthesis</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 mt-1">
                  ✓
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Context-Aware Chat</h3>
                  <p className="text-gray-600">Maintain conversation history for coherent and continuous dialogue</p>
                </div>
              </div>
            </div>
            <Button onClick={() => navigate("/chat")} size="lg" className="w-full md:w-auto">
              Start Chatting Now
            </Button>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">How It Works</h3>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                    1
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">Start Screen Sharing</p>
                    <p className="text-gray-600 text-sm">Click the screen share button to share your display</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                    2
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">Ask Questions</p>
                    <p className="text-gray-600 text-sm">Type your question and send - your screen is automatically captured</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                    3
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">Get AI Analysis</p>
                    <p className="text-gray-600 text-sm">Receive intelligent insights powered by Manus LLM</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">
                    4
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">Translate & Listen</p>
                    <p className="text-gray-600 text-sm">Translate responses and listen with text-to-speech</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
