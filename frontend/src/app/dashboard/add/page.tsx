'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Sparkles, Loader2, ArrowLeft, Image as ImageIcon, Scale } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

export default function AddProductPage() {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    type: 'ring',
    customCategory: '',
    metal: 'gold',
    customMetal: '',
    karat: '22K',
    weight_grams: '',
    price: '',
    url: ''
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleAIAutofill = async () => {
    if (!imageFile) return;
    setIsAnalyzing(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        
        const response = await axios.post('/api/analyze', {
          base64Image: base64String,
          mimeType: imageFile.type
        });

        const data = response.data;
        setFormData(prev => ({
          ...prev,
          name: data.name || '',
          type: data.type || 'ring',
          metal: data.metal || 'gold',
          price: data.price || ''
        }));
      };
    } catch (error) {
      alert("AI analysis failed. Please fill details manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let imageBase64 = null;
      if (imageFile) {
        // Convert file to base64 Data URI
        const reader = new FileReader();
        imageBase64 = await new Promise<string>((resolve, reject) => {
          reader.readAsDataURL(imageFile);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => reject(error);
        });
      }

      const { createProduct } = await import('@/app/actions/product');
      
      const parsedPrice = formData.price.trim() !== '' ? parseFloat(formData.price) : null;
      const parsedWeight = formData.weight_grams.trim() !== '' ? parseFloat(formData.weight_grams) : null;

      const finalType = formData.type === 'custom' ? (formData.customCategory.trim() || 'Other') : formData.type;
      const finalMetal = formData.metal === 'custom' ? (formData.customMetal.trim() || 'Other') : formData.metal;

      const result = await createProduct({
        name: formData.name,
        type: finalType,
        metal: finalMetal,
        karat: formData.karat,
        weight_grams: parsedWeight,
        price: parsedPrice,
        url: formData.url,
        image_base64: imageBase64,
      });

      if (!result.success) {
        throw new Error("Failed to save product");
      }

      router.push('/dashboard/catalog');
    } catch (error: any) {
      alert("Error saving product: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-10 animate-in fade-in duration-500">
      <div className="mb-8 flex items-center">
        <Link href="/dashboard/catalog" className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-black transition-colors mr-4 border border-neutral-250">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Add Jewelry to Vault</h1>
          <p className="text-neutral-500 mt-1">Upload a photo, select purity karat, and let our AI assist you.</p>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="p-8 md:flex gap-10">
          
          {/* Image Upload Section */}
          <div className="md:w-5/12 mb-8 md:mb-0">
            <label className="block text-sm font-medium text-neutral-700 mb-2">Jewelry Photo</label>
            <div className="relative group border-2 border-dashed border-neutral-200 rounded-2xl p-4 text-center hover:border-neutral-400 transition-colors bg-neutral-50 min-h-[300px] flex flex-col items-center justify-center overflow-hidden">
              
              {preview ? (
                <div className="relative w-full h-72">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                    <p className="text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-full border border-white/20">Click to Change Image</p>
                  </div>
                </div>
              ) : (
                <div className="py-8">
                  <div className="h-16 w-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-200 text-neutral-800">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                  <p className="text-sm font-bold text-neutral-700">Upload high quality image</p>
                  <p className="text-xs text-neutral-500 mt-1">PNG, JPG up to 10MB</p>
                </div>
              )}

              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            {/* AI Auto-Fill Button */}
            {preview && (
              <button
                type="button"
                onClick={handleAIAutofill}
                disabled={isAnalyzing}
                className={`mt-6 w-full flex items-center justify-center py-4 px-4 rounded-xl text-sm font-bold focus:outline-none transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                  isAnalyzing 
                    ? 'border border-black bg-neutral-100 text-black scale-[0.98]' 
                    : 'border border-neutral-300 text-neutral-805 bg-neutral-50 hover:bg-neutral-100'
                }`}
              >
                <div className={`absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-neutral-400/20 to-transparent -translate-x-full ${isAnalyzing ? 'animate-[shimmer_1s_infinite]' : 'group-hover:animate-[shimmer_1.5s_infinite]'}`} />
                
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin text-neutral-800 relative z-10" />
                    <span className="relative z-10">Gemini is analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2 relative z-10 text-neutral-800" />
                    <span className="relative z-10">Auto-Fill with AI Magic</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Form Section */}
          <div className="md:w-7/12 flex flex-col justify-center">
            <form onSubmit={handleSave} className="space-y-5">
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Jewelry Name *</label>
                <input 
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="block w-full bg-white border border-neutral-300 rounded-xl py-3 px-4 text-neutral-900 font-bold placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors sm:text-sm" 
                  placeholder="e.g. Royal Kundan Gold Necklace" 
                />
              </div>

              {/* Karat, Category & Metal */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div>
                  <label className="block text-sm font-bold text-neutral-800 mb-1.5">Karat / Purity ✨</label>
                  <select 
                    value={formData.karat} onChange={e => setFormData({...formData, karat: e.target.value})}
                    className="block w-full bg-white border border-neutral-300 rounded-xl py-3 px-3 text-neutral-900 font-bold focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors sm:text-sm cursor-pointer"
                  >
                    <option value="22K">22K Gold (916) 👑</option>
                    <option value="18K">18K Gold (750) 💎</option>
                    <option value="14K">14K Gold (585) ✨</option>
                    <option value="24K">24K Pure Gold 🥇</option>
                    <option value="925 Silver">925 Silver 🥈</option>
                    <option value="999 Silver">999 Silver ⚪</option>
                    <option value="Fashion">Fashion / Imitation 🌸</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Category</label>
                  <select 
                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                    className="block w-full bg-white border border-neutral-300 rounded-xl py-3 px-3 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors sm:text-sm cursor-pointer"
                  >
                    <option value="ring">Ring 💍</option>
                    <option value="necklace">Necklace 📿</option>
                    <option value="earring">Earring 👂</option>
                    <option value="bracelet">Bracelet ⌚</option>
                    <option value="pendant">Pendant 🔮</option>
                    <option value="anklet">Anklet 🦶</option>
                    <option value="bangle">Bangle 🔗</option>
                    <option value="other">Other ✨</option>
                    <option value="custom">✍️ Type Custom...</option>
                  </select>
                  {formData.type === 'custom' && (
                    <input 
                      type="text" 
                      value={formData.customCategory} onChange={e => setFormData({...formData, customCategory: e.target.value})}
                      placeholder="e.g. Brooch, Waist Belt, Kada"
                      className="mt-2 block w-full bg-white border border-neutral-300 rounded-xl py-2 px-3 text-neutral-900 font-bold text-xs focus:outline-none focus:border-black"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Metal</label>
                  <select 
                    value={formData.metal} onChange={e => setFormData({...formData, metal: e.target.value})}
                    className="block w-full bg-white border border-neutral-300 rounded-xl py-3 px-3 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors sm:text-sm cursor-pointer"
                  >
                    <option value="gold">Gold 🥇</option>
                    <option value="silver">Silver 🥈</option>
                    <option value="platinum">Platinum 💎</option>
                    <option value="rose gold">Rose Gold 🌸</option>
                    <option value="white gold">White Gold ⚪</option>
                    <option value="copper">Copper ⚙️</option>
                    <option value="brass">Brass ⚙️</option>
                    <option value="custom">✍️ Type Custom...</option>
                  </select>
                  {formData.metal === 'custom' && (
                    <input 
                      type="text" 
                      value={formData.customMetal} onChange={e => setFormData({...formData, customMetal: e.target.value})}
                      placeholder="e.g. Panchdhatu, Titanium"
                      className="mt-2 block w-full bg-white border border-neutral-300 rounded-xl py-2 px-3 text-neutral-900 font-bold text-xs focus:outline-none focus:border-black"
                    />
                  )}
                </div>

              </div>

              {/* Weight in Grams & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5 flex items-center justify-between">
                    <span>Weight (Grams)</span>
                    <Scale className="w-3.5 h-3.5 text-neutral-600" />
                  </label>
                  <input 
                    type="number" step="0.01"
                    value={formData.weight_grams} onChange={e => setFormData({...formData, weight_grams: e.target.value})}
                    className="block w-full bg-white border border-neutral-300 rounded-xl py-3 px-4 text-neutral-900 font-bold placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors sm:text-sm" 
                    placeholder="e.g. 8.5" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Price (₹)</label>
                  <input 
                    type="number" 
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                    className="block w-full bg-white border border-neutral-300 rounded-xl py-3 px-4 text-neutral-900 font-extrabold placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors sm:text-sm" 
                    placeholder="Leave empty for 'Ask Price'" 
                  />
                </div>
              </div>

              {/* Store Link */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Purchase URL (Optional)</label>
                <input 
                  type="url" 
                  value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})}
                  className="block w-full bg-white border border-neutral-300 rounded-xl py-3 px-4 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors sm:text-sm" 
                  placeholder="https://yourstore.com/item/123" 
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full flex items-center justify-center py-4 px-6 rounded-xl text-sm font-extrabold text-white bg-black hover:bg-neutral-800 transition-all transform hover:scale-[1.01] cursor-pointer shadow-sm"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin text-white" />
                      Saving to Vault...
                    </>
                  ) : (
                    'Add Jewelry to Catalog'
                  )}
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
