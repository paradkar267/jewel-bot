'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Upload, FileSpreadsheet, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';

export default function BulkUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Name,Type,Metal,Keywords,MinPrice,MaxPrice,ImageURL,ProductURL\nGold Bangle,bracelet,gold,\"bangle, heavy, wedding\",50000,75000,,https://yourshop.com/gold-bangle\nSilver Anklet,other,silver,\"anklet, traditional\",2000,5000,,https://yourshop.com/silver-anklet";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "jewelry_catalog_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus({ type: 'idle', message: '' });
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsProcessing(true);
    setStatus({ type: 'idle', message: 'Parsing CSV...' });

    try {
      // 1. Get current user's shop ID
      const { data: shopData, error: shopError } = await supabase.from('shops').select('id').limit(1).single();
      if (shopError || !shopData) {
        throw new Error("Could not find your shop account. Please contact support.");
      }
      const shopId = shopData.id;

      // 2. Parse CSV
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            // Validate Columns
            const expectedHeaders = ['Name', 'Type', 'Metal', 'Keywords', 'MinPrice', 'MaxPrice', 'ImageURL', 'ProductURL'];
            const actualHeaders = results.meta.fields || [];
            
            const missingHeaders = expectedHeaders.filter(header => !actualHeaders.includes(header));
            
            if (missingHeaders.length > 0) {
              throw new Error(`Invalid CSV Format. Missing columns: ${missingHeaders.join(', ')}. Please use the exact template.`);
            }

            if (results.data.length === 0) {
              throw new Error("The CSV file is empty.");
            }

            setStatus({ type: 'idle', message: `Validated columns. Uploading ${results.data.length} items to vault...` });
            
            const rowsToInsert = results.data.map((row: any) => ({
              shop_id: shopId,
              name: row.Name || 'Unnamed Item',
              type: (row.Type || 'other').toLowerCase(),
              metal: (row.Metal || '').toLowerCase(),
              keywords: row.Keywords ? row.Keywords.split(',').map((k: string) => k.trim()) : [],
              price_range_min: parseInt(row.MinPrice) || null,
              price_range_max: parseInt(row.MaxPrice) || null,
              image_url: row.ImageURL || null,
              url: row.ProductURL || null
            }));

            // 3. Bulk Insert into Supabase
            const { error: insertError } = await supabase.from('products').insert(rowsToInsert);
            
            if (insertError) throw insertError;

            setStatus({ type: 'success', message: `Successfully added ${rowsToInsert.length} items to your vault!` });
            setFile(null);
            
            // Redirect after 2 seconds
            setTimeout(() => {
              router.push('/dashboard');
            }, 2000);

          } catch (err: any) {
            setStatus({ type: 'error', message: err.message || "Failed to save data." });
            setIsProcessing(false);
          }
        },
        error: (error) => {
          setStatus({ type: 'error', message: "Failed to parse CSV file." });
          setIsProcessing(false);
        }
      });
    } catch (err: any) {
      setStatus({ type: 'error', message: err.message });
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Bulk Upload</h1>
        <p className="text-gray-400 mt-1">Upload hundreds of items instantly using a CSV spreadsheet.</p>
      </div>

      <div className="bg-[#111111] shadow-2xl rounded-2xl border border-white/5 overflow-hidden p-8">
        
        {/* Step 1: Download Template */}
        <div className="mb-10 pb-10 border-b border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 text-sm mr-3">1</span>
              Download the Template
            </h3>
            <p className="text-gray-400 mt-2 text-sm max-w-md">
              To ensure data imports correctly, please download our official CSV template and fill your catalog details in it.
            </p>
          </div>
          <button 
            onClick={handleDownloadTemplate}
            className="flex-shrink-0 inline-flex items-center px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium text-white transition-colors"
          >
            <Download className="w-4 h-4 mr-2 text-amber-400" />
            Download CSV Template
          </button>
        </div>

        {/* Step 2: Upload File */}
        <div>
          <h3 className="text-xl font-bold text-white flex items-center mb-6">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 text-sm mr-3">2</span>
            Upload Completed File
          </h3>

          <div className={`group relative bg-[#0a0a0a] border-2 border-dashed ${file ? 'border-amber-500/50 bg-amber-500/5' : 'border-white/10 hover:border-white/30'} rounded-xl flex flex-col items-center justify-center p-12 transition-colors`}>
            {file ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileSpreadsheet className="h-8 w-8 text-amber-400" />
                </div>
                <p className="text-lg font-bold text-white">{file.name}</p>
                <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                
                {!isProcessing && status.type !== 'success' && (
                  <p className="text-xs text-amber-500/80 mt-4 cursor-pointer hover:underline">Click to change file</p>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="h-8 w-8 text-gray-400 group-hover:text-amber-400 transition-colors" />
                </div>
                <p className="text-base font-medium text-gray-300">Drag & Drop your CSV file here</p>
                <p className="mt-1 text-sm text-gray-500">or click to browse</p>
              </div>
            )}
            
            {(!isProcessing && status.type !== 'success') && (
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            )}
          </div>

          {status.message && (
            <div className={`mt-6 p-4 rounded-xl flex items-center ${
              status.type === 'error' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 
              status.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 
              'bg-blue-500/10 border border-blue-500/20 text-blue-400'
            }`}>
              {status.type === 'error' && <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />}
              {status.type === 'success' && <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />}
              {status.type === 'idle' && <Loader2 className="w-5 h-5 mr-3 flex-shrink-0 animate-spin" />}
              <span className="font-medium text-sm">{status.message}</span>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleUpload}
              disabled={!file || isProcessing || status.type === 'success'}
              className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent rounded-xl shadow-lg text-base font-bold text-[#0a0a0a] bg-gradient-to-r from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing Batch...' : 'Upload & Save to Vault'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
