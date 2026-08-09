'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Download, Loader2, CheckCircle, AlertCircle, Database, Sparkles, Check, ExternalLink, ShieldCheck, Gem } from 'lucide-react';
import { createSyncProducts } from '@/app/actions/syncProduct';

export default function SyncPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
  const [scrapedData, setScrapedData] = useState<any[] | null>(null);
  const [engineUsed, setEngineUsed] = useState<string>('');
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const handleScrape = async () => {
    if (!url.trim()) return;
    setIsScraping(true);
    setScrapedData(null);
    setEngineUsed('');
    setStatus({ type: 'idle', message: 'Scanning website sitemap & AI product structure... This may take a few seconds.' });

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
      setEngineUsed(data.engine || 'AI Web Auto-Scraper');
      setSelectedIndices(new Set(data.products.map((_: any, i: number) => i)));
      setStatus({ 
        type: 'success', 
        message: `Successfully extracted ${data.scraped_count} jewelry products using ${data.engine || 'AI Engine'}!` 
      });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsScraping(false);
    }
  };

  const toggleSelectAll = () => {
    if (!scrapedData) return;
    if (selectedIndices.size === scrapedData.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(scrapedData.map((_, i) => i)));
    }
  };

  const toggleItemSelect = (index: number) => {
    const next = new Set(selectedIndices);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setSelectedIndices(next);
  };

  const handleSaveToDatabase = async () => {
    if (!scrapedData || selectedIndices.size === 0) return;
    setIsSaving(true);
    setStatus({ type: 'idle', message: `Importing ${selectedIndices.size} items to your catalog...` });

    try {
      const selectedItems = scrapedData.filter((_, i) => selectedIndices.has(i));
      const result = await createSyncProducts(selectedItems);
      
      if (!result.success) throw new Error("Failed to save products.");

      setStatus({ type: 'success', message: `🎉 Successfully imported ${result.count} jewelry products to your catalog!` });
      setTimeout(() => router.push('/dashboard/catalog'), 1500);
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10 space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/30 text-amber-400">
            <Globe className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white gold-text-gradient tracking-tight">Website Auto-Sync Engine</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Automatically extract, parse, & import products from any jewelry e-commerce website (Shopify, WooCommerce, Custom Store).</p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-gradient-to-b from-[#121212] via-[#0d0d0d] to-[#080808] shadow-2xl rounded-3xl border border-amber-500/20 overflow-hidden p-6 sm:p-8 space-y-8">
        
        {/* Step 1: Enter URL */}
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center mb-4">
            <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-amber-500 text-black text-xs font-black mr-3 shadow-md shadow-amber-500/30">1</span>
            Enter E-Commerce Website URL
          </h3>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Globe className="h-5 w-5 text-amber-400/70" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
                placeholder="https://yourjewelryshop.com or Shopify store URL"
                className="block w-full pl-11 pr-4 py-3.5 bg-black/60 border border-white/10 rounded-2xl text-white text-sm placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-medium"
              />
            </div>

            <button
              onClick={handleScrape}
              disabled={!url.trim() || isScraping}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black font-extrabold text-sm rounded-2xl shadow-xl shadow-amber-500/25 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
            >
              {isScraping ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : <Sparkles className="w-5 h-5 fill-black text-black" />}
              <span>{isScraping ? 'Scanning Store...' : 'Scan Website'}</span>
            </button>
          </div>

          {/* Quick Examples Helper */}
          <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-500 font-semibold">
            <span>Supports:</span>
            <span className="bg-white/5 px-2 py-0.5 rounded-md border border-white/5 text-gray-400">Shopify API</span>
            <span className="bg-white/5 px-2 py-0.5 rounded-md border border-white/5 text-gray-400">WooCommerce</span>
            <span className="bg-white/5 px-2 py-0.5 rounded-md border border-white/5 text-gray-400">XML Sitemaps</span>
            <span className="bg-white/5 px-2 py-0.5 rounded-md border border-white/5 text-gray-400">Direct Page AI</span>
          </div>

          {/* Status Message Alert */}
          {status.message && (
            <div className={`mt-6 p-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-3 ${
              status.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 
              status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 
              'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}>
              {status.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
              {status.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />}
              {status.type === 'idle' && <Loader2 className="w-5 h-5 text-amber-400 shrink-0 animate-spin" />}
              <div className="flex-1">
                <span>{status.message}</span>
                {engineUsed && (
                  <span className="ml-2 bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-amber-500/30 uppercase">
                    Engine: {engineUsed}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Review & Save Extracted Products */}
        {scrapedData && scrapedData.length > 0 && (
          <div className="pt-8 border-t border-white/10 space-y-6 animate-in slide-in-from-bottom-4">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-amber-500 text-black text-xs font-black shadow-md">2</span>
                <div>
                  <h3 className="text-base font-extrabold text-white">Review & Select Products ({selectedIndices.size}/{scrapedData.length} Selected)</h3>
                  <p className="text-xs text-gray-400">Metal, Karat, Category, & Weight automatically detected by AI.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <button
                  onClick={toggleSelectAll}
                  className="text-xs font-extrabold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3.5 py-2 rounded-xl border border-amber-500/30 transition-all"
                >
                  {selectedIndices.size === scrapedData.length ? 'Deselect All' : 'Select All'}
                </button>

                <button
                  onClick={handleSaveToDatabase}
                  disabled={isSaving || selectedIndices.size === 0}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-400 to-emerald-500 text-black font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Database className="w-4 h-4 text-black fill-black" />}
                  <span>Import {selectedIndices.size} Products</span>
                </button>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {scrapedData.map((item, i) => {
                const isSelected = selectedIndices.has(i);

                return (
                  <div 
                    key={i} 
                    onClick={() => toggleItemSelect(i)}
                    className={`rounded-2xl border transition-all cursor-pointer overflow-hidden flex flex-col relative group ${
                      isSelected 
                        ? 'bg-gradient-to-b from-[#181818] to-[#0f0f0f] border-amber-500/50 shadow-xl shadow-amber-500/10' 
                        : 'bg-[#0a0a0a] border-white/5 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* Checkbox badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        isSelected ? 'bg-amber-500 text-black font-extrabold shadow-md' : 'bg-black/60 border border-white/20 text-transparent'
                      }`}>
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    </div>

                    {/* Image */}
                    <div className="aspect-video w-full relative bg-black/60 overflow-hidden">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-white/[0.02]">
                          <Gem className="w-8 h-8 mb-1 opacity-40" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            {item.type}
                          </span>
                          {item.price && (
                            <span className="text-sm font-black text-emerald-400">
                              ₹{item.price.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">{item.name}</h4>
                      </div>

                      {/* Detected Specs Badges */}
                      <div className="pt-2 border-t border-white/5 flex flex-wrap gap-1.5 text-[10px] font-bold">
                        <span className="bg-white/5 text-gray-300 px-2 py-0.5 rounded-md border border-white/10 uppercase">
                          {item.metal}
                        </span>
                        <span className="bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/20">
                          {item.karat}
                        </span>
                        {item.weight_grams && (
                          <span className="bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded-md border border-blue-500/20">
                            {item.weight_grams}g
                          </span>
                        )}
                        <span className="bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-md border border-purple-500/20">
                          Mc: {item.making_charge_percent}%
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
