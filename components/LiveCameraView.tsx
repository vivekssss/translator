
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { TranslationLogEntry, OCRResult } from '../types';
import { geminiService } from '../services/geminiService';
import { LANGUAGES } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Languages, X, Play, Pause, History, Download, Trash2, Zap } from 'lucide-react';

interface LiveCameraViewProps {
  sourceLang: string;
  targetLang: string;
  onClose: () => void;
}

export const LiveCameraView: React.FC<LiveCameraViewProps> = ({ sourceLang, targetLang, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [log, setLog] = useState<TranslationLogEntry[]>([]);
  const [currentResult, setCurrentResult] = useState<OCRResult | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [lipReadingMode, setLipReadingMode] = useState(false);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' },
          audio: false 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    }
    setupCamera();
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const captureAndTranslate = useCallback(async () => {
    if (isPaused || isTranslating || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    setIsTranslating(true);
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const base64Image = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
    
    // Multi-modal processing if lipReadingMode is on
    const result = await geminiService.translateImage(base64Image, sourceLang, targetLang);
    
    if (result && result.originalText && result.originalText !== currentResult?.originalText) {
      setCurrentResult(result);
      setLog(prev => [{
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        originalText: result.originalText,
        translatedText: result.translatedText,
        sourceLang,
        targetLang
      }, ...prev].slice(0, 50));
    }
    
    setIsTranslating(false);
  }, [isPaused, isTranslating, sourceLang, targetLang, currentResult, lipReadingMode]);

  useEffect(() => {
    const interval = setInterval(captureAndTranslate, 3000);
    return () => clearInterval(interval);
  }, [captureAndTranslate]);

  return (
    <div className="flex-1 flex overflow-hidden relative bg-black h-[calc(100vh-72px)] font-display">
      <div className="flex-1 flex flex-col relative bg-black">
        {/* Indicators */}
        <div className="absolute top-6 left-6 z-20 flex flex-col gap-3">
          <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
            <span className="text-white text-[10px] font-black uppercase tracking-widest">Live Multi-Modal Stream</span>
          </div>
          {lipReadingMode && (
             <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 bg-primary/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10"
            >
              <Zap size={14} className="text-white animate-bounce" />
              <span className="text-white text-[9px] font-black uppercase tracking-widest">Visual Lip Analysis On</span>
            </motion.div>
          )}
        </div>

        <div className="relative w-full h-full flex items-center justify-center bg-zinc-900 overflow-hidden group">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scanning Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 w-24 h-24 border-l-4 border-t-4 border-white/40 rounded-tl-[2rem]"></div>
            <div className="absolute top-10 right-10 w-24 h-24 border-r-4 border-t-4 border-white/40 rounded-tr-[2rem]"></div>
            <div className="absolute bottom-40 left-10 w-24 h-24 border-l-4 border-b-4 border-white/40 rounded-bl-[2rem]"></div>
            <div className="absolute bottom-40 right-10 w-24 h-24 border-r-4 border-b-4 border-white/40 rounded-br-[2rem]"></div>
            {isTranslating && (
              <motion.div 
                initial={{ top: '10%' }}
                animate={{ top: '80%' }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent blur-[2px]"
              />
            )}
          </div>

          <AnimatePresence>
            {currentResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none p-10"
              >
                <div className="flex flex-col md:flex-row items-stretch gap-8 max-w-6xl w-full">
                  <div className="flex-1 pointer-events-auto">
                    <div className="bg-black/40 backdrop-blur-xl p-3 rounded-2xl border border-white/20 mb-3 inline-flex items-center gap-2">
                      <Zap size={14} className="text-slate-400" />
                      <span className="text-white text-[10px] font-black uppercase tracking-widest">Source Context</span>
                    </div>
                    <div className="bg-black/60 backdrop-blur-2xl p-8 rounded-[2.5rem] border-l-8 border-primary shadow-2xl">
                      <h3 className="text-white text-3xl font-black leading-tight">{currentResult.originalText}</h3>
                      {currentResult.pronunciation && (
                        <p className="text-primary/70 text-sm font-bold uppercase tracking-widest mt-3">Phonetic: {currentResult.pronunciation}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 pointer-events-auto flex flex-col justify-end md:justify-start">
                    <div className="bg-primary backdrop-blur-xl p-3 rounded-2xl border border-white/20 mb-3 inline-flex items-center gap-2 self-start md:self-end">
                      <Languages size={14} className="text-white" />
                      <span className="text-white text-[10px] font-black uppercase tracking-widest">{targetLang} Translation</span>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_40px_100px_rgba(19,91,236,0.4)] border border-white/10 group-hover:scale-[1.03] transition-transform duration-500">
                      <h3 className="text-slate-900 text-3xl font-black leading-tight">{currentResult.translatedText}</h3>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Controls */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-5xl px-6 z-30">
          <div className="bg-surface-dark/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-5 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-1 min-w-[320px]">
              <div className="relative flex-1 group">
                <div className="w-full text-white font-black uppercase tracking-widest py-4 px-6 rounded-2xl bg-white/5 border border-white/5 group-hover:border-white/20 transition-all text-xs">
                  {sourceLang === 'auto' ? 'AI Detection...' : LANGUAGES.find(l => l.code === sourceLang)?.name}
                </div>
                <label className="absolute -top-2 left-4 bg-surface-dark px-2 text-[8px] text-slate-500 uppercase font-black tracking-widest">Input</label>
              </div>
              <div className="size-10 rounded-full flex items-center justify-center text-slate-500">
                <Languages size={20} />
              </div>
              <div className="relative flex-1 group">
                <div className="w-full text-primary font-black uppercase tracking-widest py-4 px-6 rounded-2xl bg-primary/10 border border-primary/20 group-hover:border-primary transition-all text-xs">
                  {LANGUAGES.find(l => l.code === targetLang)?.name}
                </div>
                <label className="absolute -top-2 left-4 bg-surface-dark px-2 text-[8px] text-primary uppercase font-black tracking-widest">Target</label>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => setLipReadingMode(!lipReadingMode)}
                className={`size-14 rounded-2xl flex items-center justify-center transition-all ${lipReadingMode ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                title="Lip-Reading Mode"
              >
                <Eye size={24} />
              </button>
              <button 
                onClick={() => setIsPaused(!isPaused)}
                className={`h-14 px-8 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 transition-all ${isPaused ? 'bg-green-600 text-white shadow-lg shadow-green-600/30' : 'bg-primary text-white shadow-lg shadow-primary/30 active:scale-95'}`}
              >
                {isPaused ? <Play size={20} /> : <Pause size={20} />}
                <span>{isPaused ? 'Resume' : 'Freeze'}</span>
              </button>
              <button onClick={onClose} className="size-14 rounded-2xl bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
                <X size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Sidebar Log */}
      <aside className="hidden lg:flex w-96 bg-background-dark border-l border-white/5 flex-col z-10">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History size={20} className="text-primary" />
            <h3 className="font-black uppercase tracking-widest text-xs text-white">Capture Log</h3>
          </div>
          <button onClick={() => setLog([])} className="p-2 text-slate-500 hover:text-red-500 transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {log.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4 opacity-30">
                <Zap size={48} />
                <p className="text-[10px] font-black uppercase tracking-widest text-center">No translations detected<br/>Scan some text</p>
              </div>
            )}
            {log.map(entry => (
              <motion.div 
                key={entry.id} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="group relative p-5 bg-white/5 rounded-3xl border border-white/5 hover:border-primary/30 transition-all"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-slate-500 uppercase">{entry.timestamp}</span>
                  <div className="flex gap-2">
                    <button onClick={() => navigator.clipboard.writeText(entry.translatedText)} className="text-slate-500 hover:text-primary transition-colors">
                      <Download size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-slate-400 text-xs font-medium mb-2 line-clamp-2 italic">"{entry.originalText}"</p>
                <p className="text-white text-sm font-black leading-snug">{entry.translatedText}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </aside>
    </div>
  );
};
