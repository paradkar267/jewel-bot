import Link from 'next/link';
import Image from 'next/image';
import { Store, Sparkles, Rocket, PlayCircle, Clock, Tag, MessageCircle, TrendingUp, Mic, Paperclip, Camera, CheckCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#060606] text-white relative overflow-x-hidden selection:bg-amber-500/30 font-sans">
      
      {/* ── Background Layer with bg.png ─────── */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-45 mix-blend-luminosity scale-105 pointer-events-none"
        style={{ backgroundImage: "url('/bg.png')" }}
      />
      {/* Dark Luxury Gradient Overlays */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#060606]/90 via-[#060606]/65 to-[#060606] pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_75%_35%,rgba(245,158,11,0.2)_0%,transparent_55%)] pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,119,6,0.15)_0%,transparent_45%)] pointer-events-none" />

      {/* ── Header / Navigation ─────── */}
      <header className="relative z-50 border-b border-amber-500/20 bg-[#060606]/85 backdrop-blur-2xl sticky top-0 shadow-[0_4px_30px_rgba(0,0,0,0.8),0_1px_15px_rgba(245,158,11,0.15)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3.5 group">
              <div className="h-10 w-10 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.5)] border border-amber-200/60 group-hover:scale-105 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.7)] transition-all">
                <Store className="h-5 w-5 text-black fill-black" />
              </div>
              <span className="text-xl font-black tracking-tight text-white font-sans flex items-center gap-0.5">
                JewelBot<span className="text-amber-400">.AI</span>
              </span>
            </Link>

            {/* Center Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-300 hover:text-amber-400 transition-colors">
                Features
              </a>
              <a href="#features" className="text-sm font-medium text-gray-300 hover:text-amber-400 transition-colors">
                How It Works
              </a>
              <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-amber-400 transition-colors">
                SaaS Portal
              </Link>
            </nav>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-6">
              <Link 
                href="/login" 
                className="text-sm font-semibold text-gray-300 hover:text-white transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-amber-400 hover:after:w-full after:transition-all"
              >
                Sign In
              </Link>
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-black transition-all duration-300 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:brightness-110 hover:scale-[1.04] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] border border-amber-200/60"
              >
                Get Started
              </Link>
            </div>

          </div>
        </div>
      </header>

      {/* ── Main Hero Section ─────── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-16 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center min-h-[calc(100vh-220px)]">
          
          {/* Left Column: Heading & CTAs */}
          <div className="lg:col-span-7 text-left z-10">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/40 border border-amber-500/40 text-xs sm:text-sm text-[#fcd34d] font-medium mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>The Future of Jewelry Retail is Here</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black tracking-tight text-white leading-[1.08] mb-6 font-sans">
              Sell Jewelry on <br />
              WhatsApp <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 drop-shadow-[0_0_35px_rgba(245,158,11,0.35)]">
                While You Sleep.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-300 max-w-xl mb-10 leading-relaxed font-normal">
              Upload your catalog. Our AI agent instantly chats with your customers, recommends jewelry, and closes sales directly on <span className="text-[#00e676] font-bold">WhatsApp 24/7</span>.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-extrabold text-black transition-all duration-300 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 rounded-xl shadow-[0_0_35px_rgba(245,158,11,0.4)] hover:scale-[1.03] hover:shadow-[0_0_50px_rgba(245,158,11,0.65)]"
              >
                <Rocket className="w-5 h-5 fill-black text-black" />
                <span>Build your Empire now</span>
              </Link>

              <Link 
                href="/login" 
                className="inline-flex items-center justify-center gap-3 px-7 py-4 text-base font-semibold text-white transition-all duration-300 bg-black/60 border border-white/20 rounded-xl hover:bg-white/10 hover:border-amber-400/50 backdrop-blur-xl"
              >
                <PlayCircle className="w-5 h-5 text-amber-400" />
                <span>See How It Works</span>
              </Link>
            </div>

          </div>

          {/* Right Column: Realistic Dark Mobile Phone Mockup */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            
            {/* Curved Golden Glowing Light Rings */}
            <svg className="absolute w-[520px] h-[520px] pointer-events-none -z-10 opacity-75" viewBox="0 0 520 520" fill="none">
              <circle cx="260" cy="260" r="190" stroke="url(#goldGrad)" strokeWidth="1.5" strokeDasharray="6 8" opacity="0.6" />
              <circle cx="260" cy="260" r="240" stroke="url(#goldGrad)" strokeWidth="1" opacity="0.35" />
              <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#78350f" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Mobile Phone Device Frame */}
            <div className="relative w-[320px] sm:w-[345px] rounded-[48px] bg-gradient-to-b from-[#342c22] via-[#1a1713] to-[#0c0a08] p-3.5 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.95),0_0_60px_rgba(245,158,11,0.3)] border-[3px] border-amber-500/40 backdrop-blur-2xl transform lg:rotate-[2deg] hover:rotate-0 transition-transform duration-500">
              
              {/* Dynamic Island / Top Speaker */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-30 flex items-center justify-center border border-white/10">
                <div className="w-3 h-3 bg-[#111] rounded-full border border-white/10" />
              </div>

              {/* Screen Container */}
              <div className="w-full bg-[#0b0f12] rounded-[38px] overflow-hidden pt-8 pb-3.5 px-3 border border-white/10 relative text-xs shadow-inner">
                
                {/* WhatsApp Chat Header */}
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-white/10 px-1">
                  <div className="h-8 w-8 bg-gradient-to-br from-amber-300 to-amber-500 rounded-lg flex items-center justify-center text-black font-bold text-xs shadow-md">
                    <Store className="w-4 h-4 text-black fill-black" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-white text-xs truncate">JewelBot AI</span>
                      <span className="h-3.5 w-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] text-black font-black">✓</span>
                    </div>
                    <p className="text-[10px] text-emerald-400 font-medium">Online</p>
                  </div>
                  <div className="text-gray-400 text-base font-bold">⋮</div>
                </div>

                {/* WhatsApp Chat Content */}
                <div className="py-3 space-y-2.5 font-sans text-[11px]">
                  
                  {/* Bot Greeting Bubble */}
                  <div className="bg-[#182229] text-gray-200 p-2.5 rounded-2xl rounded-tl-xs max-w-[88%] border border-white/5 shadow-sm">
                    <p>Hi! 👋 Looking for something special today?</p>
                    <span className="text-[9px] text-gray-400 block text-right mt-1">10:30 AM</span>
                  </div>

                  {/* Bot Product Recommendation Card */}
                  <div className="bg-[#182229] text-white p-2.5 rounded-2xl rounded-tl-xs max-w-[94%] border border-amber-500/35 overflow-hidden shadow-md">
                    <div className="h-32 w-full bg-gradient-to-tr from-amber-950/80 via-black to-amber-900/40 rounded-xl overflow-hidden mb-2 relative flex items-center justify-center border border-amber-500/30">
                      {/* High-res Jewelry Image */}
                      <Image 
                        src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80" 
                        alt="Elegant Gold Necklace"
                        fill
                        sizes="(max-width: 768px) 100vw, 300px"
                        className="object-cover object-center"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    </div>
                    <p className="font-bold text-white text-xs">Elegant Gold Necklace</p>
                    <p className="text-amber-400 font-extrabold text-xs mt-0.5">₹45,990</p>
                    <div className="w-full mt-2 py-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-lg text-[10px] font-bold text-center">
                      View Details
                    </div>
                  </div>

                  {/* Customer Green Bubble */}
                  <div className="bg-[#005c4b] text-white p-2.5 rounded-2xl rounded-tr-xs max-w-[82%] ml-auto border border-emerald-500/20 shadow-sm">
                    <p>Yes, show me something elegant</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[9px] text-emerald-200/70">10:31 AM</span>
                      <CheckCheck className="w-3 h-3 text-emerald-300" />
                    </div>
                  </div>

                  {/* Bot Recommendations Grid */}
                  <div className="bg-[#182229] text-gray-200 p-2.5 rounded-2xl rounded-tl-xs max-w-[94%] border border-white/5">
                    <p className="font-medium text-gray-300">Here are some perfect picks for you ✨</p>
                    <div className="grid grid-cols-3 gap-1.5 mt-2">
                      
                      {/* Pick 1 */}
                      <div className="h-14 relative rounded-lg overflow-hidden border border-amber-500/35 bg-black">
                        <Image 
                          src="https://images.unsplash.com/photo-1611591475140-1049c687e834?auto=format&fit=crop&w=300&q=80" 
                          alt="Pendant"
                          fill
                          sizes="100px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>

                      {/* Pick 2 */}
                      <div className="h-14 relative rounded-lg overflow-hidden border border-amber-500/35 bg-black">
                        <Image 
                          src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=300&q=80" 
                          alt="Ring"
                          fill
                          sizes="100px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>

                      {/* Pick 3 */}
                      <div className="h-14 relative rounded-lg overflow-hidden border border-amber-500/35 bg-black">
                        <Image 
                          src="https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=300&q=80" 
                          alt="Earring"
                          fill
                          sizes="100px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>

                    </div>
                    <span className="text-[9px] text-gray-400 block text-right mt-1">10:31 AM</span>
                  </div>

                </div>

                {/* WhatsApp Chat Input Bar */}
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2">
                  <div className="flex-1 bg-[#182229] text-gray-400 px-3 py-1.5 rounded-full text-[10px] flex items-center justify-between">
                    <span>Type a message...</span>
                    <div className="flex items-center gap-2 opacity-60">
                      <Paperclip className="w-3.5 h-3.5" />
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="h-7 w-7 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs shadow-md shrink-0">
                    <Mic className="w-3.5 h-3.5 fill-white" />
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* ── Bottom Feature Bar (4 Columns) ─────── */}
        <div id="features" className="mt-16 pt-12 pb-8 border-t border-amber-500/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-950/30 to-black/40 border border-amber-500/20 hover:border-amber-500/40 transition-colors backdrop-blur-md">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm mb-0.5">24/7 AI Chat Agent</h3>
                <p className="text-gray-400 text-xs leading-snug">
                  Never miss a customer. We&apos;re always online.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-950/30 to-black/40 border border-amber-500/20 hover:border-amber-500/40 transition-colors backdrop-blur-md">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm mb-0.5">Smart Recommendations</h3>
                <p className="text-gray-400 text-xs leading-snug">
                  AI suggests the perfect jewelry every time.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-950/30 to-black/40 border border-amber-500/20 hover:border-amber-500/40 transition-colors backdrop-blur-md">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm mb-0.5">Close Sales on WhatsApp</h3>
                <p className="text-gray-400 text-xs leading-snug">
                  From chat to checkout, seamlessly.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-950/30 to-black/40 border border-amber-500/20 hover:border-amber-500/40 transition-colors backdrop-blur-md">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm mb-0.5">Boost Your Revenue</h3>
                <p className="text-gray-400 text-xs leading-snug">
                  More conversions. Less effort.
                </p>
              </div>
            </div>

          </div>
        </div>

      </main>

    </div>
  );
}
