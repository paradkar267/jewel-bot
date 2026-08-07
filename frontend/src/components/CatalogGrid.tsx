"use client";

import { useState } from 'react';
import { Edit3, Trash2, Layers, Tag, X, Upload, Loader2, AlertCircle, ExternalLink, Package } from 'lucide-react';
import { updateProduct, deleteProduct } from '@/app/actions/product';

interface Product {
  id: string;
  shop_id: string;
  name: string;
  type: string | null;
  metal: string | null;
  price: any; // Decimal type from Prisma
  url: string | null;
  image_url: string | null;
  created_at: Date;
}

export default function CatalogGrid({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // holds id of product being deleted
  const [editForm, setEditForm] = useState({
    name: '',
    type: 'ring',
    metal: 'gold',
    price: '',
    url: '',
    image_url: '' as string | null
  });
  const [error, setError] = useState('');

  // Handle Edit Click
  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      type: product.type || 'ring',
      metal: product.metal || 'gold',
      price: product.price ? String(product.price) : '',
      url: product.url || '',
      image_url: product.image_url
    });
    setError('');
  };

  // Convert File to Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditForm(prev => ({ ...prev, image_url: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editForm.name.trim()) {
      setError("Product Name is required.");
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const parsedPrice = editForm.price ? parseFloat(editForm.price) : null;
      const result = await updateProduct(editingProduct.id, {
        name: editForm.name,
        type: editForm.type,
        metal: editForm.metal,
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

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this jewelry piece from your vault?")) return;

    setIsDeleting(id);
    try {
      const result = await deleteProduct(id);
      if (result.success) {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete product.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <>
      {products.length === 0 ? (
        <div className="text-center py-24 bg-[#111111]/50 rounded-2xl border border-white/5 backdrop-blur-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6 shadow-inner">
            <Package className="h-10 w-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-white">Your vault is empty</h3>
          <p className="mt-2 text-gray-400 max-w-md mx-auto">Start building your automated catalog by adding your first jewelry piece. Our AI will handle the rest.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => (
            <div key={product.id} className="group bg-[#111111] rounded-xl overflow-hidden border border-white/5 hover:border-amber-500/30 transition-all duration-300 hover:shadow-[0_4px_20px_rgb(0,0,0,0.5)] relative">
              
              {/* Actions Overlay (Glassmorphism top right) */}
              <div className="absolute top-2 right-2 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => startEdit(product)}
                  className="p-1.5 rounded-lg bg-black/60 border border-white/10 text-amber-400 hover:bg-amber-500 hover:text-black transition-all hover:scale-105"
                  title="Edit Jewelry"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-1.5 rounded-lg bg-black/60 border border-white/10 text-red-400 hover:bg-red-500 hover:text-white transition-all hover:scale-105"
                  title="Delete Jewelry"
                  disabled={isDeleting === product.id}
                >
                  {isDeleting === product.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Image Area */}
              <div className="aspect-square bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center">
                {product.image_url ? (
                  <>
                    <img src={product.image_url} alt={product.name} className="absolute inset-0 w-full h-full object-cover z-0 transform group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/20 to-transparent z-10" />
                  </>
                ) : (
                  <div className="text-6xl z-0 transform group-hover:scale-105 transition-transform duration-500">
                    {product.type === 'ring' ? '💍' : product.type === 'necklace' ? '📿' : '✨'}
                  </div>
                )}
              </div>

              {/* Content Area */}
              <div className="p-4">
                <h4 className="text-sm font-bold text-white mb-2 line-clamp-1">{product.name || 'Unnamed Jewelry'}</h4>
                
                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <div className="flex items-center gap-1 capitalize truncate pr-2">
                    <Layers className="w-3 h-3 text-gray-500" />
                    {product.metal}
                  </div>
                  <div className="flex items-center gap-1 capitalize shrink-0">
                    <Tag className="w-3 h-3 text-gray-500" />
                    {product.type}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-0.5">Est. Value</span>
                  <span className="text-sm font-bold text-amber-400">
                    {product.price ? `₹${Number(product.price).toLocaleString()}` : 'Ask for Price'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal Overlay */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 relative">
            
            {/* Close Button */}
            <button
              onClick={() => { if (!isSaving) setEditingProduct(null); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Edit3 className="w-5 h-5 text-amber-500 mr-2" />
                Edit Jewelry Item
              </h3>
              <p className="text-gray-400 text-xs mt-1">Update details for "{editingProduct.name}" in your catalog.</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-xs text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Jewelry Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="block w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs"
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Estimated Price (₹)</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                    className="block w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs"
                    placeholder="Ask for Price"
                    disabled={isSaving}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Category</label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                    className="block w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs cursor-pointer"
                    disabled={isSaving}
                  >
                    <option value="ring">Ring 💍</option>
                    <option value="necklace">Necklace 📿</option>
                    <option value="earring">Earring 👂</option>
                    <option value="bracelet">Bracelet ⌚</option>
                    <option value="pendant">Pendant 🔮</option>
                    <option value="anklet">Anklet 🦶</option>
                    <option value="bangle">Bangle 🔗</option>
                    <option value="other">Other ✨</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Metal Material</label>
                  <select
                    value={editForm.metal}
                    onChange={(e) => setEditForm(prev => ({ ...prev, metal: e.target.value }))}
                    className="block w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs cursor-pointer"
                    disabled={isSaving}
                  >
                    <option value="gold">Gold 🥇</option>
                    <option value="silver">Silver 🥈</option>
                    <option value="platinum">Platinum 💎</option>
                    <option value="rose gold">Rose Gold 🌸</option>
                    <option value="white gold">White Gold ⚪</option>
                    <option value="copper">Copper ⚙️</option>
                    <option value="brass">Brass ⚙️</option>
                    <option value="unknown">Unknown ⚙️</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Purchase URL</label>
                <input
                  type="url"
                  value={editForm.url}
                  onChange={(e) => setEditForm(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://example.com/shop/ring"
                  className="block w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs"
                  disabled={isSaving}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5">Jewelry Image</label>
                <div className="border border-dashed border-white/10 rounded-xl p-3 flex items-center justify-between bg-white/[0.01] hover:bg-white/[0.02] transition-all cursor-pointer relative min-h-16">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={isSaving}
                  />
                  {editForm.image_url ? (
                    <div className="flex items-center gap-3 w-full justify-between">
                      <div className="flex items-center gap-2">
                        <img src={editForm.image_url} className="h-10 w-10 rounded object-cover border border-white/10" alt="Preview" />
                        <span className="text-[10px] text-gray-400 truncate max-w-48">Image loaded successfully</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditForm(prev => ({ ...prev, image_url: null }));
                        }}
                        className="text-[10px] font-bold text-red-500 hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <Upload className="w-4 h-4 text-amber-500/80" />
                      <span>Click to upload new image (max 2MB)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
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
                    'Save Changes'
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
}
