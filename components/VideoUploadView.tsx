
import React, { useState, useRef } from 'react';
import { TranslationMode } from '../types';
import { LANGUAGES } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileVideo, Sparkles, CheckCircle, ArrowRight, Loader2, Info } from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface VideoUploadViewProps {
  onSuccess: () => void;
  sourceLang: string;
  setSourceLang: (lang: string) => void;
  targetLang: string;
  setTargetLang: (lang: string) => void;
}

export const VideoUploadView: React.FC<VideoUploadViewProps> = ({
  onSuccess, sourceLang, setSourceLang, targetLang, setTargetLang
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing...');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const startTranslation = async () => {
    if (!file) return;
    setIsUploading(true);
    setStatusText('Extracting audio & context...');
    
    // Simulate complex process
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 5;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(onSuccess, 800);
      }
      
      if (p > 20) setStatusText('Analyzing speaker intent...');
      if (p > 50) setStatusText(`Generating ${LANGUAGES.find(l => l.code === targetLang)?.name} dubs...`);
      if (p > 80) setStatusText('Finalizing metadata...');
      
      setProgress(p);
    }, 400);

    // Actual frame context extraction for better AI "understanding"
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        video.src = URL.createObjectURL(file);
        video.onloadeddata = async () => {
            video.currentTime = 1; // Seek to 1s
            setTimeout(async () => {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    ctx.drawImage(video, 0, 0);
                    const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
                    // Optional: Call Gemini to pre-analyze context
                    await geminiService.analyzeVideoFrame(base64, targetLang);
                }
            }, 500);
        };
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="px-4 md:px-20 lg:px-40 flex flex-1 justify-center py-12"
    >
      <div className="w-full max-w-[900px] flex flex-col gap-10">
        <header className="flex flex-col gap-4 text-center md:text-left">
          <h1 className="text-slate-900 dark:text-white text-5xl font-black leading-tight tracking-tight">
            Video Translation
          </h1>
          <p className="text-slate-500 dark:text-gray-400 text-lg">
            High-fidelity neural dubbing and subtitle generation for your multimedia assets.
          </p>
        </header>

        <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/5 p-8 lg:p-12 flex flex-col gap-10 relative overflow-hidden">
          <div className="flex flex-col">
            <label className="group relative flex flex-col items-center gap-8 rounded-[2rem] border-4 border-dashed border-slate-200 dark:border-white/10 hover:border-primary/50 dark:hover:border-primary/50 bg-slate-50 dark:bg-black/20 px-6 py-20 transition-all cursor-pointer">
              <input type="file" className="hidden" accept="video/*" onChange={handleFileChange} />
              
              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div 
                    key="file"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="size-20 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                      <CheckCircle size={48} />
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-black text-slate-900 dark:text-white truncate max-w-[300px]">{file.name}</p>
                      <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="upload"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-6"
                  >
                    <div className="size-20 rounded-[2rem] bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload size={40} />
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-slate-900 dark:text-white">Drop video here</p>
                      <p className="text-slate-500 dark:text-gray-400 font-medium mt-2">MP4, MOV, or WEBM (Max 500MB)</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button className="px-10 py-3 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-black text-sm hover:bg-slate-50 transition-colors shadow-sm">
                {file ? 'Replace File' : 'Browse Files'}
              </button>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Native Language</label>
              <div className="relative">
                <select 
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="w-full appearance-none rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white h-14 px-5 pr-12 focus:border-primary outline-none font-bold"
                >
                  <option value="auto">Auto-Detect</option>
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-primary ml-1">Target Language</label>
              <div className="relative">
                <select 
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full appearance-none rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-slate-900 dark:text-white h-14 px-5 pr-12 focus:border-primary outline-none font-bold"
                >
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={startTranslation}
              disabled={!file || isUploading}
              className={`relative flex w-full items-center justify-center overflow-hidden rounded-2xl h-16 ${!file || isUploading ? 'bg-slate-200 dark:bg-white/5 cursor-not-allowed text-slate-400' : 'bg-primary text-white shadow-2xl shadow-primary/30'} text-lg font-black transition-all`}
            >
              {isUploading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="animate-spin" size={24} />
                  Processing Video...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Sparkles size={24} />
                  Analyze & Translate
                  <ArrowRight size={20} />
                </div>
              )}
            </motion.button>
            
            {isUploading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3"
              >
                <div className="flex justify-between text-sm font-black uppercase tracking-widest text-slate-500">
                  <span className="flex items-center gap-2">
                    <Sparkles size={14} className="text-primary" />
                    {statusText}
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-black/40 overflow-hidden p-1 border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full"
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm text-slate-500 font-bold uppercase tracking-widest">
          <span className="flex items-center gap-2"><Info size={16} /> Neural Voice Engine</span>
          <span className="flex items-center gap-2"><Sparkles size={16} /> Gemini 3 Flash</span>
          <span className="flex items-center gap-2"><CheckCircle size={16} /> 4K Ready</span>
        </div>
      </div>
      
      {/* Hidden processing elements */}
      <video ref={videoRef} className="hidden" muted />
      <canvas ref={canvasRef} className="hidden" />
    </motion.div>
  );
};

// Re-using Lucide icons as local components since they are in import map
const ChevronRight = ({ className }: { className?: string }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: '20px' }}>expand_more</span>
);
