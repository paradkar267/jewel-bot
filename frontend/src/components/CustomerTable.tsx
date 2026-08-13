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
      <div className="text-center py-20 px-4 bg-white border border-neutral-200 rounded-2xl shadow-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 mb-4 shadow-inner">
          <Phone className="h-8 w-8 text-neutral-450" />
        </div>
        <h3 className="text-lg font-bold text-neutral-900">No customers yet</h3>
        <p className="mt-2 text-neutral-550 max-w-sm mx-auto">
          When customers message your WhatsApp bot, their profile names and phone numbers will automatically appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto bg-white border border-neutral-200 rounded-2xl shadow-sm">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-neutral-550 uppercase tracking-wider">
                Customer Name
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-neutral-550 uppercase tracking-wider">
                Customer Phone
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-neutral-550 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-neutral-550 uppercase tracking-wider">
                Total Interactions
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-neutral-550 uppercase tracking-wider">
                Last Active
              </th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-neutral-550 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-150">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-neutral-50 transition-colors group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-neutral-100 border border-neutral-250 flex items-center justify-center font-bold text-neutral-800 text-xs mr-3">
                      {(lead.customer_name || 'C')[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-neutral-900">
                      {lead.customer_name || 'WhatsApp Customer'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-neutral-700 mr-3" />
                    <span className="text-sm font-medium text-neutral-600">+{lead.customer_phone}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {lead.is_active ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-705 border border-emerald-200">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200" title="Blocked or inactive number.">
                      Blocked / Inactive
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 text-emerald-600 mr-3" />
                    <span className="text-sm text-neutral-600">{lead.message_count} messages</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-blue-600 mr-3" />
                    <span className="text-sm text-neutral-600" suppressHydrationWarning>
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
                      className="inline-flex items-center px-3 py-1.5 border border-emerald-350 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-all cursor-pointer shadow-sm"
                    >
                      <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                      Chat on WhatsApp
                    </a>

                    <button
                      onClick={() => setConfirmDeleteLead(lead)}
                      title="Remove Customer"
                      className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-all cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Remove Customer?</h3>
                <p className="text-xs text-neutral-500">This action will remove the customer record from your shop.</p>
              </div>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-1">
              <p className="text-xs text-neutral-500">Customer Name: <span className="text-neutral-900 font-semibold">{confirmDeleteLead.customer_name || 'WhatsApp Customer'}</span></p>
              <p className="text-xs text-neutral-500">Phone Number: <span className="text-neutral-900 font-semibold">+{confirmDeleteLead.customer_phone}</span></p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <button
                disabled={deletingId === confirmDeleteLead.id}
                onClick={() => { setConfirmDeleteLead(null); setErrorMsg(null); }}
                className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-black bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={deletingId === confirmDeleteLead.id}
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all flex items-center shadow-sm cursor-pointer"
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
