"use client";

import { useState } from 'react';
import { 
  Store, Gem, Users, History, Plus, Search, 
  ShieldAlert, Edit3, Trash2, X, Loader2, 
  AlertCircle, CheckCircle2, Shield, Calendar, Phone, Mail
} from 'lucide-react';
import { createShopFromAdmin, updateShopMeta, deleteShopFromAdmin } from '@/app/actions/admin';

interface ShopWithCounts {
  id: string;
  name: string;
  whatsapp_number: string | null;
  owner_email: string | null;
  meta_phone_number_id: string | null;
  meta_access_token?: string | null;
  store_address?: string | null;
  custom_greeting?: string | null;
  promo_banner?: string | null;
  created_at: string;
  _count: {
    products: number;
    leads: number;
    broadcasts: number;
  };
}

interface AdminConsoleProps {
  stats: {
    totalShops: number;
    totalProducts: number;
    totalLeads: number;
    totalCampaigns: number;
  };
  initialShops: ShopWithCounts[];
}

export default function AdminConsole({ stats, initialShops }: AdminConsoleProps) {
  const [shops, setShops] = useState<ShopWithCounts[]>(initialShops);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState<ShopWithCounts | null>(null);
  
  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  // Messages states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [addForm, setAddForm] = useState({
    name: '',
    whatsappNumber: '',
    ownerEmail: '',
    password: '',
    metaPhoneNumberId: '',
    metaAccessToken: '',
    storeAddress: '',
    customGreeting: '',
    promoBanner: ''
  });

  const [editForm, setEditForm] = useState({
    name: '',
    whatsappNumber: '',
    ownerEmail: '',
    metaPhoneNumberId: '',
    metaAccessToken: '',
    storeAddress: '',
    customGreeting: '',
    promoBanner: ''
  });

  // Filtered Shops
  const filteredShops = shops.filter(shop => 
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (shop.owner_email && shop.owner_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (shop.whatsapp_number && shop.whatsapp_number.includes(searchTerm))
  );

  // Stats Counters
  const totalProducts = shops.reduce((acc, curr) => acc + curr._count.products, 0);
  const totalLeads = shops.reduce((acc, curr) => acc + curr._count.leads, 0);
  const totalBroadcasts = shops.reduce((acc, curr) => acc + curr._count.broadcasts, 0);

  // Handle Add Shop
  const handleAddShopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.ownerEmail.trim() || !addForm.whatsappNumber.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const result = await createShopFromAdmin({
        name: addForm.name,
        whatsappNumber: addForm.whatsappNumber,
        ownerEmail: addForm.ownerEmail,
        password: addForm.password || undefined,
        metaPhoneNumberId: addForm.metaPhoneNumberId || undefined,
        metaAccessToken: addForm.metaAccessToken || undefined,
        storeAddress: addForm.storeAddress || undefined,
        customGreeting: addForm.customGreeting || undefined,
        promoBanner: addForm.promoBanner || undefined,
      });

      if (result.success && result.shop) {
        const newShop: ShopWithCounts = {
          ...result.shop,
          meta_access_token: (result.shop as any).meta_access_token || null,
          store_address: (result.shop as any).store_address || null,
          custom_greeting: (result.shop as any).custom_greeting || null,
          promo_banner: (result.shop as any).promo_banner || null,
          _count: { products: 0, leads: 0, broadcasts: 0 }
        };
        setShops(prev => [newShop, ...prev]);
        setSuccess(`Registered new brand "${addForm.name}" successfully.`);
        setAddForm({
          name: '',
          whatsappNumber: '',
          ownerEmail: '',
          password: '',
          metaPhoneNumberId: '',
          metaAccessToken: '',
          storeAddress: '',
          customGreeting: '',
          promoBanner: ''
        });
        setIsAddModalOpen(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create shop.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Start Edit
  const startEdit = (shop: ShopWithCounts) => {
    setEditingShop(shop);
    setEditForm({
      name: shop.name,
      whatsappNumber: shop.whatsapp_number || '',
      ownerEmail: shop.owner_email || '',
      metaPhoneNumberId: shop.meta_phone_number_id || '',
      metaAccessToken: (shop as any).meta_access_token || '',
      storeAddress: shop.store_address || '',
      customGreeting: shop.custom_greeting || '',
      promoBanner: shop.promo_banner || ''
    });
    setError('');
    setSuccess('');
  };

  // Handle Update Shop Meta
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShop) return;
    if (!editForm.name.trim() || !editForm.ownerEmail.trim() || !editForm.whatsappNumber.trim()) {
      setError("All required fields must be populated.");
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const result = await updateShopMeta(editingShop.id, {
        name: editForm.name,
        whatsappNumber: editForm.whatsappNumber,
        ownerEmail: editForm.ownerEmail,
        metaPhoneNumberId: editForm.metaPhoneNumberId,
        metaAccessToken: editForm.metaAccessToken,
        storeAddress: editForm.storeAddress,
        customGreeting: editForm.customGreeting,
        promoBanner: editForm.promoBanner,
      });

      if (result.success && result.shop) {
        setShops(prev => prev.map(s => s.id === editingShop.id ? {
          ...s,
          name: result.shop.name,
          whatsapp_number: result.shop.whatsapp_number,
          owner_email: result.shop.owner_email,
          meta_phone_number_id: result.shop.meta_phone_number_id,
          meta_access_token: (result.shop as any).meta_access_token || null,
          store_address: (result.shop as any).store_address || null,
          custom_greeting: (result.shop as any).custom_greeting || null,
          promo_banner: (result.shop as any).promo_banner || null,
        } : s));
        setSuccess(`Updated details for "${editForm.name}" successfully.`);
        setEditingShop(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to update shop credentials.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete Shop
  const handleDeleteShop = async (shopId: string, shopName: string) => {
    if (!window.confirm(`CRITICAL WARNING: Are you sure you want to permanently delete "${shopName}"? This will delete all catalog items, customers, and history for this business.`)) {
      return;
    }

    setIsDeleting(shopId);
    setError('');
    setSuccess('');

    try {
      const result = await deleteShopFromAdmin(shopId);
      if (result.success) {
        setShops(prev => prev.filter(s => s.id !== shopId));
        setSuccess(`Account for "${shopName}" has been terminated.`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to terminate shop account.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Alert Banner System */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-sm text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Error Occurred:</span>
            <p className="mt-0.5 text-xs text-red-400/80">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 text-sm text-emerald-400">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Success:</span>
            <p className="mt-0.5 text-xs text-emerald-400/80">{success}</p>
          </div>
        </div>
      )}

      {/* Global Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Shops Card */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-4 right-4 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
            <Store className="h-5 w-5 text-amber-500 animate-pulse" />
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Registered Brands</p>
          <p className="text-3xl font-extrabold text-white mt-3">{shops.length}</p>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-bold">
            <span>SaaS tenants</span>
            <span className="text-amber-500">Live Accounts</span>
          </div>
        </div>

        {/* Products Card */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-4 right-4 bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20">
            <Gem className="h-5 w-5 text-blue-400" />
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Inventory Items</p>
          <p className="text-3xl font-extrabold text-white mt-3">{totalProducts}</p>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-bold">
            <span>Across all catalogs</span>
            <span className="text-blue-400">Synced Pieces</span>
          </div>
        </div>

        {/* Leads Card */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-4 right-4 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
            <Users className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Active Customers</p>
          <p className="text-3xl font-extrabold text-white mt-3">{totalLeads}</p>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-bold">
            <span>Captured phone threads</span>
            <span className="text-emerald-400">Leads Generated</span>
          </div>
        </div>

        {/* Campaigns Card */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-4 right-4 bg-purple-500/10 p-2.5 rounded-xl border border-purple-500/20">
            <History className="h-5 w-5 text-purple-400" />
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Broadcast Campaigns</p>
          <p className="text-3xl font-extrabold text-white mt-3">{totalBroadcasts}</p>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-bold">
            <span>Mass messages sent</span>
            <span className="text-purple-400">Dispatched Campaigns</span>
          </div>
        </div>

      </div>

      {/* Control Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search by brand, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-4 py-2.5 bg-[#111111] border border-white/5 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
          />
        </div>

        {/* Add Brand Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs font-bold text-[#0a0a0a] bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(251,191,36,0.1)]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Register New Brand
        </button>

      </div>

      {/* Main Tenant Management Table */}
      <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/5">
          <h3 className="text-base font-bold text-white flex items-center">
            <Shield className="w-4 h-4 text-amber-500 mr-2" />
            Registered Shops (Tenants)
          </h3>
          <p className="text-xs text-gray-400 mt-1">Configure Meta Phone IDs and delete expired client accounts.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/5">
            <thead className="bg-[#0a0a0a]/50 text-left">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Brand Information</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Credentials</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Meta API Phone ID</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Metrics</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredShops.map((shop) => (
                <tr key={shop.id} className="hover:bg-white/[0.01] transition-colors">
                  
                  {/* Brand Information */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
                        <Store className="h-4.5 w-4.5 text-amber-500" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{shop.name}</div>
                        <div className="flex items-center text-[10px] text-gray-500 mt-0.5 font-semibold">
                          <Calendar className="w-3 h-3 mr-1" />
                          Registered: {new Date(shop.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact Credentials */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center text-gray-300 font-medium">
                        <Phone className="w-3 h-3 text-gray-500 mr-1.5 shrink-0" />
                        +{shop.whatsapp_number || 'N/A'}
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Mail className="w-3 h-3 text-gray-600 mr-1.5 shrink-0" />
                        {shop.owner_email}
                      </div>
                    </div>
                  </td>

                  {/* Meta Phone ID */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {shop.meta_phone_number_id ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {shop.meta_phone_number_id}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Missing Phone ID
                      </span>
                    )}
                  </td>

                  {/* Stats Counter */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex justify-center items-center gap-4 text-xs font-semibold">
                      <div className="flex flex-col items-center">
                        <span className="text-gray-400">{shop._count.products}</span>
                        <span className="text-[9px] text-gray-600 uppercase">Items</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-gray-400">{shop._count.leads}</span>
                        <span className="text-[9px] text-gray-600 uppercase">Leads</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-gray-400">{shop._count.broadcasts}</span>
                        <span className="text-[9px] text-gray-600 uppercase">Alerts</span>
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => startEdit(shop)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-amber-500/10 text-gray-400 hover:text-amber-500 border border-transparent hover:border-amber-500/20 transition-all duration-200"
                        title="Edit Shop Details"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteShop(shop.id, shop.name)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 border border-transparent hover:border-red-500/20 transition-all duration-200"
                        title="Terminate Shop Account"
                        disabled={isDeleting === shop.id || shop.owner_email === 'bizleap1@gmail.com'}
                      >
                        {isDeleting === shop.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
              {filteredShops.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
                    No shops found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Shop Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 relative">
            <button
              onClick={() => { if (!isSaving) setIsAddModalOpen(false); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Store className="w-5 h-5 text-amber-500 mr-2" />
                Register Brand Account
              </h3>
              <p className="text-gray-400 text-xs mt-1">Add a new client and configure their business credentials.</p>
            </div>

            <form onSubmit={handleAddShopSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Jewels"
                    value={addForm.name}
                    onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                    className="block w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs"
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">WhatsApp Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 919876543210"
                    value={addForm.whatsappNumber}
                    onChange={(e) => setAddForm(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                    className="block w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Owner Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="owner@email.com"
                    value={addForm.ownerEmail}
                    onChange={(e) => setAddForm(prev => ({ ...prev, ownerEmail: e.target.value }))}
                    className="block w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs"
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Temporary Password</label>
                  <input
                    type="text"
                    placeholder="Defaults to 12345678"
                    value={addForm.password}
                    onChange={(e) => setAddForm(prev => ({ ...prev, password: e.target.value }))}
                    className="block w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Meta Phone Number ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 1094827409283"
                    value={addForm.metaPhoneNumberId}
                    onChange={(e) => setAddForm(prev => ({ ...prev, metaPhoneNumberId: e.target.value }))}
                    className="block w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs font-mono"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Meta Access Token</label>
                  <input
                    type="password"
                    placeholder="EAAjchida9b..."
                    value={addForm.metaAccessToken}
                    onChange={(e) => setAddForm(prev => ({ ...prev, metaAccessToken: e.target.value }))}
                    className="block w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs font-mono"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-300 hover:bg-white/5 transition-all"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-bold text-[#0a0a0a] bg-amber-500 hover:bg-amber-400 transition-all flex items-center shadow-[0_0_10px_rgba(251,191,36,0.1)]"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Registering...
                    </>
                  ) : (
                    'Register Shop'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Shop Modal */}
      {editingShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 relative">
            <button
              onClick={() => { if (!isSaving) setEditingShop(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Edit3 className="w-5 h-5 text-amber-500 mr-2" />
                Configure Shop Account
              </h3>
              <p className="text-gray-400 text-xs mt-1">Configure API IDs and credentials for "{editingShop.name}".</p>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="block w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs"
                  disabled={isSaving}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">WhatsApp Number *</label>
                  <input
                    type="text"
                    required
                    value={editForm.whatsappNumber}
                    onChange={(e) => setEditForm(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                    className="block w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs"
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Owner Email *</label>
                  <input
                    type="email"
                    required
                    value={editForm.ownerEmail}
                    onChange={(e) => setEditForm(prev => ({ ...prev, ownerEmail: e.target.value }))}
                    className="block w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Meta Phone Number ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 1094827409283"
                    value={editForm.metaPhoneNumberId}
                    onChange={(e) => setEditForm(prev => ({ ...prev, metaPhoneNumberId: e.target.value }))}
                    className="block w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs font-mono"
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Meta Access Token</label>
                  <input
                    type="password"
                    placeholder="EAAjchida9b..."
                    value={editForm.metaAccessToken}
                    onChange={(e) => setEditForm(prev => ({ ...prev, metaAccessToken: e.target.value }))}
                    className="block w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs font-mono"
                    disabled={isSaving}
                  />
                </div>
              </div>
              <span className="text-[10px] text-gray-500 mt-1 block">Specify the Meta ID & Token required for this brand's WhatsApp Cloud API.</span>

              {/* Showroom Location & Bot Customizations */}
              <div className="pt-3 border-t border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-amber-400">📍 Showroom & Bot Settings</h4>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Showroom Location / Store Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Shop 12, Zaveri Bazaar, Mumbai. Map: https://maps.google.com/..."
                    value={editForm.storeAddress}
                    onChange={(e) => setEditForm(prev => ({ ...prev, storeAddress: e.target.value }))}
                    className="block w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs"
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Custom Bot Welcome Greeting</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Welcome to Royal Jewelers! Send us a photo of any design..."
                    value={editForm.customGreeting}
                    onChange={(e) => setEditForm(prev => ({ ...prev, customGreeting: e.target.value }))}
                    className="block w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs"
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Special Festival Offer Banner</label>
                  <input
                    type="text"
                    placeholder="e.g. FESTIVE10: 10% OFF on Making Charges!"
                    value={editForm.promoBanner}
                    onChange={(e) => setEditForm(prev => ({ ...prev, promoBanner: e.target.value }))}
                    className="block w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingShop(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-300 hover:bg-white/5 transition-all"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-bold text-[#0a0a0a] bg-amber-500 hover:bg-amber-400 transition-all flex items-center shadow-[0_0_10px_rgba(251,191,36,0.1)]"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      Saving...
                    </>
                  ) : (
                    'Save Configuration'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
