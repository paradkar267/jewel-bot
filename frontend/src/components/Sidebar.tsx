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
    { name: 'Jewelry Catalog', href: '/dashboard/catalog', icon: Gem },
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
        <div className="h-16 px-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.25)] shrink-0">
              <Store className="h-5 w-5 text-black fill-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black text-white tracking-wide gold-text-gradient uppercase">JEWELBOT</span>
              <span className="text-[10px] font-extrabold text-amber-400/80 tracking-widest uppercase">
                {isAdminPage ? 'SUPER ADMIN PANEL' : 'AI SHOWROOM PORTAL'}
              </span>
            </div>
          </div>
          {/* Close button for mobile drawer */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Shop Active Badge */}
        {shopName && (
          <div className="px-6 py-3 border-b border-white/5 bg-gradient-to-r from-amber-500/5 via-transparent to-transparent">
            <div className="flex items-center text-xs font-extrabold text-amber-300 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse shrink-0"></span>
              <span className="truncate">{shopName}</span>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-230px)]">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center px-4 py-3 text-xs sm:text-sm font-extrabold rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent text-amber-300 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 mr-3 transition-colors shrink-0 ${
                  isActive ? 'text-amber-400' : 'text-gray-400 group-hover:text-amber-400'
                }`} />
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile & Logout */}
      <div className="p-4 border-t border-white/10 bg-black/40">
        {userEmail && (
          <div className="px-4 mb-3">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Connected Account</p>
            <p className="text-xs font-bold text-gray-300 truncate font-mono mt-0.5">{userEmail}</p>
          </div>
        )}
        <LogoutButton />
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header Navigation Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#080808]/90 backdrop-blur-xl border-b border-amber-500/20 z-40 px-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors border border-white/10"
            aria-label="Open Navigation Menu"
          >
            <Menu className="h-5 w-5 text-amber-400" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-gradient-to-br from-amber-300 to-amber-500 rounded-lg flex items-center justify-center shadow-md">
              <Store className="h-4 w-4 text-black font-bold fill-black" />
            </div>
            <span className="text-sm font-black text-white gold-text-gradient uppercase tracking-wider">JEWELBOT</span>
          </div>
        </div>

        {shopName && (
          <span className="text-xs font-extrabold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 truncate max-w-[140px]">
            {shopName}
          </span>
        )}
      </div>

      {/* Mobile Touch Navigation Drawer Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-50 transition-opacity duration-300"
        />
      )}

      {/* Mobile Navigation Drawer Container */}
      <div className={`md:hidden fixed top-0 left-0 bottom-0 w-72 bg-[#0d0d0d] border-r border-amber-500/20 z-50 transition-transform duration-300 ease-in-out shadow-2xl ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {renderNavContent()}
      </div>

      {/* Desktop Desktop Permanent Left Navigation Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-[#0c0c0c] border-r border-amber-500/20 z-30 shadow-2xl">
        {renderNavContent()}
      </aside>
    </>
  );
}
