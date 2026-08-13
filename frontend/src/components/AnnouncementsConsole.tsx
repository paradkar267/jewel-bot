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
      <div className="lg:col-span-1 p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-4 self-start">
        <h2 className="text-lg font-extrabold text-neutral-900 flex items-center gap-2 pb-3 border-b border-neutral-200">
          <Plus className="w-5 h-5 text-neutral-900" />
          Broadcast New Announcement
        </h2>

        {status && (
          <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            status.type === "success" 
              ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}>
            {status.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{status.message}</span>
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Diwali Special Offer: 500 Free Broadcasts!"
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs font-semibold focus:outline-none focus:border-black"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Type / Category</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs font-semibold focus:outline-none focus:border-black cursor-pointer"
            >
              <option value="info">📢 General Announcement (Info)</option>
              <option value="promo">🎁 Special Offer / Promotion</option>
              <option value="alert">⚠️ System Maintenance / Alert</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">Content / Message</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Write announcement message that will appear on all shop owner dashboards..."
              className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs font-semibold focus:outline-none focus:border-black resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-black text-white hover:bg-neutral-800 font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4 fill-white text-white" />
            <span>{loading ? "Publishing..." : "Publish to All Shop Dashboards"}</span>
          </button>
        </form>
      </div>

      {/* Announcements List */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-lg font-extrabold text-neutral-900 flex items-center justify-between pb-2 border-b border-neutral-200">
          <span>Active Announcements ({announcements.length})</span>
          <span className="text-xs text-neutral-500 font-normal">Visible on all shop dashboards</span>
        </h2>

        {announcements.length === 0 ? (
          <div className="p-8 text-center bg-white border border-neutral-200 rounded-2xl text-neutral-500 text-sm shadow-sm">
            No active announcements found. Create your first announcement on the left!
          </div>
        ) : (
          announcements.map((a) => (
            <div
              key={a.id}
              className={`p-5 rounded-2xl border transition-all space-y-2 ${
                a.type === 'promo'
                  ? 'bg-purple-50/30 border-purple-200'
                  : a.type === 'alert'
                  ? 'bg-rose-50/30 border-rose-200'
                  : 'bg-neutral-50/50 border-neutral-250'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    a.type === 'promo'
                      ? 'bg-purple-50 text-purple-705 border border-purple-200'
                      : a.type === 'alert'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-neutral-100 text-neutral-800 border border-neutral-250'
                  }`}>
                    {a.type === 'promo' ? '🎁 Offer' : a.type === 'alert' ? '⚠️ Alert' : '📢 Notice'}
                  </span>
                  <span className="text-xs text-neutral-500">{new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                </div>

                <button
                  onClick={() => handleDelete(a.id)}
                  className="p-1.5 text-neutral-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors cursor-pointer"
                  title="Delete Announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-base font-extrabold text-neutral-900">{a.title}</h3>
              <p className="text-xs text-neutral-700 whitespace-pre-wrap leading-relaxed">{a.content}</p>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
