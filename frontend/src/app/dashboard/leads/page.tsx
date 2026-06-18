'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, MessageSquare, Calendar, Phone } from 'lucide-react';

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      return;
    }

    // Get shop ID for this user
    const { data: shop } = await supabase
      .from('shops')
      .select('id')
      .eq('owner_id', userData.user.id)
      .single();

    if (shop) {
      // Fetch leads for this shop
      const { data } = await supabase
        .from('leads')
        .select('*')
        .eq('shop_id', shop.id)
        .order('last_contacted_at', { ascending: false });
      
      if (data) setLeads(data);
    }
    
    setLoading(false);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">My Customers</h1>
          <p className="text-gray-400 mt-1">People who have interacted with your bot</p>
        </div>
      </div>

      <div className="bg-[#111111]/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500 animate-pulse">Loading customers...</div>
        ) : leads.length === 0 ? (
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
                    Total Interactions
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Last Active
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
