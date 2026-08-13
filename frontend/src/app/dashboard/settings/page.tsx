"use client";

import { useState, useEffect } from "react";
import { Settings, Save, CheckCircle2, AlertCircle, MessageSquare, MapPin, Tag, Phone, Store, Sparkles, RefreshCw } from "lucide-react";
import { getShopSettings, updateShopSettings } from "@/app/actions/settings";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    custom_greeting: "",
    store_address: "",
    promo_banner: "",
    meta_phone_number_id: "",
  });

  useEffect(() => {
    async function loadSettings() {
      const res = await getShopSettings();
      if (res.success && res.shop) {
        setFormData({
          name: res.shop.name || "",
          custom_greeting: res.shop.custom_greeting || "",
          store_address: res.shop.store_address || "",
          promo_banner: res.shop.promo_banner || "",
          meta_phone_number_id: res.shop.meta_phone_number_id || "",
        });
      } else {
        setStatus({ type: "error", message: res.error || "Failed to load settings" });
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    const res = await updateShopSettings(formData);
    if (res.success) {
      setStatus({ type: "success", message: res.message || "Settings updated successfully!" });
    } else {
      setStatus({ type: "error", message: res.error || "Failed to update settings" });
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-neutral-900">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <p className="text-sm font-semibold text-neutral-500">Loading Shop Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-neutral-100 rounded-xl border border-neutral-250 text-neutral-800">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Bot & Store Settings</h1>
            <p className="text-sm text-neutral-500">Customize your WhatsApp Bot greeting, store address, and special discount offers</p>
          </div>
        </div>
      </div>

      {/* Alert Status */}
      {status && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 ${
          status.type === "success" 
            ? "bg-emerald-50 border border-emerald-200 text-emerald-800" 
            : "bg-rose-50 border border-rose-200 text-rose-800"
        }`}>
          {status.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span className="text-sm font-semibold">{status.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form Settings */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Shop Profile */}
          <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-neutral-800" />
              Shop Identity
            </h2>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Shop / Brand Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-neutral-900 text-sm focus:border-black focus:outline-none"
                placeholder="e.g. Royal Kundan Jewelers"
                required
              />
            </div>
          </div>

          {/* Section 2: Custom WhatsApp Greeting & Store Address */}
          <div className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-neutral-805" />
              WhatsApp Bot Persona & Greeting
            </h2>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Custom Welcome Message</label>
              <textarea
                rows={3}
                value={formData.custom_greeting}
                onChange={(e) => setFormData({ ...formData, custom_greeting: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-neutral-900 text-sm focus:border-black focus:outline-none resize-none"
                placeholder="e.g. Welcome to Royal Jewelers! 💎 Send us a photo of any ring or necklace to find it in our catalog."
              />
              <p className="text-[11px] text-neutral-500 mt-1">This greeting is sent automatically when a new customer sends their first WhatsApp message.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-neutral-800" />
                Physical Store Address & Google Maps Link
              </label>
              <textarea
                rows={2}
                value={formData.store_address}
                onChange={(e) => setFormData({ ...formData, store_address: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-neutral-900 text-sm focus:border-black focus:outline-none resize-none"
                placeholder="e.g. Shop 12, Zaveri Bazaar, Mumbai. Map: https://maps.google.com/..."
              />
              <p className="text-[11px] text-neutral-500 mt-1">Customers can ask for your showroom location or store hours.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-neutral-805" />
                Special Festival Offer / Discount Banner (Optional)
              </label>
              <input
                type="text"
                value={formData.promo_banner}
                onChange={(e) => setFormData({ ...formData, promo_banner: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-neutral-300 text-neutral-900 text-sm focus:border-black focus:outline-none"
                placeholder="e.g. FESTIVE2026: Get 10% OFF on Making Charges this week! 🎁"
              />
              <p className="text-[11px] text-neutral-500 mt-1">If filled, this banner will automatically append to product search WhatsApp replies.</p>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white font-extrabold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>{saving ? "Saving Settings..." : "Save Bot & Store Settings"}</span>
          </button>

        </form>

        {/* Right Column: Real-Time WhatsApp Live Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm">
            <h3 className="text-sm font-bold text-neutral-900 mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neutral-800" />
              Live WhatsApp Bot Preview
            </h3>
            <p className="text-xs text-neutral-500 mb-4">See how your custom greeting & store info will appear to customers on WhatsApp</p>

            {/* Phone Screen Container */}
            <div className="bg-[#efeae2] rounded-3xl p-3 border border-neutral-200 text-xs shadow-md font-sans space-y-3">
              
              {/* WhatsApp Header */}
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-200">
                <div className="h-7 w-7 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xs">
                  <Store className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-neutral-900 text-xs truncate block">{formData.name || "Your Jewelry Store"}</span>
                  <span className="text-[9px] text-emerald-600">Online</span>
                </div>
              </div>

              {/* Chat Message Bubble 1: Welcome Greeting */}
              <div className="bg-white text-neutral-800 p-2.5 rounded-2xl rounded-tl-xs border border-neutral-200 shadow-sm space-y-1">
                <p className="text-xs font-semibold text-neutral-800">👋 Welcome Message:</p>
                <p className="text-[11px] leading-relaxed">
                  {formData.custom_greeting || `👋 Hello! Welcome to *${formData.name || 'our shop'}*. Send us a photo of any jewelry design, and our AI will find it in our catalog! ✨`}
                </p>
                <span className="text-[9px] text-neutral-500 block text-right">10:30 AM</span>
              </div>

              {/* Chat Message Bubble 2: Store Address */}
              {formData.store_address && (
                <div className="bg-white text-neutral-850 p-2.5 rounded-2xl rounded-tl-xs border border-neutral-250 shadow-sm space-y-1">
                  <p className="text-xs font-semibold text-neutral-850">📍 Showroom Location:</p>
                  <p className="text-[11px] leading-relaxed text-neutral-700">{formData.store_address}</p>
                </div>
              )}

              {/* Chat Message Bubble 3: Promo Offer Banner */}
              {formData.promo_banner && (
                <div className="bg-neutral-100 text-neutral-800 p-2.5 rounded-xl border border-neutral-250 text-[10px] font-bold shadow-sm">
                  🎁 {formData.promo_banner}
                </div>
              )}

              {/* System Mandatory Footer (Locked & Protected) */}
              <div className="bg-white text-neutral-800 p-2.5 rounded-xl border border-neutral-200 shadow-sm text-[10px] space-y-1">
                <p className="font-semibold text-emerald-700">📸 Send a photo or type what you are looking for!</p>
                <p className="text-neutral-500">ℹ️ Daily Limit: 0/5 used today.</p>
                <span className="text-[9px] text-emerald-800 font-bold block pt-1 border-t border-neutral-200">🔒 System Mandate (API Cost Protection)</span>
              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
