import { Users, MessageSquare, Calendar, Phone, MessageCircle } from 'lucide-react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';
import { redirect } from "next/navigation";
import BroadcastModal from '@/components/BroadcastModal';

export default async function LeadsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !(session.user as any).id) {
    redirect('/login');
  }

  const shopId = (session.user as any).id;

  const leads = await prisma.lead.findMany({
    where: { shop_id: shopId },
    orderBy: { last_contacted_at: 'desc' },
  });

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">My Customers</h1>
          <p className="text-gray-400 mt-1">People who have interacted with your bot</p>
        </div>
        <BroadcastModal customerCount={leads.length} />
      </div>

      <div className="bg-[#111111]/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/5 overflow-hidden">
        {leads.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4 shadow-inner">
              <Users className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-white">No customers yet</h3>
            <p className="mt-2 text-gray-400 max-w-sm mx-auto">
              When customers message your WhatsApp bot, their phone numbers will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5">
              <thead className="bg-[#0a0a0a]">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Customer Phone
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Total Interactions
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-amber-500 mr-3" />
                        <span className="text-sm font-medium text-white">{lead.customer_phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20" title="This customer blocked your number or has an invalid number. Broadcasts will bypass them.">
                          Blocked / Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 text-emerald-500 mr-3" />
                        <span className="text-sm text-gray-300">{lead.message_count} messages</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-blue-500 mr-3" />
                        <span className="text-sm text-gray-300">
                          {new Date(lead.last_contacted_at).toLocaleDateString()} at {new Date(lead.last_contacted_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a
                        href={`https://wa.me/${lead.customer_phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 border border-emerald-500/30 rounded-lg text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500 hover:text-[#0a0a0a] hover:border-transparent transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                      >
                        <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                        Chat on WhatsApp
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
