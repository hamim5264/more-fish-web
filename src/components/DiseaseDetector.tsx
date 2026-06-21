// H:\DMA Hamim\DMA-Web-App\src\components\DiseaseDetector.tsx
import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { api, STORAGE_KEYS } from '../services/api.ts';
import { diseasesCatalog } from '../data/guides';
import type { AquacultureFlow } from '../types/aquaculture';
import { 
  Upload, ShieldAlert, BookOpen, AlertCircle, RefreshCw, 
  Camera, Search, Activity
} from 'lucide-react';

interface DiseaseDetectorProps {
  defaultTab?: 'scanner' | 'guide';
  flow?: AquacultureFlow;
}

export const DiseaseDetector: React.FC<DiseaseDetectorProps> = (props) => {
  const flow = props.flow ?? 'fish';
  const { tokens } = useAuth();
  const { t } = useLang();
  
  const [activeTab, setActiveTab] = useState<'scanner' | 'guide'>(props.defaultTab || 'scanner');

  React.useEffect(() => {
    if (props.defaultTab) {
      setActiveTab(props.defaultTab);
    }
  }, [props.defaultTab]);
  
  // Scanner States
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Guide Search
  const [searchQuery, setSearchQuery] = useState('');

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setError(null);
    setScanResult(null);
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG).');
      return;
    }
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleScan = async () => {
    if (!selectedImage) {
      setError('Please select an image first.');
      return;
    }
    if (!tokens[flow] && !localStorage.getItem(flow === 'pharma' ? STORAGE_KEYS.PHARMA_TOKEN : STORAGE_KEYS.MORE_FISH_TOKEN)) {
      setError('You are not logged in.');
      return;
    }

    setScanning(true);
    setError(null);
    setScanResult(null);
    try {
      const res = await api.detectFishDisease(selectedImage, flow);
      const payload = res?.data ?? res ?? {};

      const diseaseName = payload?.data?.disease || payload?.disease || payload?.data?.disease_name || payload?.disease_name || payload?.result?.disease || null;
      let confidenceRaw = payload?.data?.confidence_percent ?? payload?.data?.confidence ?? payload?.confidence ?? payload?.result?.confidence ?? null;
      let confidence = null;
      if (typeof confidenceRaw === 'number') {
        confidence = confidenceRaw > 1 ? Number(confidenceRaw) : Number((confidenceRaw * 100).toFixed(2));
      } else if (typeof confidenceRaw === 'string') {
        const parsed = parseFloat(confidenceRaw);
        if (!Number.isNaN(parsed)) confidence = parsed > 1 ? parsed : Number((parsed * 100).toFixed(2));
      }

      const apiSymptoms = payload?.data?.symptoms || payload?.symptoms || payload?.data?.symptom_list || null;
      const apiTreatment = payload?.data?.treatment || payload?.treatment || payload?.data?.advice || null;

      // Map to local catalog if possible
      const guideMatch = diseasesCatalog.find(d => diseaseName && (
        d.name.toLowerCase().includes(String(diseaseName).toLowerCase()) ||
        String(diseaseName).toLowerCase().includes(d.name.toLowerCase())
      ));
      
      const treatmentText = guideMatch ? guideMatch.treatment : apiTreatment || null;
      const diseaseDisplayName = guideMatch ? guideMatch.name : (diseaseName || 'Unknown Pathogen');

      const result = {
        disease: diseaseDisplayName,
        confidence: confidence ?? null,
        symptoms: Array.isArray(apiSymptoms) ? apiSymptoms : (guideMatch ? guideMatch.symptoms : undefined),
        treatment: treatmentText,
        guideId: guideMatch ? guideMatch.id : null,
      };

      setScanResult(result);
    } catch (err: any) {
      console.error('[DiseaseDetector] Detect request failed', err);
      const msg = String(err?.message || err || 'Request failed. Please try again later.');
      if (msg.toLowerCase().includes('401') || msg.toLowerCase().includes('unauthor') || msg.toLowerCase().includes('not logged')) {
        setError('You are not logged in.');
      } else {
        setError('Request failed. Please try again later.');
      }
    } finally {
      setScanning(false);
    }
  };

  const resetScanner = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setScanResult(null);
    setError(null);
  };

  const filteredGuide = diseasesCatalog.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.bengaliName.includes(searchQuery) ||
    d.symptoms.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!tokens[flow]) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-linear-to-tr from-bg-light to-cyan-50">
        <ShieldAlert className="w-16 h-16 text-cyan-400 mb-4 animate-pulse" />
        <h3 className="text-xl font-bold text-font-dark">{t('please_login')}</h3>
        <p className="text-sm text-font-light max-w-sm mt-2">Authentication is required to upload fish pictures to the diagnostic AI network.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none max-w-7xl mx-auto w-full">
      {/* Tabs selector */}
      <div className="flex border-b border-cyan-100/60 pb-px">
        <button
          onClick={() => setActiveTab('scanner')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold cursor-pointer transition-all ${
            activeTab === 'scanner' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-font-light hover:text-primary'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>AI Disease Scanner</span>
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-bold cursor-pointer transition-all ${
            activeTab === 'guide' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-font-light hover:text-primary'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Disease Treatment Guide</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-semibold text-sm">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* SCANNER VIEW */}
      {activeTab === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Upload / Image Box */}
          <div className="bg-white/80 border border-cyan-100/40 p-6 rounded-3xl shadow-sm flex flex-col justify-between min-h-[360px]">
            {!imagePreview ? (
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 border-2 border-dashed border-cyan-200 hover:border-primary rounded-2xl flex flex-col items-center justify-center p-8 text-center cursor-pointer bg-cyan-50/20 hover:bg-cyan-50/40 transition-all"
              >
                <Upload className="w-12 h-12 text-primary/40 mb-3" />
                <span className="text-sm font-bold text-font-dark">Drag & Drop fish image here</span>
                <span className="text-xs text-font-light font-medium mt-1">Supports PNG, JPG, JPEG (Max 5MB)</span>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={cameraInputRef}
                  onChange={handleCameraChange}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                    disabled={scanning}
                    className="px-4 py-2 rounded-2xl bg-white border border-cyan-100 text-sm font-bold text-primary hover:bg-cyan-50 disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4 inline-block mr-2" />{t('camera')}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    disabled={scanning}
                    className="px-4 py-2 rounded-2xl bg-white border border-cyan-100 text-sm font-bold text-primary hover:bg-cyan-50 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4 inline-block mr-2" />{t('gallery')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-4 relative bg-cyan-50/10 rounded-2xl border border-cyan-100/20">
                <img
                  src={imagePreview}
                  alt="Fish scan preview"
                  className="max-h-60 rounded-xl object-contain shadow-md"
                />
                {!scanning && !scanResult && (
                  <button
                    onClick={resetScanner}
                    className="absolute top-4 right-4 bg-white/95 text-red-500 p-2 rounded-full shadow border border-red-50 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {imagePreview && (
              <div className="flex gap-4 mt-6">
                {!scanResult && (
                  <button
                    onClick={handleScan}
                    disabled={scanning}
                    className="flex-1 py-3.5 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white font-bold rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {scanning ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Diagnosing pathogen...</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-5 h-5" />
                        <span>Detect Disease</span>
                      </>
                    )}
                  </button>
                )}

                {scanResult && (
                  <button
                    onClick={resetScanner}
                    className="flex-1 py-3.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-font-dark font-bold rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Scan Another Image</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* AI Result Card */}
          <div className="bg-white/80 border border-cyan-100/40 p-6 rounded-3xl shadow-sm min-h-[360px] flex flex-col justify-center">
            {scanning && (
              <div className="text-center py-12 space-y-4">
                <Activity className="w-12 h-12 text-primary animate-bounce mx-auto" />
                <h4 className="font-bold text-font-dark animate-pulse">Running AI Image Inference</h4>
                <p className="text-xs text-font-light max-w-xs mx-auto">Analyzing skin texture, scales discoloration, and fin shapes for infections...</p>
              </div>
            )}

            {!scanning && !scanResult && (
              <div className="text-center py-12 space-y-3">
                <ShieldAlert className="w-12 h-12 text-cyan-200 mx-auto" />
                <h4 className="font-bold text-font-dark">No Active Diagnosis</h4>
                <p className="text-xs text-font-light max-w-xs mx-auto font-medium">Upload a clear photo of the diseased fish and click scan to query the diagnostic node.</p>
              </div>
            )}

            {!scanning && scanResult && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
                <div className="flex items-center justify-between border-b border-cyan-50 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">AI MATCH DETECTED</span>
                    <h3 className="text-lg font-black text-font-dark mt-1">{scanResult.disease}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-font-light font-bold">CONFIDENCE</span>
                    <h3 className="text-lg font-black text-primary">{scanResult.confidence !== null && scanResult.confidence !== undefined ? `${Number(scanResult.confidence).toFixed(1)}%` : '—'}</h3>
                  </div>
                </div>

                {scanResult.symptoms && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-font-dark uppercase tracking-wide">Key Symptoms Analyzed</span>
                    <ul className="space-y-1">
                      {scanResult.symptoms.map((sym: string, i: number) => (
                        <li key={i} className="text-xs text-font-light font-semibold flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                          {sym}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-xs font-bold text-font-dark uppercase tracking-wide">Recommended Treatment & Medicine</span>
                  <div className="p-4 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl text-xs text-emerald-800 leading-normal font-medium">
                    {scanResult.treatment}
                  </div>
                </div>

                {/* Link to Guide */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSearchQuery(scanResult.disease === 'Unknown Pathogen' ? '' : scanResult.disease);
                      setActiveTab('guide');
                    }}
                    className="w-full py-3 bg-cyan-50 hover:bg-cyan-100 text-primary font-bold text-xs rounded-2xl border border-cyan-100 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>View Treatment Guide Details</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GUIDE VIEW */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search diseases, symptoms, or remedies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/80 border border-cyan-100/80 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
            />
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-cyan-500" />
          </div>

          {/* List items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGuide.map((item, idx) => (
              <div key={idx} className="bg-white/80 border border-cyan-100/30 p-6 rounded-3xl shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="border-b border-cyan-50 pb-3 flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-base text-font-dark">{item.name}</h4>
                    <span className="text-xs font-bold text-primary">{item.bengaliName}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-cyan-100/50 text-primary px-2 py-0.5 rounded uppercase tracking-wider">
                    {item.category.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-font-light uppercase tracking-wide">Symptoms</span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.symptoms.map((s, i) => (
                      <span key={i} className="text-[10px] bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded font-bold">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-font-light uppercase tracking-wide">Cure Guideline</span>
                  <p className="text-xs text-font-dark font-medium leading-relaxed bg-cyan-50/30 p-3 rounded-xl border border-cyan-50">{item.treatment}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-font-light uppercase tracking-wide">Preventive Measures</span>
                  <p className="text-xs text-font-light font-medium leading-relaxed">{item.preventive}</p>
                </div>
              </div>
            ))}
            
            {filteredGuide.length === 0 && (
              <div className="col-span-2 text-center py-12 text-font-light font-semibold">
                No diseases found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
