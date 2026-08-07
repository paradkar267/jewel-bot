"use client";

import { useState } from 'react';
import { Edit3, Trash2, Layers, Tag, X, Upload, Loader2, AlertCircle, ExternalLink, Package, Scale, Sparkles } from 'lucide-react';
import { updateProduct, deleteProduct } from '@/app/actions/product';

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
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    type: 'ring',
    metal: 'gold',
    karat: '22K',
    weight_grams: '',
    making_charge_percent: '',
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

      const result = await updateProduct(editingProduct.id, {
        name: editForm.name,
        type: editForm.type,
        metal: editForm.metal,
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
    } catch (err: any) {
      alert("Failed to delete product: " + err.message);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div>
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
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                {/* Image Section */}
                <div className="relative h-48 w-full bg-[#0a0a0a] overflow-hidden flex items-center justify-center border-b border-white/5">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-gray-600 text-xs font-semibold">No Image Provided</div>
                  )}

                  {/* Metal / Karat Badge */}
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
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
          ))}
        </div>
      )}

      {/* Edit Jewelry Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl my-8">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-[#0a0a0a]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-500" />
                  Edit Jewelry Item
                </h3>
                <p className="text-xs text-gray-400">Update details & purity for "{editingProduct.name}"</p>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Jewelry Name & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Jewelry Name *</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="block w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs font-bold"
                    placeholder="e.g. Kundan Gold Necklace"
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Estimated Price (₹)</label>
                  <input
                    type="number"
                    value={editForm.price}
                    onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                    className="block w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-2.5 text-amber-400 font-extrabold focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs"
                    placeholder="Auto-calculated or Manual"
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Karat / Purity & Metal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-amber-400 mb-1.5">Karat / Purity ✨</label>
                  <select
                    value={editForm.karat}
                    onChange={(e) => setEditForm(prev => ({ ...prev, karat: e.target.value }))}
                    className="block w-full bg-[#0a0a0a] border border-amber-500/30 rounded-xl p-2.5 text-white font-bold focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs cursor-pointer"
                    disabled={isSaving}
                  >
                    <option value="22K">22K Gold (916 Purity) 👑</option>
                    <option value="18K">18K Gold (750 Purity) 💎</option>
                    <option value="14K">14K Gold (585 Purity) ✨</option>
                    <option value="24K">24K Gold (999 Pure) 🥇</option>
                    <option value="925 Silver">925 Sterling Silver 🥈</option>
                    <option value="999 Silver">999 Pure Silver ⚪</option>
                    <option value="Fashion">Fashion / Imitation 🌸</option>
                  </select>
                </div>

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
                  </select>
                </div>
              </div>

              {/* Weight in Grams & Making Charges % */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Weight (in Grams)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.weight_grams}
                    onChange={(e) => setEditForm(prev => ({ ...prev, weight_grams: e.target.value }))}
                    className="block w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs font-bold"
                    placeholder="e.g. 8.5"
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1.5">Making Charge (%)</label>
                  <input
                    type="number"
                    value={editForm.making_charge_percent}
                    onChange={(e) => setEditForm(prev => ({ ...prev, making_charge_percent: e.target.value }))}
                    className="block w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-2.5 text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-xs"
                    placeholder="Default shop %"
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Purchase URL */}
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

              {/* Image Upload */}
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
    </div>
  );
}
