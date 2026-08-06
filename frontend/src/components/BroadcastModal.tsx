"use client";

import { useState } from 'react';
import { Send, Loader2, CheckCircle, AlertCircle, Megaphone, X, Upload } from 'lucide-react';
import { sendBroadcast, uploadMetaMedia } from '@/app/actions/sendBroadcast';

export default function BroadcastModal({ customerCount }: { customerCount: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [useUrl, setUseUrl] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [limit, setLimit] = useState(0); // 0 = All
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || customerCount === 0) return;
    
    setIsSending(true);
    setStatus({ type: 'idle', message: 'Initiating broadcast...' });

    try {
      let mediaId: string | undefined;

      // If user uploaded a file, upload to Meta servers first
      if (!useUrl && file) {
        setStatus({ type: 'idle', message: 'Uploading image to WhatsApp...' });
        const formData = new FormData();
        formData.append('file', file);
        mediaId = await uploadMetaMedia(formData);
      }

      setStatus({ type: 'idle', message: 'Initiating broadcast queue...' });
      const result = await sendBroadcast(
        message, 
        limit === 0 ? undefined : limit, 
        useUrl ? imageUrl || undefined : undefined, 
        mediaId
      );
      
      if (result.successCount > 0) {
        setStatus({ 
          type: 'success', 
          message: `Broadcast complete! Successfully sent to ${result.successCount} of ${result.total} customers.` 
        });
        setMessage('');
        setImageUrl('');
        setFile(null);
        setPreviewUrl(null);
        setTimeout(() => {
          setIsOpen(false);
          setStatus({ type: 'idle', message: '' });
          setLimit(0);
        }, 3000);
      } else {
        throw new Error(result.errors[0] || 'Meta API rejected the broadcast.');
      }
    } catch (err: any) {
      setStatus({ 
        type: 'error', 
        message: err.message || 'Failed to send broadcast.' 
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        disabled={customerCount === 0}
        className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-bold text-[#0a0a0a] bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)] transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Megaphone className="h-4 w-4 mr-2" />
        Broadcast Message ({customerCount})
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 relative">
            
            {/* Close Button */}
            <button
              onClick={() => { if (!isSending) setIsOpen(false); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Megaphone className="w-5 h-5 text-amber-500 mr-2" />
                Send Broadcast
              </h3>
              <p className="text-gray-400 text-xs mt-1">
                This will send a WhatsApp message to {limit === 0 ? `all ${customerCount}` : `the first ${limit}`} customers currently in your list (sorted by most recent interactions).
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Send Limit</label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="block w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm cursor-pointer"
                  disabled={isSending || status.type === 'success'}
                >
                  <option value={0}>All Customers ({customerCount})</option>
                  <option value={5}>First 5 Customers</option>
                  <option value={10}>First 10 Customers</option>
                  <option value={20}>First 20 Customers</option>
                  <option value={50}>First 50 Customers</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Campaign Image <span className="text-gray-500 text-xs">(Optional)</span>
                </label>
                
                {/* Tabs */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => { setUseUrl(false); setImageUrl(''); }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${!useUrl ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-transparent border-white/5 text-gray-400 hover:text-white'}`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUseUrl(true); setFile(null); setPreviewUrl(null); }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${useUrl ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-transparent border-white/5 text-gray-400 hover:text-white'}`}
                  >
                    Image URL
                  </button>
                </div>

                {/* Input Container */}
                <div>
                  {!useUrl ? (
                    <div className="border border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center bg-white/[0.01] hover:bg-white/[0.03] transition-all cursor-pointer relative min-h-24">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            setFile(f);
                            setPreviewUrl(URL.createObjectURL(f));
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={isSending || status.type === 'success'}
                      />
                      {previewUrl ? (
                        <div className="relative w-full max-h-28 flex justify-center items-center">
                          <img src={previewUrl} className="max-h-24 rounded-lg object-contain" alt="Upload Preview" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFile(null);
                              setPreviewUrl(null);
                            }}
                            className="absolute top-0 right-1/4 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-amber-500/80 mb-1.5" />
                          <span className="text-xs text-gray-400">Click or drag image to upload</span>
                        </>
                      )}
                    </div>
                  ) : (
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/images/new-pendant.jpg"
                      className="block w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm"
                      disabled={isSending || status.type === 'success'}
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Message Body</label>
                <p className="text-[10px] text-amber-500/80 mb-2">Tip: Use <strong>{`{name}`}</strong> to dynamically insert the customer's WhatsApp name.</p>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hello {name}! We've just added new gold items to our vault. Tap here to view: https://example.com"
                  className="block w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all resize-none text-sm"
                  disabled={isSending || status.type === 'success'}
                />
              </div>

              {/* Status Indicator */}
              {status.message && (
                <div className={`p-4 rounded-xl flex items-start ${
                  status.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 
                  status.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 
                  'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                }`}>
                  {status.type === 'error' && <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />}
                  {status.type === 'success' && <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />}
                  {status.type === 'idle' && <Loader2 className="w-5 h-5 mr-3 flex-shrink-0 animate-spin mt-0.5" />}
                  <div className="text-xs font-medium leading-relaxed">{status.message}</div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSending}
                  className="px-4 py-2 border border-white/10 rounded-xl text-sm font-medium text-gray-400 bg-white/5 hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending || !message.trim() || status.type === 'success'}
                  className="inline-flex items-center justify-center px-5 py-2 bg-gradient-to-r from-amber-400 to-amber-600 text-[#0a0a0a] font-bold text-sm rounded-xl hover:from-amber-300 hover:to-amber-500 transition-all disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Broadcast
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
