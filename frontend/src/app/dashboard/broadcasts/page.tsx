import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import { History, CheckCircle2, XCircle, Megaphone, MessageSquare } from 'lucide-react';
import BroadcastsTable from '@/components/BroadcastsTable';
import BroadcastHeaderActions from '@/components/BroadcastHeaderActions';

export default async function BroadcastsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).id) {
    redirect('/login');
  }

  const shopId = (session.user as any).id;

  // Fetch shop details
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { gold_rate_per_gram: true }
  });

  // Fetch campaigns
  const campaigns = await prisma.broadcastCampaign.findMany({
    where: { shop_id: shopId },
    orderBy: { created_at: 'desc' }
  });

  // Calculate statistics
  const totalCampaigns = campaigns.length;
  const totalSent = campaigns.reduce((acc, c) => acc + c.total_recipients, 0);
  const totalSuccess = campaigns.reduce((acc, c) => acc + c.success_count, 0);
  const averageSuccessRate = totalSent > 0 ? Math.round((totalSuccess / totalSent) * 100) : 0;

  const currentGoldRate = shop?.gold_rate_per_gram ? Number(shop.gold_rate_per_gram) : 13750;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center tracking-tight">
            <History className="h-8 w-8 text-amber-500 mr-3" />
            Broadcast History
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Track and review all marketing, promotional, and Gold Rate price-drop alerts sent to your customers.
          </p>
        </div>

        <BroadcastHeaderActions currentGoldRate={currentGoldRate} />
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Total Campaigns */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div className="absolute top-4 right-4 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
            <Megaphone className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-sm font-medium text-gray-400">Total Campaigns</p>
          <p className="text-3xl font-bold text-white mt-2">{totalCampaigns}</p>
          <div className="mt-2 text-xs text-gray-500">Scheduled & executed batches</div>
        </div>

        {/* Card 2: Total Messages Sent */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div className="absolute top-4 right-4 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
            <MessageSquare className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-gray-400">Messages Dispatched</p>
          <p className="text-3xl font-bold text-white mt-2">{totalSent.toLocaleString()}</p>
          <div className="mt-2 text-xs text-gray-500">Delivered to active numbers</div>
        </div>

        {/* Card 3: Success Rate */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div className="absolute top-4 right-4 bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
            <CheckCircle2 className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-sm font-medium text-gray-400">Average Delivery Rate</p>
          <p className="text-3xl font-bold text-white mt-2">{averageSuccessRate}%</p>
          <div className="mt-2 text-xs text-gray-500">Overall success metrics</div>
        </div>
      </div>

      {/* Campaigns History */}
      <BroadcastsTable campaigns={campaigns} />
    </div>
  );
}
