"use client";

import { useState, useMemo } from "react";
import { Store, Clock, Gem, UserCheck, Send, Search, Filter, Layers, ChevronRight, Activity, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

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
  const [viewMode, setViewMode] = useState<"grouped" | "timeline">("grouped");

  // Executive Overview Metrics
  const metrics = useMemo(() => {
    const totalProducts = initialActivities.filter(a => a.type === 'product').length;
    const totalLeads = initialActivities.filter(a => a.type === 'lead').length;
    const totalBroadcasts = initialActivities.filter(a => a.type === 'broadcast').length;
    return {
      totalShops: initialShops.length,
      totalEvents: initialActivities.length,
      totalProducts,
      totalLeads,
      totalBroadcasts
    };
  }, [initialShops, initialActivities]);

  // Calculate shop-wise event counts
  const shopStats = useMemo(() => {
    const map: Record<string, { total: number; products: number; leads: number; broadcasts: number }> = {};
    initialActivities.forEach((act) => {
      if (!map[act.shopId]) {
        map[act.shopId] = { total: 0, products: 0, leads: 0, broadcasts: 0 };
      }
      map[act.shopId].total += 1;
      if (act.type === 'product') map[act.shopId].products += 1;
      if (act.type === 'lead') map[act.shopId].leads += 1;
      if (act.type === 'broadcast') map[act.shopId].broadcasts += 1;
    });
    return map;
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
    const map = new Map<string, { shopName: string; ownerEmail?: string; activities: ActivityItem[] }>();
    
    filteredActivities.forEach((act) => {
      if (!map.has(act.shopId)) {
        const shopObj = initialShops.find(s => s.id === act.shopId);
        map.set(act.shopId, { 
          shopName: act.shopName, 
          ownerEmail: shopObj?.owner_email || undefined,
          activities: [] 
        });
      }
      map.get(act.shopId)!.activities.push(act);
    });

    return Array.from(map.entries()).map(([shopId, data]) => ({
      shopId,
      shopName: data.shopName,
      ownerEmail: data.ownerEmail,
      activities: data.activities,
    }));
  }, [filteredActivities, initialShops]);

  return (
    <div className="space-y-8">

      {/* Executive Overview KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121212] via-[#0a0a0a] to-[#121212] border border-amber-500/20 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Showrooms</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-2 tracking-tight">{metrics.totalShops}</div>
          <div className="text-[10px] text-amber-400 font-semibold mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Registered Merchants
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121212] via-[#0a0a0a] to-[#121212] border border-amber-500/20 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Catalog Items</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Gem className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-300 mt-2 tracking-tight">{metrics.totalProducts}</div>
          <div className="text-[10px] text-gray-400 font-medium mt-1">Uploaded & Live</div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121212] via-[#0a0a0a] to-[#121212] border border-emerald-500/20 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Customer Leads</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2 tracking-tight">{metrics.totalLeads}</div>
          <div className="text-[10px] text-emerald-400/80 font-medium mt-1">Captured via WhatsApp</div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121212] via-[#0a0a0a] to-[#121212] border border-purple-500/20 shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Broadcast Campaigns</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-300 mt-2 tracking-tight">{metrics.totalBroadcasts}</div>
          <div className="text-[10px] text-purple-400/80 font-medium mt-1">WhatsApp Dispatches</div>
        </div>

      </div>

      {/* Control Console Bar (Search & Filters) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-[#111111] to-amber-950/10 border border-amber-500/30 shadow-2xl backdrop-blur-xl space-y-4">
        
        {/* Top Controls Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by showroom name, item name, phone number, or alert text..."
              className="w-full pl-10 pr-4 py-2.5 bg-black/80 border border-white/10 rounded-xl text-white text-xs font-medium placeholder:text-gray-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all"
            />
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 self-start md:self-auto bg-black/80 p-1.5 rounded-xl border border-white/10 shadow-inner">
            <button
              onClick={() => setViewMode("grouped")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-2 ${
                viewMode === "grouped"
                  ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Grouped Showroom Cards</span>
            </button>

            <button
              onClick={() => setViewMode("timeline")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-2 ${
                viewMode === "timeline"
                  ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Unified Timeline</span>
            </button>
          </div>

        </div>

        {/* Showroom Pills Toolbar */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <Filter className="w-3 h-3 text-amber-400" />
            <span>Filter Showroom:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 max-h-32 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-amber-500/20">
            <button
              onClick={() => setSelectedShopId("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                selectedShopId === "ALL"
                  ? "bg-amber-400 text-black shadow-md"
                  : "bg-black/60 border border-white/10 text-gray-300 hover:text-white hover:border-amber-500/40"
              }`}
            >
              <span>🌐 All Showrooms</span>
              <span className="px-2 py-0.2 text-[10px] rounded-full bg-black/40 text-amber-300 font-extrabold">
                {initialActivities.length}
              </span>
            </button>

            {initialShops.map((shop) => {
              const stats = shopStats[shop.id] || { total: 0 };
              return (
                <button
                  key={shop.id}
                  onClick={() => setSelectedShopId(shop.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                    selectedShopId === shop.id
                      ? "bg-amber-400 text-black shadow-md"
                      : "bg-black/60 border border-white/10 text-gray-300 hover:text-white hover:border-amber-500/40"
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>{shop.name}</span>
                  <span className={`px-2 py-0.2 text-[10px] rounded-full font-extrabold ${
                    selectedShopId === shop.id ? 'bg-black/40 text-amber-300' : 'bg-white/10 text-gray-400'
                  }`}>
                    {stats.total}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 pt-1 border-t border-white/5">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mr-1">Category:</span>
          
          <button
            onClick={() => setSelectedType("ALL")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              selectedType === "ALL" ? "bg-white/20 text-white" : "bg-black/40 text-gray-400 hover:text-white"
            }`}
          >
            All Events
          </button>

          <button
            onClick={() => setSelectedType("product")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedType === "product" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-black/40 text-gray-400 hover:text-white"
            }`}
          >
            <Gem className="w-3 h-3 text-amber-400" />
            <span>Items Added</span>
          </button>

          <button
            onClick={() => setSelectedType("lead")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedType === "lead" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-black/40 text-gray-400 hover:text-white"
            }`}
          >
            <UserCheck className="w-3 h-3 text-emerald-400" />
            <span>Customer Leads</span>
          </button>

          <button
            onClick={() => setSelectedType("broadcast")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedType === "broadcast" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-black/40 text-gray-400 hover:text-white"
            }`}
          >
            <Send className="w-3 h-3 text-purple-400" />
            <span>Broadcast Dispatches</span>
          </button>
        </div>

      </div>

      {/* Main Content Presentation */}

      {viewMode === "grouped" ? (

        /* ---------------- VIEW 1: GROUPED SHOWROOM CARDS ---------------- */
        <div className="space-y-6">
          {groupedByShop.length === 0 ? (
            <div className="p-12 text-center bg-[#111111] border border-white/10 rounded-2xl text-gray-400 text-sm">
              No showroom activity matching your current filter selection.
            </div>
          ) : (
            groupedByShop.map((group) => {
              const stats = shopStats[group.shopId] || { products: 0, leads: 0, broadcasts: 0 };

              return (
                <div 
                  key={group.shopId} 
                  className="p-6 rounded-2xl bg-gradient-to-b from-[#141414] via-[#101010] to-[#0a0a0a] border border-amber-500/30 shadow-2xl space-y-4 hover:border-amber-500/50 transition-all group"
                >
                  
                  {/* Showroom Header Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl text-black font-extrabold shadow-lg shadow-amber-500/20 shrink-0">
                        <Store className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                          {group.shopName}
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Active Showroom
                          </span>
                        </h2>
                        {group.ownerEmail && (
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{group.ownerEmail}</p>
                        )}
                      </div>
                    </div>

                    {/* Showroom Activity Counter Badges */}
                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1">
                        <Gem className="w-3.5 h-3.5" />
                        {stats.products} Items
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" />
                        {stats.leads} Leads
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1">
                        <Send className="w-3.5 h-3.5" />
                        {stats.broadcasts} Broadcasts
                      </span>
                    </div>
                  </div>

                  {/* Activity Items Timeline inside Showroom Card */}
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
                        <div 
                          key={act.id} 
                          className="p-4 bg-black/70 border border-white/10 hover:border-amber-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all group/item"
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2.5">
                              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md tracking-wider flex items-center gap-1 ${
                                act.type === 'product'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : act.type === 'lead'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              }`}>
                                {act.type === 'product' ? <Gem className="w-3 h-3" /> : act.type === 'lead' ? <UserCheck className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                                <span>{act.type === 'product' ? 'ITEM ADDED' : act.type === 'lead' ? 'NEW LEAD' : 'WHATSAPP BROADCAST'}</span>
                              </span>
                              <h3 className="text-sm font-bold text-white group-hover/item:text-amber-300 transition-colors">{act.title}</h3>
                            </div>

                            <p className="text-xs text-gray-300 font-mono bg-white/5 px-3 py-2 rounded-lg border border-white/5 leading-relaxed mt-2">{act.details}</p>
                          </div>

                          <div className="text-right shrink-0 self-end sm:self-auto">
                            <span className="text-[11px] text-gray-400 font-medium block">{formattedTime}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              );
            })
          )}
        </div>

      ) : (

        /* ---------------- VIEW 2: UNIFIED TIMELINE STREAM ---------------- */
        <div className="bg-[#111111] border border-amber-500/20 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-extrabold text-white flex items-center justify-between pb-4 border-b border-white/10">
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Unified Chronological Stream ({filteredActivities.length} Events)
            </span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Real-Time Live
            </span>
          </h2>

          {filteredActivities.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">
              No matching activity events found for the selected filter.
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

                    <div className="bg-black/60 border border-white/10 hover:border-amber-500/30 p-4 rounded-xl transition-all space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-xs font-extrabold text-amber-300 flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-amber-400" />
                          {act.shopName}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">{formattedTime}</span>
                      </div>

                      <h3 className="text-sm font-bold text-white mt-1">{act.title}</h3>
                      <p className="text-xs text-gray-400 font-mono bg-white/5 p-2.5 rounded-lg border border-white/5 leading-relaxed mt-2">{act.details}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      )}

    </div>
  );
}
