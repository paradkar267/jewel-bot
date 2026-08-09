"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, Store, Gem, Users, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { exportMasterPlatformData } from "@/app/actions/admin-features";

export default function ExportConsole() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleDownload = async (reportType: 'shops' | 'products' | 'leads' | 'broadcasts', label: string) => {
    setDownloading(reportType);
    setStatus(null);

    try {
      const res = await exportMasterPlatformData(reportType);

      if (res.success && res.csvData && res.fileName) {
        // Trigger browser file download
        const blob = new Blob([res.csvData], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", res.fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setStatus({ type: "success", message: `${label} CSV downloaded successfully!` });
      } else {
        setStatus({ type: "error", message: res.error || `Failed to export ${label}` });
      }
    } catch (e: any) {
      setStatus({ type: "error", message: e.message || "Failed to download CSV" });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">

      {status && (
        <div className={`p-4 rounded-xl border text-xs font-bold flex items-center gap-2 ${
          status.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
            : "bg-rose-500/10 border-rose-500/30 text-rose-400"
        }`}>
          {status.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{status.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Report 1: Registered Shops Master */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-[#141414] to-[#0d0d0d] border border-amber-500/30 shadow-xl space-y-4 hover:border-amber-500/50 transition-all group">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-400">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Registered Showrooms Master CSV</h2>
              <p className="text-xs text-gray-400">Full directory of all registered shops, owner emails, WhatsApp numbers, Meta credentials status & inventory sizes.</p>
            </div>
          </div>

          <button
            onClick={() => handleDownload('shops', 'Registered Showrooms Report')}
            disabled={downloading === 'shops'}
            className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            {downloading === 'shops' ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Download className="w-4 h-4 fill-black text-black" />}
            <span>Export Shops Directory CSV</span>
          </button>
        </div>

        {/* Report 2: Full Products & Catalog Master */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-[#141414] to-[#0d0d0d] border border-amber-500/30 shadow-xl space-y-4 hover:border-amber-500/50 transition-all group">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-400">
              <Gem className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Platform Jewelry Catalog Master CSV</h2>
              <p className="text-xs text-gray-400">Complete itemized list of all products, metal types (22K, 18K), weights in grams, and calculated prices across all shops.</p>
            </div>
          </div>

          <button
            onClick={() => handleDownload('products', 'Jewelry Catalog Master Report')}
            disabled={downloading === 'products'}
            className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            {downloading === 'products' ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Download className="w-4 h-4 fill-black text-black" />}
            <span>Export Jewelry Products CSV</span>
          </button>
        </div>

        {/* Report 3: Customer Leads Master */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-[#141414] to-[#0d0d0d] border border-amber-500/30 shadow-xl space-y-4 hover:border-amber-500/50 transition-all group">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Customer Leads Directory CSV</h2>
              <p className="text-xs text-gray-400">Database of all WhatsApp customer leads captured by the AI bots across all showrooms, message counts & last interaction dates.</p>
            </div>
          </div>

          <button
            onClick={() => handleDownload('leads', 'Customer Leads Directory Report')}
            disabled={downloading === 'leads'}
            className="w-full py-3 bg-gradient-to-r from-emerald-400 to-emerald-500 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            {downloading === 'leads' ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Download className="w-4 h-4 fill-black text-black" />}
            <span>Export Customer Leads CSV</span>
          </button>
        </div>

        {/* Report 4: Broadcast Campaigns Master */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-[#141414] to-[#0d0d0d] border border-amber-500/30 shadow-xl space-y-4 hover:border-amber-500/50 transition-all group">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/30 text-purple-400">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Broadcast Campaigns Audit CSV</h2>
              <p className="text-xs text-gray-400">Audit log of all WhatsApp broadcast campaigns sent by shop owners, recipient counts, and delivery success rates.</p>
            </div>
          </div>

          <button
            onClick={() => handleDownload('broadcasts', 'Broadcast Campaigns Audit Report')}
            disabled={downloading === 'broadcasts'}
            className="w-full py-3 bg-gradient-to-r from-purple-400 to-purple-500 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-purple-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            {downloading === 'broadcasts' ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Download className="w-4 h-4 fill-black text-black" />}
            <span>Export Broadcast Logs CSV</span>
          </button>
        </div>

      </div>
    </div>
  );
}
