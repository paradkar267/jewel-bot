"use client";

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="inline-flex items-center px-3 py-1.5 border border-white/10 rounded-lg text-sm font-medium text-gray-400 bg-white/5 hover:text-white hover:bg-white/10 hover:border-red-500/50 hover:text-red-400 transition-all"
      title="Logout"
    >
      <LogOut className="h-4 w-4 md:mr-2" />
      <span className="hidden md:inline">Logout</span>
    </button>
  );
}
