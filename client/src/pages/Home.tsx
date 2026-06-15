import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE } from "@/const";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Sparkles, Monitor, MessageCircle, Zap, ArrowRight } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();

  useEffect(() => {
    document.title = "Talk Screen AI - AI-Powered Screen Analysis Tool";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {APP_LOGO && <img src={APP_LOGO} alt="logo" className="h-8 w-8" />}
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                {APP_TITLE}
              </h1>
            </div>
            <Button
              onClick={() => navigate("/chat")}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full px-6 shadow-lg shadow-purple-500/25"
            >
              Open Chat
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm mb-6">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-purple-700">AI-Powered Assistant</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
              Talk Screen AI
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            An intelligent AI assistant that understands your screen and provides real-time analysis and insights.
          </p>
          <Button
            onClick={() => navigate("/chat")}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full px-8 py-6 text-lg shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 transition-all"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start Chatting Now
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/25">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-lg text-gray-800 mb-2">Screen Sharing & Analysis</h3>
            <p className="text-gray-600">Share your screen and get AI-powered insights about what you see in real-time.</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center mb-4 shadow-lg shadow-pink-500/25">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-lg text-gray-800 mb-2">Context-Aware Chat</h3>
            <p className="text-gray-600">Maintain conversation history for coherent and continuous dialogue with AI.</p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-yellow-400 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/25">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-lg text-gray-800 mb-2">Instant Responses</h3>
            <p className="text-gray-600">Get quick, accurate answers powered by advanced AI technology.</p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 md:p-12 shadow-xl border border-purple-100">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-10 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold text-xl mx-auto mb-4 shadow-lg shadow-purple-500/25">
                1
              </div>
              <h4 className="font-bold text-gray-800 mb-2">Start Screen Sharing</h4>
              <p className="text-gray-600 text-sm">Click the screen share button to share your display with the AI.</p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 text-white flex items-center justify-center font-bold text-xl mx-auto mb-4 shadow-lg shadow-pink-500/25">
                2
              </div>
              <h4 className="font-bold text-gray-800 mb-2">Ask Questions</h4>
              <p className="text-gray-600 text-sm">Type your question and send - your screen is automatically captured.</p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 text-white flex items-center justify-center font-bold text-xl mx-auto mb-4 shadow-lg shadow-orange-500/25">
                3
              </div>
              <h4 className="font-bold text-gray-800 mb-2">Get AI Analysis</h4>
              <p className="text-gray-600 text-sm">Receive intelligent insights and answers about your screen content.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-gray-400">
        Powered by AI Support Team
      </footer>
    </div>
  );
}
