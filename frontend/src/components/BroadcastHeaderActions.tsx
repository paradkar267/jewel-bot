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
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-bold text-xs text-neutral-800 hover:text-black bg-neutral-100 hover:bg-neutral-200 border border-neutral-250 shadow-sm transition-all cursor-pointer"
        >
          <TrendingDown className="h-4 w-4 mr-2 text-neutral-700" />
          <span>Trigger Price Drop WhatsApp Alert</span>
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
