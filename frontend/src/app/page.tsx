import Link from 'next/link';
import { Store, Bot, Sparkles, Zap, TrendingUp, ShieldCheck, PlayCircle, MessageSquare } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-amber-500/30 font-sans">
      {/* ── Luxury Background Image & Gradient Overlay ── */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50 scale-105 pointer-events-none transition-transform duration-1000"
        style={{ backgroundImage: "url('/bg.png')" }}
      />
      {/* Dark Vignette Overlay for Crisp Legibility */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#050505]/85 via-[#050505]/60 to-[#050505]/95 pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

      {/* ── Navigation Bar ── */}
      <nav className="relative z-50 border-b border-amber-500/10 bg-[#050505]/70 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.35)] border border-amber-300/30">
                <Store className="h-5 w-5 text-[#050505]" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                JewelBot<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">.AI</span>
              </span>
            </div>
            <div className="flex items-center gap-5">
              <Link href="/login" className="text-sm font-semibold text-gray-300 hover:text-amber-300 transition-colors">
                Sign In
              </Link>
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-[#050505] transition-all duration-300 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 rounded-xl hover:scale-105 hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] border border-amber-200/40"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs sm:text-sm font-medium text-amber-300 mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>The Future of Jewelry Retail is Here</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight mb-8 text-white">
            Sell Jewelry on WhatsApp <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 drop-shadow-[0_0_35px_rgba(245,158,11,0.2)]">
              While You Sleep.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 max-w-2xl mx-auto text-base sm:text-xl text-gray-300 mb-10 leading-relaxed font-normal">
            Upload your catalog. Our AI agent instantly chats with your customers, recommends jewelry, and closes sales directly on <span className="text-emerald-400 font-semibold">WhatsApp 24/7</span>.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link 
              href="/login" 
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold text-[#050505] transition-all duration-300 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 rounded-xl hover:scale-105 hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] border border-amber-200/50"
            >
              🚀 Build your Empire now
            </Link>
            <Link 
              href="#features" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white transition-all duration-300 bg-white/5 border border-white/15 rounded-xl hover:bg-white/10 hover:border-amber-500/40 backdrop-blur-md"
            >
              <PlayCircle className="w-5 h-5 text-amber-400" />
              <span>See How It Works</span>
            </Link>
          </div>
        </div>

        {/* ── Feature Cards Section ── */}
        <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-amber-500/10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-black/40 border border-white/10 hover:border-amber-500/40 transition-all duration-300 group backdrop-blur-md hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)]">
              <div className="h-12 w-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-5 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">24/7 AI Chat Agent</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Never miss a customer. Our AI handles inquiries and scans catalogs around the clock.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-black/40 border border-white/10 hover:border-amber-500/40 transition-all duration-300 group backdrop-blur-md hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)]">
              <div className="h-12 w-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-5 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Smart Recommendations</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Gemini 2.5 Flash Vision analyzes photo screenshots & text to match exact products.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-black/40 border border-white/10 hover:border-amber-500/40 transition-all duration-300 group backdrop-blur-md hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)]">
              <div className="h-12 w-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-5 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Close Sales on WhatsApp</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Send prices, matching designs, and buy links directly into WhatsApp chats.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-black/40 border border-white/10 hover:border-amber-500/40 transition-all duration-300 group backdrop-blur-md hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)]">
              <div className="h-12 w-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-5 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Boost Your Revenue</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                More customer conversions, automated broadcast updates, with minimal manual effort.
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
