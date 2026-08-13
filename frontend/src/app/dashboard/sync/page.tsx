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
          <div className="p-3 bg-neutral-100 rounded-2xl border border-neutral-250 text-neutral-850">
            <Globe className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">Website Auto-Sync Engine</h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">Automatically extract, parse, & import products from any jewelry e-commerce website (Shopify, WooCommerce, Custom Store).</p>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white shadow-sm rounded-3xl border border-neutral-200 overflow-hidden p-6 sm:p-8 space-y-8">
        
        {/* Step 1: Enter URL */}
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-neutral-900 flex items-center mb-4">
            <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-black text-white text-xs font-black mr-3 shadow-sm">1</span>
            Enter E-Commerce Website URL
          </h3>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Globe className="h-5 w-5 text-neutral-500" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
                placeholder="https://yourjewelryshop.com or Shopify store URL"
                className="block w-full pl-11 pr-4 py-3.5 bg-white border border-neutral-300 rounded-2xl text-neutral-900 text-sm placeholder-neutral-400 focus:ring-2 focus:ring-black focus:border-black transition-all font-medium"
              />
            </div>

            <button
              onClick={handleScrape}
              disabled={!url.trim() || isScraping}
              className="px-8 py-3.5 bg-black hover:bg-neutral-800 text-white font-extrabold text-sm rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-sm"
            >
              {isScraping ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Sparkles className="w-5 h-5 fill-white text-white" />}
              <span>{isScraping ? 'Scanning Store...' : 'Scan Website'}</span>
            </button>
          </div>

          {/* Quick Examples Helper */}
          <div className="mt-3 flex items-center gap-2 text-[11px] text-neutral-500 font-semibold">
            <span>Supports:</span>
            <span className="bg-neutral-105 px-2 py-0.5 rounded-md border border-neutral-200 text-neutral-600 font-bold">Shopify API</span>
            <span className="bg-neutral-105 px-2 py-0.5 rounded-md border border-neutral-200 text-neutral-600 font-bold">WooCommerce</span>
            <span className="bg-neutral-105 px-2 py-0.5 rounded-md border border-neutral-200 text-neutral-600 font-bold">XML Sitemaps</span>
            <span className="bg-neutral-105 px-2 py-0.5 rounded-md border border-neutral-200 text-neutral-600 font-bold">Direct Page AI</span>
          </div>

          {/* Status Message Alert */}
          {status.message && (
            <div className={`mt-6 p-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center gap-3 ${
              status.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 
              status.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 
              'bg-neutral-50 border-neutral-200 text-neutral-800'
            }`}>
              {status.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" />}
              {status.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0" />}
              {status.type === 'idle' && <Loader2 className="w-5 h-5 text-neutral-700 shrink-0 animate-spin" />}
              <div className="flex-1">
                <span>{status.message}</span>
                {engineUsed && (
                  <span className="ml-2 bg-neutral-100 text-neutral-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-neutral-250 uppercase">
                    Engine: {engineUsed}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Review & Save Extracted Products */}
        {scrapedData && scrapedData.length > 0 && (
          <div className="pt-8 border-t border-neutral-200 space-y-6 animate-in slide-in-from-bottom-4">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-black text-white text-xs font-black shadow-sm">2</span>
                <div>
                  <h3 className="text-base font-extrabold text-neutral-900">Review & Select Products ({selectedIndices.size}/{scrapedData.length} Selected)</h3>
                  <p className="text-xs text-neutral-500">Metal, Karat, Category, & Weight automatically detected by AI.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <button
                  onClick={toggleSelectAll}
                  className="text-xs font-extrabold text-neutral-700 hover:text-black bg-neutral-100 hover:bg-neutral-200 px-3.5 py-2 rounded-xl border border-neutral-250 transition-all cursor-pointer"
                >
                  {selectedIndices.size === scrapedData.length ? 'Deselect All' : 'Select All'}
                </button>

                <button
                  onClick={handleSaveToDatabase}
                  disabled={isSaving || selectedIndices.size === 0}
                  className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Database className="w-4 h-4 text-white fill-white" />}
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
                        ? 'bg-white border-neutral-800 shadow-md' 
                        : 'bg-white border-neutral-200 opacity-60 hover:opacity-100 shadow-sm'
                    }`}
                  >
                    {/* Checkbox badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        isSelected ? 'bg-black text-white font-extrabold shadow-sm' : 'bg-white border border-neutral-350 text-transparent'
                      }`}>
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    </div>

                    {/* Image */}
                    <div className="aspect-video w-full relative bg-neutral-100 overflow-hidden">
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
                        <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 bg-neutral-100">
                          <Gem className="w-8 h-8 mb-1 opacity-40 text-neutral-500" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-extrabold text-neutral-850 uppercase tracking-widest bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-250">
                            {item.type}
                          </span>
                          {item.price && (
                            <span className="text-sm font-extrabold text-neutral-900">
                              ₹{item.price.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-neutral-900 line-clamp-2 leading-snug">{item.name}</h4>
                      </div>

                      {/* Detected Specs Badges */}
                      <div className="pt-2 border-t border-neutral-200 flex flex-wrap gap-1.5 text-[10px] font-bold">
                        <span className="bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-md border border-neutral-250 uppercase">
                          {item.metal}
                        </span>
                        <span className="bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-md border border-neutral-250 uppercase">
                          {item.karat}
                        </span>
                        {item.weight_grams && (
                          <span className="bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-md border border-neutral-250 uppercase">
                            {item.weight_grams}g
                          </span>
                        )}
                        <span className="bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded-md border border-neutral-250 uppercase">
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
