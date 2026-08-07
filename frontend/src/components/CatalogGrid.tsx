"use client";

import { useState } from 'react';
import { Edit3, Trash2, Layers, Tag, X, Upload, Loader2, AlertCircle, ExternalLink, Package, Scale, Sparkles, CheckSquare, Square, CheckCircle2 } from 'lucide-react';
import { updateProduct, deleteProduct, deleteMultipleProducts } from '@/app/actions/product';

interface Product {
  id: string;
  shop_id: string;
  name: string;
  type: string | null;
  metal: string | null;
  karat?: string | null;
  weight_grams?: any;
  making_charge_percent?: any;
  price: any; // Decimal type from Prisma
  url: string | null;
  image_url: string | null;
  created_at: Date;
}

export default function CatalogGrid({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    type: 'ring',
    customCategory: '',
    metal: 'gold',
    customMetal: '',
    karat: '22K',
    weight_grams: '',
    making_charge_percent: '',
    price: '',
    url: '',
    image_url: '' as string | null
  });
  const [error, setError] = useState('');

  const standardTypes = ['ring', 'necklace', 'earring', 'bracelet', 'pendant', 'anklet', 'bangle'];
  const standardMetals = ['gold', 'silver', 'platinum', 'rose gold', 'white gold', 'copper', 'brass'];

  // Toggle selection for a single product
  const toggleSelectProduct = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p.id));
    }
  };

  // Handle Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const count = selectedIds.length;
    if (!window.confirm(`Are you sure you want to delete ${count} selected jewelry items permanently from your showroom catalog and database?`)) {
      return;
    }

    setIsBulkDeleting(true);
    try {
      const res = await deleteMultipleProducts(selectedIds);
      if (res.success) {
        setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
        setSelectedIds([]);
      } else {
        alert("Failed to delete items.");
      }
    } catch (err: any) {
      alert("Error deleting items: " + err.message);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Handle Edit Click
  const startEdit = (product: Product) => {
    setEditingProduct(product);
    
    const pType = (product.type || 'ring').toLowerCase();
    const isStandardType = standardTypes.includes(pType);
    
    const pMetal = (product.metal || 'gold').toLowerCase();
    const isStandardMetal = standardMetals.includes(pMetal);

    setEditForm({
      name: product.name,
      type: isStandardType ? pType : 'custom',
      customCategory: isStandardType ? '' : (product.type || ''),
      metal: isStandardMetal ? pMetal : 'custom',
      customMetal: isStandardMetal ? '' : (product.metal || ''),
      karat: product.karat || '22K',
      weight_grams: product.weight_grams ? String(product.weight_grams) : '',
      making_charge_percent: product.making_charge_percent ? String(product.making_charge_percent) : '',
      price: product.price ? String(product.price) : '',
      url: product.url || '',
      image_url: product.image_url
    });
    setError('');
  };

  // Convert File to Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image file size must be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, image_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Edit Form Submission
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editForm.name.trim()) {
      setError('Jewelry name is required');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const parsedPrice = editForm.price.trim() !== '' ? parseFloat(editForm.price) : null;
      const parsedWeight = editForm.weight_grams.trim() !== '' ? parseFloat(editForm.weight_grams) : null;
      const parsedMaking = editForm.making_charge_percent.trim() !== '' ? parseFloat(editForm.making_charge_percent) : null;

      const finalType = editForm.type === 'custom' ? (editForm.customCategory.trim() || 'Other') : editForm.type;
      const finalMetal = editForm.metal === 'custom' ? (editForm.customMetal.trim() || 'Other') : editForm.metal;

      const result = await updateProduct(editingProduct.id, {
        name: editForm.name,
        type: finalType,
        metal: finalMetal,
        karat: editForm.karat,
        weight_grams: parsedWeight,
        making_charge_percent: parsedMaking,
        price: parsedPrice,
        url: editForm.url,
        image_url: editForm.image_url
      });

      if (result.success && result.product) {
        const updatedProd = result.product;
        setProducts(prev => prev.map(p => p.id === updatedProd.id ? (updatedProd as unknown as Product) : p));
        setEditingProduct(null);
      }
    } catch (err: any) {
      setError(err.message || "Failed to update product.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete Click
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from your catalog?`)) {
      return;
    }

    setIsDeleting(id);
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setSelectedIds(prev => prev.filter(item => item !== id));
    } catch (err: any) {
      alert("Failed to delete product: " + err.message);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div>
      {/* Top Toolbar: Select All & Bulk Action Banner */}
      {products.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-[#111111] border border-white/5 p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-xs font-bold text-gray-300 hover:text-amber-400 bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-lg transition-all border border-white/5"
            >
              {selectedIds.length === products.length ? (
                <CheckSquare className="w-4 h-4 text-amber-400" />
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
              <span>
                {selectedIds.length === products.length
                  ? `Deselect All (${products.length})`
                  : `Select All (${products.length} Items)`}
              </span>
            </button>

            {selectedIds.length > 0 && (
              <span className="text-xs font-medium text-amber-400/90 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected
              </span>
            )}
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-lg shadow-red-900/30 transition-all border border-red-500/30 disabled:opacity-50"
              >
                {isBulkDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>Delete Selected ({selectedIds.length})</span>
              </button>

              <button
                onClick={() => setSelectedIds([])}
                className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-lg border border-white/5"
                title="Clear Selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-[#111111] border border-white/5 rounded-2xl">
          <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No Jewelry Items Added Yet</h3>
          <p className="text-gray-400 text-xs max-w-sm mx-auto">
            Click "Add Jewelry" to create your first catalog item or sync your website.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const isSelected = selectedIds.includes(product.id);
            return (
              <div
                key={product.id}
                className={`bg-[#111111] border ${isSelected ? 'border-red-500/80 shadow-lg shadow-red-500/10' : 'border-white/5 hover:border-amber-500/30'} rounded-2xl overflow-hidden transition-all duration-300 group flex flex-col justify-between relative`}
              >
                <div>
                  {/* Image Section */}
                  <div className="relative h-48 w-full bg-[#0a0a0a] overflow-hidden flex items-center justify-center border-b border-white/5">
                    {/* Checkbox Overlay Top-Left */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectProduct(product.id);
                      }}
                      className="absolute top-3 left-3 z-10 p-1.5 rounded-lg bg-black/70 hover:bg-black border border-white/20 transition-all shadow-md backdrop-blur-md"
                      title={isSelected ? "Deselect item" : "Select item for bulk delete"}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-red-500 fill-red-500/20" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400 hover:text-white" />
                      )}
                    </button>

                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isSelected ? 'opacity-80' : ''}`}
                      />
                    ) : (
                      <div className="text-gray-600 text-xs font-semibold">No Image Provided</div>
                    )}

                    {/* Metal / Karat Badge */}
                    <div className="absolute top-3 left-12 flex gap-1.5 flex-wrap z-0">
                      {product.karat && (
                        <span className="px-2.5 py-1 bg-amber-500/90 text-black text-[10px] font-extrabold rounded-full uppercase shadow-md backdrop-blur-md">
                          {product.karat}
                        </span>
                      )}
                      <span className="px-2.5 py-1 bg-black/80 text-amber-300 text-[10px] font-bold rounded-full uppercase border border-amber-500/30 backdrop-blur-md">
                        {product.metal || 'Gold'}
                      </span>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 bg-black/80 text-gray-300 text-[10px] font-medium rounded-full border border-white/10 backdrop-blur-md capitalize">
                        {product.type || 'Jewelry'}
                      </span>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-white text-base truncate group-hover:text-amber-400 transition-colors">
                      {product.name}
                    </h3>

                    <div className="flex items-center justify-between pt-1">
                      <div className="text-amber-400 font-extrabold text-lg">
                        {product.price ? `₹${Number(product.price).toLocaleString('en-IN')}` : 'Ask for Price'}
                      </div>

                      {product.weight_grams && (
                        <div className="text-[11px] font-semibold text-gray-400 bg-white/5 px-2 py-0.5 rounded-lg flex items-center gap-1 border border-white/5">
                          <Scale className="w-3 h-3 text-amber-500" />
                          <span>{Number(product.weight_grams)}g</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="px-4 py-3 bg-[#0a0a0a]/50 border-t border-white/5 flex items-center justify-between text-xs">
                  {product.url ? (
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-amber-400 flex items-center font-medium transition-colors text-[11px]"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Store Page
                    </a>
                  ) : (
                    <span className="text-[10px] text-gray-600">No URL</span>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(product)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 text-gray-300 hover:text-amber-400 transition-all border border-transparent hover:border-amber-500/30"
                      title="Edit Item"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      disabled={isDeleting === product.id}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-all border border-transparent hover:border-red-500/30"
                      title="Delete Item"
                    >
                      {isDeleting === product.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#111111] border border-amber-500/20 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">Edit Jewelry Details</h2>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 text-gray-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Jewelry Name *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g. Royal 22K Kundan Gold Necklace"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                  required
                />
              </div>

              {/* Category & Custom Category Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Category (Type)
                  </label>
                  <select
                    value={editForm.type}
                    onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 capitalize"
                  >
                    {standardTypes.map(t => (
                      <option key={t} value={t} className="bg-black text-white capitalize">{t}</option>
                    ))}
                    <option value="custom" className="bg-black text-amber-400 font-bold">✍️ Type Custom Category...</option>
                  </select>
                </div>

                {editForm.type === 'custom' && (
                  <div>
                    <label className="block text-xs font-semibold text-amber-400 mb-1">
                      Type Custom Category Name
                    </label>
                    <input
                      type="text"
                      value={editForm.customCategory}
                      onChange={e => setEditForm({ ...editForm, customCategory: e.target.value })}
                      placeholder="e.g. Brooch, Kamarbandh, Panchdhatu"
                      className="w-full bg-[#0a0a0a] border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Metal & Karat Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Metal
                  </label>
                  <select
                    value={editForm.metal}
                    onChange={e => setEditForm({ ...editForm, metal: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 capitalize"
                  >
                    {standardMetals.map(m => (
                      <option key={m} value={m} className="bg-black text-white capitalize">{m}</option>
                    ))}
                    <option value="custom" className="bg-black text-amber-400 font-bold">✍️ Type Custom Metal...</option>
                  </select>
                </div>

                {editForm.metal === 'custom' && (
                  <div>
                    <label className="block text-xs font-semibold text-amber-400 mb-1">
                      Type Custom Metal Name
                    </label>
                    <input
                      type="text"
                      value={editForm.customMetal}
                      onChange={e => setEditForm({ ...editForm, customMetal: e.target.value })}
                      placeholder="e.g. Rose Gold, Panchdhatu"
                      className="w-full bg-[#0a0a0a] border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Karat (Purity)
                  </label>
                  <select
                    value={editForm.karat}
                    onChange={e => setEditForm({ ...editForm, karat: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="24K" className="bg-black text-white">24K (99.9% Pure)</option>
                    <option value="22K" className="bg-black text-white">22K (91.6% Hallmark)</option>
                    <option value="18K" className="bg-black text-white">18K (75.0% Gold)</option>
                    <option value="14K" className="bg-black text-white">14K (58.3% Gold)</option>
                    <option value="10K" className="bg-black text-white">10K Gold</option>
                    <option value="925" className="bg-black text-white">925 Sterling Silver</option>
                  </select>
                </div>
              </div>

              {/* Weight, Making Charges & Calculated Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1 flex items-center gap-1">
                    <Scale className="w-3 h-3 text-amber-400" /> Weight (Grams)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.weight_grams}
                    onChange={e => setEditForm({ ...editForm, weight_grams: e.target.value })}
                    placeholder="e.g. 10.5"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Making Charge (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.making_charge_percent}
                    onChange={e => setEditForm({ ...editForm, making_charge_percent: e.target.value })}
                    placeholder="e.g. 12"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-400 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                    placeholder="e.g. 154000"
                    className="w-full bg-[#0a0a0a] border border-amber-500/40 rounded-xl px-3.5 py-2.5 text-sm font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Store Product URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Product Link (Buy URL)
                </label>
                <input
                  type="url"
                  value={editForm.url}
                  onChange={e => setEditForm({ ...editForm, url: e.target.value })}
                  placeholder="https://yourstore.com/item/123"
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Image Preview & File Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Jewelry Photo
                </label>
                
                <div className="flex items-center gap-4">
                  {editForm.image_url ? (
                    <div className="relative h-16 w-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0">
                      <img src={editForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setEditForm({ ...editForm, image_url: null })}
                        className="absolute top-0.5 right-0.5 p-0.5 bg-black/80 rounded-full text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded-xl bg-[#0a0a0a] border border-dashed border-white/20 flex items-center justify-center text-gray-500 text-[10px] text-center p-1">
                      No Image
                    </div>
                  )}

                  <label className="flex-1 cursor-pointer bg-[#0a0a0a] border border-white/10 hover:border-amber-500/40 rounded-xl p-3 flex items-center justify-center gap-2 text-xs font-semibold text-gray-300 hover:text-amber-400 transition-colors">
                    <Upload className="w-4 h-4 text-amber-500" />
                    <span>Upload New Photo (Max 2MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs shadow-lg shadow-amber-500/20 transition-all border border-amber-400/30 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Edit3 className="w-4 h-4" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
