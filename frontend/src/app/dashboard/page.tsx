import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { fetchLiveIndiaMetalRates } from '@/app/actions/live-rates';
import { 
  Gem, Users, History, Activity, Sparkles, PlusCircle, 
  FileSpreadsheet, MessageSquare, ArrowRight, UserCheck, Calendar,
  TrendingUp, ShieldCheck, DollarSign, Layers, CheckCircle2, Zap
} from 'lucide-react';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).id) {
    redirect('/login');
  }

  // Redirect admin
  if (session.user.email === 'bizleap1@gmail.com') {
    redirect('/dashboard/admin');
  }

  const shopId = (session.user as any).id;

  // Fetch shop statistics, shop details, and recent items
  const [
    shop,
    totalProducts,
    totalLeads,
    totalCampaigns,
    allProducts,
    recentLeads,
    recentCampaigns
  ] = await Promise.all([
    prisma.shop.findUnique({
      where: { id: shopId },
      select: { name: true, gold_rate_per_gram: true, silver_rate_per_gram: true, whatsapp_number: true }
    }),
    prisma.product.count({ where: { shop_id: shopId } }),
    prisma.lead.count({ where: { shop_id: shopId } }),
    prisma.broadcastCampaign.count({ where: { shop_id: shopId } }),
    prisma.product.findMany({
      where: { shop_id: shopId },
      select: { price: true, metal: true, karat: true, type: true }
    }),
    prisma.lead.findMany({
      where: { shop_id: shopId },
      orderBy: { last_contacted_at: 'desc' },
      take: 5
    }),
    prisma.broadcastCampaign.findMany({
      where: { shop_id: shopId },
      orderBy: { created_at: 'desc' },
      take: 3
    })
  ]);

  // Calculate Total Vault Inventory Value
  const totalVaultValue = allProducts.reduce((sum, item) => sum + Number(item.price || 0), 0);

  // Count Gold vs Silver vs Other metals
  const goldItemsCount = allProducts.filter(p => (p.metal || '').toLowerCase().includes('gold') || (p.karat && p.karat !== 'N/A')).length;
  const silverItemsCount = allProducts.filter(p => (p.metal || '').toLowerCase().includes('silver')).length;

  // Calculate success rates
  const totalCampaignsStats = await prisma.broadcastCampaign.findMany({
    where: { shop_id: shopId },
    select: { success_count: true, total_recipients: true }
  });

  const totalRecipients = totalCampaignsStats.reduce((sum, c) => sum + c.total_recipients, 0);
  const totalSuccess = totalCampaignsStats.reduce((sum, c) => sum + c.success_count, 0);
  const averageSuccessRate = totalRecipients > 0 ? Math.round((totalSuccess / totalRecipients) * 100) : 100;

  const liveRatesRes = await fetchLiveIndiaMetalRates();
  const liveRates = liveRatesRes.rates;
  const currentGoldRate = shop?.gold_rate_per_gram ? Number(shop.gold_rate_per_gram) : liveRates.gold_22k;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Real-Time Live Metal Benchmark Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-[#12110c] to-amber-950/40 border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.12)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl text-black font-extrabold shadow-md">
            <TrendingUp className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Live Real-Time India Jewelry Market Rates (API Live)</span>
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-white flex flex-wrap items-center gap-2 sm:gap-3 mt-0.5">
              <span>👑 22K Gold: <strong className="text-amber-400">₹{liveRates.gold_22k.toLocaleString('en-IN')} /g</strong></span>
              <span className="text-gray-600 hidden sm:inline">|</span>
              <span>🥇 24K Pure: <strong className="text-amber-300">₹{liveRates.gold_24k.toLocaleString('en-IN')} /g</strong></span>
              <span className="text-gray-600 hidden sm:inline">|</span>
              <span>⚪ Silver: <strong className="text-gray-300">₹{liveRates.silver.toLocaleString('en-IN')} /g</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-gray-400 font-semibold block">Store Active Rate</span>
            <span className="text-xs font-extrabold text-white">₹{currentGoldRate.toLocaleString('en-IN')}/g</span>
          </div>
          <Link
            href="/dashboard/catalog"
            className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:brightness-110 transition-all flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 fill-black" />
            <span>Update Rates & Recalculate</span>
          </Link>
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-gradient-to-r from-[#141414] via-[#111111] to-[#17140e] p-6 rounded-2xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {shop?.name || 'Jewelry Showroom'} Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Verified Portal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-400">Welcome back! Real-time catalog valuation, leads & WhatsApp AI statistics.</p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link
            href="/dashboard/broadcasts"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-extrabold text-xs text-black bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:brightness-110 shadow-[0_0_20px_rgba(251,191,36,0.25)] transition-all transform hover:scale-[1.02]"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Send Broadcast
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Vault Inventory Valuation Card */}
        <div className="bg-gradient-to-br from-amber-950/30 via-[#111111] to-[#14120c] border border-amber-500/20 rounded-2xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all"></div>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-amber-300/80 uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                Vault Valuation
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                ₹{totalVaultValue.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
              <Gem className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
            <span className="font-semibold">{totalProducts} Jewelry Pieces</span>
            <span className="text-amber-400 font-bold flex items-center gap-1">
              Live Auto-Priced
            </span>
          </div>
        </div>

        {/* Catalog Items Card */}
        <Link href="/dashboard/catalog" className="bg-[#111111] border border-white/5 rounded-2xl p-5 hover:border-amber-500/30 transition-all group relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Catalog Vault</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">{totalProducts}</p>
            </div>
            <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Layers className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
            <span className="font-semibold text-amber-400">{goldItemsCount} Gold | {silverItemsCount} Silver</span>
            <span className="text-gray-400 font-bold group-hover:text-amber-400 flex items-center gap-1">
              Manage Vault <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Total Leads Card */}
        <Link href="/dashboard/leads" className="bg-[#111111] border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 transition-all group relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Captured Leads</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">{totalLeads}</p>
            </div>
            <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> WhatsApp Auto-Logged
            </span>
            <span className="text-gray-400 font-bold group-hover:text-emerald-400 flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Campaigns & Delivery Success */}
        <Link href="/dashboard/broadcasts" className="bg-[#111111] border border-white/5 rounded-2xl p-5 hover:border-purple-500/30 transition-all group relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Campaigns & Success</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-white mt-2">{totalCampaigns}</p>
            </div>
            <div className="bg-purple-500/10 p-2.5 rounded-xl border border-purple-500/20 group-hover:scale-110 transition-transform">
              <History className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-400">
            <span className="font-semibold text-purple-400">{averageSuccessRate}% Success Rate</span>
            <span className="text-gray-400 font-bold group-hover:text-purple-400 flex items-center gap-1">
              History <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

      </div>

      {/* Main Grid: Recent activities & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Recents lists */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Customer Inquiries */}
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 shadow-md">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Recent Customer Leads</h3>
                  <p className="text-[11px] text-gray-400">Customers interacting with your WhatsApp Jewelry Bot</p>
                </div>
              </div>
              <Link href="/dashboard/leads" className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                View All Leads <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentLeads.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-xs">
                No customer interactions captured yet. Connect WhatsApp Bot to log incoming leads automatically!
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0 hover:bg-white/[0.01] px-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-700/20 border border-emerald-500/30 flex items-center justify-center font-extrabold text-emerald-400 text-sm shadow-sm">
                        {(lead.customer_name || 'C')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-white flex items-center gap-2">
                          {lead.customer_name || 'WhatsApp Customer'}
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">Active</span>
                        </div>
                        <div className="text-[11px] text-gray-400 font-medium mt-0.5">+{lead.customer_phone}</div>
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-400 font-semibold flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {new Date(lead.last_contacted_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Broadcast Campaigns */}
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 shadow-md">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Recent Broadcast Campaigns</h3>
                  <p className="text-[11px] text-gray-400">Promotions & New Arrival updates sent to customers</p>
                </div>
              </div>
              <Link href="/dashboard/broadcasts" className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                View History <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentCampaigns.length === 0 ? (
              <div className="text-center py-10 text-gray-500 text-xs">
                No campaigns sent yet. Send your first broadcast to boost sales!
              </div>
            ) : (
              <div className="space-y-3">
                {recentCampaigns.map((camp) => {
                  const successPct = camp.total_recipients > 0 ? Math.round((camp.success_count / camp.total_recipients) * 100) : 0;
                  return (
                    <div key={camp.id} className="p-3.5 bg-black/60 rounded-xl border border-white/5 flex items-center justify-between hover:border-purple-500/20 transition-all">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-white line-clamp-1 max-w-sm flex items-center gap-2">
                          {camp.message_text}
                        </span>
                        <span className="text-[10px] text-gray-400 font-medium">{new Date(camp.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-white">{camp.success_count}/{camp.total_recipients}</span>
                          <span className="text-[9px] text-gray-500 block font-semibold">Sent Successfully</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${
                          successPct >= 90 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {successPct}% Delivered
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (1 col): Quick Actions & WhatsApp AI Status */}
        <div className="space-y-6">
          
          {/* Quick Actions Card */}
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 shadow-md space-y-5">
            <h3 className="text-base font-bold text-white flex items-center border-b border-white/5 pb-3">
              <Sparkles className="w-4 h-4 text-amber-500 mr-2" />
              Quick Store Actions
            </h3>
            
            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard/add"
                className="flex items-center gap-3 p-3.5 bg-black/60 hover:bg-amber-500/5 border border-white/5 hover:border-amber-500/30 rounded-xl transition-all group"
              >
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-white block group-hover:text-amber-400 transition-colors">Add Jewelry Piece</span>
                  <span className="text-[10px] text-gray-400">Insert new item with photo & weight</span>
                </div>
              </Link>

              <Link
                href="/dashboard/catalog"
                className="flex items-center gap-3 p-3.5 bg-black/60 hover:bg-amber-500/5 border border-white/5 hover:border-amber-500/30 rounded-xl transition-all group"
              >
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-white block group-hover:text-amber-400 transition-colors">1-Click Recalculate Rates</span>
                  <span className="text-[10px] text-gray-400">Update catalog with today's gold rate</span>
                </div>
              </Link>

              <Link
                href="/dashboard/bulk"
                className="flex items-center gap-3 p-3.5 bg-black/60 hover:bg-blue-500/5 border border-white/5 hover:border-blue-500/30 rounded-xl transition-all group"
              >
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-white block group-hover:text-blue-400 transition-colors">Bulk CSV Upload</span>
                  <span className="text-[10px] text-gray-400">Import inventory spreadsheet</span>
                </div>
              </Link>

              <Link
                href="/dashboard/sync"
                className="flex items-center gap-3 p-3.5 bg-black/60 hover:bg-purple-500/5 border border-white/5 hover:border-purple-500/30 rounded-xl transition-all group"
              >
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-white block group-hover:text-purple-400 transition-colors">Auto-Sync Integration</span>
                  <span className="text-[10px] text-gray-400">WooCommerce / Shopify auto sync</span>
                </div>
              </Link>
            </div>
          </div>

          {/* WhatsApp Bot AI Status Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-[#111111] to-emerald-950/20 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">WhatsApp Bot AI Active</h4>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">Auto-Reply ON</span>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              Your AI Assistant is connected and actively sending live jewelry photos, prices, and gold rates to customer WhatsApp inquiries.
            </p>
            <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[11px]">
              <span className="text-gray-400 font-medium">WhatsApp Number:</span>
              <span className="text-emerald-400 font-extrabold">+{shop?.whatsapp_number || 'Connected'}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
