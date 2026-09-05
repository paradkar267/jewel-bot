import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Rocket, Camera, Flame, MessageSquare, ShieldCheck, CheckCheck, Store, ArrowUpRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 relative overflow-x-hidden selection:bg-neutral-200 font-sans antialiased">
      
      {/* ── Background Subtle Glow ─────── */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: "url('/bg.png')" }}
      />
      <div className="fixed inset-0 z-0 bg-radial-gradient from-white/80 via-[#fafafa] to-[#f4f4f5] pointer-events-none" />

      {/* ── Minimalist Header ─────── */}
      <header className="relative z-50 border-b border-neutral-200/70 bg-white/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-9 w-9 bg-black rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-all">
                <Store className="h-4.5 w-4.5 text-white fill-white" />
              </div>
              <span className="text-lg font-black tracking-tight text-neutral-900 font-sans">
                JewelBot<span className="text-neutral-400 font-medium">.AI</span>
              </span>
            </Link>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="text-sm font-semibold text-neutral-600 hover:text-black transition-colors px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center gap-1.5 px-5 py-2 text-sm font-bold text-white transition-all duration-200 bg-black rounded-xl shadow-sm hover:bg-neutral-800 hover:scale-[1.02]"
              >
                <span>Launch Portal</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </header>

      {/* ── Main Hero Section ─────── */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Heading & CTAs */}
          <div className="lg:col-span-7 text-left space-y-6">
            
            {/* Minimal Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-neutral-200 text-xs text-neutral-700 font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>AI-Powered WhatsApp Jewelry Sales</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-neutral-900 leading-[1.1]">
              Sell Jewelry on <br />
              WhatsApp <br />
              <span className="text-neutral-400">While You Sleep.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-neutral-600 max-w-lg leading-relaxed font-normal">
              Upload your catalog. Our Vision AI recognizes jewelry screenshots, calculates real-time gold rates, and closes high-ticket sales directly on <span className="text-emerald-700 font-semibold">WhatsApp 24/7</span>.
            </p>

            {/* Primary Action Button */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:items-center">
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 text-sm sm:text-base font-extrabold text-white transition-all duration-200 bg-black rounded-xl shadow-md hover:scale-[1.02] hover:bg-neutral-800 cursor-pointer"
              >
                <Rocket className="w-4 h-4 fill-white text-white" />
                <span>Build Your Showroom Bot</span>
              </Link>
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center px-6 py-3.5 text-sm sm:text-base font-bold text-neutral-700 transition-all duration-200 bg-white border border-neutral-250 rounded-xl hover:bg-neutral-100 hover:text-black shadow-xs"
              >
                <span>Owner Login</span>
              </Link>
            </div>

          </div>

          {/* Right Column: Clean Phone Preview */}
          <div className="lg:col-span-5 relative flex justify-center items-center py-4">
            
            {/* Phone Mockup Frame */}
            <div className="relative w-[310px] sm:w-[335px] rounded-[44px] bg-white p-3 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-neutral-250">
              
              {/* Dynamic Island */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-3.5 bg-black rounded-full z-30" />

              {/* Screen */}
              <div className="w-full bg-[#f4f2ee] rounded-[34px] overflow-hidden pt-7 pb-3 px-3 border border-neutral-200 text-xs">
                
                {/* Chat Header */}
                <div className="flex items-center gap-2 pb-2 border-b border-neutral-200 px-1 bg-white p-2 rounded-t-xl">
                  <div className="h-7 w-7 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xs">
                    <Store className="w-3.5 h-3.5 text-white fill-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-neutral-900 text-xs">Royal Diamonds</span>
                      <span className="h-3 w-3 bg-emerald-500 rounded-full flex items-center justify-center text-[7px] text-white font-black">✓</span>
                    </div>
                    <p className="text-[9px] text-emerald-600 font-medium">Verified AI Showroom</p>
                  </div>
                </div>

                {/* Chat Body */}
                <div className="py-2.5 space-y-2 text-[11px]">
                  
                  {/* Customer Photo */}
                  <div className="bg-[#d9fdd3] text-neutral-800 p-1.5 rounded-2xl rounded-tr-xs max-w-[84%] ml-auto border border-[#b7e9b0] shadow-xs">
                    <div className="h-28 w-full bg-neutral-900 rounded-xl overflow-hidden relative">
                      <Image 
                        src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80"
                        alt="Solitaire Ring"
                        fill
                        sizes="200px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <p className="text-[10px] font-medium text-neutral-700 mt-1 px-1">Is this ring design available?</p>
                    <div className="flex items-center justify-end gap-1 mt-0.5 px-1">
                      <span className="text-[8px] text-neutral-500">10:30 AM</span>
                      <CheckCheck className="w-3 h-3 text-emerald-600" />
                    </div>
                  </div>

                  {/* AI Instant Recommendation Card */}
                  <div className="bg-white text-neutral-900 p-2.5 rounded-2xl rounded-tl-xs max-w-[94%] border border-neutral-200 shadow-sm space-y-1">
                    <div className="flex items-center gap-1 text-emerald-700 font-bold text-[9px]">
                      <Sparkles className="w-3 h-3" />
                      <span>Best Showroom Match (94% Similar)</span>
                    </div>
                    <p className="font-bold text-neutral-900 text-xs">18K Diamond Solitaire Ring</p>
                    <div className="flex items-center justify-between text-[10px] text-neutral-600 pt-0.5">
                      <span>Purity: <strong>18K Gold</strong></span>
                      <span className="text-emerald-700 font-black text-xs">₹55,607</span>
                    </div>
                    <div className="w-full mt-1.5 py-1.5 bg-black text-white rounded-lg text-[9px] font-bold text-center">
                      View Details & Book Showroom Visit
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>

        </div>

        {/* ── 4 Core Minimal Pillars ─────── */}
        <section className="mt-20 pt-10 border-t border-neutral-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-2">
              <div className="h-9 w-9 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-900">
                <Camera className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-neutral-900 text-sm">Vision AI Matching</h3>
              <p className="text-neutral-500 text-xs leading-relaxed">
                Identifies jewelry from Instagram screenshots and matches in-stock showroom items.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-2">
              <div className="h-9 w-9 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-900">
                <Flame className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-neutral-900 text-sm">Daily Metal Rate Sync</h3>
              <p className="text-neutral-500 text-xs leading-relaxed">
                Live 22K/18K Gold & Silver rates auto-update all jewelry prices with making charges.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-2">
              <div className="h-9 w-9 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-900">
                <MessageSquare className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-neutral-900 text-sm">24/7 WhatsApp Closer</h3>
              <p className="text-neutral-500 text-xs leading-relaxed">
                Answers customer queries at midnight and books appointments instantly.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs space-y-2">
              <div className="h-9 w-9 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-900">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-bold text-neutral-900 text-sm">100% Data Isolation</h3>
              <p className="text-neutral-500 text-xs leading-relaxed">
                Each brand&apos;s catalog, customer leads, and Meta tokens are strictly separated.
              </p>
            </div>

          </div>
        </section>

        {/* ── Minimal Bottom Banner ─────── */}
        <section className="mt-16 p-8 sm:p-10 rounded-2xl bg-black text-white text-center space-y-4 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Ready to Automate Your Jewelry Showroom?
          </h2>
          <p className="text-neutral-400 text-sm max-w-md mx-auto">
            Connect your WhatsApp Business number and upload your catalog in 5 minutes.
          </p>
          <div className="pt-2">
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-extrabold text-black bg-white rounded-xl hover:bg-neutral-200 transition-all"
            >
              <span>Get Started Now</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

      </main>

      {/* ── Minimal Footer ─────── */}
      <footer className="border-t border-neutral-200 bg-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900">JewelBot.AI</span>
            <span>• WhatsApp Commerce for Jewelers</span>
          </div>
          <p>© {new Date().getFullYear()} JewelBot.AI. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
