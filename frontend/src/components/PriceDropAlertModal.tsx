"use client";

import { useState } from 'react';
import { TrendingDown, Send, X, Sparkles, CheckCircle2, AlertCircle, Users, MessageSquare } from 'lucide-react';
import { triggerPriceDropWhatsAppBroadcast } from '@/app/actions/price-drop-alert';

interface PriceDropAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoldRate?: number;
}

export default function PriceDropAlertModal({ isOpen, onClose, currentGoldRate = 13750 }: PriceDropAlertModalProps) {
  const [oldRate, setOldRate] = useState<number>(currentGoldRate + 500);
  const [newRate, setNewRate] = useState<number>(currentGoldRate);
  const [customNote, setCustomNote] = useState<string>('Special Discount: Extra 2% off on Making Charges today only!');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; isSimulated?: boolean } | null>(null);

  if (!isOpen) return null;

  const dropAmount = Math.max(0, oldRate - newRate);

  const handleSendBroadcast = async () => {
    if (dropAmount <= 0) {
      alert("New rate must be lower than previous rate to trigger a price drop alert!");
      return;
    }

    setIsSending(true);
    setResult(null);

    try {
      const res = await triggerPriceDropWhatsAppBroadcast({
        dropAmountPerGram: dropAmount,
        oldRate,
        newRate,
        customNote
      });

      if (res.success) {
        setResult({
          success: true,
          message: res.message || `Alert successfully sent to ${res.totalRecipients} customer leads!`,
          isSimulated: (res as any).isSimulated
        });
      } else {
        setResult({
          success: false,
          message: res.error || "Failed to trigger broadcast"
        });
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: err.message || "An unexpected error occurred"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#111111] border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl text-black font-extrabold shadow-lg shadow-amber-500/20">
            <TrendingDown className="w-6 h-6 text-black" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <span>Gold Rate Price Drop Alert</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] uppercase font-bold border border-amber-500/30">
                AI Auto Wishlist
              </span>
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Broadcast price-drop alerts directly to customer WhatsApp leads.</p>
          </div>
        </div>

        {result ? (
          <div className="space-y-4 text-center py-4">
            <div className={`p-4 rounded-2xl border ${result.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
              {result.success ? (
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
              ) : (
                <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-2" />
              )}
              <h4 className="font-extrabold text-base mb-1">{result.success ? 'WhatsApp Alert Sent Successfully! 🎉' : 'Broadcast Failed'}</h4>
              <p className="text-xs opacity-90">{result.message}</p>
              {result.isSimulated && (
                <p className="text-[10px] text-amber-400 font-semibold mt-2 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                  ⚡ Simulated Mode: Add Meta API Phone ID & Access Token in Bot Settings for live automated WhatsApp delivery!
                </p>
              )}
            </div>

            <button
              onClick={() => {
                setResult(null);
                onClose();
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold rounded-xl shadow-lg hover:brightness-110 transition-all text-xs"
            >
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Input Rate Drop Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Previous Gold Rate (₹/g)
                </label>
                <input
                  type="number"
                  value={oldRate}
                  onChange={(e) => setOldRate(Number(e.target.value))}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  placeholder="14250"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  New Gold Rate (₹/g)
                </label>
                <input
                  type="number"
                  value={newRate}
                  onChange={(e) => setNewRate(Number(e.target.value))}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  placeholder="13750"
                />
              </div>
            </div>

            {/* Calculated Drop Badge */}
            <div className="p-3 bg-gradient-to-r from-emerald-950/40 via-[#141414] to-emerald-950/20 border border-emerald-500/30 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300">Calculated Price Drop:</span>
              <span className="text-sm font-extrabold text-emerald-400 flex items-center gap-1">
                <TrendingDown className="w-4 h-4" />
                ₹{dropAmount.toLocaleString('en-IN')}/gram OFF
              </span>
            </div>

            {/* Custom Offer Note */}
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                Special Offer / Note (Optional)
              </label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                placeholder="e.g. Extra 2% off on Making Charges today only!"
              />
            </div>

            {/* Live Message Preview Box */}
            <div>
              <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                Live WhatsApp Message Preview
              </label>
              <div className="bg-[#0b141a] border border-emerald-500/30 rounded-xl p-3.5 text-[11px] text-gray-200 font-mono space-y-2 relative shadow-inner">
                <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold pb-2 border-b border-white/10">
                  <span>📱 WhatsApp Broadcast Message</span>
                  <span>Instant Delivery</span>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed text-gray-300">
                  {`🚨 *GOLD RATE PRICE DROP ALERT!* 📉\n\nNamaste! Aaj Jewelry Market me Gold Rate Sasta Hua hai!\n\n✨ *Previous Gold Rate:* ₹${oldRate.toLocaleString('en-IN')}/g\n⚡ *Today's New Rate:* ₹${newRate.toLocaleString('en-IN')}/g\n📉 *Price Drop:* ₹${dropAmount.toLocaleString('en-IN')}/gram OFF!\n\nAapki pasandida Gold Jewelry par aaj ₹2,500 - ₹10,000 tak ki bachat ho rahi hai. Offers valid for TODAY only!\n\n📢 *Offer:* ${customNote}`}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 font-extrabold rounded-xl text-xs transition-colors border border-white/5"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSendBroadcast}
                disabled={isSending || dropAmount <= 0}
                className="flex-[2] py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:brightness-110 text-black font-extrabold rounded-xl shadow-lg shadow-amber-500/20 transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>Broadcasting Alert...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 fill-black" />
                    <span>🚀 Broadcast Price Drop Alert</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
