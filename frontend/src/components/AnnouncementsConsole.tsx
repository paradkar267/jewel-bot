"use client";

import { useState } from "react";
import { Megaphone, Plus, Trash2, Bell, Sparkles, CheckCircle2, AlertCircle, Info, Tag } from "lucide-react";
import { createAnnouncement, deleteAnnouncement } from "@/app/actions/admin-features";

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  type: string;
  is_active: boolean;
  created_at: string;
}

export default function AnnouncementsConsole({ initialAnnouncements }: { initialAnnouncements: AnnouncementItem[] }) {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("info");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    setStatus(null);

    const res = await createAnnouncement({ title, content, type });

    if (res.success && res.announcement) {
      setAnnouncements([
        {
          id: res.announcement.id,
          title: res.announcement.title,
          content: res.announcement.content,
          type: res.announcement.type,
          is_active: res.announcement.is_active,
          created_at: res.announcement.created_at.toISOString(),
        },
        ...announcements
      ]);
      setTitle("");
      setContent("");
      setStatus({ type: "success", message: "Announcement published successfully!" });
    } else {
      setStatus({ type: "error", message: res.error || "Failed to publish announcement" });
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;

    const res = await deleteAnnouncement(id);
    if (res.success) {
      setAnnouncements(announcements.filter(a => a.id !== id));
      setStatus({ type: "success", message: "Announcement deleted." });
    } else {
      setStatus({ type: "error", message: res.error || "Failed to delete" });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Create Form */}
      <div className="lg:col-span-1 p-6 rounded-2xl bg-gradient-to-b from-[#161616] to-[#0d0d0d] border border-amber-500/30 shadow-xl space-y-4 self-start">
        <h2 className="text-lg font-extrabold text-white flex items-center gap-2 pb-3 border-b border-white/10">
          <Plus className="w-5 h-5 text-amber-400" />
          Broadcast New Announcement
        </h2>

        {status && (
          <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            status.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}>
            {status.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{status.message}</span>
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Diwali Special Offer: 500 Free Broadcasts!"
              className="w-full px-3 py-2 bg-black/70 border border-white/10 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Type / Category</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 bg-black/70 border border-white/10 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
            >
              <option value="info">📢 General Announcement (Info)</option>
              <option value="promo">🎁 Special Offer / Promotion</option>
              <option value="alert">⚠️ System Maintenance / Alert</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">Content / Message</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Write announcement message that will appear on all shop owner dashboards..."
              className="w-full px-3 py-2 bg-black/70 border border-white/10 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold rounded-xl text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-black text-black" />
            <span>{loading ? "Publishing..." : "Publish to All Shop Dashboards"}</span>
          </button>
        </form>
      </div>

      {/* Announcements List */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-lg font-extrabold text-white flex items-center justify-between pb-2 border-b border-white/10">
          <span>Active Announcements ({announcements.length})</span>
          <span className="text-xs text-gray-400 font-normal">Visible on all shop dashboards</span>
        </h2>

        {announcements.length === 0 ? (
          <div className="p-8 text-center bg-[#111] border border-white/10 rounded-2xl text-gray-400 text-sm">
            No active announcements found. Create your first announcement on the left!
          </div>
        ) : (
          announcements.map((a) => (
            <div
              key={a.id}
              className={`p-5 rounded-2xl border transition-all space-y-2 ${
                a.type === 'promo'
                  ? 'bg-gradient-to-r from-purple-950/40 via-[#111] to-purple-950/20 border-purple-500/40'
                  : a.type === 'alert'
                  ? 'bg-gradient-to-r from-rose-950/40 via-[#111] to-rose-950/20 border-rose-500/40'
                  : 'bg-gradient-to-r from-amber-950/40 via-[#111] to-amber-950/20 border-amber-500/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    a.type === 'promo'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : a.type === 'alert'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {a.type === 'promo' ? '🎁 Offer' : a.type === 'alert' ? '⚠️ Alert' : '📢 Notice'}
                  </span>
                  <span className="text-xs text-gray-500">{new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                </div>

                <button
                  onClick={() => handleDelete(a.id)}
                  className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Delete Announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-base font-extrabold text-white">{a.title}</h3>
              <p className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">{a.content}</p>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
