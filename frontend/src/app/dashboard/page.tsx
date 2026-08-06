import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { 
  Gem, Users, History, Activity, Sparkles, PlusCircle, 
  FileSpreadsheet, MessageSquare, ArrowRight, UserCheck, Calendar
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

  // Fetch shop statistics and recent items
  const [
    totalProducts,
    totalLeads,
    totalCampaigns,
    recentLeads,
    recentCampaigns
  ] = await Promise.all([
    prisma.product.count({ where: { shop_id: shopId } }),
    prisma.lead.count({ where: { shop_id: shopId } }),
    prisma.broadcastCampaign.count({ where: { shop_id: shopId } }),
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

  // Calculate success rates
  const totalCampaignsStats = await prisma.broadcastCampaign.findMany({
    where: { shop_id: shopId },
    select: { success_count: true, total_recipients: true }
  });

  const totalRecipients = totalCampaignsStats.reduce((sum, c) => sum + c.total_recipients, 0);
  const totalSuccess = totalCampaignsStats.reduce((sum, c) => sum + c.success_count, 0);
  const averageSuccessRate = totalRecipients > 0 ? Math.round((totalSuccess / totalRecipients) * 100) : 100;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Overview Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back! Here is a summary of your jewelry business statistics.</p>
        </div>
        <Link
          href="/dashboard/broadcasts"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-bold text-[#0a0a0a] bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)] transition-all transform hover:scale-[1.02]"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Send Broadcast
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Products */}
        <Link href="/dashboard/catalog" className="bg-[#111111] border border-white/5 rounded-2xl p-5 hover:border-amber-500/20 transition-all group relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 group-hover:scale-110 transition-transform">
            <Gem className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Catalog Items</p>
          <p className="text-3xl font-extrabold text-white mt-3">{totalProducts}</p>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-bold group-hover:text-amber-400 transition-colors">
            <span>Manage Vault</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Customers */}
        <Link href="/dashboard/leads" className="bg-[#111111] border border-white/5 rounded-2xl p-5 hover:border-emerald-500/20 transition-all group relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
            <Users className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Leads</p>
          <p className="text-3xl font-extrabold text-white mt-3">{totalLeads}</p>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-bold group-hover:text-emerald-400 transition-colors">
            <span>View Customers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Broadcasts */}
        <Link href="/dashboard/broadcasts" className="bg-[#111111] border border-white/5 rounded-2xl p-5 hover:border-purple-500/20 transition-all group relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-purple-500/10 p-2.5 rounded-xl border border-purple-500/20 group-hover:scale-110 transition-transform">
            <History className="h-5 w-5 text-purple-400" />
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Campaigns Dispatched</p>
          <p className="text-3xl font-extrabold text-white mt-3">{totalCampaigns}</p>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-bold group-hover:text-purple-400 transition-colors">
            <span>Broadcast History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Success Rate */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-4 right-4 bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
            <Activity className="h-5 w-5 text-blue-400" />
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Avg. Delivery Success</p>
          <p className="text-3xl font-extrabold text-white mt-3">{averageSuccessRate}%</p>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-bold">
            <span>WhatsApp Cloud API</span>
            <span className="text-blue-400">High Quality</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Recent activities & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Recents lists */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Leads */}
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-white flex items-center">
                <UserCheck className="w-4 h-4 text-emerald-400 mr-2" />
                Recent Customers
              </h3>
              <Link href="/dashboard/leads" className="text-xs font-semibold text-amber-500 hover:text-amber-400 flex items-center transition-colors">
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>

            {recentLeads.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs">
                No customer interactions captured yet.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center font-bold text-emerald-400 text-xs">
                        {(lead.customer_name || 'C')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{lead.customer_name || 'WhatsApp Customer'}</div>
                        <div className="text-[10px] text-gray-500">+{lead.customer_phone}</div>
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-500 font-semibold flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(lead.last_contacted_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Campaigns */}
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-white flex items-center">
                <History className="w-4 h-4 text-purple-400 mr-2" />
                Recent Campaigns
              </h3>
              <Link href="/dashboard/broadcasts" className="text-xs font-semibold text-amber-500 hover:text-amber-400 flex items-center transition-colors">
                View History <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>

            {recentCampaigns.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs">
                No campaigns sent yet.
              </div>
            ) : (
              <div className="space-y-3.5">
                {recentCampaigns.map((camp) => {
                  const successPct = camp.total_recipients > 0 ? Math.round((camp.success_count / camp.total_recipients) * 100) : 0;
                  return (
                    <div key={camp.id} className="p-3 bg-[#0a0a0a] rounded-xl border border-white/5 flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-white line-clamp-1 max-w-sm">{camp.message_text}</span>
                        <span className="text-[9px] text-gray-500 font-medium">{new Date(camp.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-xs font-bold text-white">{camp.success_count}/{camp.total_recipients}</span>
                          <span className="text-[9px] text-gray-500 block">Recipients</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          successPct >= 90 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {successPct}% OK
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (1 col): Quick Actions */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 h-fit space-y-5">
          <h3 className="text-base font-bold text-white flex items-center">
            <Sparkles className="w-4 h-4 text-amber-500 mr-2" />
            Quick Actions
          </h3>
          
          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard/add"
              className="flex items-center gap-3 p-3 bg-[#0a0a0a] hover:bg-white/[0.02] border border-white/5 hover:border-amber-500/20 rounded-xl transition-all"
            >
              <PlusCircle className="w-5 h-5 text-amber-500" />
              <div className="text-left">
                <span className="text-xs font-bold text-white block">Add Product</span>
                <span className="text-[10px] text-gray-500">Insert a jewelry piece manually</span>
              </div>
            </Link>

            <Link
              href="/dashboard/bulk"
              className="flex items-center gap-3 p-3 bg-[#0a0a0a] hover:bg-white/[0.02] border border-white/5 hover:border-blue-500/20 rounded-xl transition-all"
            >
              <FileSpreadsheet className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <span className="text-xs font-bold text-white block">Bulk CSV Upload</span>
                <span className="text-[10px] text-gray-500">Upload inventory spreadsheets</span>
              </div>
            </Link>

            <Link
              href="/dashboard/sync"
              className="flex items-center gap-3 p-3 bg-[#0a0a0a] hover:bg-white/[0.02] border border-white/5 hover:border-purple-500/20 rounded-xl transition-all"
            >
              <Activity className="w-5 h-5 text-purple-400" />
              <div className="text-left">
                <span className="text-xs font-bold text-white block">Auto-Sync settings</span>
                <span className="text-[10px] text-gray-500">Integrate with WooCommerce/Shopify</span>
              </div>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
