'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Upload, Sparkles, Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
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
    type: '',
    metal: '',
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
          type: data.type || '',
          metal: data.metal || '',
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
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("Not authenticated");

      let imageUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('catalog-images')
          .upload(fileName, imageFile);
          
        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          throw new Error("Failed to upload image. Have you created the 'catalog-images' storage bucket in Supabase?");
        }
          
        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage.from('catalog-images').getPublicUrl(uploadData.path);
          imageUrl = publicUrl;
        }
      }

      const { data: shopData, error: shopError } = await supabase.from('shops').select('id').limit(1).single();
      
      if (shopError || !shopData) {
        throw new Error("Could not find your shop account. Please contact support.");
      }

      const newProduct = {
        shop_id: shopData.id,
        name: formData.name,
        type: formData.type,
        metal: formData.metal,
        price: parseInt(formData.price) || null,
        image_url: imageUrl,
        url: formData.url
      };

      const { error } = await supabase.from('products').insert([newProduct]);
      
      if (error) throw error;

      router.push('/dashboard');
    } catch (error: any) {
      alert("Error saving product: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-10 animate-in fade-in duration-500">
      <div className="mb-8 flex items-center">
        <Link href="/dashboard" className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors mr-4 border border-white/5">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Add to Vault</h1>
          <p className="text-gray-400 mt-1">Upload a photo and let our AI do the heavy lifting.</p>
        </div>
      </div>

      <div className="bg-[#111111] shadow-2xl rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-8 md:flex gap-10">
          
          {/* Image Upload Section */}
          <div className="md:w-5/12 mb-8 md:mb-0">
            <div className="group relative aspect-[4/5] bg-[#0a0a0a] border-2 border-dashed border-white/10 hover:border-amber-500/50 rounded-xl flex flex-col items-center justify-center overflow-hidden transition-colors">
              {preview ? (
                <>
                  <img src={preview} alt="Preview" className={`w-full h-full object-cover transition-all duration-700 ${isAnalyzing ? 'brightness-50 grayscale-[30%] blur-[2px]' : ''}`} />
                  
                  {isAnalyzing && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl z-20">
                      {/* Scanning Line */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-amber-400 shadow-[0_0_20px_5px_rgba(251,191,36,0.6)] animate-[scan_2s_ease-in-out_infinite]" />
                      
                      {/* Central AI Badge */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/70 px-4 py-2 rounded-lg backdrop-blur-md border border-amber-500/30 flex items-center shadow-2xl">
                          <Sparkles className="w-5 h-5 text-amber-400 mr-2 animate-pulse" />
                          <span className="text-amber-400 font-bold text-sm tracking-widest animate-pulse">EXTRACTING DATA...</span>
                        </div>
                      </div>
                      
                      <style jsx>{`
                        @keyframes scan {
                          0%, 100% { transform: translateY(0); opacity: 0; }
                          10%, 90% { opacity: 1; }
                          50% { transform: translateY(300px); }
                        }
                        @keyframes shimmer {
                          100% { transform: translateX(100%); }
                        }
                      `}</style>
                    </div>
                  )}

                  {!isAnalyzing && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-medium bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">Change Photo</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <ImageIcon className="h-8 w-8 text-gray-400 group-hover:text-amber-400 transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-gray-300">Drop your high-res photo here</p>
                  <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            {preview && (
              <button 
                type="button"
                onClick={handleAIAutofill}
                disabled={isAnalyzing}
                className={`mt-6 w-full flex items-center justify-center py-4 px-4 rounded-xl text-sm font-bold focus:outline-none transition-all duration-300 relative overflow-hidden group ${
                  isAnalyzing 
                    ? 'border-2 border-amber-400 bg-amber-500/20 text-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.4)] scale-[0.98]' 
                    : 'border border-amber-500/30 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 shadow-[0_0_20px_rgba(251,191,36,0.1)] hover:shadow-[0_0_25px_rgba(251,191,36,0.2)]'
                }`}
              >
                {/* Animated gradient sweep */}
                <div className={`absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-amber-400/20 to-transparent -translate-x-full ${isAnalyzing ? 'animate-[shimmer_1s_infinite]' : 'group-hover:animate-[shimmer_1.5s_infinite]'}`} />
                
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin text-amber-500 relative z-10" />
                    <span className="relative z-10">Gemini is analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2 relative z-10" />
                    <span className="relative z-10">Auto-Fill with AI Magic</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Form Section */}
          <div className="md:w-7/12 flex flex-col justify-center">
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
                <input 
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="block w-full bg-[#0a0a0a] border border-white/10 rounded-lg shadow-sm py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors sm:text-sm" 
                  placeholder="e.g. Royal Kundan Bridal Set" 
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Type</label>
                  <select 
                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                    className="block w-full bg-[#0a0a0a] border border-white/10 rounded-lg shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors sm:text-sm appearance-none"
                  >
                    <option value="" className="text-gray-500">Select category</option>
                    <option value="ring">Ring</option>
                    <option value="necklace">Necklace</option>
                    <option value="earring">Earring</option>
                    <option value="bracelet">Bracelet</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Metal</label>
                  <select 
                    value={formData.metal} onChange={e => setFormData({...formData, metal: e.target.value})}
                    className="block w-full bg-[#0a0a0a] border border-white/10 rounded-lg shadow-sm py-3 px-4 text-white focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors sm:text-sm appearance-none"
                  >
                    <option value="" className="text-gray-500">Select metal</option>
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                    <option value="platinum">Platinum</option>
                    <option value="rose gold">Rose Gold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">PriceINR</label>
                <input 
                  type="number" 
                  value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                  className="block w-full bg-[#0a0a0a] border border-white/10 rounded-lg shadow-sm py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors sm:text-sm" 
                  placeholder="10000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">PurchaseURL</label>
                <input 
                  type="url" 
                  value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})}
                  className="block w-full bg-[#0a0a0a] border border-white/10 rounded-lg shadow-sm py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-colors sm:text-sm" 
                  placeholder="https://yourshop.com/product/royal-kundan" 
                />
              </div>

              <div className="pt-6">
                <button 
                  type="submit" disabled={isSaving}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-[#0a0a0a] bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 focus:outline-none transition-all duration-300 disabled:opacity-50"
                >
                  {isSaving ? 'Securing in Vault...' : 'Save to Vault'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
