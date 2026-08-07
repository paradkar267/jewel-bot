'use client';

import { useState } from 'react';
import { Phone, MessageSquare, Calendar, MessageCircle, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { deleteLead } from '@/app/actions/lead';

interface LeadItem {
  id: string;
  customer_phone: string;
  customer_name: string | null;
  message_count: number;
  is_active: boolean;
  last_contacted_at: string;
}

export default function CustomerTable({ initialLeads }: { initialLeads: LeadItem[] }) {
  const [leads, setLeads] = useState<LeadItem[]>(initialLeads);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteLead, setConfirmDeleteLead] = useState<LeadItem | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirmDeleteLead) return;
    setDeletingId(confirmDeleteLead.id);
    setErrorMsg(null);

    const res = await deleteLead(confirmDeleteLead.id);
    if (res.success) {
      setLeads(prev => prev.filter(l => l.id !== confirmDeleteLead.id));
      setConfirmDeleteLead(null);
    } else {
      setErrorMsg(res.error || 'Failed to remove customer');
    }
    setDeletingId(null);
  };

  if (leads.length === 0) {
    return (
      <div className="text-center py-20 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4 shadow-inner">
          <Phone className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-bold text-white">No customers yet</h3>
        <p className="mt-2 text-gray-400 max-w-sm mx-auto">
          When customers message your WhatsApp bot, their profile names and phone numbers will automatically appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/5">
          <thead className="bg-[#0a0a0a]">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Customer Name
              </th>
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
              <tr key={lead.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-amber-400 text-xs mr-3">
                      {(lead.customer_name || 'C')[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-white">
                      {lead.customer_name || 'WhatsApp Customer'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-amber-500 mr-3" />
                    <span className="text-sm font-medium text-gray-300">+{lead.customer_phone}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {lead.is_active ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20" title="Blocked or inactive number.">
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
                    <span className="text-sm text-gray-300" suppressHydrationWarning>
                      {new Date(lead.last_contacted_at).toLocaleDateString('en-US')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <a
                      href={`https://wa.me/${lead.customer_phone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 border border-emerald-500/30 rounded-lg text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500 hover:text-[#0a0a0a] hover:border-transparent transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                    >
                      <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                      Chat on WhatsApp
                    </a>

                    <button
                      onClick={() => setConfirmDeleteLead(lead)}
                      title="Remove Customer"
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDeleteLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-red-400">
              <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Remove Customer?</h3>
                <p className="text-xs text-gray-400">This action will remove the customer record from your shop.</p>
              </div>
            </div>

            <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-1">
              <p className="text-xs text-gray-400">Customer Name: <span className="text-white font-semibold">{confirmDeleteLead.customer_name || 'WhatsApp Customer'}</span></p>
              <p className="text-xs text-gray-400">Phone Number: <span className="text-white font-semibold">+{confirmDeleteLead.customer_phone}</span></p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <button
                disabled={deletingId === confirmDeleteLead.id}
                onClick={() => { setConfirmDeleteLead(null); setErrorMsg(null); }}
                className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                disabled={deletingId === confirmDeleteLead.id}
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-all flex items-center shadow-lg shadow-red-600/20"
              >
                {deletingId === confirmDeleteLead.id ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    Removing...
                  </>
                ) : (
                  'Yes, Remove Customer'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
