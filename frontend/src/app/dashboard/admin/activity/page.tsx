import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Activity, Shield, Clock, Gem, UserCheck, Send, Store, Search } from "lucide-react";
import { getAdminActivityLogs } from "@/app/actions/admin-features";

const ADMIN_EMAIL = 'bizleap1@gmail.com';

export default async function AdminActivityPage() {
  const session = await getServerSession(authOptions);

  const isSuperAdmin = Boolean((session?.user as any)?.isSuperAdmin) || session?.user?.email === ADMIN_EMAIL;

  if (!session || !session.user || !isSuperAdmin) {
    redirect('/dashboard');
  }

  const result = await getAdminActivityLogs();
  const activities = result.activities || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center tracking-tight">
            <Activity className="h-8 w-8 text-amber-500 mr-3" />
            Real-Time Showroom Audit Logs & Activity Feed
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Live chronological stream of actions taken across all registered jewelry showrooms (Item additions, customer leads, WhatsApp broadcasts).
          </p>
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-[#111111] border border-amber-500/20 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-extrabold text-white flex items-center justify-between pb-4 border-b border-white/10">
          <span className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Live Activity Stream ({activities.length} Events)
          </span>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Real-Time Live
          </span>
        </h2>

        {activities.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            No activity recorded yet across registered shops.
          </div>
        ) : (
          <div className="relative border-l border-white/10 ml-4 pl-6 space-y-6">
            {activities.map((act) => {
              const formattedTime = new Date(act.timestamp).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              });

              return (
                <div key={act.id} className="relative group">
                  
                  {/* Timeline Node Dot */}
                  <span className={`absolute -left-[31px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center text-black font-bold text-xs ${
                    act.type === 'product'
                      ? 'bg-amber-400 border-amber-500 text-black'
                      : act.type === 'lead'
                      ? 'bg-emerald-400 border-emerald-500 text-black'
                      : 'bg-purple-400 border-purple-500 text-black'
                  }`}>
                    {act.type === 'product' ? <Gem className="w-3.5 h-3.5" /> : act.type === 'lead' ? <UserCheck className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                  </span>

                  {/* Content Box */}
                  <div className="bg-black/50 border border-white/10 hover:border-amber-500/30 p-4 rounded-xl transition-all space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-amber-400" />
                        {act.shopName}
                      </span>
                      <span className="text-[11px] text-gray-400 font-medium">{formattedTime}</span>
                    </div>

                    <h3 className="text-sm font-bold text-white mt-1">{act.title}</h3>
                    <p className="text-xs text-gray-400 font-mono bg-white/5 p-2 rounded-lg border border-white/5">{act.details}</p>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
