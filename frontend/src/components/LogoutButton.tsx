"use client";

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="inline-flex items-center px-3 py-1.5 border border-neutral-250 rounded-lg text-sm font-medium text-neutral-600 bg-neutral-105 hover:text-red-605 hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer"
      title="Logout"
    >
      <LogOut className="h-4 w-4 md:mr-2" />
      <span className="hidden md:inline">Logout</span>
    </button>
  );
}
