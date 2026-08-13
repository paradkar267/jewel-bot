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
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-white border border-neutral-200 p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-black bg-neutral-105 hover:bg-neutral-200 px-3.5 py-2 rounded-lg transition-all border border-neutral-250 cursor-pointer"
            >
              {selectedIds.length === products.length ? (
                <CheckSquare className="w-4 h-4 text-black" />
              ) : (
                <Square className="w-4 h-4 text-neutral-450" />
              )}
              <span>
                {selectedIds.length === products.length
                  ? `Deselect All (${products.length})`
                  : `Select All (${products.length} Items)`}
              </span>
            </button>

            {selectedIds.length > 0 && (
              <span className="text-xs font-medium text-neutral-800 bg-neutral-100 px-3 py-1.5 rounded-lg border border-neutral-250">
                {selectedIds.length} item{selectedIds.length > 1 ? 's' : ''} selected
              </span>
            )}
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-md transition-all border border-red-500/30 disabled:opacity-50 cursor-pointer"
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
                className="p-2 text-neutral-500 hover:text-black bg-neutral-100 rounded-lg border border-neutral-250 cursor-pointer"
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
        <div className="text-center py-16 bg-white border border-neutral-200 rounded-2xl shadow-sm">
          <Package className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-neutral-900 mb-1">No Jewelry Items Added Yet</h3>
          <p className="text-neutral-550 text-xs max-w-sm mx-auto">
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
                className={`bg-white border ${isSelected ? 'border-red-500/80 shadow-md shadow-red-500/5' : 'border-neutral-200 hover:border-neutral-400'} rounded-2xl overflow-hidden transition-all duration-300 group flex flex-col justify-between relative shadow-sm`}
              >
                <div>
                  {/* Image Section */}
                  <div className="relative h-48 w-full bg-neutral-50 overflow-hidden flex items-center justify-center border-b border-neutral-150">
                    {/* Checkbox Overlay Top-Left */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectProduct(product.id);
                      }}
                      className="absolute top-3 left-3 z-10 p-1.5 rounded-lg bg-white/90 hover:bg-white border border-neutral-250 transition-all shadow-sm backdrop-blur-md cursor-pointer"
                      title={isSelected ? "Deselect item" : "Select item for bulk delete"}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-red-605 fill-red-500/10" />
                      ) : (
                        <Square className="w-4 h-4 text-neutral-500 hover:text-neutral-800" />
                      )}
                    </button>

                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isSelected ? 'opacity-80' : ''}`}
                      />
                    ) : (
                      <div className="text-neutral-400 text-xs font-semibold">No Image Provided</div>
                    )}

                    {/* Metal / Karat Badge */}
                    <div className="absolute top-3 left-12 flex gap-1.5 flex-wrap z-0">
                      {product.karat && (
                        <span className="px-2.5 py-1 bg-black text-white text-[10px] font-extrabold rounded-full uppercase shadow-sm">
                          {product.karat}
                        </span>
                      )}
                      <span className="px-2.5 py-1 bg-neutral-100 text-neutral-800 text-[10px] font-extrabold rounded-full uppercase border border-neutral-250 shadow-sm">
                        {product.metal || 'Gold'}
                      </span>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 bg-white/95 text-neutral-700 text-[10px] font-medium rounded-full border border-neutral-200 shadow-sm capitalize">
                        {product.type || 'Jewelry'}
                      </span>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-neutral-900 text-base truncate group-hover:text-black transition-colors">
                      {product.name}
                    </h3>

                    <div className="flex items-center justify-between pt-1">
                      <div className="text-neutral-950 font-black text-lg">
                        {product.price ? `₹${Number(product.price).toLocaleString('en-IN')}` : 'Ask for Price'}
                      </div>

                      {product.weight_grams && (
                        <div className="text-[11px] font-semibold text-neutral-600 bg-neutral-50 px-2 py-0.5 rounded-lg flex items-center gap-1 border border-neutral-200">
                          <Scale className="w-3 h-3 text-neutral-700" />
                          <span>{Number(product.weight_grams)}g</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="px-4 py-3 bg-neutral-50 border-t border-neutral-150 flex items-center justify-between text-xs">
                  {product.url ? (
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-600 hover:text-black flex items-center font-medium transition-colors text-[11px]"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Store Page
                    </a>
                  ) : (
                    <span className="text-[10px] text-neutral-400">No URL</span>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(product)}
                      className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-black transition-all border border-neutral-200 cursor-pointer"
                      title="Edit Item"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      disabled={isDeleting === product.id}
                      className="p-1.5 rounded-lg bg-neutral-100 hover:bg-red-50 hover:border-red-200 text-neutral-600 hover:text-red-600 transition-all border border-neutral-200 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-neutral-200 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-5">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-neutral-900" />
                <h2 className="text-lg font-bold text-neutral-900">Edit Jewelry Details</h2>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 text-neutral-500 hover:text-black rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-750 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Jewelry Name *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g. Royal 22K Kundan Gold Necklace"
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-905 placeholder-neutral-400 focus:outline-none focus:border-black"
                  required
                />
              </div>

              {/* Category & Custom Category Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Category (Type)
                  </label>
                  <select
                    value={editForm.type}
                    onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-black capitalize cursor-pointer"
                  >
                    {standardTypes.map(t => (
                      <option key={t} value={t} className="capitalize">{t}</option>
                    ))}
                    <option value="custom" className="font-bold">✍️ Type Custom Category...</option>
                  </select>
                </div>

                {editForm.type === 'custom' && (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-900 mb-1">
                      Type Custom Category Name
                    </label>
                    <input
                      type="text"
                      value={editForm.customCategory}
                      onChange={e => setEditForm({ ...editForm, customCategory: e.target.value })}
                      placeholder="e.g. Brooch, Kamarbandh, Panchdhatu"
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-450 focus:outline-none focus:border-black"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Metal & Karat Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Metal
                  </label>
                  <select
                    value={editForm.metal}
                    onChange={e => setEditForm({ ...editForm, metal: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-black capitalize cursor-pointer"
                  >
                    {standardMetals.map(m => (
                      <option key={m} value={m} className="capitalize">{m}</option>
                    ))}
                    <option value="custom" className="font-bold">✍️ Type Custom Metal...</option>
                  </select>
                </div>

                {editForm.metal === 'custom' && (
                  <div>
                    <label className="block text-xs font-semibold text-neutral-900 mb-1">
                      Type Custom Metal Name
                    </label>
                    <input
                      type="text"
                      value={editForm.customMetal}
                      onChange={e => setEditForm({ ...editForm, customMetal: e.target.value })}
                      placeholder="e.g. Rose Gold, Panchdhatu"
                      className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-450 focus:outline-none focus:border-black"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Karat (Purity)
                  </label>
                  <select
                    value={editForm.karat}
                    onChange={e => setEditForm({ ...editForm, karat: e.target.value })}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-black cursor-pointer"
                  >
                    <option value="24K">24K (99.9% Pure)</option>
                    <option value="22K">22K (91.6% Hallmark)</option>
                    <option value="18K">18K (75.0% Gold)</option>
                    <option value="14K">14K (58.3% Gold)</option>
                    <option value="10K">10K Gold</option>
                    <option value="925">925 Sterling Silver</option>
                  </select>
                </div>
              </div>

              {/* Weight, Making Charges & Calculated Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1">
                    <Scale className="w-3 h-3 text-neutral-800" /> Weight (Grams)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.weight_grams}
                    onChange={e => setEditForm({ ...editForm, weight_grams: e.target.value })}
                    placeholder="e.g. 10.5"
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Making Charge (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.making_charge_percent}
                    onChange={e => setEditForm({ ...editForm, making_charge_percent: e.target.value })}
                    placeholder="e.g. 12"
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-900 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={e => setEditForm({ ...editForm, price: e.target.value })}
                    placeholder="e.g. 154000"
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-neutral-950 focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Store Product URL */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Product Link (Buy URL)
                </label>
                <input
                  type="url"
                  value={editForm.url}
                  onChange={e => setEditForm({ ...editForm, url: e.target.value })}
                  placeholder="https://yourstore.com/item/123"
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 placeholder-neutral-450 focus:outline-none focus:border-black"
                />
              </div>

              {/* Image Preview & File Upload */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Jewelry Photo
                </label>
                
                <div className="flex items-center gap-4">
                  {editForm.image_url ? (
                    <div className="relative h-16 w-16 rounded-xl overflow-hidden border border-neutral-200 flex-shrink-0">
                      <img src={editForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setEditForm({ ...editForm, image_url: null })}
                        className="absolute top-0.5 right-0.5 p-0.5 bg-black/80 rounded-full text-red-400 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded-xl bg-neutral-50 border border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 text-[10px] text-center p-1">
                      No Image
                    </div>
                  )}

                  <label className="flex-1 cursor-pointer bg-neutral-50 border border-neutral-300 hover:border-neutral-400 rounded-xl p-3 flex items-center justify-center gap-2 text-xs font-semibold text-neutral-700 hover:text-black transition-colors">
                    <Upload className="w-4 h-4 text-neutral-800" />
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
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-bold text-xs shadow-md transition-all border border-neutral-900 disabled:opacity-50 cursor-pointer"
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
