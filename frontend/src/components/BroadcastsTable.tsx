"use client";

import { useState, Fragment } from 'react';
import { ChevronDown, ChevronUp, Calendar, CheckCircle2, XCircle, ImageIcon, Copy, Check, ExternalLink } from 'lucide-react';

interface Campaign {
  id: string;
  shop_id: string;
  message_text: string;
  image_url: string | null;
  total_recipients: number;
  success_count: number;
  fail_count: number;
  created_at: Date;
}

export default function BroadcastsTable({ campaigns }: { campaigns: Campaign[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleCopy = async (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  if (campaigns.length === 0) {
    return (
      <div className="p-12 text-center bg-white border border-neutral-200 rounded-2xl shadow-sm">
        <svg className="h-12 w-12 text-neutral-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <h3 className="text-lg font-bold text-neutral-900">No campaigns sent yet</h3>
        <p className="text-neutral-550 text-sm mt-1 max-w-sm mx-auto">
          Go to your "My Customers" tab and click "Broadcast Message" to start sending updates.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-neutral-200 rounded-2xl bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200 table-fixed">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th scope="col" className="w-[200px] px-6 py-4 text-left text-xs font-medium text-neutral-550 uppercase tracking-wider">
                Date & Time
              </th>
              <th scope="col" className="w-[100px] px-6 py-4 text-left text-xs font-medium text-neutral-550 uppercase tracking-wider">
                Media
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-neutral-550 uppercase tracking-wider">
                Message Preview
              </th>
              <th scope="col" className="w-[120px] px-6 py-4 text-center text-xs font-medium text-neutral-550 uppercase tracking-wider">
                Recipients
              </th>
              <th scope="col" className="w-[160px] px-6 py-4 text-center text-xs font-medium text-neutral-550 uppercase tracking-wider">
                Delivery Health
              </th>
              <th scope="col" className="w-[140px] px-6 py-4 text-right text-xs font-medium text-neutral-550 uppercase tracking-wider">
                Success Rate
              </th>
              <th scope="col" className="w-[60px] px-6 py-4 text-center text-xs font-medium text-neutral-550 tracking-wider">
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-150">
            {campaigns.map((camp) => {
              const campaignIdStr = String(camp.id);
              const isExpanded = expandedId === campaignIdStr;
              const successPct = camp.total_recipients > 0 
                ? Math.round((camp.success_count / camp.total_recipients) * 100) 
                : 0;

              let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              if (successPct < 50) {
                badgeColor = 'bg-red-55 border-red-200 text-red-700';
              } else if (successPct < 90) {
                badgeColor = 'bg-neutral-100 border-neutral-250 text-neutral-800';
              }

              const isUploadedImage = camp.image_url && camp.image_url.startsWith('Meta Media ID:');
              const isLinkedImage = camp.image_url && !isUploadedImage;

              return (
                <Fragment key={camp.id}>
                  {/* Main Row */}
                  <tr 
                    onClick={() => toggleExpand(campaignIdStr)} 
                    className={`cursor-pointer hover:bg-neutral-50 transition-colors select-none ${isExpanded ? 'bg-neutral-50/50' : ''}`}
                  >
                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-neutral-705 mr-2.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-neutral-900">{new Date(camp.created_at).toLocaleDateString()}</div>
                          <div className="text-[10px] text-neutral-450">{new Date(camp.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>
                      </div>
                    </td>

                    {/* Media Thumbnail */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {camp.image_url ? (
                        isLinkedImage ? (
                          <div className="h-10 w-10 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50 flex items-center justify-center flex-shrink-0">
                            <img src={camp.image_url} alt="Media" className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-lg border border-neutral-250 bg-neutral-50 flex items-center justify-center flex-shrink-0" title={camp.image_url}>
                            <ImageIcon className="h-5 w-5 text-neutral-600" />
                          </div>
                        )
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
                    </td>

                    {/* Preview message */}
                    <td className="px-6 py-4 text-sm text-neutral-700 overflow-hidden text-ellipsis whitespace-nowrap">
                      <span className="font-medium text-neutral-800">
                        {camp.message_text}
                      </span>
                    </td>

                    {/* Recipients */}
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-neutral-900">
                      {camp.total_recipients}
                    </td>

                    {/* Delivery Health */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center space-x-3">
                        <div className="flex items-center text-emerald-705 text-xs font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {camp.success_count}
                        </div>
                        <div className="flex items-center text-red-700 text-xs font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                          <XCircle className="h-3 w-3 mr-1" />
                          {camp.fail_count}
                        </div>
                      </div>
                    </td>

                    {/* Success Rate */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeColor}`}>
                        {successPct}%
                      </span>
                    </td>

                    {/* Expansion Icon */}
                    <td className="px-6 py-4 whitespace-nowrap text-center text-neutral-450">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </td>
                  </tr>

                  {/* Expanded Details Row */}
                  {isExpanded && (
                    <tr className="bg-neutral-50/20">
                      <td colSpan={7} className="px-8 py-6 border-t border-neutral-150">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                          
                          {/* Left Column: Full Message details */}
                          <div className={`md:col-span-8 ${camp.image_url ? 'md:col-span-8' : 'md:col-span-12'}`}>
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Full Message Text</h4>
                              <button
                                onClick={(e) => handleCopy(campaignIdStr, camp.message_text, e)}
                                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-black transition-all border border-neutral-250 cursor-pointer"
                              >
                                {copiedId === campaignIdStr ? (
                                  <>
                                    <Check className="h-3.5 w-3.5 text-emerald-600 mr-1" />
                                    Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3.5 w-3.5 mr-1" />
                                    Copy Message
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-sm text-neutral-800 whitespace-pre-wrap break-words leading-relaxed select-text font-mono font-medium shadow-inner">
                              {camp.message_text}
                            </div>
                          </div>

                          {/* Right Column: Media Preview */}
                          {camp.image_url && (
                            <div className="md:col-span-4 flex flex-col">
                              <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Campaign Media</h4>
                              {isLinkedImage ? (
                                <div className="border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50 flex flex-col justify-between h-full min-h-36">
                                  <div className="p-2 flex justify-center items-center flex-1 bg-neutral-100">
                                    <img src={camp.image_url} alt="Large preview" className="max-h-36 rounded-lg object-contain" />
                                  </div>
                                  <div className="p-3 border-t border-neutral-200 flex justify-between items-center bg-neutral-50">
                                    <span className="text-[10px] text-neutral-500 truncate max-w-40" title={camp.image_url}>{camp.image_url}</span>
                                    <a
                                      href={camp.image_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-neutral-700 hover:text-black text-[10px] font-bold inline-flex items-center"
                                    >
                                      Open URL
                                      <ExternalLink className="h-3 w-3 ml-1" />
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <div className="border border-neutral-200 rounded-xl p-4 bg-neutral-50 flex flex-col items-center justify-center flex-1 min-h-36">
                                  <div className="bg-neutral-100 p-4 rounded-full border border-neutral-250 mb-3">
                                    <ImageIcon className="h-8 w-8 text-neutral-600" />
                                  </div>
                                  <span className="text-xs font-bold text-neutral-900">Uploaded to WhatsApp</span>
                                  <span className="text-[9px] text-neutral-450 mt-2 font-mono break-all text-center max-w-xs">{camp.image_url}</span>
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
