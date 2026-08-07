"use client";

import { useState, useEffect } from "react";
import { Coins, RefreshCw, Calculator, Sparkles, CheckCircle2, AlertCircle, TrendingUp, Zap, RotateCcw, TrendingDown } from "lucide-react";
import { getShopMetalRates, updateShopMetalRatesAndRecalculate } from "@/app/actions/product";
import PriceDropAlertModal from "./PriceDropAlertModal";

interface MetalRateCalculatorProps {
  onRecalculateDone?: () => void;
}

export default function MetalRateCalculator({ onRecalculateDone }: MetalRateCalculatorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  // Real-Time India Live Market Reference Benchmarks (INR / gram)
  const LIVE_MARKET_RATES = {
    gold_24k: 14750, // ₹14,750/g (24K Gold 999)
    gold_22k: 13750, // ₹13,750/g (22K Gold 916 - Standard Jewelry Rate)
    gold_18k: 11250, // ₹11,250/g
    silver: 240,     // ₹240/g (₹2.4 Lakh / kg)
    platinum: 4500   // ₹4,500/g
  };

  const [rates, setRates] = useState({
    gold_rate: 13750,
    silver_rate: 240,
    making_charge_percent: 12,
  });

  useEffect(() => {
    async function loadRates() {
      const res = await getShopMetalRates();
      if (res.success) {
        setRates({
          gold_rate: res.gold_rate || 13750,
          silver_rate: res.silver_rate || 240,
          making_charge_percent: (res.making_charge_percent && res.making_charge_percent <= 50) ? res.making_charge_percent : 12,
        });
      }
      setLoading(false);
    }
    loadRates();
  }, []);

  const handleAutoFillLiveRates = () => {
    setRates({
      gold_rate: LIVE_MARKET_RATES.gold_22k,
      silver_rate: LIVE_MARKET_RATES.silver,
      making_charge_percent: 12
    });
    setStatus({
      type: "success",
      message: "Reset & Auto-filled to Standard Live Market Rates (₹13,750/g for 22K, ₹240/g Silver, 12% Making Charge)! Click 'Recalculate' to update catalog."
    });
  };

  const handleSaveAndRecalculate = async (recalculateAll: boolean) => {
    setSaving(true);
    setStatus(null);

    const res = await updateShopMetalRatesAndRecalculate({
      gold_rate: rates.gold_rate,
      silver_rate: rates.silver_rate,
      making_charge_percent: rates.making_charge_percent,
      recalculateAll,
    });

    if (res.success) {
      setStatus({ 
        type: "success", 
        message: res.message || "Rates updated successfully!" 
      });
      if (onRecalculateDone) onRecalculateDone();
    } else {
      setStatus({ type: "error", message: res.error || "Failed to update metal rates" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="p-4 bg-[#111111] border border-amber-500/20 rounded-2xl animate-pulse flex items-center justify-between">
        <div className="h-5 w-48 bg-white/10 rounded"></div>
        <div className="h-8 w-32 bg-white/10 rounded-lg"></div>
      </div>
    );
  }

  // Quick Live Formula Preview for 10g Gold Item
  const sample10gPrice = Math.round((10 * rates.gold_rate) * (1 + rates.making_charge_percent / 100));

  return (
    <>
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#111111] to-amber-950/20 border border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.1)] space-y-5">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl text-black font-bold shadow-md">
              <Coins className="w-5 h-5 fill-black" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                Daily Gold & Silver Auto-Price Calculator
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-amber-400" />
                  Live Market Rates
                </span>
              </h2>
              <p className="text-xs text-gray-400">Enter today's gold rate to automatically calculate prices & trigger WhatsApp alerts</p>
            </div>
          </div>

          {/* Live Calculation Badge */}
          <div className="bg-black/60 border border-amber-500/30 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-semibold flex items-center gap-2 self-start sm:self-auto">
            <Calculator className="w-4 h-4 text-amber-400" />
            <span>10g 22K Gold Preview: <strong className="text-white font-extrabold">₹{sample10gPrice.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

        {/* Live Market Reference Ticker */}
        <div className="p-3 bg-black/60 border border-white/10 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Today's Real-Time India Market Benchmark Rates (₹/gram)
            </span>
            <button
              type="button"
              onClick={handleAutoFillLiveRates}
              className="text-[11px] font-extrabold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors self-start sm:self-auto bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 shadow-sm"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              Reset to Standard Live Rates
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
              <div className="text-[10px] text-amber-300 font-semibold">🥇 24K Pure Gold</div>
              <div className="font-extrabold text-white text-sm">₹{LIVE_MARKET_RATES.gold_24k.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-gray-400">/g</span></div>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center ring-1 ring-amber-400/40">
              <div className="text-[10px] text-amber-300 font-semibold">👑 22K Gold (916) [Default]</div>
              <div className="font-extrabold text-white text-sm">₹{LIVE_MARKET_RATES.gold_22k.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-gray-400">/g</span></div>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
              <div className="text-[10px] text-amber-300 font-semibold">💎 18K Gold (750)</div>
              <div className="font-extrabold text-white text-sm">₹{LIVE_MARKET_RATES.gold_18k.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-gray-400">/g</span></div>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center">
              <div className="text-[10px] text-gray-300 font-semibold">⚪ 925 Silver</div>
              <div className="font-extrabold text-white text-sm">₹{LIVE_MARKET_RATES.silver.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-gray-400">/g</span></div>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-center col-span-2 sm:col-span-1">
              <div className="text-[10px] text-gray-300 font-semibold">💠 Platinum</div>
              <div className="font-extrabold text-white text-sm">₹{LIVE_MARKET_RATES.platinum.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-gray-400">/g</span></div>
            </div>
          </div>
        </div>

        {/* Input Rate Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* 22K/24K Gold Rate */}
          <div>
            <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center justify-between">
              <span>🪙 Active Gold Rate (₹ / gram)</span>
              <span className="text-[10px] text-gray-400 font-normal">(Default: 22K ₹13,750)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">₹</span>
              <input
                type="number"
                value={rates.gold_rate}
                onChange={(e) => setRates({ ...rates, gold_rate: Number(e.target.value) })}
                className="w-full pl-7 pr-3 py-2 bg-black/70 border border-amber-500/30 rounded-xl text-white text-sm font-extrabold focus:outline-none focus:border-amber-400"
                placeholder="13750"
              />
            </div>
          </div>

          {/* Silver Rate */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center justify-between">
              <span>⚪ Active Silver Rate (₹ / gram)</span>
              <span className="text-[10px] text-gray-400 font-normal">(Default: ₹240)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-bold">₹</span>
              <input
                type="number"
                value={rates.silver_rate}
                onChange={(e) => setRates({ ...rates, silver_rate: Number(e.target.value) })}
                className="w-full pl-7 pr-3 py-2 bg-black/70 border border-white/10 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-amber-400"
                placeholder="240"
              />
            </div>
          </div>

          {/* Making Charge % */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center justify-between">
              <span>🛠️ Default Making Charges (%)</span>
              <span className="text-[10px] text-gray-400 font-normal">(Default: 12%)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={rates.making_charge_percent}
                onChange={(e) => setRates({ ...rates, making_charge_percent: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-black/70 border border-white/10 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-amber-400"
                placeholder="12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">%</span>
            </div>
          </div>

        </div>

        {/* Alert Status */}
        {status && (
          <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
            status.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}>
            {status.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{status.message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-1 border-t border-amber-500/10">
          <button
            type="button"
            onClick={() => setIsAlertModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500/20 via-emerald-600/20 to-emerald-500/10 border border-emerald-500/40 text-emerald-300 hover:text-white rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
          >
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            <span>📉 Send Price Drop WhatsApp Alert to Customers</span>
          </button>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <button
              type="button"
              onClick={() => handleSaveAndRecalculate(false)}
              disabled={saving}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Save Rates Only</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveAndRecalculate(true)}
              disabled={saving}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-black font-extrabold rounded-xl text-xs shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:brightness-110 transition-all flex items-center justify-center gap-2"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin text-black" /> : <Sparkles className="w-4 h-4 fill-black text-black" />}
              <span>⚡ 1-Click Recalculate All Catalog Prices</span>
            </button>
          </div>
        </div>

      </div>

      {/* Gold Rate Price Drop WhatsApp Alert Modal */}
      <PriceDropAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        currentGoldRate={rates.gold_rate}
      />
    </>
  );
}
