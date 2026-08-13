'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FileSpreadsheet, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import { createBulkProducts } from '@/app/actions/bulkProduct';

export default function BulkUploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Name,Type,Metal,PriceINR,PurchaseURL,ImageURL\nGold Bangle,bracelet,gold,50000,https://yourshop.com/gold-bangle,\nSilver Anklet,other,silver,2000,https://yourshop.com/silver-anklet,";
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
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            if (results.data.length === 0) {
              throw new Error("The CSV file is empty.");
            }

            setStatus({ type: 'idle', message: `Validated columns. Uploading ${results.data.length} items to vault...` });
            
            const result = await createBulkProducts(results.data);
            
            if (!result.success) throw new Error("Failed to insert products");

            setStatus({ type: 'success', message: `Successfully added ${result.count} items to your vault!` });
            setFile(null);
            
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
        <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Bulk Upload</h1>
        <p className="text-neutral-500 mt-1">Upload hundreds of items instantly using a CSV spreadsheet.</p>
      </div>

      <div className="bg-white shadow-sm rounded-2xl border border-neutral-200 overflow-hidden p-8">
        
        {/* Step 1: Download Template */}
        <div className="mb-10 pb-10 border-b border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-neutral-900 flex items-center">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-100 border border-neutral-250 text-neutral-800 text-sm mr-3">1</span>
              Download the Template
            </h3>
            <p className="text-neutral-500 mt-2 text-sm max-w-md">
              To ensure data imports correctly, please download our official CSV template and fill your catalog details in it.
            </p>
          </div>
          <button 
            onClick={handleDownloadTemplate}
            className="flex-shrink-0 inline-flex items-center px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 border border-neutral-250 rounded-xl font-medium text-neutral-700 hover:text-black transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 mr-2 text-neutral-600" />
            Download CSV Template
          </button>
        </div>

        {/* Step 2: Upload File */}
        <div>
          <h3 className="text-xl font-bold text-neutral-900 flex items-center mb-6">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-100 border border-neutral-250 text-neutral-800 text-sm mr-3">2</span>
            Upload Completed File
          </h3>

          <div className={`group relative bg-neutral-50 border-2 border-dashed ${file ? 'border-neutral-850 bg-neutral-100' : 'border-neutral-250 hover:border-neutral-400'} rounded-xl flex flex-col items-center justify-center p-12 transition-colors`}>
            {file ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-200">
                  <FileSpreadsheet className="h-8 w-8 text-neutral-800" />
                </div>
                <p className="text-lg font-bold text-neutral-900">{file.name}</p>
                <p className="text-sm text-neutral-505 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                
                {!isProcessing && status.type !== 'success' && (
                  <p className="text-xs text-neutral-800 font-extrabold mt-4 cursor-pointer hover:underline">Click to change file</p>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform border border-neutral-200">
                  <Upload className="h-8 w-8 text-neutral-500 group-hover:text-neutral-950 transition-colors" />
                </div>
                <p className="text-base font-medium text-neutral-700">Drag & Drop your CSV file here</p>
                <p className="mt-1 text-sm text-neutral-500">or click to browse</p>
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
              status.type === 'error' ? 'bg-rose-50 border border-rose-200 text-rose-800' : 
              status.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 
              'bg-neutral-50 border border-neutral-200 text-neutral-800'
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
              className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-black hover:bg-neutral-800 focus:outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isProcessing ? 'Processing Batch...' : 'Upload & Save to Vault'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
