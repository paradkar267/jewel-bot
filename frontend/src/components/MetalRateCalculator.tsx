"use client";

import { useState, useEffect } from "react";
import { Coins, RefreshCw, Calculator, Sparkles, CheckCircle2, AlertCircle, TrendingUp, RotateCcw, TrendingDown, Radio } from "lucide-react";
import { getShopMetalRates, updateShopMetalRatesAndRecalculate } from "@/app/actions/product";
import { fetchLiveIndiaMetalRates } from "@/app/actions/live-rates";
import PriceDropAlertModal from "./PriceDropAlertModal";

interface MetalRateCalculatorProps {
  onRecalculateDone?: () => void;
}

export default function MetalRateCalculator({ onRecalculateDone }: MetalRateCalculatorProps) {
  const [loading, setLoading] = useState(true);
  const [fetchingApi, setFetchingApi] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  // Dynamic Live Market Rates from API
  const [liveMarketRates, setLiveMarketRates] = useState({
    gold_24k: 14750,
    gold_22k: 13750,
    gold_18k: 11250,
    silver: 240,
    platinum: 4500,
    lastUpdatedTime: "",
    source: "Connecting to Live Bullion API..."
  });

  const [rates, setRates] = useState({
    gold_rate: 13750,
    silver_rate: 240,
    making_charge_percent: 12,
  });

  // Load shop saved rates & fetch live real-time market API rates
  const loadLiveApiRates = async () => {
    setFetchingApi(true);
    try {
      const liveRes = await fetchLiveIndiaMetalRates();
      if (liveRes.success && liveRes.rates) {
        setLiveMarketRates({
          gold_24k: liveRes.rates.gold_24k,
          gold_22k: liveRes.rates.gold_22k,
          gold_18k: liveRes.rates.gold_18k,
          silver: liveRes.rates.silver,
          platinum: liveRes.rates.platinum,
          lastUpdatedTime: liveRes.lastUpdatedTime || "",
          source: liveRes.source || "Live Bullion API"
        });
      }
    } catch (e) {
      console.error("Error fetching live rates API:", e);
    } finally {
      setFetchingApi(false);
    }
  };

  useEffect(() => {
    async function initData() {
      const [shopRes] = await Promise.all([
        getShopMetalRates(),
        loadLiveApiRates()
      ]);

      if (shopRes.success) {
        setRates({
          gold_rate: shopRes.gold_rate || 13750,
          silver_rate: shopRes.silver_rate || 240,
          making_charge_percent: (shopRes.making_charge_percent && shopRes.making_charge_percent <= 50) ? shopRes.making_charge_percent : 12,
        });
      }
      setLoading(false);
    }
    initData();
  }, []);

  const handleAutoFillLiveRates = () => {
    setRates({
      gold_rate: liveMarketRates.gold_22k,
      silver_rate: liveMarketRates.silver,
      making_charge_percent: rates.making_charge_percent || 12
    });
    setStatus({
      type: "success",
      message: `Auto-filled today's LIVE API Market Rates (₹${liveMarketRates.gold_22k.toLocaleString('en-IN')}/g for 22K Gold, ₹${liveMarketRates.silver.toLocaleString('en-IN')}/g Silver)! Click '1-Click Recalculate' to update catalog.`
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
      <div className="p-4 bg-white border border-neutral-200 rounded-2xl animate-pulse flex items-center justify-between">
        <div className="h-5 w-48 bg-neutral-100 rounded"></div>
        <div className="h-8 w-32 bg-neutral-100 rounded-lg"></div>
      </div>
    );
  }

  // Quick Live Formula Preview for 10g Gold Item
  const sample10gPrice = Math.round((10 * rates.gold_rate) * (1 + rates.making_charge_percent / 100));

  return (
    <>
      <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-5">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-black rounded-xl text-white font-bold shadow-sm">
              <Coins className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-neutral-900 flex items-center gap-2">
                Daily Gold & Silver Auto-Price Calculator
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-250 font-semibold flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                  Live API Connected
                </span>
              </h2>
              <p className="text-xs text-neutral-500">Real-time live bullion rates auto-syncing from financial market feeds</p>
            </div>
          </div>

          {/* Live Calculation Badge */}
          <div className="bg-neutral-50 border border-neutral-250 rounded-xl px-3 py-1.5 text-xs text-neutral-800 font-semibold flex items-center gap-2 self-start sm:self-auto">
            <Calculator className="w-4 h-4 text-neutral-700" />
            <span>10g 22K Gold Preview: <strong className="text-neutral-950 font-extrabold">₹{sample10gPrice.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>

        {/* Real-Time Live Market Reference Ticker (Dynamic API Feed) */}
        <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-extrabold text-neutral-800 tracking-wider">
                TODAY'S REAL-TIME LIVE INDIA MARKET RATES (₹/GRAM)
              </span>
              {liveMarketRates.lastUpdatedTime && (
                <span className="text-[10px] text-neutral-500 font-medium">
                  (Updated {liveMarketRates.lastUpdatedTime})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadLiveApiRates}
                disabled={fetchingApi}
                className="text-[10px] font-bold text-neutral-600 hover:text-black flex items-center gap-1 transition-colors bg-neutral-100 hover:bg-neutral-205 px-2 py-1 rounded-lg border border-neutral-250 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${fetchingApi ? 'animate-spin text-neutral-950' : ''}`} />
                <span>Refresh API</span>
              </button>

              <button
                type="button"
                onClick={handleAutoFillLiveRates}
                className="text-[11px] font-extrabold text-white bg-black hover:bg-neutral-800 flex items-center gap-1 transition-all px-3 py-1 rounded-lg shadow-sm font-sans cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 fill-white text-white" />
                <span>⚡ Auto-Fill Today's Live Rates</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-neutral-100/60 border border-neutral-250 text-center relative overflow-hidden group">
              <div className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider">🥇 24K Pure Gold</div>
              <div className="font-extrabold text-neutral-900 text-base mt-0.5">
                ₹{liveMarketRates.gold_24k.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-neutral-500">/g</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-100 border border-neutral-405 text-center ring-2 ring-neutral-400/30">
              <div className="text-[10px] text-neutral-900 font-extrabold uppercase tracking-wider">👑 22K Gold (916)</div>
              <div className="font-extrabold text-neutral-950 text-base mt-0.5">
                ₹{liveMarketRates.gold_22k.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-neutral-500">/g</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-100/60 border border-neutral-250 text-center">
              <div className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider">💎 18K Gold (750)</div>
              <div className="font-extrabold text-neutral-900 text-base mt-0.5">
                ₹{liveMarketRates.gold_18k.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-neutral-500">/g</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-100/60 border border-neutral-250 text-center">
              <div className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider">⚪ 925 Silver</div>
              <div className="font-extrabold text-neutral-900 text-base mt-0.5">
                ₹{liveMarketRates.silver.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-neutral-500">/g</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-100/60 border border-neutral-250 text-center col-span-2 sm:col-span-1">
              <div className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider">💠 Platinum</div>
              <div className="font-extrabold text-neutral-900 text-base mt-0.5">
                ₹{liveMarketRates.platinum.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-neutral-500">/g</span>
              </div>
            </div>
          </div>
        </div>

        {/* Input Rate Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* 22K/24K Gold Rate */}
          <div>
            <label className="block text-xs font-semibold text-neutral-850 mb-1 flex items-center justify-between">
              <span>🪙 Active Gold Rate (₹ / gram)</span>
              <span className="text-[10px] text-neutral-500 font-normal">(Live: ₹{liveMarketRates.gold_22k})</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs font-bold">₹</span>
              <input
                type="number"
                value={rates.gold_rate}
                onChange={(e) => setRates({ ...rates, gold_rate: Number(e.target.value) })}
                className="w-full pl-7 pr-3 py-2 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-sm font-extrabold focus:outline-none focus:border-black"
                placeholder="14021"
              />
            </div>
          </div>

          {/* Silver Rate */}
          <div>
            <label className="block text-xs font-semibold text-neutral-850 mb-1 flex items-center justify-between">
              <span>⚪ Active Silver Rate (₹ / gram)</span>
              <span className="text-[10px] text-neutral-550 font-normal">(Live: ₹{liveMarketRates.silver})</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs font-bold">₹</span>
              <input
                type="number"
                value={rates.silver_rate}
                onChange={(e) => setRates({ ...rates, silver_rate: Number(e.target.value) })}
                className="w-full pl-7 pr-3 py-2 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-sm font-bold focus:outline-none focus:border-black"
                placeholder="224"
              />
            </div>
          </div>

          {/* Making Charge % */}
          <div>
            <label className="block text-xs font-semibold text-neutral-850 mb-1 flex items-center justify-between">
              <span>🛠️ Default Making Charges (%)</span>
              <span className="text-[10px] text-neutral-550 font-normal">(Default: 12%)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={rates.making_charge_percent}
                onChange={(e) => setRates({ ...rates, making_charge_percent: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-sm font-bold focus:outline-none focus:border-black"
                placeholder="12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 text-xs font-bold">%</span>
            </div>
          </div>

        </div>

        {/* Alert Status */}
        {status && (
          <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
            status.type === "success" 
              ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}>
            {status.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{status.message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-1 border-t border-neutral-200">
          <button
            type="button"
            onClick={() => setIsAlertModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-50 border border-emerald-300 text-emerald-850 hover:bg-emerald-100 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <TrendingDown className="w-4 h-4 text-emerald-700" />
            <span>📉 Send Price Drop WhatsApp Alert to Customers</span>
          </button>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <button
              type="button"
              onClick={() => handleSaveAndRecalculate(false)}
              disabled={saving}
              className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-305 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Save Rates Only</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveAndRecalculate(true)}
              disabled={saving}
              className="px-5 py-2.5 bg-black text-white hover:bg-neutral-800 font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <Sparkles className="w-4 h-4 fill-white text-white" />}
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
