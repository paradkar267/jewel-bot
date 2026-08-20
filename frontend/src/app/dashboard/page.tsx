import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { fetchLiveIndiaMetalRates } from '@/app/actions/live-rates';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import { getActiveAnnouncements } from '@/app/actions/admin-features';
import { 
  Gem, Users, History, Activity, Sparkles, PlusCircle, 
  FileSpreadsheet, MessageSquare, ArrowRight, UserCheck, Calendar,
  TrendingUp, ShieldCheck, DollarSign, Layers, CheckCircle2, Zap, Megaphone
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

  const announcementsPromise = typeof getActiveAnnouncements === 'function' 
    ? getActiveAnnouncements() 
    : Promise.resolve({ announcements: [] });

  const [liveRatesRes, announcementsRes] = await Promise.all([
    fetchLiveIndiaMetalRates(),
    announcementsPromise
  ]);
  const liveRates = liveRatesRes.rates;
  const activeAnnouncements = announcementsRes.announcements || [];
  const currentGoldRate = shop?.gold_rate_per_gram ? Number(shop.gold_rate_per_gram) : liveRates.gold_24k;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* Super Admin Global Announcements Banner (Dismissable by Shop Owner) */}
      <AnnouncementBanner announcements={activeAnnouncements} />

      {/* Real-Time Live Metal Benchmark Banner */}
      <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-black rounded-xl text-white font-extrabold shadow-sm">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">Live Real-Time India Jewelry Market Rates (API Live)</span>
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-neutral-900 flex flex-wrap items-center gap-2 sm:gap-3 mt-0.5">
              <span>👑 22K Gold: <strong className="text-neutral-900">₹{liveRates.gold_22k.toLocaleString('en-IN')} /g</strong></span>
              <span className="text-neutral-300 hidden sm:inline">|</span>
              <span>🥇 24K Pure: <strong className="text-neutral-900">₹{liveRates.gold_24k.toLocaleString('en-IN')} /g</strong></span>
              <span className="text-neutral-300 hidden sm:inline">|</span>
              <span>⚪ Silver: <strong className="text-neutral-600">₹{liveRates.silver.toLocaleString('en-IN')} /g</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-neutral-450 font-semibold block">Store Active 24K Rate</span>
            <span className="text-xs font-extrabold text-neutral-900">₹{currentGoldRate.toLocaleString('en-IN')}/g</span>
          </div>
          <Link
            href="/dashboard/catalog"
            className="px-4 py-2 bg-black text-white font-extrabold text-xs rounded-xl shadow-sm hover:bg-neutral-800 transition-all flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 fill-white text-white" />
            <span>Update Rates & Recalculate</span>
          </Link>
        </div>
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neutral-100/50 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-955 tracking-tight">
              {shop?.name || 'Jewelry Showroom'} Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Verified Portal
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500">Welcome back! Real-time catalog valuation, leads & WhatsApp AI statistics.</p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link
            href="/dashboard/broadcasts"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-extrabold text-xs text-white bg-black hover:bg-neutral-800 shadow-md transition-all transform hover:scale-[1.02]"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Send Broadcast
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Vault Inventory Valuation Card */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-neutral-700" />
                Vault Valuation
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-2">
                ₹{totalVaultValue.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="p-2.5 bg-neutral-100 rounded-xl border border-neutral-200 text-neutral-800">
              <Gem className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-150 flex items-center justify-between text-[11px] text-neutral-500">
            <span className="font-semibold">{totalProducts} Jewelry Pieces</span>
            <span className="text-neutral-800 font-bold flex items-center gap-1">
              Live Auto-Priced
            </span>
          </div>
        </div>

        {/* Catalog Items Card */}
        <Link href="/dashboard/catalog" className="bg-white border border-neutral-200 rounded-2xl p-5 hover:border-neutral-400 transition-all group relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Catalog Vault</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-2">{totalProducts}</p>
            </div>
            <div className="bg-neutral-100 p-2.5 rounded-xl border border-neutral-200 group-hover:scale-110 transition-transform">
              <Layers className="h-5 w-5 text-neutral-800" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-150 flex items-center justify-between text-[11px] text-neutral-500">
            <span className="font-semibold text-neutral-800">{goldItemsCount} Gold | {silverItemsCount} Silver</span>
            <span className="text-neutral-500 font-bold group-hover:text-black flex items-center gap-1">
              Manage Vault <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Total Leads Card */}
        <Link href="/dashboard/leads" className="bg-white border border-neutral-200 rounded-2xl p-5 hover:border-emerald-300 transition-all group relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Captured Leads</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-2">{totalLeads}</p>
            </div>
            <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-150 flex items-center justify-between text-[11px] text-neutral-500">
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> WhatsApp Auto-Logged
            </span>
            <span className="text-neutral-500 font-bold group-hover:text-emerald-700 flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Campaigns & Delivery Success */}
        <Link href="/dashboard/broadcasts" className="bg-white border border-neutral-200 rounded-2xl p-5 hover:border-purple-300 transition-all group relative overflow-hidden shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Campaigns & Success</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-2">{totalCampaigns}</p>
            </div>
            <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-100 group-hover:scale-110 transition-transform">
              <History className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-150 flex items-center justify-between text-[11px] text-neutral-500">
            <span className="font-semibold text-purple-600">{averageSuccessRate}% Success Rate</span>
            <span className="text-neutral-500 font-bold group-hover:text-purple-700 flex items-center gap-1">
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
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">Recent Customer Leads</h3>
                  <p className="text-[11px] text-neutral-500">Customers interacting with your WhatsApp Jewelry Bot</p>
                </div>
              </div>
              <Link href="/dashboard/leads" className="text-xs font-bold text-neutral-700 hover:text-black hover:bg-neutral-100 transition-colors bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-250">
                View All Leads <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentLeads.length === 0 ? (
              <div className="text-center py-10 text-neutral-500 text-xs">
                No customer interactions captured yet. Connect WhatsApp Bot to log incoming leads automatically!
              </div>
            ) : (
              <div className="divide-y divide-neutral-150">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0 hover:bg-neutral-50 px-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center font-extrabold text-emerald-700 text-sm shadow-sm">
                        {(lead.customer_name || 'C')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-neutral-900 flex items-center gap-2">
                          {lead.customer_name || 'WhatsApp Customer'}
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold">Active</span>
                        </div>
                        <div className="text-[11px] text-neutral-550 font-medium mt-0.5">+{lead.customer_phone}</div>
                      </div>
                    </div>
                    <div className="text-[11px] text-neutral-600 font-semibold flex items-center gap-1 bg-neutral-50 px-2.5 py-1 rounded-lg border border-neutral-200">
                      <Calendar className="w-3 h-3 text-neutral-500" />
                      {new Date(lead.last_contacted_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Broadcast Campaigns */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 border border-purple-100 text-purple-600">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">Recent Broadcast Campaigns</h3>
                  <p className="text-[11px] text-neutral-500">Promotions & New Arrival updates sent to customers</p>
                </div>
              </div>
              <Link href="/dashboard/broadcasts" className="text-xs font-bold text-neutral-700 hover:text-black hover:bg-neutral-100 transition-colors bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-250">
                View History <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentCampaigns.length === 0 ? (
              <div className="text-center py-10 text-neutral-500 text-xs">
                No campaigns sent yet. Send your first broadcast to boost sales!
              </div>
            ) : (
              <div className="space-y-3">
                {recentCampaigns.map((camp) => {
                  const successPct = camp.total_recipients > 0 ? Math.round((camp.success_count / camp.total_recipients) * 100) : 0;
                  return (
                    <div key={camp.id} className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between hover:border-neutral-350 transition-all">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-neutral-900 line-clamp-1 max-w-sm flex items-center gap-2">
                          {camp.message_text}
                        </span>
                        <span className="text-[10px] text-neutral-550 font-medium">{new Date(camp.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-neutral-900">{camp.success_count}/{camp.total_recipients}</span>
                          <span className="text-[9px] text-neutral-450 block font-semibold">Sent Successfully</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${
                          successPct >= 90 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-neutral-100 text-neutral-805 border-neutral-300'
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
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-neutral-900 flex items-center border-b border-neutral-200 pb-3">
              <Sparkles className="w-4 h-4 text-neutral-800 mr-2" />
              Quick Store Actions
            </h3>
            
            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard/add"
                className="flex items-center gap-3 p-3.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 hover:border-neutral-350 rounded-xl transition-all group"
              >
                <div className="p-2 rounded-xl bg-neutral-100 border border-neutral-300 text-neutral-800 group-hover:scale-110 transition-transform">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-neutral-900 block group-hover:text-black transition-colors">Add Jewelry Piece</span>
                  <span className="text-[10px] text-neutral-500">Insert new item with photo & weight</span>
                </div>
              </Link>

              <Link
                href="/dashboard/catalog"
                className="flex items-center gap-3 p-3.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 hover:border-neutral-350 rounded-xl transition-all group"
              >
                <div className="p-2 rounded-xl bg-neutral-100 border border-neutral-300 text-neutral-800 group-hover:scale-110 transition-transform">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-neutral-900 block group-hover:text-black transition-colors">1-Click Recalculate Rates</span>
                  <span className="text-[10px] text-neutral-550">Update catalog with today's gold rate</span>
                </div>
              </Link>

              <Link
                href="/dashboard/bulk"
                className="flex items-center gap-3 p-3.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 hover:border-neutral-350 rounded-xl transition-all group"
              >
                <div className="p-2 rounded-xl bg-neutral-100 border border-neutral-300 text-neutral-800 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-neutral-900 block group-hover:text-black transition-colors">Bulk CSV Upload</span>
                  <span className="text-[10px] text-neutral-550">Import inventory spreadsheet</span>
                </div>
              </Link>

              <Link
                href="/dashboard/sync"
                className="flex items-center gap-3 p-3.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 hover:border-neutral-350 rounded-xl transition-all group"
              >
                <div className="p-2 rounded-xl bg-neutral-100 border border-neutral-300 text-neutral-800 group-hover:scale-110 transition-transform">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold text-neutral-900 block group-hover:text-black transition-colors">Auto-Sync Integration</span>
                  <span className="text-[10px] text-neutral-550">WooCommerce / Shopify auto sync</span>
                </div>
              </Link>
            </div>
          </div>

          {/* WhatsApp Bot AI Status Card */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h4 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider">WhatsApp Bot AI Active</h4>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">Auto-Reply ON</span>
            </div>
            <p className="text-[11px] text-neutral-600 leading-relaxed">
              Your AI Assistant is connected and actively sending live jewelry photos, prices, and gold rates to customer WhatsApp inquiries.
            </p>
            <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-[11px]">
              <span className="text-neutral-500 font-medium">WhatsApp Number:</span>
              <span className="text-emerald-700 font-extrabold">+{shop?.whatsapp_number || 'Connected'}</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
