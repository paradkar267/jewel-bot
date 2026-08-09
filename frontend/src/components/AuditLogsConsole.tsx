"use client";

import { useState, useMemo } from "react";
import { Store, Clock, Gem, UserCheck, Send, Search, Filter, Layers, ListFilter } from "lucide-react";

interface ActivityItem {
  id: string;
  shopId: string;
  type: 'product' | 'lead' | 'broadcast';
  shopName: string;
  title: string;
  details: string;
  timestamp: string;
}

interface ShopItem {
  id: string;
  name: string;
  owner_email?: string | null;
}

export default function AuditLogsConsole({
  initialShops,
  initialActivities,
}: {
  initialShops: ShopItem[];
  initialActivities: ActivityItem[];
}) {
  const [selectedShopId, setSelectedShopId] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"timeline" | "grouped">("timeline");

  // Calculate shop-wise event counts
  const shopEventCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    initialActivities.forEach((act) => {
      counts[act.shopId] = (counts[act.shopId] || 0) + 1;
    });
    return counts;
  }, [initialActivities]);

  // Filter activities based on selection & search query
  const filteredActivities = useMemo(() => {
    return initialActivities.filter((act) => {
      const matchShop = selectedShopId === "ALL" || act.shopId === selectedShopId;
      const matchType = selectedType === "ALL" || act.type === selectedType;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        act.shopName.toLowerCase().includes(q) ||
        act.title.toLowerCase().includes(q) ||
        act.details.toLowerCase().includes(q);

      return matchShop && matchType && matchQuery;
    });
  }, [initialActivities, selectedShopId, selectedType, searchQuery]);

  // Group activities by shop for Grouped View
  const groupedByShop = useMemo(() => {
    const map = new Map<string, { shopName: string; activities: ActivityItem[] }>();
    
    filteredActivities.forEach((act) => {
      if (!map.has(act.shopId)) {
        map.set(act.shopId, { shopName: act.shopName, activities: [] });
      }
      map.get(act.shopId)!.activities.push(act);
    });

    return Array.from(map.entries()).map(([shopId, data]) => ({
      shopId,
      shopName: data.shopName,
      activities: data.activities,
    }));
  }, [filteredActivities]);

  return (
    <div className="space-y-6">

      {/* Top Filter & Search Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#111111] to-amber-950/20 border border-amber-500/30 shadow-xl space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by shop name, item, customer phone, or broadcast..."
              className="w-full pl-9 pr-4 py-2 bg-black/70 border border-white/10 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-2 self-start md:self-auto bg-black/60 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode("timeline")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                viewMode === "timeline"
                  ? "bg-amber-400 text-black shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Timeline View</span>
            </button>

            <button
              onClick={() => setViewMode("grouped")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                viewMode === "grouped"
                  ? "bg-amber-400 text-black shadow-md"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Grouped Shop Cards</span>
            </button>
          </div>

        </div>

        {/* Shop Selector Pills */}
        <div className="pt-2 border-t border-white/10">
          <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-amber-400" />
            <span>Select Showroom Filter:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedShopId("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                selectedShopId === "ALL"
                  ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-lg shadow-amber-500/20"
                  : "bg-black/60 border border-white/10 text-gray-300 hover:text-white hover:border-amber-500/40"
              }`}
            >
              <span>🌐 All Showrooms</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-black/40 text-amber-300 font-extrabold">
                {initialActivities.length}
              </span>
            </button>

            {initialShops.map((shop) => {
              const count = shopEventCounts[shop.id] || 0;
              return (
                <button
                  key={shop.id}
                  onClick={() => setSelectedShopId(shop.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                    selectedShopId === shop.id
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-lg shadow-amber-500/20"
                      : "bg-black/60 border border-white/10 text-gray-300 hover:text-white hover:border-amber-500/40"
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>{shop.name}</span>
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-extrabold ${
                    selectedShopId === shop.id ? 'bg-black/40 text-amber-300' : 'bg-white/10 text-gray-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Activity Type Filter Pills */}
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[11px] font-bold text-gray-400 mr-1">Category:</span>
          
          <button
            onClick={() => setSelectedType("ALL")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              selectedType === "ALL" ? "bg-white/20 text-white" : "bg-black/40 text-gray-400 hover:text-white"
            }`}
          >
            All Events
          </button>
          
          <button
            onClick={() => setSelectedType("product")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
              selectedType === "product" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-black/40 text-gray-400 hover:text-white"
            }`}
          >
            <Gem className="w-3 h-3 text-amber-400" />
            <span>Items Added</span>
          </button>

          <button
            onClick={() => setSelectedType("lead")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
              selectedType === "lead" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-black/40 text-gray-400 hover:text-white"
            }`}
          >
            <UserCheck className="w-3 h-3 text-emerald-400" />
            <span>Leads Captured</span>
          </button>

          <button
            onClick={() => setSelectedType("broadcast")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
              selectedType === "broadcast" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-black/40 text-gray-400 hover:text-white"
            }`}
          >
            <Send className="w-3 h-3 text-purple-400" />
            <span>Broadcasts</span>
          </button>
        </div>

      </div>

      {/* Main Content Render */}

      {viewMode === "timeline" ? (
        
        /* ---------------- VIEW 1: TIMELINE VIEW ---------------- */
        <div className="bg-[#111111] border border-amber-500/20 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-extrabold text-white flex items-center justify-between pb-4 border-b border-white/10">
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Chronological Audit Stream ({filteredActivities.length} Events)
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Real-Time Live
            </span>
          </h2>

          {filteredActivities.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              No matching activity events found for the selected showroom filter.
            </div>
          ) : (
            <div className="relative border-l border-white/10 ml-4 pl-6 space-y-6">
              {filteredActivities.map((act) => {
                const formattedTime = new Date(act.timestamp).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                });

                return (
                  <div key={act.id} className="relative group">
                    <span className={`absolute -left-[31px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center text-black font-bold text-xs ${
                      act.type === 'product'
                        ? 'bg-amber-400 border-amber-500 text-black'
                        : act.type === 'lead'
                        ? 'bg-emerald-400 border-emerald-500 text-black'
                        : 'bg-purple-400 border-purple-500 text-black'
                    }`}>
                      {act.type === 'product' ? <Gem className="w-3.5 h-3.5" /> : act.type === 'lead' ? <UserCheck className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                    </span>

                    <div className="bg-black/50 border border-white/10 hover:border-amber-500/30 p-4 rounded-xl transition-all space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-amber-400" />
                          {act.shopName}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">{formattedTime}</span>
                      </div>

                      <h3 className="text-sm font-bold text-white mt-1">{act.title}</h3>
                      <p className="text-xs text-gray-400 font-mono bg-white/5 p-2 rounded-lg border border-white/5">{act.details}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      ) : (

        /* ---------------- VIEW 2: GROUPED SHOP CARDS VIEW ---------------- */
        <div className="space-y-6">
          {groupedByShop.length === 0 ? (
            <div className="p-12 text-center bg-[#111111] border border-white/10 rounded-2xl text-gray-400 text-sm">
              No showroom activity matching your current filter.
            </div>
          ) : (
            groupedByShop.map((group) => (
              <div key={group.shopId} className="p-6 rounded-2xl bg-gradient-to-b from-[#141414] to-[#0d0d0d] border border-amber-500/30 shadow-xl space-y-4">
                
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl text-black font-extrabold">
                      <Store className="w-5 h-5 text-black" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-white">{group.shopName}</h2>
                      <span className="text-xs text-amber-300 font-semibold">{group.activities.length} Recorded Activity Events</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  {group.activities.map((act) => {
                    const formattedTime = new Date(act.timestamp).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    });

                    return (
                      <div key={act.id} className="p-3.5 bg-black/60 border border-white/10 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-extrabold px-2 py-0.2 rounded-md ${
                              act.type === 'product'
                                ? 'bg-amber-500/20 text-amber-300'
                                : act.type === 'lead'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-purple-500/20 text-purple-300'
                            }`}>
                              {act.type === 'product' ? '💎 ITEM' : act.type === 'lead' ? '👤 LEAD' : '🚀 BROADCAST'}
                            </span>
                            <h4 className="text-xs font-bold text-white">{act.title}</h4>
                          </div>
                          <p className="text-xs text-gray-400 font-mono mt-1">{act.details}</p>
                        </div>

                        <span className="text-[10px] text-gray-500 font-medium shrink-0 self-end sm:self-auto">{formattedTime}</span>
                      </div>
                    );
                  })}
                </div>

              </div>
            ))
          )}
        </div>

      )}

    </div>
  );
}
