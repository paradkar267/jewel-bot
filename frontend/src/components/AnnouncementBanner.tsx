"use client";

import { useState, useEffect } from "react";
import { Megaphone, X } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  created_at: string;
}

export default function AnnouncementBanner({ announcements }: { announcements: Announcement[] }) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("dismissed_announcements");
      if (stored) {
        setDismissedIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error reading dismissed announcements:", e);
    }
  }, []);

  const handleDismiss = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try {
      localStorage.setItem("dismissed_announcements", JSON.stringify(updated));
    } catch (e) {
      console.error("Error saving dismissed announcement:", e);
    }
  };

  const visibleAnnouncements = announcements.filter(a => !dismissedIds.includes(a.id));

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="space-y-3">
      {visibleAnnouncements.map((a) => (
        <div
          key={a.id}
          className={`p-4 rounded-2xl border flex items-start justify-between gap-3 shadow-lg transition-all duration-300 relative group ${
            a.type === 'promo'
              ? 'bg-gradient-to-r from-purple-950/70 via-[#140f1a] to-purple-950/50 border-purple-500/40 text-purple-200'
              : a.type === 'alert'
              ? 'bg-gradient-to-r from-rose-950/70 via-[#1a0f12] to-rose-950/50 border-rose-500/40 text-rose-200'
              : 'bg-gradient-to-r from-amber-950/70 via-[#18150f] to-amber-950/50 border-amber-500/40 text-amber-200'
          }`}
        >
          <div className="flex items-start gap-3 flex-1 pr-6">
            <div className="p-2.5 rounded-xl bg-white/10 shrink-0 mt-0.5 shadow-sm">
              <Megaphone className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-white tracking-wider">
                  {a.type === 'promo' ? '🎁 Special Offer' : a.type === 'alert' ? '⚠️ Important Notice' : '📢 System Announcement'}
                </span>
                <span className="text-[10px] opacity-70">Platform Update</span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white mt-1.5">{a.title}</h3>
              <p className="text-xs opacity-90 mt-1 whitespace-pre-wrap leading-relaxed">{a.content}</p>
            </div>
          </div>

          {/* Dismiss/Close Button */}
          <button
            type="button"
            onClick={() => handleDismiss(a.id)}
            className="p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors shrink-0"
            title="Dismiss Announcement"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
