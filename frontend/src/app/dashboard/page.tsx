'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, Plus, Sparkles, Tag, Layers } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    // Get the user's shop first
    const { data: shopData } = await supabase.from('shops').select('id').limit(1).single();
    
    if (shopData) {
      // Only fetch products for THEIR shop
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shopData.id)
        .order('created_at', { ascending: false });
      
      if (data) {
        setProducts(data);
      }
    }
    setLoading(false);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Vault</h1>
          <p className="text-gray-400 mt-1">Manage your exclusive jewelry collection</p>
        </div>
        <Link 
          href="/dashboard/add" 
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-bold text-[#0a0a0a] bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.2)] hover:shadow-[0_0_25px_rgba(251,191,36,0.3)] transition-all transform hover:scale-105"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Add Jewelry
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-48 rounded-xl bg-white/5 animate-pulse border border-white/5"></div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 bg-[#111111]/50 rounded-2xl border border-white/5 backdrop-blur-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6 shadow-inner">
            <Package className="h-10 w-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white">Your vault is empty</h3>
          <p className="mt-2 text-gray-400 max-w-md mx-auto">Start building your automated catalog by adding your first jewelry piece. Our AI will handle the rest.</p>
          <div className="mt-8">
            <Link 
              href="/dashboard/add" 
              className="inline-flex items-center px-4 py-2 border border-white/10 rounded-lg text-sm font-medium text-white bg-white/5 hover:bg-white/10 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => (
            <div key={product.id} className="group bg-[#111111] rounded-xl overflow-hidden border border-white/5 hover:border-amber-500/30 transition-all duration-300 hover:shadow-[0_4px_20px_rgb(0,0,0,0.5)]">
              
              {/* Image Area */}
              <div className="aspect-square bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center">
                {product.image_url ? (
                  <>
                    <img src={product.image_url} alt={product.name} className="absolute inset-0 w-full h-full object-cover z-0 transform group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/20 to-transparent z-10" />
                  </>
                ) : (
                  <div className="text-6xl z-0 transform group-hover:scale-110 transition-transform duration-500">
                    {product.type === 'ring' ? '💍' : product.type === 'necklace' ? '📿' : '✨'}
                  </div>
                )}

                <div className="absolute top-2 right-2 z-20">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 backdrop-blur-md">
                    Active
                  </span>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-4">
                <h4 className="text-sm font-bold text-white mb-2 line-clamp-1">{product.name || 'Unnamed Jewelry'}</h4>
                
                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <div className="flex items-center gap-1 capitalize truncate pr-2">
                    <Layers className="w-3 h-3 text-gray-500" />
                    {product.metal}
                  </div>
                  <div className="flex items-center gap-1 capitalize shrink-0">
                    <Tag className="w-3 h-3 text-gray-500" />
                    {product.type}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-0.5">Est. Value</span>
                  <span className="text-sm font-bold text-amber-400">
                    {product.price ? `₹${product.price.toLocaleString()}` : 'Ask for Price'}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
