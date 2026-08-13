import Link from 'next/link';
import Image from 'next/image';
import { Store, Sparkles, Rocket, PlayCircle, Clock, Tag, MessageCircle, TrendingUp, Mic, Paperclip, Camera, CheckCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 relative overflow-x-hidden selection:bg-neutral-200 font-sans">
      
      {/* ── Background Layer with bg.png ─────── */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.03] mix-blend-luminosity scale-105 pointer-events-none"
        style={{ backgroundImage: "url('/bg.png')" }}
      />
      {/* Light Luxury Gradient Overlays */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-neutral-50/90 via-neutral-100/60 to-neutral-50 pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_75%_35%,rgba(0,0,0,0.03)_0%,transparent_55%)] pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.02)_0%,transparent_45%)] pointer-events-none" />

      {/* ── Header / Navigation ─────── */}
      <header className="relative z-50 border-b border-neutral-200 bg-white/80 backdrop-blur-2xl sticky top-0 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3.5 group">
              <div className="h-10 w-10 bg-black rounded-xl flex items-center justify-center shadow-md border border-neutral-800 group-hover:scale-105 transition-all">
                <Store className="h-5 w-5 text-white fill-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-neutral-900 font-sans flex items-center gap-0.5">
                JewelBot<span className="text-neutral-500">.AI</span>
              </span>
            </Link>

            {/* Center Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-neutral-600 hover:text-black transition-colors">
                Features
              </a>
              <a href="#features" className="text-sm font-medium text-neutral-600 hover:text-black transition-colors">
                How It Works
              </a>
              <Link href="/login" className="text-sm font-medium text-neutral-600 hover:text-black transition-colors">
                SaaS Portal
              </Link>
            </nav>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-6">
              <Link 
                href="/login" 
                className="text-sm font-semibold text-neutral-600 hover:text-black transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-black hover:after:w-full after:transition-all"
              >
                Sign In
              </Link>
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white transition-all duration-300 bg-neutral-900 rounded-xl shadow-md hover:bg-black hover:scale-[1.04] border border-neutral-800"
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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-100 border border-neutral-300 text-xs sm:text-sm text-neutral-800 font-medium mb-8 shadow-sm">
              <Sparkles className="w-4 h-4 text-neutral-900" />
              <span>The Future of Jewelry Retail is Here</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black tracking-tight text-neutral-900 leading-[1.08] mb-6 font-sans">
              Sell Jewelry on <br />
              WhatsApp <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-950 to-neutral-700 drop-shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
                While You Sleep.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-neutral-600 max-w-xl mb-10 leading-relaxed font-normal">
              Upload your catalog. Our AI agent instantly chats with your customers, recommends jewelry, and closes sales directly on <span className="text-emerald-600 font-bold">WhatsApp 24/7</span>.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-extrabold text-white transition-all duration-300 bg-black rounded-xl shadow-lg hover:scale-[1.03] hover:bg-neutral-800"
              >
                <Rocket className="w-5 h-5 fill-white text-white" />
                <span>Build your Empire now</span>
              </Link>

              <Link 
                href="/login" 
                className="inline-flex items-center justify-center gap-3 px-7 py-4 text-base font-semibold text-neutral-800 transition-all duration-300 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-100 hover:border-neutral-400 backdrop-blur-xl"
              >
                <PlayCircle className="w-5 h-5 text-neutral-900" />
                <span>See How It Works</span>
              </Link>
            </div>

          </div>

          {/* Right Column: Realistic Light Mobile Phone Mockup */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            
            {/* Curved Gray Glowing Light Rings */}
            <svg className="absolute w-[520px] h-[520px] pointer-events-none -z-10 opacity-75" viewBox="0 0 520 520" fill="none">
              <circle cx="260" cy="260" r="190" stroke="url(#goldGrad)" strokeWidth="1.5" strokeDasharray="6 8" opacity="0.6" />
              <circle cx="260" cy="260" r="240" stroke="url(#goldGrad)" strokeWidth="1" opacity="0.35" />
              <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#111111" />
                  <stop offset="50%" stopColor="#6b7280" />
                  <stop offset="100%" stopColor="#d1d5db" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Mobile Phone Device Frame */}
            <div className="relative w-[320px] sm:w-[345px] rounded-[48px] bg-gradient-to-b from-neutral-200 via-neutral-100 to-neutral-300 p-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-[3px] border-neutral-400 backdrop-blur-2xl transform lg:rotate-[2deg] hover:rotate-0 transition-transform duration-500">
              
              {/* Dynamic Island / Top Speaker */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-30 flex items-center justify-center border border-white/10">
                <div className="w-3 h-3 bg-[#111] rounded-full border border-white/10" />
              </div>

              {/* Screen Container */}
              <div className="w-full bg-[#efeae2] rounded-[38px] overflow-hidden pt-8 pb-3.5 px-3 border border-neutral-300 relative text-xs shadow-inner">
                
                {/* WhatsApp Chat Header */}
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-neutral-200 px-1 bg-white p-2 rounded-t-xl">
                  <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-md">
                    <Store className="w-4 h-4 text-white fill-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-neutral-800 text-xs truncate">JewelBot AI</span>
                      <span className="h-3.5 w-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] text-white font-black">✓</span>
                    </div>
                    <p className="text-[10px] text-emerald-600 font-medium">Online</p>
                  </div>
                  <div className="text-neutral-500 text-base font-bold">⋮</div>
                </div>

                {/* WhatsApp Chat Content */}
                <div className="py-3 space-y-2.5 font-sans text-[11px]">
                  
                  {/* Bot Greeting Bubble */}
                  <div className="bg-white text-neutral-850 p-2.5 rounded-2xl rounded-tl-xs max-w-[88%] border border-neutral-200 shadow-sm">
                    <p>Hi! 👋 Looking for something special today?</p>
                    <span className="text-[9px] text-neutral-400 block text-right mt-1">10:30 AM</span>
                  </div>

                  {/* Bot Product Recommendation Card */}
                  <div className="bg-white text-neutral-900 p-2.5 rounded-2xl rounded-tl-xs max-w-[94%] border border-neutral-250 overflow-hidden shadow-md">
                    <div className="h-32 w-full bg-neutral-100 rounded-xl overflow-hidden mb-2 relative flex items-center justify-center border border-neutral-200">
                      {/* High-res Jewelry Image */}
                      <Image 
                        src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80" 
                        alt="Elegant Gold Necklace"
                        fill
                        sizes="(max-width: 768px) 100vw, 300px"
                        className="object-cover object-center"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                    </div>
                    <p className="font-bold text-neutral-900 text-xs">Elegant Gold Necklace</p>
                    <p className="text-neutral-900 font-extrabold text-xs mt-0.5">₹45,990</p>
                    <div className="w-full mt-2 py-1.5 bg-neutral-900 border border-neutral-950 text-white rounded-lg text-[10px] font-bold text-center">
                      View Details
                    </div>
                  </div>

                  {/* Customer Light Green Bubble */}
                  <div className="bg-[#d9fdd3] text-neutral-800 p-2.5 rounded-2xl rounded-tr-xs max-w-[82%] ml-auto border border-[#b7e9b0] shadow-sm">
                    <p>Yes, show me something elegant</p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[9px] text-neutral-500">10:31 AM</span>
                      <CheckCheck className="w-3 h-3 text-emerald-600" />
                    </div>
                  </div>

                  {/* Bot Recommendations Grid */}
                  <div className="bg-white text-neutral-850 p-2.5 rounded-2xl rounded-tl-xs max-w-[94%] border border-neutral-200">
                    <p className="font-medium text-neutral-700">Here are some perfect picks for you ✨</p>
                    <div className="grid grid-cols-3 gap-1.5 mt-2">
                      
                      {/* Pick 1 */}
                      <div className="h-14 relative rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100">
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
                      <div className="h-14 relative rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100">
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
                      <div className="h-14 relative rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100">
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
                    <span className="text-[9px] text-neutral-400 block text-right mt-1">10:31 AM</span>
                  </div>

                </div>

                {/* WhatsApp Chat Input Bar */}
                <div className="mt-2 pt-2 border-t border-neutral-200 flex items-center gap-2">
                  <div className="flex-1 bg-white border border-neutral-300 text-neutral-500 px-3 py-1.5 rounded-full text-[10px] flex items-center justify-between">
                    <span>Type a message...</span>
                    <div className="flex items-center gap-2 opacity-60">
                      <Paperclip className="w-3.5 h-3.5" />
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="h-7 w-7 bg-[#00a884] rounded-full flex items-center justify-center text-white text-xs shadow-md shrink-0">
                    <Mic className="w-3.5 h-3.5 fill-white" />
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* ── Bottom Feature Bar (4 Columns) ─────── */}
        <div id="features" className="mt-16 pt-12 pb-8 border-t border-neutral-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-neutral-200 hover:border-neutral-400 transition-colors backdrop-blur-md shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-neutral-100 border border-neutral-300 flex items-center justify-center text-neutral-900 shrink-0 shadow-sm">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 text-sm mb-0.5">24/7 AI Chat Agent</h3>
                <p className="text-neutral-550 text-xs leading-snug">
                  Never miss a customer. We&apos;re always online.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-neutral-200 hover:border-neutral-400 transition-colors backdrop-blur-md shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-neutral-100 border border-neutral-300 flex items-center justify-center text-neutral-900 shrink-0 shadow-sm">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 text-sm mb-0.5">Smart Recommendations</h3>
                <p className="text-neutral-550 text-xs leading-snug">
                  AI suggests the perfect jewelry every time.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-neutral-200 hover:border-neutral-400 transition-colors backdrop-blur-md shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-neutral-100 border border-neutral-300 flex items-center justify-center text-neutral-900 shrink-0 shadow-sm">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 text-sm mb-0.5">Close Sales on WhatsApp</h3>
                <p className="text-neutral-550 text-xs leading-snug">
                  From chat to checkout, seamlessly.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-neutral-200 hover:border-neutral-400 transition-colors backdrop-blur-md shadow-sm">
              <div className="h-12 w-12 rounded-xl bg-neutral-100 border border-neutral-300 flex items-center justify-center text-neutral-900 shrink-0 shadow-sm">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 text-sm mb-0.5">Boost Your Revenue</h3>
                <p className="text-neutral-550 text-xs leading-snug">
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
