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
        const uploadRes = await uploadMetaMedia(formData);
        if (!uploadRes.success) {
          throw new Error(uploadRes.error || 'Failed to upload image to WhatsApp');
        }
        mediaId = uploadRes.mediaId;
      }

      setStatus({ type: 'idle', message: 'Initiating broadcast queue...' });
      const result = await sendBroadcast(
        message, 
        limit === 0 ? undefined : limit, 
        useUrl ? imageUrl || undefined : undefined, 
        mediaId
      );
      
      if (result.success && result.successCount !== undefined && result.successCount > 0) {
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
        throw new Error(result.errors?.[0] || 'Meta API rejected the broadcast.');
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
        className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-bold text-white bg-black hover:bg-neutral-800 shadow-sm border border-neutral-900 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <Megaphone className="h-4 w-4 mr-2" />
        Broadcast Message ({customerCount})
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 relative">
            
            {/* Close Button */}
            <button
              onClick={() => { if (!isSending) setIsOpen(false); }}
              className="absolute top-4 right-4 text-neutral-500 hover:text-black transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-neutral-900 flex items-center">
                <Megaphone className="w-5 h-5 text-neutral-800 mr-2" />
                Send Broadcast
              </h3>
              <p className="text-neutral-500 text-xs mt-1">
                This will send a WhatsApp message to {limit === 0 ? `all ${customerCount}` : `the first ${limit}`} customers currently in your list (sorted by most recent interactions).
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Send Limit</label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="block w-full bg-white border border-neutral-300 rounded-xl p-3 text-neutral-900 focus:outline-none focus:border-black transition-all text-sm cursor-pointer"
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
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Campaign Image <span className="text-neutral-450 text-xs">(Optional)</span>
                </label>
                
                {/* Tabs */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => { setUseUrl(false); setImageUrl(''); }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${!useUrl ? 'bg-neutral-100 border-neutral-300 text-neutral-900' : 'bg-transparent border-neutral-200 text-neutral-500 hover:text-black'}`}
                  >
                    Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUseUrl(true); setFile(null); setPreviewUrl(null); }}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${useUrl ? 'bg-neutral-100 border-neutral-300 text-neutral-900' : 'bg-transparent border-neutral-200 text-neutral-500 hover:text-black'}`}
                  >
                    Image URL
                  </button>
                </div>

                {/* Input Container */}
                <div>
                  {!useUrl ? (
                    <div className="border border-dashed border-neutral-300 rounded-xl p-4 flex flex-col items-center justify-center bg-neutral-50 hover:bg-neutral-100 transition-all cursor-pointer relative min-h-24">
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
                            className="absolute top-0 right-1/4 bg-red-600 hover:bg-red-500 text-white rounded-full p-1 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-neutral-600 mb-1.5" />
                          <span className="text-xs text-neutral-500">Click or drag image to upload</span>
                        </>
                      )}
                    </div>
                  ) : (
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/images/new-pendant.jpg"
                      className="block w-full bg-white border border-neutral-300 rounded-xl p-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black transition-all text-sm"
                      disabled={isSending || status.type === 'success'}
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Message Body</label>
                <p className="text-[10px] text-neutral-500 mb-2">Tip: Use <strong>{`{name}`}</strong> to dynamically insert the customer's WhatsApp name.</p>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hello {name}! We've just added new gold items to our vault. Tap here to view: https://example.com"
                  className="block w-full bg-white border border-neutral-300 rounded-xl p-3 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-black transition-all resize-none text-sm"
                  disabled={isSending || status.type === 'success'}
                />
              </div>

              {/* Status Indicator */}
              {status.message && (
                <div className={`p-4 rounded-xl flex items-start ${
                  status.type === 'error' ? 'bg-red-50 border border-red-200 text-red-750' : 
                  status.type === 'success' ? 'bg-emerald-50 border border-emerald-250 text-emerald-800' : 
                  'bg-neutral-100 border border-neutral-250 text-neutral-700'
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
                  className="px-4 py-2 border border-neutral-250 rounded-xl text-sm font-medium text-neutral-600 hover:text-black bg-neutral-100 hover:bg-neutral-200 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending || !message.trim() || status.type === 'success'}
                  className="inline-flex items-center justify-center px-5 py-2 bg-black text-white hover:bg-neutral-800 font-bold text-sm rounded-xl transition-all border border-neutral-900 disabled:opacity-50 cursor-pointer shadow-sm"
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
