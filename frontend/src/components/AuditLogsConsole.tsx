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
        
        <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm relative overflow-hidden group hover:border-neutral-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Active Showrooms</span>
            <div className="p-2 bg-neutral-100 text-neutral-800 rounded-xl border border-neutral-250">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900 mt-2 tracking-tight">{metrics.totalShops}</div>
          <div className="text-[10px] text-neutral-750 font-semibold mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Registered Merchants
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm relative overflow-hidden group hover:border-neutral-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Catalog Items</span>
            <div className="p-2 bg-neutral-100 text-neutral-800 rounded-xl border border-neutral-250">
              <Gem className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-950 mt-2 tracking-tight">{metrics.totalProducts}</div>
          <div className="text-[10px] text-neutral-500 font-medium mt-1">Uploaded & Live</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm relative overflow-hidden group hover:border-neutral-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Customer Leads</span>
            <div className="p-2 bg-emerald-55 text-emerald-800 rounded-xl border border-emerald-200">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-850 mt-2 tracking-tight">{metrics.totalLeads}</div>
          <div className="text-[10px] text-emerald-700 font-medium mt-1">Captured via WhatsApp</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-sm relative overflow-hidden group hover:border-neutral-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Broadcast Campaigns</span>
            <div className="p-2 bg-neutral-100 text-neutral-800 rounded-xl border border-neutral-250">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900 mt-2 tracking-tight">{metrics.totalBroadcasts}</div>
          <div className="text-[10px] text-neutral-500 font-medium mt-1">WhatsApp Dispatches</div>
        </div>

      </div>

      {/* Control Console Bar (Search & Filters) */}
      <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-4">
        
        {/* Top Controls Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-450" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by showroom name, item name, phone number, or alert text..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-neutral-900 text-xs font-medium placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            />
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1.5 self-start md:self-auto bg-neutral-100 p-1.5 rounded-xl border border-neutral-200 shadow-inner">
            <button
              onClick={() => setViewMode("grouped")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                viewMode === "grouped"
                  ? "bg-black text-white shadow-sm"
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Grouped Showroom Cards</span>
            </button>

            <button
              onClick={() => setViewMode("timeline")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                viewMode === "timeline"
                  ? "bg-black text-white shadow-sm"
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Unified Timeline</span>
            </button>
          </div>

        </div>

        {/* Showroom Pills Toolbar */}
        <div className="pt-3 border-t border-neutral-200 space-y-2">
          <div className="text-[10px] font-extrabold text-neutral-700 uppercase tracking-widest flex items-center gap-1.5">
            <Filter className="w-3 h-3 text-neutral-600" />
            <span>Filter Showroom:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 max-h-32 overflow-y-auto pr-1">
            <button
              onClick={() => setSelectedShopId("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                selectedShopId === "ALL"
                  ? "bg-black text-white shadow-sm"
                  : "bg-neutral-100 border border-neutral-250 text-neutral-600 hover:text-black hover:bg-neutral-200"
              }`}
            >
              <span>🌐 All Showrooms</span>
              <span className={`px-2 py-0.2 text-[10px] rounded-full font-extrabold ${
                selectedShopId === "ALL" ? 'bg-neutral-850 text-white' : 'bg-neutral-200 text-neutral-600'
              }`}>
                {initialActivities.length}
              </span>
            </button>

            {initialShops.map((shop) => {
              const stats = shopStats[shop.id] || { total: 0 };
              return (
                <button
                  key={shop.id}
                  onClick={() => setSelectedShopId(shop.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                    selectedShopId === shop.id
                      ? "bg-black text-white shadow-sm"
                      : "bg-neutral-100 border border-neutral-250 text-neutral-600 hover:text-black hover:bg-neutral-200"
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>{shop.name}</span>
                  <span className={`px-2 py-0.2 text-[10px] rounded-full font-extrabold ${
                    selectedShopId === shop.id ? 'bg-neutral-850 text-white' : 'bg-neutral-200 text-neutral-600'
                  }`}>
                    {stats.total}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 pt-1 border-t border-neutral-150">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mr-1">Category:</span>
          
          <button
            onClick={() => setSelectedType("ALL")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedType === "ALL" ? "bg-black text-white" : "bg-neutral-100 border border-neutral-200 text-neutral-500 hover:text-black"
            }`}
          >
            All Events
          </button>

          <button
            onClick={() => setSelectedType("product")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedType === "product" ? "bg-neutral-100 text-neutral-800 border border-neutral-300" : "bg-neutral-105 border border-neutral-200 text-neutral-500 hover:text-black"
            }`}
          >
            <Gem className="w-3 h-3 text-neutral-700" />
            <span>Items Added</span>
          </button>

          <button
            onClick={() => setSelectedType("lead")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedType === "lead" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-neutral-105 border border-neutral-200 text-neutral-500 hover:text-black"
            }`}
          >
            <UserCheck className="w-3 h-3 text-emerald-600" />
            <span>Customer Leads</span>
          </button>

          <button
            onClick={() => setSelectedType("broadcast")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedType === "broadcast" ? "bg-neutral-100 text-neutral-800 border border-neutral-250" : "bg-neutral-105 border border-neutral-200 text-neutral-500 hover:text-black"
            }`}
          >
            <Send className="w-3 h-3 text-neutral-750" />
            <span>Broadcast Dispatches</span>
          </button>
        </div>

      </div>

      {/* Main Content Presentation */}

      {viewMode === "grouped" ? (

        /* ---------------- VIEW 1: GROUPED SHOWROOM CARDS ---------------- */
        <div className="space-y-6">
          {groupedByShop.length === 0 ? (
            <div className="p-12 text-center bg-white border border-neutral-200 rounded-2xl text-neutral-500 text-sm shadow-sm">
              No showroom activity matching your current filter selection.
            </div>
          ) : (
            groupedByShop.map((group) => {
              const stats = shopStats[group.shopId] || { products: 0, leads: 0, broadcasts: 0 };

              return (
                <div 
                  key={group.shopId} 
                  className="p-6 rounded-2xl bg-white border border-neutral-200 shadow-sm space-y-4 hover:border-neutral-300 transition-all group"
                >
                  
                  {/* Showroom Header Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-black rounded-xl text-white font-extrabold shadow-sm shrink-0">
                        <Store className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-neutral-900 tracking-tight flex items-center gap-2">
                          {group.shopName}
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-705 border border-emerald-200 font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Active Showroom
                          </span>
                        </h2>
                        {group.ownerEmail && (
                          <p className="text-xs text-neutral-500 font-mono mt-0.5">{group.ownerEmail}</p>
                        )}
                      </div>
                    </div>

                    {/* Showroom Activity Counter Badges */}
                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                      <span className="px-2.5 py-1 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs font-bold flex items-center gap-1">
                        <Gem className="w-3.5 h-3.5" />
                        {stats.products} Items
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" />
                        {stats.leads} Leads
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-neutral-50 border border-neutral-200 text-neutral-700 text-xs font-bold flex items-center gap-1">
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
                          className="p-4 bg-neutral-50 border border-neutral-200 hover:border-neutral-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all group/item"
                        >
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2.5">
                              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md tracking-wider flex items-center gap-1 ${
                                act.type === 'product'
                                  ? 'bg-neutral-100 text-neutral-800 border border-neutral-300'
                                  : act.type === 'lead'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-250'
                                  : 'bg-neutral-100 text-neutral-800 border border-neutral-250'
                              }`}>
                                {act.type === 'product' ? <Gem className="w-3 h-3" /> : act.type === 'lead' ? <UserCheck className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                                <span>{act.type === 'product' ? 'ITEM ADDED' : act.type === 'lead' ? 'NEW LEAD' : 'WHATSAPP BROADCAST'}</span>
                              </span>
                              <h3 className="text-sm font-bold text-neutral-900 group-hover/item:text-black transition-colors">{act.title}</h3>
                            </div>

                            <p className="text-xs text-neutral-700 font-mono bg-white px-3 py-2 rounded-lg border border-neutral-200 leading-relaxed mt-2">{act.details}</p>
                          </div>

                          <div className="text-right shrink-0 self-end sm:self-auto">
                            <span className="text-[11px] text-neutral-500 font-medium block">{formattedTime}</span>
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
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-neutral-900 flex items-center justify-between pb-4 border-b border-neutral-200">
            <span className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-neutral-800" />
              Unified Chronological Stream ({filteredActivities.length} Events)
            </span>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Real-Time Live
            </span>
          </h2>

          {filteredActivities.length === 0 ? (
            <div className="p-12 text-center text-neutral-500 text-sm">
              No matching activity events found for the selected filter.
            </div>
          ) : (
            <div className="relative border-l border-neutral-200 ml-4 pl-6 space-y-6">
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
                        ? 'bg-neutral-100 border-neutral-300 text-neutral-805'
                        : act.type === 'lead'
                        ? 'bg-emerald-50 border-emerald-205 text-emerald-805'
                        : 'bg-neutral-105 border-neutral-250 text-neutral-805'
                    }`}>
                      {act.type === 'product' ? <Gem className="w-3.5 h-3.5" /> : act.type === 'lead' ? <UserCheck className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                    </span>

                    <div className="bg-neutral-50 border border-neutral-200 hover:border-neutral-300 p-4 rounded-xl transition-all space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-xs font-extrabold text-neutral-800 flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-neutral-700" />
                          {act.shopName}
                        </span>
                        <span className="text-[11px] text-neutral-505 font-medium">{formattedTime}</span>
                      </div>

                      <h3 className="text-sm font-bold text-neutral-900 mt-1">{act.title}</h3>
                      <p className="text-xs text-neutral-700 font-mono bg-white p-2.5 rounded-lg border border-neutral-200 leading-relaxed mt-2">{act.details}</p>
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
