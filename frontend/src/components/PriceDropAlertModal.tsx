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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-neutral-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-black rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-200">
          <div className="p-3 bg-black rounded-xl text-white font-extrabold shadow-md">
            <TrendingDown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-neutral-900 flex items-center gap-2">
              <span>Gold Rate Price Drop Alert</span>
              <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 text-[10px] uppercase font-bold border border-neutral-200">
                AI Auto Wishlist
              </span>
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">Broadcast price-drop alerts directly to customer WhatsApp leads.</p>
          </div>
        </div>

        {result ? (
          <div className="space-y-4 text-center py-4">
            <div className={`p-4 rounded-2xl border ${result.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
              {result.success ? (
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
              ) : (
                <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-2" />
              )}
              <h4 className="font-extrabold text-base mb-1">{result.success ? 'WhatsApp Alert Sent Successfully! 🎉' : 'Broadcast Failed'}</h4>
              <p className="text-xs opacity-90">{result.message}</p>
              {result.isSimulated && (
                <p className="text-[10px] text-amber-800 font-semibold mt-2 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  ⚡ Simulated Mode: Add Meta API Phone ID & Access Token in Bot Settings for live automated WhatsApp delivery!
                </p>
              )}
            </div>

            <button
              onClick={() => {
                setResult(null);
                onClose();
              }}
              className="w-full py-3 bg-black hover:bg-neutral-800 text-white font-extrabold rounded-xl shadow-md transition-all text-xs cursor-pointer"
            >
              Done & Return to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Input Rate Drop Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider block mb-1.5">
                  Previous Gold Rate (₹/g)
                </label>
                <input
                  type="number"
                  value={oldRate}
                  onChange={(e) => setOldRate(Number(e.target.value))}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
                  placeholder="14250"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider block mb-1.5">
                  New Gold Rate (₹/g)
                </label>
                <input
                  type="number"
                  value={newRate}
                  onChange={(e) => setNewRate(Number(e.target.value))}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 focus:outline-none focus:border-black"
                  placeholder="13750"
                />
              </div>
            </div>

            {/* Calculated Drop Badge */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-700">Calculated Price Drop:</span>
              <span className="text-sm font-extrabold text-emerald-700 flex items-center gap-1">
                <TrendingDown className="w-4 h-4" />
                ₹{dropAmount.toLocaleString('en-IN')}/gram OFF
              </span>
            </div>

            {/* Custom Offer Note */}
            <div>
              <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wider block mb-1.5">
                Special Offer / Note (Optional)
              </label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black"
                placeholder="e.g. Extra 2% off on Making Charges today only!"
              />
            </div>

            {/* Live Message Preview Box */}
            <div>
              <label className="text-[11px] font-bold text-neutral-800 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-neutral-700" />
                Live WhatsApp Message Preview
              </label>
              <div className="bg-[#efeae2] border border-neutral-200 rounded-xl p-3.5 text-[11px] text-neutral-800 font-mono space-y-2 relative shadow-inner">
                <div className="flex items-center justify-between text-[10px] text-emerald-800 font-bold pb-2 border-b border-neutral-300">
                  <span>📱 WhatsApp Broadcast Message</span>
                  <span>Instant Delivery</span>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed text-neutral-700">
                  {`🚨 *GOLD RATE PRICE DROP ALERT!* 📉\n\nNamaste! Aaj Jewelry Market me Gold Rate Sasta Hua hai!\n\n✨ *Previous Gold Rate:* ₹${oldRate.toLocaleString('en-IN')}/g\n⚡ *Today's New Rate:* ₹${newRate.toLocaleString('en-IN')}/g\n📉 *Price Drop:* ₹${dropAmount.toLocaleString('en-IN')}/gram OFF!\n\nAapki pasandida Gold Jewelry par aaj ₹2,500 - ₹10,000 tak ki bachat ho rahi hai. Offers valid for TODAY only!\n\n📢 *Offer:* ${customNote}`}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-black font-extrabold rounded-xl text-xs transition-colors border border-neutral-200 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSendBroadcast}
                disabled={isSending || dropAmount <= 0}
                className="flex-[2] py-3 bg-black hover:bg-neutral-800 text-white font-extrabold rounded-xl shadow-md transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Broadcasting Alert...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-white fill-white" />
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
