import Link from 'next/link';
import { Store, Bot, Sparkles, Zap, TrendingUp, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden selection:bg-amber-500/30">
      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-amber-200 to-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                <Store className="h-5 w-5 text-[#0a0a0a]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">JewelBot<span className="text-amber-500">.AI</span></span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold text-[#0a0a0a] transition-all duration-200 bg-gradient-to-r from-amber-300 to-amber-500 border border-transparent rounded-lg hover:from-amber-200 hover:to-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[60%] h-[50%] rounded-full bg-amber-600/10 blur-[150px] -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-amber-200/80 mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span>The Future of Jewelry Retail is Here</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            Sell Jewelry on WhatsApp <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
              While You Sleep.
            </span>
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400 mb-12 leading-relaxed">
            Upload your catalog. Our AI agent instantly chats with your customers, recommends jewelry, and closes sales directly on WhatsApp 24/7.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/login" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-[#0a0a0a] transition-all duration-300 bg-gradient-to-r from-amber-300 to-amber-500 rounded-xl hover:scale-105 hover:shadow-[0_0_30px_rgba(251,191,36,0.3)]">
              Build your Empire now
            </Link>
            <Link href="#features" className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white transition-all duration-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 backdrop-blur-sm">
              See How It Works
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 hover:border-amber-500/30 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Bot className="w-24 h-24 text-amber-500" />
              </div>
              <div className="h-12 w-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-6 border border-amber-500/20 text-amber-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">AI Auto-Fill Catalog</h3>
              <p className="text-gray-400 leading-relaxed">
                Just upload a photo of your jewelry. Our Gemini AI automatically extracts the name, metal, type, and price range instantly. No manual entry needed.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 hover:border-amber-500/30 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp className="w-24 h-24 text-amber-500" />
              </div>
              <div className="h-12 w-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-6 border border-amber-500/20 text-amber-400">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">24/7 WhatsApp Sales</h3>
              <p className="text-gray-400 leading-relaxed">
                Customers send an image of what they want. Your AI bot scans your catalog and replies instantly with matching jewelry and prices.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-white/5 to-transparent border border-white/5 hover:border-amber-500/30 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <ShieldCheck className="w-24 h-24 text-amber-500" />
              </div>
              <div className="h-12 w-12 bg-amber-500/10 rounded-lg flex items-center justify-center mb-6 border border-amber-500/20 text-amber-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">100% Data Isolation</h3>
              <p className="text-gray-400 leading-relaxed">
                Military-grade Row Level Security ensures your catalog and customer inquiries are completely private and separated from other jewelers.
              </p>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
