"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Store, Sparkles, Rocket, PlayCircle, Clock, Tag, MessageCircle, 
  TrendingUp, Mic, Paperclip, Camera, CheckCheck, ShieldCheck, 
  Zap, ArrowRight, ChevronDown, Award, Users, BarChart3, Database,
  CheckCircle2, RefreshCw, Send, Star, Gem, PhoneCall, ChevronRight,
  Flame, Lock, HelpCircle
} from 'lucide-react';

export default function LandingPage() {
  // Interactive Phone Demo state
  const [activeTab, setActiveTab] = useState<'vision' | 'text' | 'pricing'>('vision');

  // Interactive ROI Calculator state
  const [dailyChats, setDailyChats] = useState(25);
  const avgOrderValue = 42000;
  const conversionRate = 0.08; // 8% conversion
  const monthlyExtraRevenue = Math.round(dailyChats * 30 * conversionRate * avgOrderValue * 0.15);
  const hoursSavedPerMonth = Math.round(dailyChats * 30 * (4 / 60)); // 4 mins per chat saved

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 relative overflow-x-hidden selection:bg-neutral-200 font-sans">
      
      {/* ── Background Layer with subtle luxury glow ─────── */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.03] mix-blend-luminosity scale-105 pointer-events-none"
        style={{ backgroundImage: "url('/bg.png')" }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-neutral-50/90 via-neutral-100/60 to-neutral-50 pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_75%_35%,rgba(0,0,0,0.03)_0%,transparent_55%)] pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.02)_0%,transparent_45%)] pointer-events-none" />

      {/* ── Header / Navigation ─────── */}
      <header className="relative z-50 border-b border-neutral-200/80 bg-white/85 backdrop-blur-2xl sticky top-0 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3.5 group">
              <div className="h-11 w-11 bg-black rounded-2xl flex items-center justify-center shadow-lg border border-neutral-800 group-hover:scale-105 transition-all">
                <Gem className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-neutral-900 flex items-center gap-1">
                  JewelBot<span className="text-neutral-500 font-bold text-sm">.AI</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-600 block -mt-1 tracking-wider uppercase">WhatsApp Commerce</span>
              </div>
            </Link>

            {/* Center Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#demo" className="text-sm font-semibold text-neutral-600 hover:text-black transition-colors">
                Live Demo
              </a>
              <a href="#features" className="text-sm font-semibold text-neutral-600 hover:text-black transition-colors">
                Features
              </a>
              <a href="#calculator" className="text-sm font-semibold text-neutral-600 hover:text-black transition-colors">
                ROI Calculator
              </a>
              <a href="#how-it-works" className="text-sm font-semibold text-neutral-600 hover:text-black transition-colors">
                How It Works
              </a>
              <a href="#faq" className="text-sm font-semibold text-neutral-600 hover:text-black transition-colors">
                FAQ
              </a>
            </nav>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-4 sm:gap-6">
              <Link 
                href="/login" 
                className="text-sm font-bold text-neutral-700 hover:text-black transition-colors py-1"
              >
                Sign In
              </Link>
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-extrabold text-white transition-all duration-300 bg-black rounded-xl shadow-md hover:bg-neutral-800 hover:scale-[1.03] border border-neutral-800 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Launch Portal</span>
              </Link>
            </div>

          </div>
        </div>
      </header>

      {/* ── Main Hero Section ─────── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 lg:pt-16 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline & Value Proposition */}
          <div className="lg:col-span-7 text-left z-10 space-y-6">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-neutral-250 text-xs sm:text-sm text-neutral-800 font-bold shadow-sm backdrop-blur-md">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Next-Gen WhatsApp Commerce for Jewelry Brands</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl xl:text-[68px] font-black tracking-tight text-neutral-900 leading-[1.08]">
              Turn WhatsApp Chats Into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-950 via-neutral-800 to-neutral-600">
                Multi-Lakh Jewelry Sales.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-neutral-600 max-w-xl leading-relaxed font-normal">
              Upload your showroom vault. Our Vision AI recognizes Instagram screenshots, calculates real-time 22K/18K gold rates, and closes high-ticket sales directly on <span className="text-emerald-700 font-bold">WhatsApp 24/7</span>.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center pt-2">
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-extrabold text-white transition-all duration-300 bg-black rounded-xl shadow-xl hover:scale-[1.03] hover:bg-neutral-800 cursor-pointer border border-neutral-800"
              >
                <Rocket className="w-5 h-5 fill-white text-white" />
                <span>Build Your Showroom Bot</span>
              </Link>

              <a 
                href="#demo" 
                className="inline-flex items-center justify-center gap-3 px-7 py-4 text-base font-bold text-neutral-800 transition-all duration-300 bg-white border border-neutral-300 rounded-xl hover:bg-neutral-100 hover:border-neutral-400 backdrop-blur-xl cursor-pointer shadow-sm"
              >
                <PlayCircle className="w-5 h-5 text-neutral-900" />
                <span>Try Interactive Demo</span>
              </a>
            </div>

            {/* Social Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-neutral-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Meta Verified Cloud API</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>100% Isolated Catalogs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>0% Commission On Sales</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Phone Mockup */}
          <div id="demo" className="lg:col-span-5 relative flex flex-col items-center py-6">
            
            {/* Interactive Scenario Tabs */}
            <div className="flex items-center gap-1.5 bg-white/80 p-1.5 rounded-2xl border border-neutral-250 shadow-sm backdrop-blur-md mb-5 z-20">
              <button
                onClick={() => setActiveTab('vision')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'vision' ? 'bg-black text-white shadow-md' : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                }`}
              >
                📸 Photo Search
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'text' ? 'bg-black text-white shadow-md' : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                }`}
              >
                💬 Text Inquiries
              </button>
              <button
                onClick={() => setActiveTab('pricing')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'pricing' ? 'bg-black text-white shadow-md' : 'text-neutral-600 hover:text-black hover:bg-neutral-100'
                }`}
              >
                ⚡ Live Gold Rate
              </button>
            </div>

            {/* Glowing Rings Background */}
            <div className="relative flex justify-center items-center w-full">
              
              {/* Floating Live Indicator badge (Top Left) */}
              <div className="absolute -left-3 sm:-left-8 top-12 bg-white/95 backdrop-blur-md border border-neutral-200 rounded-2xl p-3 shadow-lg animate-float-left z-20 flex items-center gap-2.5 max-w-[160px] pointer-events-none">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <div>
                  <p className="text-[8px] font-extrabold text-neutral-400 uppercase tracking-wider">Vision Engine</p>
                  <p className="text-[11px] font-bold text-neutral-900 mt-0.5">Gemini 3.6 Active ⚡</p>
                </div>
              </div>

              {/* Floating Conversion Badge (Bottom Right) */}
              <div className="absolute -right-3 sm:-right-6 bottom-16 bg-white/95 backdrop-blur-md border border-neutral-200 rounded-2xl p-3.5 shadow-lg animate-float-right z-20 flex items-center gap-3 pointer-events-none">
                <div className="h-8 w-8 bg-emerald-50 rounded-xl flex items-center justify-center text-sm border border-emerald-100 shrink-0">
                  📈
                </div>
                <div>
                  <p className="text-[8px] font-extrabold text-neutral-400 uppercase tracking-wider">Conversion</p>
                  <p className="text-[12px] font-black text-emerald-700 mt-0.5">+43.8% Sales</p>
                </div>
              </div>
              
              {/* Mobile Phone Device Frame */}
              <div className="relative w-[320px] sm:w-[350px] rounded-[48px] bg-gradient-to-b from-neutral-300 via-neutral-100 to-neutral-300 p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.15)] border-[3px] border-neutral-300 backdrop-blur-2xl">
                
                {/* Dynamic Island */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-30 flex items-center justify-center border border-white/10">
                  <div className="w-3 h-3 bg-[#111] rounded-full border border-white/10" />
                </div>

                {/* Screen Container */}
                <div className="w-full bg-[#efeae2] rounded-[38px] overflow-hidden pt-8 pb-3.5 px-3 border border-neutral-300 relative text-xs shadow-inner">
                  
                  {/* WhatsApp Chat Header */}
                  <div className="flex items-center gap-2.5 pb-2.5 border-b border-neutral-200 px-1 bg-white p-2 rounded-t-xl">
                    <div className="h-8 w-8 bg-black rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-md">
                      <Store className="w-4 h-4 text-white fill-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-neutral-900 text-xs truncate">Royal Diamonds</span>
                        <span className="h-3.5 w-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] text-white font-black">✓</span>
                      </div>
                      <p className="text-[10px] text-emerald-600 font-medium">Verified Business AI</p>
                    </div>
                    <div className="text-neutral-500 text-base font-bold">⋮</div>
                  </div>

                  {/* ── SCENARIO 1: Photo Search ─────── */}
                  {activeTab === 'vision' && (
                    <div className="py-2.5 space-y-2 font-sans text-[11px] animate-in fade-in duration-300">
                      
                      {/* Customer sends Image */}
                      <div className="bg-[#d9fdd3] text-neutral-800 p-1.5 rounded-2xl rounded-tr-xs max-w-[82%] ml-auto border border-[#b7e9b0] shadow-sm">
                        <div className="h-28 w-full bg-neutral-900 rounded-xl overflow-hidden relative">
                          <Image 
                            src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80"
                            alt="Customer Ring"
                            fill
                            sizes="200px"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <p className="text-[10px] font-semibold text-neutral-700 mt-1 px-1">Do you have this solitaire design?</p>
                        <div className="flex items-center justify-end gap-1 mt-0.5 px-1">
                          <span className="text-[8px] text-neutral-500">10:30 AM</span>
                          <CheckCheck className="w-3 h-3 text-emerald-600" />
                        </div>
                      </div>

                      {/* Bot AI Instant Analysis */}
                      <div className="bg-white text-neutral-900 p-2.5 rounded-2xl rounded-tl-xs max-w-[92%] border border-neutral-250 shadow-sm space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[10px]">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>AI Match Found (94% Similarity)</span>
                        </div>
                        <p className="font-bold text-neutral-900 text-xs">CARATLANE 18K Diamond Solitaire Ring</p>
                        <div className="flex items-center justify-between text-[10px] text-neutral-600 pt-0.5">
                          <span>Karat: <strong>18K Rose Gold</strong></span>
                          <span className="text-emerald-700 font-black text-xs">₹55,607</span>
                        </div>
                        <div className="w-full mt-1.5 py-1.5 bg-black text-white rounded-lg text-[10px] font-bold text-center shadow-sm">
                          Buy Online / Book Showroom Visit
                        </div>
                      </div>

                    </div>
                  )}

                  {/* ── SCENARIO 2: Text Inquiries ─────── */}
                  {activeTab === 'text' && (
                    <div className="py-2.5 space-y-2 font-sans text-[11px] animate-in fade-in duration-300">
                      
                      <div className="bg-[#d9fdd3] text-neutral-800 p-2.5 rounded-2xl rounded-tr-xs max-w-[82%] ml-auto border border-[#b7e9b0] shadow-sm">
                        <p>Show me bridal choker necklace sets under ₹5 Lakhs</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[8px] text-neutral-500">11:15 AM</span>
                          <CheckCheck className="w-3 h-3 text-emerald-600" />
                        </div>
                      </div>

                      <div className="bg-white text-neutral-900 p-2.5 rounded-2xl rounded-tl-xs max-w-[92%] border border-neutral-250 shadow-sm space-y-1.5">
                        <p className="font-bold text-neutral-800 text-[10px]">💎 Top Showroom Matching Picks:</p>
                        <div className="border border-neutral-200 rounded-xl p-2 bg-neutral-50 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-neutral-900 text-[11px]">22K Gold Bridal Choker Haar</p>
                            <p className="text-[9px] text-neutral-500">Weight: 42.5g • Making: 12%</p>
                          </div>
                          <span className="font-black text-neutral-900 text-xs">₹4,85,900</span>
                        </div>
                        <div className="w-full mt-1 py-1.5 bg-black text-white rounded-lg text-[10px] font-bold text-center">
                          View High-Res Video & Certificate
                        </div>
                      </div>

                    </div>
                  )}

                  {/* ── SCENARIO 3: Live Metal Rate ─────── */}
                  {activeTab === 'pricing' && (
                    <div className="py-2.5 space-y-2 font-sans text-[11px] animate-in fade-in duration-300">
                      
                      <div className="bg-white text-neutral-900 p-2.5 rounded-2xl rounded-tl-xs max-w-[92%] border border-neutral-250 shadow-sm space-y-1.5">
                        <div className="flex items-center gap-1.5 text-amber-700 font-bold text-[10px]">
                          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>Live Daily Metal Rate Sync</span>
                        </div>
                        <p className="text-[10px] text-neutral-600">Today&apos;s 24K Gold: <strong>₹7,850/g</strong> | Silver: <strong>₹92/g</strong></p>
                        <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-200/70 text-[10px] space-y-1">
                          <p className="font-bold text-amber-950">22K Traditional Jhumka (18.2g)</p>
                          <p className="text-neutral-600">Formula: (18.2g × ₹7,195) + 12% Making</p>
                          <p className="font-extrabold text-amber-900 text-xs">Auto-Calculated: ₹1,46,650</p>
                        </div>
                      </div>

                      <div className="bg-[#d9fdd3] text-neutral-800 p-2 rounded-2xl rounded-tr-xs max-w-[80%] ml-auto border border-[#b7e9b0] shadow-sm">
                        <p className="text-[10px]">Can I book with 10% advance deposit?</p>
                      </div>

                    </div>
                  )}

                  {/* WhatsApp Chat Input Bar */}
                  <div className="mt-2 pt-2 border-t border-neutral-200 flex items-center gap-2">
                    <div className="flex-1 bg-white border border-neutral-300 text-neutral-500 px-3 py-1.5 rounded-full text-[10px] flex items-center justify-between">
                      <span>Type message or send photo...</span>
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

        </div>

        {/* ── Metric Highlights Bar ─────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-16 pt-8 border-t border-neutral-200">
          <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-sm text-center sm:text-left">
            <p className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">3.4x</p>
            <p className="text-xs sm:text-sm font-semibold text-neutral-500 mt-1">Average Conversion Lift</p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-sm text-center sm:text-left">
            <p className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">&lt; 3 Sec</p>
            <p className="text-xs sm:text-sm font-semibold text-neutral-500 mt-1">Vision AI Search Speed</p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-sm text-center sm:text-left">
            <p className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">24/7</p>
            <p className="text-xs sm:text-sm font-semibold text-neutral-500 mt-1">Midnight Shoppers Captured</p>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-neutral-200 shadow-sm text-center sm:text-left">
            <p className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight">100%</p>
            <p className="text-xs sm:text-sm font-semibold text-neutral-500 mt-1">Isolated Brand Vaults</p>
          </div>
        </div>

        {/* ── Trusted Showrooms Auto-Scrolling Marquee ─────── */}
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden py-8 border-y border-neutral-200 bg-white/50 backdrop-blur-md mt-16">
          <p className="text-[11px] uppercase tracking-widest text-center text-neutral-400 font-extrabold mb-5">
            EMPOWERING LUXURY JEWELRY SHOWROOMS ACROSS INDIA & GLOBALLY
          </p>
          <div className="relative flex w-full overflow-x-hidden">
            <div className="flex gap-16 whitespace-nowrap animate-marquee">
              {['Zaveri Bazaar Jewels', 'Royal Diamonds Surat', 'Jaipur Heritage Kundan', 'Heritage Polki Delhi', 'Kalyan Diamond Studio', 'Malabar Luxury Showroom', 'Tanishq Vault Partners', 'CaratLane Matchers'].map((brand, i) => (
                <span key={i} className="text-sm font-black tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors uppercase font-mono flex items-center gap-2">
                  <Gem className="w-3.5 h-3.5 text-neutral-300" />
                  {brand}
                </span>
              ))}
              {/* Duplicate for seamless infinite loop */}
              {['Zaveri Bazaar Jewels', 'Royal Diamonds Surat', 'Jaipur Heritage Kundan', 'Heritage Polki Delhi', 'Kalyan Diamond Studio', 'Malabar Luxury Showroom', 'Tanishq Vault Partners', 'CaratLane Matchers'].map((brand, i) => (
                <span key={`dup-${i}`} className="text-sm font-black tracking-widest text-neutral-400 hover:text-neutral-900 transition-colors uppercase font-mono flex items-center gap-2">
                  <Gem className="w-3.5 h-3.5 text-neutral-300" />
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Feature Bento Grid Section ─────── */}
        <section id="features" className="mt-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-200/70 text-neutral-800 text-xs font-extrabold uppercase tracking-wider mb-3">
              Power Features
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight">
              Engineered Specifically For High-Ticket Jewelry Retail.
            </h2>
            <p className="text-neutral-600 text-base sm:text-lg mt-3">
              Generic chatbots fail on carat weights, gemstone identification, and dynamic metal pricing. JewelBot is custom-trained on fine jewelry vision.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1: Large Card */}
            <div className="md:col-span-2 p-8 rounded-3xl bg-white border border-neutral-250 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center text-white shadow-md">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-neutral-900">Multimodal Gemini 3.6 Vision AI</h3>
              <p className="text-neutral-600 leading-relaxed text-sm sm:text-base">
                When a customer sends an Instagram screenshot or Pinterest photo, our AI analyzes jewelry category (Jhumka, Choker, Solitaire Ring, Kada), metal color, gemstone cuts, and matches them to your in-stock catalog with 90%+ accuracy.
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-lg bg-neutral-100 text-neutral-700 text-xs font-bold border border-neutral-200">Instagram Screenshot Matcher</span>
                <span className="px-3 py-1 rounded-lg bg-neutral-100 text-neutral-700 text-xs font-bold border border-neutral-200">Gemstone & Metal Detection</span>
                <span className="px-3 py-1 rounded-lg bg-neutral-100 text-neutral-700 text-xs font-bold border border-neutral-200">Multi-Model Failover</span>
              </div>
            </div>

            {/* Feature 2: Rate Engine */}
            <div className="p-8 rounded-3xl bg-white border border-neutral-250 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700 shadow-sm">
                <Flame className="w-6 h-6 fill-amber-500" />
              </div>
              <h3 className="text-2xl font-black text-neutral-900">Live Metal Rate Engine</h3>
              <p className="text-neutral-600 leading-relaxed text-sm">
                Set today&apos;s 24K Gold and Silver rate once in the portal. All 22K, 18K, and 14K weighted items instantly recalculate prices including making charges.
              </p>
              <div className="pt-2">
                <span className="px-3 py-1 rounded-lg bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200">Zero Price Discrepancies</span>
              </div>
            </div>

            {/* Feature 3: Broadcast Campaigns */}
            <div className="p-8 rounded-3xl bg-white border border-neutral-250 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-700 shadow-sm">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-neutral-900">Targeted Broadcast Campaigns</h3>
              <p className="text-neutral-600 leading-relaxed text-sm">
                Send festival promotions (Diwali, Akshaya Tritiya, Wedding Season) and 0% making charge offers with rich Cloudinary CDN image banners to past leads.
              </p>
            </div>

            {/* Feature 4: Lead CRM */}
            <div className="p-8 rounded-3xl bg-white border border-neutral-250 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-700 shadow-sm">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-neutral-900">VIP Lead CRM & Tracking</h3>
              <p className="text-neutral-600 leading-relaxed text-sm">
                Every customer who chats is automatically captured in your CRM with phone number, name, message count, and last interaction timestamp.
              </p>
            </div>

            {/* Feature 5: Multi-Tenant Isolation */}
            <div className="p-8 rounded-3xl bg-white border border-neutral-250 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-neutral-900 flex items-center justify-center text-white shadow-sm">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-neutral-900">Strict Multi-Tenant Security</h3>
              <p className="text-neutral-600 leading-relaxed text-sm">
                Each brand&apos;s vault, inventory prices, customer leads, and Meta WABA IDs are 100% separated and never shared with other showrooms.
              </p>
            </div>

          </div>
        </section>

        {/* ── Interactive ROI / Revenue Calculator ─────── */}
        <section id="calculator" className="mt-28 p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-black text-white border border-neutral-800 shadow-2xl relative overflow-hidden">
          <div className="max-w-4xl mx-auto space-y-8 relative z-10">
            
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-800 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Revenue Calculator</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Calculate Your Monthly Revenue Boost</h2>
              <p className="text-neutral-400 text-sm sm:text-base max-w-xl mx-auto">
                See how much revenue your showroom is leaving on the table by not answering WhatsApp inquiries instantly 24/7.
              </p>
            </div>

            {/* Calculator Controls */}
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 backdrop-blur-xl">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-neutral-300">Average Daily WhatsApp Inquiries:</span>
                  <span className="text-xl font-black text-amber-300">{dailyChats} chats / day</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="100" 
                  step="5"
                  value={dailyChats} 
                  onChange={(e) => setDailyChats(Number(e.target.value))}
                  className="w-full h-2.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <div className="flex justify-between text-[11px] text-neutral-500 font-bold">
                  <span>5 chats/day</span>
                  <span>50 chats/day</span>
                  <span>100 chats/day</span>
                </div>
              </div>

              {/* Calculated Outputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-800">
                <div className="p-5 rounded-xl bg-black/60 border border-neutral-800">
                  <p className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Estimated Extra Monthly Revenue</p>
                  <p className="text-3xl sm:text-4xl font-black text-emerald-400 mt-1">
                    +₹{monthlyExtraRevenue.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-1">Based on 8% instant closure rate at ₹{avgOrderValue.toLocaleString('en-IN')} AOV</p>
                </div>

                <div className="p-5 rounded-xl bg-black/60 border border-neutral-800">
                  <p className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider">Staff Manual Chat Hours Saved</p>
                  <p className="text-3xl sm:text-4xl font-black text-amber-300 mt-1">
                    ~{hoursSavedPerMonth} Hours
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-1">Automated midnight responses and instant photo catalog search</p>
                </div>
              </div>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-black font-extrabold rounded-xl shadow-lg hover:bg-neutral-200 transition-all hover:scale-[1.02]"
                >
                  <span>Start Capturing This Revenue Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>

          </div>
        </section>

        {/* ── 3-Step "How It Works" Section ─────── */}
        <section id="how-it-works" className="mt-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-200/70 text-neutral-800 text-xs font-extrabold uppercase tracking-wider mb-3">
              Fast Onboarding
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight">
              Live in 5 Minutes. Zero Tech Headaches.
            </h2>
            <p className="text-neutral-600 text-base sm:text-lg mt-3">
              We connect directly to your official WhatsApp Business number via Meta Cloud API.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 1 */}
            <div className="p-8 rounded-3xl bg-white border border-neutral-250 shadow-sm relative space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-black text-white font-black text-lg flex items-center justify-center shadow-md">
                1
              </div>
              <h3 className="text-xl font-bold text-neutral-900">Connect Meta WhatsApp ID</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Enter your Phone Number ID and WABA ID in our portal. Our system auto-subscribes your webhook in 1 second.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl bg-white border border-neutral-250 shadow-sm relative space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-black text-white font-black text-lg flex items-center justify-center shadow-md">
                2
              </div>
              <h3 className="text-xl font-bold text-neutral-900">Upload Your Vault Catalog</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Add jewelry items individually or import 100+ products instantly via CSV/Excel with weights, karats, and Cloudinary photos.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl bg-white border border-neutral-250 shadow-sm relative space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-black text-white font-black text-lg flex items-center justify-center shadow-md">
                3
              </div>
              <h3 className="text-xl font-bold text-neutral-900">AI Sells on Autopilot</h3>
              <p className="text-neutral-600 text-sm leading-relaxed">
                Customers send design screenshots or chat with questions. AI recognizes jewelry, quotes live prices, and books sales 24/7.
              </p>
            </div>

          </div>
        </section>

        {/* ── Real Customer Testimonials ─────── */}
        <section className="mt-28">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-200/70 text-neutral-800 text-xs font-extrabold uppercase tracking-wider mb-3">
              Showroom Testimonials
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight">
              Loved by Top Jewelers Across India
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="p-8 rounded-3xl bg-white border border-neutral-250 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400">
                  {'★★★★★'.split('').map((s, i) => <span key={i} className="text-lg">{s}</span>)}
                </div>
                <p className="text-neutral-700 text-sm leading-relaxed italic">
                  &ldquo;We used to miss 20–30 NRI customer queries at night. JewelBot alone closed ₹18 Lakhs worth of bridal orders last month while our showroom was closed.&rdquo;
                </p>
              </div>
              <div className="pt-4 border-t border-neutral-100 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center text-xs">
                  RM
                </div>
                <div>
                  <p className="font-bold text-neutral-900 text-sm">Rajesh Mehta</p>
                  <p className="text-xs text-neutral-500">Zaveri Bazaar, Mumbai</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-neutral-250 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400">
                  {'★★★★★'.split('').map((s, i) => <span key={i} className="text-lg">{s}</span>)}
                </div>
                <p className="text-neutral-700 text-sm leading-relaxed italic">
                  &ldquo;Customers send screenshots of celebrity jewelry from Pinterest. JewelBot instantly identifies the Kundan work and shows matching pieces from our vault.&rdquo;
                </p>
              </div>
              <div className="pt-4 border-t border-neutral-100 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center text-xs">
                  PS
                </div>
                <div>
                  <p className="font-bold text-neutral-900 text-sm">Pooja Singhania</p>
                  <p className="text-xs text-neutral-500">Jaipur Heritage Jewels</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-neutral-250 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex text-amber-400">
                  {'★★★★★'.split('').map((s, i) => <span key={i} className="text-lg">{s}</span>)}
                </div>
                <p className="text-neutral-700 text-sm leading-relaxed italic">
                  &ldquo;The live metal rate auto-calculation is a lifesaver. Changing gold price once in the morning automatically updates all 400+ diamond ring prices on WhatsApp.&rdquo;
                </p>
              </div>
              <div className="pt-4 border-t border-neutral-100 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-neutral-900 text-white font-bold flex items-center justify-center text-xs">
                  VS
                </div>
                <div>
                  <p className="font-bold text-neutral-900 text-sm">Vikram Soni</p>
                  <p className="text-xs text-neutral-500">Surat Diamond Hub</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── FAQ Accordion Section ─────── */}
        <section id="faq" className="mt-28 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-200/70 text-neutral-800 text-xs font-extrabold uppercase tracking-wider mb-3">
              Common Inquiries
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "How does the AI detect jewelry from photos or Instagram screenshots?",
                a: "JewelBot uses Google's latest Gemini 3.6 Multimodal Vision model trained on jewelry attributes (karat purity, gemstones, prong settings, floral/antique styling). It ignores background elements, model hands, and Instagram UI buttons to match the exact piece in your catalog."
              },
              {
                q: "Can other jewelry showrooms see my catalog or customer leads?",
                a: "No, never. Our architecture uses strict Multi-Tenant PostgreSQL isolation. Your products, prices, leads, and Meta WhatsApp tokens are completely isolated to your shop ID and cannot be accessed by any other account."
              },
              {
                q: "How does the daily Gold & Silver rate calculation work?",
                a: "Whenever you update the 24K Gold or Silver rate in your dashboard, our engine automatically recalculates the live price of every weighted item based on its Karat purity (22K, 18K, 14K) and your custom making charge percentage."
              },
              {
                q: "Do I need a new WhatsApp number or can I use my existing showroom number?",
                a: "You can use any phone number registered with Meta WhatsApp Cloud API. We support both new numbers and existing official business phone numbers with green badge verification."
              },
              {
                q: "Can I send bulk festival broadcasts to all my past customers?",
                a: "Yes! Our Broadcast Campaign engine allows you to send high-res promotional photo messages and offers directly to thousands of registered CRM leads in a single click."
              }
            ].map((faq, idx) => (
              <div 
                key={idx} 
                className="border border-neutral-250 bg-white rounded-2xl overflow-hidden shadow-sm transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-6 font-bold text-neutral-900 text-base sm:text-lg flex justify-between items-center gap-4 cursor-pointer hover:bg-neutral-50/50"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-neutral-500 transition-transform shrink-0 ${openFaq === idx ? 'rotate-180 text-black' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-neutral-600 text-sm sm:text-base leading-relaxed animate-in fade-in duration-200 border-t border-neutral-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── High-Converting Bottom CTA Banner ─────── */}
        <section className="mt-28 p-10 sm:p-16 rounded-3xl bg-black text-white text-center space-y-6 shadow-2xl relative overflow-hidden border border-neutral-800">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Ready to Put Your Jewelry Showroom on Autopilot?
            </h2>
            <p className="text-neutral-400 text-base sm:text-lg">
              Join 120+ leading jewelry brands closing high-ticket sales automatically on WhatsApp 24/7.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-extrabold text-black bg-white rounded-xl shadow-xl hover:bg-neutral-200 hover:scale-[1.03] transition-all cursor-pointer w-full sm:w-auto"
              >
                <Rocket className="w-5 h-5" />
                <span>Launch Your Showroom Portal</span>
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── Luxury Footer ─────── */}
      <footer className="border-t border-neutral-200 bg-white relative z-10 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-black rounded-xl flex items-center justify-center text-white shadow-md">
                <Gem className="w-4 h-4" />
              </div>
              <span className="font-black text-lg text-neutral-900">
                JewelBot<span className="text-neutral-500 text-xs">.AI</span>
              </span>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 text-xs font-semibold text-neutral-600">
              <a href="#features" className="hover:text-black transition-colors">Features</a>
              <a href="#demo" className="hover:text-black transition-colors">Interactive Demo</a>
              <a href="#calculator" className="hover:text-black transition-colors">ROI Calculator</a>
              <a href="#faq" className="hover:text-black transition-colors">FAQ</a>
              <Link href="/login" className="hover:text-black transition-colors">Owner Login</Link>
            </div>

            <p className="text-xs text-neutral-400">
              © {new Date().getFullYear()} JewelBot.AI • All Rights Reserved.
            </p>

          </div>
        </div>
      </footer>

    </div>
  );
}
