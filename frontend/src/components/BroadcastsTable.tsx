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
      <div className="p-12 text-center">
        <svg className="h-12 w-12 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <h3 className="text-lg font-bold text-white">No campaigns sent yet</h3>
        <p className="text-gray-400 text-sm mt-1 max-w-sm mx-auto">
          Go to your "My Customers" tab and click "Broadcast Message" to start sending updates.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden border border-white/5 rounded-2xl bg-[#111111] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/5 table-fixed">
          <thead className="bg-[#0a0a0a]">
            <tr>
              <th scope="col" className="w-[200px] px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Date & Time
              </th>
              <th scope="col" className="w-[100px] px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Media
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Message Preview
              </th>
              <th scope="col" className="w-[120px] px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                Recipients
              </th>
              <th scope="col" className="w-[160px] px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                Delivery Health
              </th>
              <th scope="col" className="w-[140px] px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                Success Rate
              </th>
              <th scope="col" className="w-[60px] px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {campaigns.map((camp) => {
              const campaignIdStr = String(camp.id);
              const isExpanded = expandedId === campaignIdStr;
              const successPct = camp.total_recipients > 0 
                ? Math.round((camp.success_count / camp.total_recipients) * 100) 
                : 0;

              let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
              if (successPct < 50) {
                badgeColor = 'bg-red-500/10 text-red-400 border-red-500/20';
              } else if (successPct < 90) {
                badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
              }

              const isUploadedImage = camp.image_url && camp.image_url.startsWith('Meta Media ID:');
              const isLinkedImage = camp.image_url && !isUploadedImage;

              return (
                <Fragment key={camp.id}>
                  {/* Main Row */}
                  <tr 
                    onClick={() => toggleExpand(campaignIdStr)} 
                    className={`cursor-pointer hover:bg-white/[0.03] transition-colors select-none ${isExpanded ? 'bg-white/[0.01]' : ''}`}
                  >
                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-blue-500 mr-2.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-white">{new Date(camp.created_at).toLocaleDateString()}</div>
                          <div className="text-[10px] text-gray-500">{new Date(camp.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>
                      </div>
                    </td>

                    {/* Media Thumbnail */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {camp.image_url ? (
                        isLinkedImage ? (
                          <div className="h-10 w-10 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center flex-shrink-0">
                            <img src={camp.image_url} alt="Media" className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-lg border border-amber-500/20 bg-amber-500/5 flex items-center justify-center flex-shrink-0" title={camp.image_url}>
                            <ImageIcon className="h-5 w-5 text-amber-500" />
                          </div>
                        )
                      ) : (
                        <span className="text-xs text-gray-500">—</span>
                      )}
                    </td>

                    {/* Preview message */}
                    <td className="px-6 py-4 text-sm text-gray-300 overflow-hidden text-ellipsis whitespace-nowrap">
                      <span className="font-medium text-gray-200">
                        {camp.message_text}
                      </span>
                    </td>

                    {/* Recipients */}
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-white">
                      {camp.total_recipients}
                    </td>

                    {/* Delivery Health */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center space-x-3">
                        <div className="flex items-center text-emerald-400 text-xs font-bold bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {camp.success_count}
                        </div>
                        <div className="flex items-center text-red-400 text-xs font-bold bg-red-500/5 border border-red-500/10 px-2 py-0.5 rounded-md">
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
                    <td className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </td>
                  </tr>

                  {/* Expanded Details Row */}
                  {isExpanded && (
                    <tr className="bg-white/[0.01]">
                      <td colSpan={7} className="px-8 py-6 border-t border-white/5">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                          
                          {/* Left Column: Full Message details */}
                          <div className={`md:col-span-8 ${camp.image_url ? 'md:col-span-8' : 'md:col-span-12'}`}>
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Message Text</h4>
                              <button
                                onClick={(e) => handleCopy(campaignIdStr, camp.message_text, e)}
                                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all border border-white/5"
                              >
                                {copiedId === campaignIdStr ? (
                                  <>
                                    <Check className="h-3.5 w-3.5 text-emerald-500 mr-1" />
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
                            <div className="bg-[#070707] border border-white/5 rounded-xl p-4 text-sm text-gray-200 whitespace-pre-wrap break-words leading-relaxed select-text font-mono font-medium shadow-inner">
                              {camp.message_text}
                            </div>
                          </div>

                          {/* Right Column: Media Preview */}
                          {camp.image_url && (
                            <div className="md:col-span-4 flex flex-col">
                              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Campaign Media</h4>
                              {isLinkedImage ? (
                                <div className="border border-white/5 rounded-xl overflow-hidden bg-[#070707] flex flex-col justify-between h-full min-h-36">
                                  <div className="p-2 flex justify-center items-center flex-1 bg-black/40">
                                    <img src={camp.image_url} alt="Large preview" className="max-h-36 rounded-lg object-contain" />
                                  </div>
                                  <div className="p-3 border-t border-white/5 flex justify-between items-center bg-[#0d0d0d]">
                                    <span className="text-[10px] text-gray-500 truncate max-w-40" title={camp.image_url}>{camp.image_url}</span>
                                    <a
                                      href={camp.image_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-amber-500 hover:text-amber-400 text-[10px] font-bold inline-flex items-center"
                                    >
                                      Open URL
                                      <ExternalLink className="h-3 w-3 ml-1" />
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <div className="border border-white/5 rounded-xl p-4 bg-[#070707] flex flex-col items-center justify-center flex-1 min-h-36">
                                  <div className="bg-amber-500/10 p-4 rounded-full border border-amber-500/20 mb-3">
                                    <ImageIcon className="h-8 w-8 text-amber-500" />
                                  </div>
                                  <span className="text-xs font-bold text-white">Uploaded to WhatsApp</span>
                                  <span className="text-[9px] text-gray-500 mt-2 font-mono break-all text-center max-w-xs">{camp.image_url}</span>
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
