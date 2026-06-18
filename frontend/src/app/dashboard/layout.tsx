'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { LogOut, Package, PlusCircle, Store } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [shopName, setShopName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUserEmail(session.user.email || null);
        
        // Fetch shop name
        const { data: shopData } = await supabase.from('shops').select('name').limit(1).single();
        if (shopData && shopData.name) {
          setShopName(shopData.name);
        }
        
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 font-sans selection:bg-amber-500/30">
      <nav className="bg-[#111111]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/" className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity">
                <div className="h-8 w-8 bg-gradient-to-br from-amber-200 to-amber-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                  <Store className="h-5 w-5 text-[#0a0a0a]" />
                </div>
                <span className="ml-3 text-lg font-bold text-white tracking-tight">JewelBot Vault</span>
              </Link>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <Link href="/dashboard" className="border-transparent text-gray-400 hover:border-white/20 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                  Catalog
                </Link>
                <Link href="/dashboard/add" className="border-transparent text-gray-400 hover:border-white/20 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                  Add Single Item
                </Link>
                <Link href="/dashboard/bulk" className="border-transparent text-gray-400 hover:border-white/20 hover:text-white inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                  Bulk Upload (CSV)
                </Link>
                <Link href="/dashboard/leads" className="border-transparent text-gray-400 hover:border-amber-500 hover:text-amber-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                  My Customers
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {(shopName || userEmail) && (
                <div className="hidden md:flex flex-col items-end mr-2">
                  {shopName && (
                    <div className="flex items-center text-sm font-bold text-amber-500">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                      {shopName}
                    </div>
                  )}
                  {userEmail && (
                    <div className="text-xs text-gray-500">
                      {userEmail}
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-1.5 border border-white/10 rounded-lg text-sm font-medium text-gray-400 bg-white/5 hover:text-white hover:bg-white/10 hover:border-red-500/50 hover:text-red-400 transition-all"
                title="Logout"
              >
                <LogOut className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
