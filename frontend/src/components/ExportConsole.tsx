"use client";

import { useState } from "react";
import { Download, FileText, Store, Gem, Users, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { exportMasterPlatformData } from "@/app/actions/admin-features";

export default function ExportConsole() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // 1. Download CSV File
  const handleDownloadCSV = async (reportType: 'shops' | 'products' | 'leads' | 'broadcasts', label: string) => {
    setDownloading(`${reportType}_csv`);
    setStatus(null);

    try {
      const res = await exportMasterPlatformData(reportType);

      if (res.success && res.csvData && res.fileName) {
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

  // 2. Generate & Download PDF File (via Print-to-PDF Window)
  const handleDownloadPDF = async (reportType: 'shops' | 'products' | 'leads' | 'broadcasts', label: string) => {
    setDownloading(`${reportType}_pdf`);
    setStatus(null);

    try {
      const res = await exportMasterPlatformData(reportType);

      if (res.success && res.csvData) {
        // Parse CSV lines to construct printable PDF document
        const lines = res.csvData.trim().split("\n");
        if (lines.length === 0) throw new Error("Empty report data");

        const headers = lines[0].split(",").map(h => h.replace(/^"|"$/g, ""));
        const rows = lines.slice(1).map(line => 
          line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cell => cell.replace(/^"|"$/g, ""))
        );

        const printWindow = window.open("", "_blank");
        if (!printWindow) {
          throw new Error("Pop-up blocked. Please allow pop-ups to generate PDF.");
        }

        const now = new Date().toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        });

        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${label} - JewelBot Master Report PDF</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 30px; color: #111; background: #fff; }
              .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #d97706; padding-bottom: 15px; margin-bottom: 20px; }
              .logo { font-size: 24px; font-weight: 900; color: #d97706; letter-spacing: -0.5px; }
              .sub { font-size: 11px; text-transform: uppercase; color: #666; font-weight: 700; }
              .meta { text-align: right; font-size: 12px; color: #555; }
              h1 { font-size: 18px; margin: 15px 0 5px 0; color: #111; }
              .badge { background: #fef3c7; color: #b45309; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; display: inline-block; }
              table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
              th { background: #111827; color: #fff; text-align: left; padding: 8px 10px; font-weight: 700; text-transform: uppercase; font-size: 10px; }
              td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; word-break: break-word; }
              tr:nth-child(even) { background: #f9fafb; }
              .footer { margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 10px; display: flex; justify-content: space-between; font-size: 10px; color: #888; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="logo">JEWELBOT AI</div>
                <div class="sub">Enterprise Master Platform Audit Report</div>
              </div>
              <div class="meta">
                <div><strong>Generated:</strong> ${now}</div>
                <div><strong>Records Count:</strong> ${rows.length} Total</div>
              </div>
            </div>

            <h1>${label}</h1>
            <div class="badge">Official Platform Report Document</div>

            <table>
              <thead>
                <tr>
                  ${headers.map(h => `<th>${h}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${rows.map(row => `
                  <tr>
                    ${row.map(c => `<td>${c}</td>`).join("")}
                  </tr>
                `).join("")}
              </tbody>
            </table>

            <div class="footer">
              <div>Confidential & Internal Super Admin Platform Record</div>
              <div>Page 1 of 1 | JewelBot Cloud SaaS</div>
            </div>

            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 500);
              };
            </script>
          </body>
          </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();

        setStatus({ type: "success", message: `${label} PDF Report generated! Select 'Save as PDF' in the print dialog.` });
      } else {
        setStatus({ type: "error", message: res.error || `Failed to export ${label}` });
      }
    } catch (e: any) {
      setStatus({ type: "error", message: e.message || "Failed to generate PDF" });
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
              <h2 className="text-base font-extrabold text-white">Registered Showrooms Master Directory</h2>
              <p className="text-xs text-gray-400">Directory of all registered shops, owner emails, WhatsApp numbers, Meta credentials status & inventory sizes.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleDownloadCSV('shops', 'Registered Showrooms Directory')}
              disabled={downloading === 'shops_csv'}
              className="py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              {downloading === 'shops_csv' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-amber-400" />}
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => handleDownloadPDF('shops', 'Registered Showrooms Directory')}
              disabled={downloading === 'shops_pdf'}
              className="py-2.5 px-3 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
            >
              {downloading === 'shops_pdf' ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : <FileText className="w-3.5 h-3.5 fill-black text-black" />}
              <span>Download PDF 📄</span>
            </button>
          </div>
        </div>

        {/* Report 2: Full Products & Catalog Master */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-[#141414] to-[#0d0d0d] border border-amber-500/30 shadow-xl space-y-4 hover:border-amber-500/50 transition-all group">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-amber-400">
              <Gem className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Platform Jewelry Catalog Master Report</h2>
              <p className="text-xs text-gray-400">Complete itemized list of all products, metal types (22K, 18K), weights in grams, and calculated prices across all shops.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleDownloadCSV('products', 'Jewelry Catalog Master Report')}
              disabled={downloading === 'products_csv'}
              className="py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              {downloading === 'products_csv' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-amber-400" />}
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => handleDownloadPDF('products', 'Jewelry Catalog Master Report')}
              disabled={downloading === 'products_pdf'}
              className="py-2.5 px-3 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
            >
              {downloading === 'products_pdf' ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : <FileText className="w-3.5 h-3.5 fill-black text-black" />}
              <span>Download PDF 📄</span>
            </button>
          </div>
        </div>

        {/* Report 3: Customer Leads Master */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-[#141414] to-[#0d0d0d] border border-amber-500/30 shadow-xl space-y-4 hover:border-amber-500/50 transition-all group">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Customer Leads Directory Report</h2>
              <p className="text-xs text-gray-400">Database of all WhatsApp customer leads captured by the AI bots across all showrooms, message counts & last interaction dates.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleDownloadCSV('leads', 'Customer Leads Directory Report')}
              disabled={downloading === 'leads_csv'}
              className="py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              {downloading === 'leads_csv' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-emerald-400" />}
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => handleDownloadPDF('leads', 'Customer Leads Directory Report')}
              disabled={downloading === 'leads_pdf'}
              className="py-2.5 px-3 bg-gradient-to-r from-emerald-400 to-emerald-500 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
            >
              {downloading === 'leads_pdf' ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : <FileText className="w-3.5 h-3.5 fill-black text-black" />}
              <span>Download PDF 📄</span>
            </button>
          </div>
        </div>

        {/* Report 4: Broadcast Campaigns Master */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-[#141414] to-[#0d0d0d] border border-amber-500/30 shadow-xl space-y-4 hover:border-amber-500/50 transition-all group">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/30 text-purple-400">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Broadcast Campaigns Audit Report</h2>
              <p className="text-xs text-gray-400">Audit log of all WhatsApp broadcast campaigns sent by shop owners, recipient counts, and delivery success rates.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleDownloadCSV('broadcasts', 'Broadcast Campaigns Audit Report')}
              disabled={downloading === 'broadcasts_csv'}
              className="py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              {downloading === 'broadcasts_csv' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-purple-400" />}
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => handleDownloadPDF('broadcasts', 'Broadcast Campaigns Audit Report')}
              disabled={downloading === 'broadcasts_pdf'}
              className="py-2.5 px-3 bg-gradient-to-r from-purple-400 to-purple-500 text-black font-extrabold text-xs rounded-xl shadow-lg shadow-purple-500/20 hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
            >
              {downloading === 'broadcasts_pdf' ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : <FileText className="w-3.5 h-3.5 fill-black text-black" />}
              <span>Download PDF 📄</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
