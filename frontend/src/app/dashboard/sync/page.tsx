'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Globe, Download, Loader2, CheckCircle, AlertCircle, Database } from 'lucide-react';

export default function SyncPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
  const [scrapedData, setScrapedData] = useState<any[] | null>(null);

  const handleScrape = async () => {
    if (!url) return;
    setIsScraping(true);
    setScrapedData(null);
    setStatus({ type: 'idle', message: 'Scanning website sitemap and extracting products... This may take a minute.' });

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan website.');
      }

      setScrapedData(data.products);
      setStatus({ type: 'success', message: `Found ${data.total_found} products. Previewing first ${data.scraped_count}.` });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsScraping(false);
    }
  };

  const handleSaveToDatabase = async () => {
    if (!scrapedData || scrapedData.length === 0) return;
    setIsSaving(true);
    setStatus({ type: 'idle', message: 'Saving products to your vault...' });

    try {
      const { data: shopData, error: shopError } = await supabase.from('shops').select('id').limit(1).single();
      if (shopError || !shopData) throw new Error("Could not find your shop account.");

      const rowsToInsert = scrapedData.map(product => ({
        shop_id: shopData.id,
        ...product
      }));

      const { error: insertError } = await supabase.from('products').insert(rowsToInsert);
      if (insertError) throw insertError;

      setStatus({ type: 'success', message: `Successfully saved ${rowsToInsert.length} products to your vault!` });
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Website Auto-Sync</h1>
        <p className="text-gray-400 mt-1">Automatically pull products from your existing E-commerce website.</p>
      </div>

      <div className="bg-[#111111] shadow-2xl rounded-2xl border border-white/5 overflow-hidden p-8">
        
        {/* Step 1: Enter URL */}
        <div>
          <h3 className="text-xl font-bold text-white flex items-center mb-6">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 text-sm mr-3">1</span>
            Enter your Website URL
          </h3>

          <div className="flex gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Globe className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourjewelryshop.com"
                className="block w-full pl-11 pr-4 py-3 bg-[#0a0a0a] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                required
              />
            </div>
            <button
              onClick={handleScrape}
              disabled={!url || isScraping}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-[#0a0a0a] bg-amber-500 hover:bg-amber-400 focus:outline-none disabled:opacity-50 transition-colors"
            >
              {isScraping ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Download className="w-5 h-5 mr-2" />}
              {isScraping ? 'Scanning...' : 'Scan Website'}
            </button>
          </div>

          {status.message && (
            <div className={`mt-6 p-4 rounded-xl flex items-center ${
              status.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 
              status.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 
              'bg-blue-500/10 border border-blue-500/20 text-blue-400'
            }`}>
              {status.type === 'error' && <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />}
              {status.type === 'success' && <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />}
              {status.type === 'idle' && <Loader2 className="w-5 h-5 mr-3 flex-shrink-0 animate-spin" />}
              <span className="font-medium text-sm">{status.message}</span>
            </div>
          )}
        </div>

        {/* Step 2: Preview & Save */}
        {scrapedData && (
          <div className="mt-12 pt-10 border-t border-white/5 animate-in slide-in-from-bottom-4">
            <h3 className="text-xl font-bold text-white flex items-center justify-between mb-6">
              <div className="flex items-center">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 text-sm mr-3">2</span>
                Review & Save Products
              </div>
              <button
                onClick={handleSaveToDatabase}
                disabled={isSaving}
                className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold rounded-xl hover:from-amber-300 hover:to-amber-500 transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Database className="w-4 h-4 mr-2" />}
                Save {scrapedData.length} Products to Vault
              </button>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scrapedData.map((item, i) => (
                <div key={i} className="bg-[#0a0a0a] rounded-xl border border-white/5 overflow-hidden flex flex-col">
                  {item.image_url ? (
                    <div className="aspect-square w-full relative bg-gray-900">
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="aspect-square w-full bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-white line-clamp-2">{item.name}</h4>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">{item.url}</p>
                    </div>
                    <div className="mt-3 font-bold text-amber-400">
                      {item.price_range_min ? `₹${item.price_range_min.toLocaleString('en-IN')}` : 'Price not found'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
