"use client";

import { useState } from 'react';
import { TrendingDown, Send } from 'lucide-react';
import PriceDropAlertModal from './PriceDropAlertModal';

export default function BroadcastHeaderActions({ currentGoldRate }: { currentGoldRate: number }) {
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsAlertModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-extrabold text-xs text-emerald-300 bg-gradient-to-r from-emerald-500/20 via-emerald-600/20 to-emerald-500/10 border border-emerald-500/40 hover:brightness-110 shadow-lg shadow-emerald-500/10 transition-all"
        >
          <TrendingDown className="h-4 w-4 mr-2 text-emerald-400" />
          📉 Trigger Price Drop WhatsApp Alert
        </button>
      </div>

      <PriceDropAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        currentGoldRate={currentGoldRate}
      />
    </>
  );
}
