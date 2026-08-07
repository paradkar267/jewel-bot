"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gem, PlusCircle, FileSpreadsheet, Users, History, RefreshCw, Store, LogOut, Shield, LayoutDashboard, Settings } from 'lucide-react';
import LogoutButton from './LogoutButton';

interface SidebarProps {
  shopName: string | null;
  userEmail: string | null;
}

export default function Sidebar({ shopName, userEmail }: SidebarProps) {
  const pathname = usePathname();

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

  const menuItems = userEmail === 'bizleap1@gmail.com'
    ? [{ name: 'Admin Console', href: '/dashboard/admin', icon: Shield }]
    : baseItems;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-64 bg-[#111111] border-r border-white/5 flex flex-col justify-between">
      
      {/* Top Section: Brand & Shop Info */}
      <div>
        <div className="h-16 px-6 border-b border-white/5 flex items-center gap-3">
          <div className="h-8 w-8 bg-gradient-to-br from-amber-200 to-amber-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.2)] flex-shrink-0">
            <Store className="h-4 w-4 text-[#0a0a0a]" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-white tracking-wider uppercase">JewelBot</span>
            <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Vault Panel</span>
          </div>
        </div>

        {/* Shop Badge */}
        {shopName && (
          <div className="px-6 py-4 border-b border-white/5 bg-white/[0.01]">
            <div className="flex items-center text-xs font-bold text-amber-500">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
              {shopName}
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(251,191,36,0.05)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 mr-3 transition-colors ${
                  isActive ? 'text-amber-400' : 'text-gray-400 group-hover:text-white'
                }`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Profile & Logout */}
      <div className="p-4 border-t border-white/5 bg-white/[0.01]">
        {userEmail && (
          <div className="px-4 mb-3">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Logged in as</p>
            <p className="text-xs text-gray-400 truncate font-medium mt-0.5">{userEmail}</p>
          </div>
        )}
        <LogoutButton />
      </div>

    </aside>
  );
}
