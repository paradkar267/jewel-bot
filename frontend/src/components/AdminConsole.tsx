"use client";

import { useState } from 'react';
import { 
  Store, Gem, Users, History, Plus, Search, 
  ShieldAlert, Edit3, Trash2, X, Loader2, 
  AlertCircle, CheckCircle2, Shield, Calendar, Phone, Mail,
  KeyRound, Eye, EyeOff, Lock, RefreshCw, Power, Ban, CheckCircle,
  LogIn, Activity, Cpu, AlertTriangle
} from 'lucide-react';
import { signIn } from 'next-auth/react';
import { 
  createShopFromAdmin, 
  updateShopMeta, 
  deleteShopFromAdmin, 
  resetShopPasswordByAdmin, 
  toggleShopStatusByAdmin,
  checkShopDiagnostics
} from '@/app/actions/admin';

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
  is_active?: boolean;
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
  const [resetPasswordShop, setResetPasswordShop] = useState<ShopWithCounts | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Diagnostics Modal State
  const [diagnosticShop, setDiagnosticShop] = useState<ShopWithCounts | null>(null);
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);

  // Impersonating State
  const [impersonatingShopId, setImpersonatingShopId] = useState<string | null>(null);

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

  // 🔑 One-Click Impersonation Login in New Tab
  const handleImpersonate = (shop: ShopWithCounts) => {
    if (!shop.owner_email) return;
    if (!window.confirm(`🔑 Super Admin Access: Do you want to open "${shop.name}" dashboard in a NEW tab?`)) {
      return;
    }

    const impersonateUrl = `/api/auth/impersonate?email=${encodeURIComponent(shop.owner_email)}`;
    window.open(impersonateUrl, '_blank');
  };

  // ⚡ Run Health & Diagnostic Checks
  const handleRunDiagnostics = async (shop: ShopWithCounts) => {
    setDiagnosticShop(shop);
    setDiagnosticData(null);
    setDiagnosticLoading(true);

    try {
      const res = await checkShopDiagnostics(shop.id);
      if (res.success) {
        setDiagnosticData(res);
      }
    } catch (err: any) {
      setError("Diagnostic error: " + err.message);
    } finally {
      setDiagnosticLoading(false);
    }
  };

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

  // Start Editing Shop
  const startEdit = (shop: ShopWithCounts) => {
    setEditingShop(shop);
    setEditForm({
      name: shop.name,
      whatsappNumber: shop.whatsapp_number || '',
      ownerEmail: shop.owner_email || '',
      metaPhoneNumberId: shop.meta_phone_number_id || '',
      metaAccessToken: shop.meta_access_token || '',
      storeAddress: shop.store_address || '',
      customGreeting: shop.custom_greeting || '',
      promoBanner: shop.promo_banner || ''
    });
    setError('');
    setSuccess('');
  };

  // Handle Edit Submit
  const handleEditShopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShop) return;

    if (!editForm.name.trim() || !editForm.ownerEmail.trim() || !editForm.whatsappNumber.trim()) {
      setError("Brand name, email, and WhatsApp number are required.");
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const result = await updateShopMeta(editingShop.id, editForm);
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

  // Handle Password Reset by Admin
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordShop) return;
    if (!newPasswordInput || newPasswordInput.trim().length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await resetShopPasswordByAdmin(resetPasswordShop.id, newPasswordInput);
      if (res.success) {
        setSuccess(`Successfully updated password for "${resetPasswordShop.name}".`);
        setResetPasswordShop(null);
        setNewPasswordInput('');
      }
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Toggle Shop Status (Active vs Suspended)
  const handleToggleStatus = async (shopId: string, currentStatus: boolean | undefined) => {
    const targetStatus = currentStatus === false ? true : false;
    const actionText = targetStatus ? "ACTIVATE" : "SUSPEND";
    
    if (!window.confirm(`Are you sure you want to ${actionText} this shop bot account?`)) {
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await toggleShopStatusByAdmin(shopId, targetStatus);
      if (res.success) {
        setShops(prev => prev.map(s => s.id === shopId ? { ...s, is_active: targetStatus } : s));
        setSuccess(res.message);
      }
    } catch (err: any) {
      setError(err.message || "Failed to update status.");
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
            <span>Captured leads</span>
            <span className="text-emerald-400">CRM Contacts</span>
          </div>
        </div>

        {/* Broadcasts Card */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-4 right-4 bg-purple-500/10 p-2.5 rounded-xl border border-purple-500/20">
            <History className="h-5 w-5 text-purple-400" />
          </div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Broadcast Campaigns</p>
          <p className="text-3xl font-extrabold text-white mt-3">{totalBroadcasts}</p>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-bold">
            <span>WhatsApp alerts</span>
            <span className="text-purple-400">Sent Blasts</span>
          </div>
        </div>

      </div>

      {/* Main Brand Management Table */}
      <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Table Toolbar Header */}
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search shops by name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="text-xs text-gray-500 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <button
            onClick={() => {
              setError('');
              setSuccess('');
              setIsAddModalOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all border border-amber-400/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Shop</span>
          </button>
        </div>

        {/* Table Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0a0a0a] border-b border-white/5">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Brand / Showroom</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Contact & Credentials</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Meta Phone ID</th>
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
                        <div className="flex items-center text-[10px] text-gray-500 mt-0.5 font-semibold" suppressHydrationWarning>
                          <Calendar className="w-3 h-3 mr-1" />
                          Registered: {new Date(shop.created_at).toLocaleDateString('en-US')}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {shop.is_active !== false ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <Ban className="w-3 h-3" />
                        SUSPENDED
                      </span>
                    )}
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
                    <div className="flex items-center justify-end gap-2">
                      {/* 🔑 One-Click Impersonate Button */}
                      <button
                        onClick={() => handleImpersonate(shop)}
                        disabled={impersonatingShopId === shop.id}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-xs border border-amber-500/30 transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:scale-105"
                        title="🔑 Super Admin One-Click Login to shop dashboard"
                      >
                        {impersonatingShopId === shop.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <LogIn className="w-3.5 h-3.5" />
                        )}
                        <span>Login</span>
                      </button>

                      {/* ⚡ Diagnostics Check Button */}
                      <button
                        onClick={() => handleRunDiagnostics(shop)}
                        className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-all duration-200 hover:scale-105"
                        title="⚡ Live WhatsApp & AI Health Diagnostics"
                      >
                        <Activity className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleStatus(shop.id, shop.is_active)}
                        className={`p-2 rounded-xl transition-all duration-200 border ${
                          shop.is_active !== false
                            ? 'bg-emerald-500/10 hover:bg-rose-500/10 text-emerald-400 hover:text-rose-400 border-emerald-500/20 hover:border-rose-500/20'
                            : 'bg-rose-500/10 hover:bg-emerald-500/10 text-rose-400 hover:text-emerald-400 border-rose-500/20 hover:border-emerald-500/20'
                        }`}
                        title={shop.is_active !== false ? "Suspend Bot Service" : "Activate Bot Service"}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setResetPasswordShop(shop);
                          setNewPasswordInput('');
                          setError('');
                          setSuccess('');
                        }}
                        className="p-2 rounded-xl bg-white/5 hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-400 border border-transparent hover:border-emerald-500/20 transition-all duration-200"
                        title="Reset Shop Owner Password"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
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
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">
                    No shops found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diagnostics Modal */}
      {diagnosticShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-blue-500/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 relative">
            <button
              onClick={() => { setDiagnosticShop(null); setDiagnosticData(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-5">
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Live Diagnostics: {diagnosticShop.name}</h3>
                <p className="text-xs text-gray-400">Real-time WhatsApp Webhook & AI Health Status</p>
              </div>
            </div>

            {diagnosticLoading ? (
              <div className="py-12 text-center text-gray-400 flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                <p className="text-xs font-semibold">Scanning Meta Graph API & Gemini AI Engine...</p>
              </div>
            ) : diagnosticData ? (
              <div className="space-y-4">
                
                {/* Health Status Header Badge */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  diagnosticData.metaStatus === 'HEALTHY' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                }`}>
                  <div className="flex items-center gap-2">
                    {diagnosticData.metaStatus === 'HEALTHY' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    )}
                    <span className="font-bold text-sm">
                      Overall Health: {diagnosticData.metaStatus === 'HEALTHY' ? '100% HEALTHY' : 'CONFIGURATION NEEDED'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/40 border border-white/10">
                    LIVE CHECK
                  </span>
                </div>

                {/* Diagnostic Items Grid */}
                <div className="space-y-3 pt-2">
                  
                  {/* Meta Phone ID */}
                  <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-xl border border-white/5 text-xs">
                    <span className="text-gray-300 font-medium">Meta Phone Number ID</span>
                    {diagnosticData.hasPhoneId ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Configured
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Missing
                      </span>
                    )}
                  </div>

                  {/* Meta Access Token */}
                  <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-xl border border-white/5 text-xs">
                    <span className="text-gray-300 font-medium">Meta System Access Token</span>
                    {diagnosticData.hasToken ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Token Valid
                      </span>
                    ) : (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Token Missing
                      </span>
                    )}
                  </div>

                  {/* Gemini Vision AI Engine */}
                  <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-xl border border-white/5 text-xs">
                    <span className="text-gray-300 font-medium flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-purple-400" /> Google Gemini 2.5 Flash Vision AI
                    </span>
                    {diagnosticData.hasGeminiKey ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active ⚡
                      </span>
                    ) : (
                      <span className="text-red-400 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> API Key Missing
                      </span>
                    )}
                  </div>

                  {/* Account Status */}
                  <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-xl border border-white/5 text-xs">
                    <span className="text-gray-300 font-medium">Account Access Status</span>
                    {diagnosticData.isActive ? (
                      <span className="text-emerald-400 font-bold">Active Service</span>
                    ) : (
                      <span className="text-red-400 font-bold">Suspended Service</span>
                    )}
                  </div>

                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => { setDiagnosticShop(null); setDiagnosticData(null); }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors"
                  >
                    Close Diagnostics
                  </button>
                </div>

              </div>
            ) : null}
          </div>
        </div>
      )}

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
              <p className="text-xs text-gray-400 mt-1">Create a new jewelry shop profile with Meta WhatsApp credentials.</p>
            </div>

            <form onSubmit={handleAddShopSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Brand / Showroom Name *</label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. Malabar Gold & Diamonds"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">WhatsApp Business Phone *</label>
                  <input
                    type="text"
                    required
                    value={addForm.whatsappNumber}
                    onChange={(e) => setAddForm({ ...addForm, whatsappNumber: e.target.value })}
                    placeholder="919876543210"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Owner Email *</label>
                  <input
                    type="email"
                    required
                    value={addForm.ownerEmail}
                    onChange={(e) => setAddForm({ ...addForm, ownerEmail: e.target.value })}
                    placeholder="owner@malabar.com"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Account Password</label>
                <input
                  type="password"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  placeholder="Default: 12345678"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="pt-2 border-t border-white/5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Meta Phone Number ID</label>
                  <input
                    type="text"
                    value={addForm.metaPhoneNumberId}
                    onChange={(e) => setAddForm({ ...addForm, metaPhoneNumberId: e.target.value })}
                    placeholder="e.g. 109283746592834"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Meta Permanent Access Token</label>
                  <textarea
                    rows={2}
                    value={addForm.metaAccessToken}
                    onChange={(e) => setAddForm({ ...addForm, metaAccessToken: e.target.value })}
                    placeholder="EAAG..."
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 font-mono resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Showroom Address</label>
                  <input
                    type="text"
                    value={addForm.storeAddress}
                    onChange={(e) => setAddForm({ ...addForm, storeAddress: e.target.value })}
                    placeholder="e.g. Shop 12, Gold Souk Mall, MG Road, Mumbai"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Custom Bot Greeting</label>
                  <input
                    type="text"
                    value={addForm.customGreeting}
                    onChange={(e) => setAddForm({ ...addForm, customGreeting: e.target.value })}
                    placeholder="Welcome to Malabar Gold! How can we assist you today?"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Promo Banner Message</label>
                  <input
                    type="text"
                    value={addForm.promoBanner}
                    onChange={(e) => setAddForm({ ...addForm, promoBanner: e.target.value })}
                    placeholder="Flat 20% OFF on Making Charges this Festive Season!"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all border border-amber-400/30 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Register Brand</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Shop Credentials & Meta Modal */}
      {editingShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
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
                Configure Meta Credentials & Details
              </h3>
              <p className="text-xs text-gray-400 mt-1">Update Meta API credentials and showroom settings for {editingShop.name}.</p>
            </div>

            <form onSubmit={handleEditShopSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">WhatsApp Business Phone *</label>
                  <input
                    type="text"
                    required
                    value={editForm.whatsappNumber}
                    onChange={(e) => setEditForm({ ...editForm, whatsappNumber: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Owner Email *</label>
                  <input
                    type="email"
                    required
                    value={editForm.ownerEmail}
                    onChange={(e) => setEditForm({ ...editForm, ownerEmail: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Meta Phone Number ID</label>
                  <input
                    type="text"
                    value={editForm.metaPhoneNumberId}
                    onChange={(e) => setEditForm({ ...editForm, metaPhoneNumberId: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Meta System Access Token</label>
                  <textarea
                    rows={3}
                    value={editForm.metaAccessToken}
                    onChange={(e) => setEditForm({ ...editForm, metaAccessToken: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500/50 font-mono resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Showroom Address</label>
                  <input
                    type="text"
                    value={editForm.storeAddress}
                    onChange={(e) => setEditForm({ ...editForm, storeAddress: e.target.value })}
                    placeholder="e.g. Shop 12, Gold Souk Mall, Mumbai"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Custom Bot Greeting</label>
                  <input
                    type="text"
                    value={editForm.customGreeting}
                    onChange={(e) => setEditForm({ ...editForm, customGreeting: e.target.value })}
                    placeholder="Welcome to our showroom!"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Promo Banner Message</label>
                  <input
                    type="text"
                    value={editForm.promoBanner}
                    onChange={(e) => setEditForm({ ...editForm, promoBanner: e.target.value })}
                    placeholder="Special offer banner..."
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingShop(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all border border-amber-400/30 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resetPasswordShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 relative">
            <button
              onClick={() => { if (!isSaving) setResetPasswordShop(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <KeyRound className="w-5 h-5 text-emerald-400 mr-2" />
                Reset Account Password
              </h3>
              <p className="text-xs text-gray-400 mt-1">Set a new login password for {resetPasswordShop.name}.</p>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">New Password (Min 6 chars) *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setResetPasswordShop(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all border border-emerald-400/30 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
