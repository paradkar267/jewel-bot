"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gem, PlusCircle, FileSpreadsheet, Users, History, RefreshCw, Store, Shield, LayoutDashboard, Settings, Menu, X, Megaphone, Activity } from 'lucide-react';
import LogoutButton from './LogoutButton';

interface SidebarProps {
  shopName: string | null;
  userEmail: string | null;
  isSuperAdmin?: boolean;
}

export default function Sidebar({ shopName, userEmail, isSuperAdmin }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const isAdminPage = pathname === '/dashboard/admin' || pathname.startsWith('/dashboard/admin');

  const baseItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Catalog', href: '/dashboard/catalog', icon: Gem },
    { name: 'Add Single Item', href: '/dashboard/add', icon: PlusCircle },
    { name: 'Bulk Upload (CSV)', href: '/dashboard/bulk', icon: FileSpreadsheet },
    { name: 'My Customers', href: '/dashboard/leads', icon: Users },
    { name: 'Broadcast History', href: '/dashboard/broadcasts', icon: History },
    { name: 'Website Auto-Sync', href: '/dashboard/sync', icon: RefreshCw },
    { name: 'Bot & Store Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const adminItems = [
    { name: 'Shops Console', href: '/dashboard/admin', icon: Shield },
    { name: 'Announcements', href: '/dashboard/admin/announcements', icon: Megaphone },
    { name: 'Showroom Audit Logs', href: '/dashboard/admin/activity', icon: Activity },
    { name: 'Export CSV Reports', href: '/dashboard/admin/export', icon: FileSpreadsheet },
  ];

  let menuItems;

  if (isAdminPage) {
    menuItems = adminItems;
  } else {
    menuItems = (isSuperAdmin || userEmail === 'bizleap1@gmail.com')
      ? [adminItems[0], ...baseItems]
      : baseItems;
  }

  const renderNavContent = () => (
    <div className="flex flex-col justify-between h-full py-4">
      <div>
        {/* Brand & Logo */}
        <div className="h-14 px-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gradient-to-br from-amber-200 to-amber-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.2)] flex-shrink-0">
              <Store className="h-4 w-4 text-[#0a0a0a]" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-white tracking-wider uppercase">JewelBot</span>
              <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">
                {isAdminPage ? 'Platform Control' : 'Vault Panel'}
              </span>
            </div>
          </div>
          {/* Close button for mobile drawer */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Shop Badge */}
        {shopName && (
          <div className="px-6 py-3 border-b border-white/5 bg-white/[0.01]">
            <div className="flex items-center text-xs font-bold text-amber-500 truncate">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_5px_rgba(16,185,129,0.5)] flex-shrink-0"></div>
              <span className="truncate">{shopName}</span>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-220px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(251,191,36,0.05)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 mr-3 transition-colors flex-shrink-0 ${
                  isActive ? 'text-amber-400' : 'text-gray-400 group-hover:text-white'
                }`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Logout */}
      <div className="p-4 border-t border-white/5 bg-white/[0.01]">
        {userEmail && (
          <div className="px-4 mb-3">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Logged in as</p>
            <p className="text-xs text-gray-400 truncate font-medium mt-0.5">{userEmail}</p>
          </div>
        )}
        <LogoutButton />
      </div>
    </div>
  );

  return (
    <>
      {/* 📱 Mobile Top Navigation Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-[#111111]/90 backdrop-blur-md border-b border-white/10 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 bg-gradient-to-br from-amber-200 to-amber-500 rounded-lg flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.2)]">
            <Store className="h-4 w-4 text-[#0a0a0a]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-white tracking-wider uppercase">JewelBot</span>
            {shopName && <span className="text-[10px] text-amber-400 font-bold truncate max-w-[140px]">{shopName}</span>}
          </div>
        </div>

        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 active:scale-95 transition-all"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* 📱 Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        />
      )}

      {/* 📱 Mobile Slide-Out Drawer */}
      <aside className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-[#111111] border-r border-white/10 transform transition-transform duration-300 ease-in-out ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {renderNavContent()}
      </aside>

      {/* 💻 Desktop Fixed Sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-64 bg-[#111111] border-r border-white/5 flex-col justify-between">
        {renderNavContent()}
      </aside>
    </>
  );
}
