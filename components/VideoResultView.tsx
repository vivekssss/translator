
import React, { useState } from 'react';
import { LANGUAGES } from '../constants';
import { Play, Share2, Download, Languages as LangIcon, CheckCircle, Volume2, Globe, Eye, Zap, Info } from 'lucide-react';
// Import AnimatePresence along with motion
import { motion, AnimatePresence } from 'framer-motion';

interface VideoResultViewProps {
  sourceLang: string;
  targetLang: string;
}

export const VideoResultView: React.FC<VideoResultViewProps> = ({ sourceLang, targetLang }) => {
  const [isDubbed, setIsDubbed] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(true);

  const TRANSCRIPT = [
    { time: '00:05', text: 'The technology we are discussing today has the potential to revolutionize how we communicate globally.' },
    { time: '00:12', text: 'Specifically, real-time video translation removes the language barrier in a way that text simply cannot.', active: true },
    { time: '00:18', text: 'Imagine having a video conference where everyone speaks their native tongue, yet understands each other perfectly.' },
    { time: '00:25', text: 'This is not science fiction anymore. It is happening right here, right now, with our latest update.' },
    { time: '00:32', text: 'Let\'s look at the architecture behind this system. It involves three key neural networks working in tandem.' },
  ];

  return (
    <main className="flex-1 w-full max-w-screen-2xl mx-auto p-6 sm:p-10 grid grid-cols-1 xl:grid-cols-12 gap-10 font-display">
      <section className="xl:col-span-8 flex flex-col gap-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3">
          <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Multimedia</span>
          <span className="text-slate-600">/</span>
          <span className="text-primary text-[10px] font-black uppercase tracking-widest">Translation Finished</span>
        </div>

        {/* Title and Meta */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-3">
            <h1 className="text-white text-4xl font-black tracking-tight">Meeting_Recording_AI_Translated.mp4</h1>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                <Globe size={14} className="text-slate-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{LANGUAGES.find(l => l.code === sourceLang)?.name || 'Auto'}</span>
              </div>
              <div className="text-slate-600"><LangIcon size={14} /></div>
              <div className="flex items-center gap-2 bg-primary/20 px-3 py-1.5 rounded-xl border border-primary/20">
                <LangIcon size={14} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">{LANGUAGES.find(l => l.code === targetLang)?.name}</span>
              </div>
              <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1.5 rounded-xl border border-green-500/20 text-green-500">
                <CheckCircle size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">AI Dubbed</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 h-12 px-6 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all border border-white/10">
              <Share2 size={18} /> Share
            </button>
            <button className="flex items-center gap-2 h-12 px-8 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-primary/30">
              <Download size={18} /> Download
            </button>
          </div>
        </div>

        {/* Player Area */}
        <div className="flex flex-col gap-6">
          <div className="relative w-full aspect-video bg-black rounded-[3rem] overflow-hidden group shadow-[0_40px_100px_rgba(0,0,0,0.6)] border border-white/10">
            <div className="absolute inset-0 bg-cover bg-center opacity-70" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1200")' }}></div>
            <div className="absolute inset-0 flex items-center justify-center z-10 group-hover:bg-black/20 transition-all">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex items-center justify-center rounded-full size-24 bg-primary text-white shadow-2xl shadow-primary/40 relative"
              >
                <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20"></div>
                <Play size={48} className="ml-1 fill-white" />
              </motion.button>
            </div>

            {/* Subtitles Overlay */}
            <div className="absolute bottom-24 left-0 right-0 flex justify-center z-20 px-10">
              <div className="bg-black/60 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/10 text-center">
                <p className="text-white text-xl font-bold italic leading-snug">
                  "Specifically, real-time video translation removes the language barrier..."
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent pt-24 pb-8 px-10 flex flex-col gap-5">
              <div className="relative w-full h-2 bg-white/10 rounded-full cursor-pointer overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-[35%] bg-primary shadow-[0_0_10px_rgba(19,91,236,1)]"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <Play size={24} className="text-white cursor-pointer hover:text-primary transition-colors" />
                  <Volume2 size={24} className="text-white cursor-pointer hover:text-primary transition-colors" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">00:12 / 01:45</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-black/60 backdrop-blur-xl p-1 rounded-2xl border border-white/10 flex items-center">
                    <button 
                      onClick={() => setIsDubbed(false)}
                      className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${!isDubbed ? 'bg-primary text-white' : 'text-slate-500 hover:text-white'}`}
                    >
                      Original
                    </button>
                    <button 
                      onClick={() => setIsDubbed(true)}
                      className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${isDubbed ? 'bg-primary text-white' : 'text-slate-500 hover:text-white'}`}
                    >
                      Dubbed
                    </button>
                  </div>
                  <button className="text-white p-2 hover:bg-white/10 rounded-xl transition-all"><Zap size={20}/></button>
                </div>
              </div>
            </div>
          </div>

          {/* Lip Reading Tracks */}
          <div className="p-8 bg-surface-dark/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye size={20} className="text-primary" />
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Multimodal Sync Analysis</h3>
              </div>
              <button 
                onClick={() => setShowAnalysis(!showAnalysis)}
                className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors"
              >
                {showAnalysis ? 'Collapse Tracks' : 'Expand Tracks'}
              </button>
            </div>

            {/* AnimatePresence for content transitions */}
            <AnimatePresence>
              {showAnalysis && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-6 overflow-hidden"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-500 px-1">
                      <span>Lip-Sync Phonetic Track</span>
                      <span className="text-green-500">Locked 99.4%</span>
                    </div>
                    <div className="h-6 w-full bg-white/5 rounded-lg flex items-center px-1 gap-1">
                      {[...Array(40)].map((_, i) => (
                        <div key={i} className="h-4 flex-1 bg-primary/20 rounded-sm overflow-hidden">
                          <motion.div 
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.random() * 100}%` }}
                            className="bg-primary/60 h-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-500 px-1">
                      <span>Visual Scene Context</span>
                      <span className="text-primary">Office Environment Detected</span>
                    </div>
                    <div className="h-6 w-full bg-white/5 rounded-lg flex items-center px-1 gap-1">
                       {[...Array(20)].map((_, i) => (
                        <div key={i} className={`h-4 flex-1 rounded-sm ${i % 5 === 0 ? 'bg-primary/40' : 'bg-white/10'}`} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Sidebar - Transcript and Queue */}
      <aside className="xl:col-span-4 flex flex-col gap-10">
        <div className="bg-surface-dark/60 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] flex flex-col flex-1 overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/20">
            <h3 className="text-white font-black uppercase tracking-widest text-xs">Full Transcript</h3>
            <button className="p-2 text-primary hover:bg-primary/10 rounded-xl transition-all">
              <Download size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {TRANSCRIPT.map((item, i) => (
              <div 
                key={i} 
                className={`p-6 rounded-3xl cursor-pointer transition-all border ${item.active ? 'bg-primary text-white border-primary shadow-2xl shadow-primary/20 scale-[1.02]' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${item.active ? 'text-white/70' : 'text-slate-500'}`}>{item.time}</span>
                  {item.active && <Zap size={12} className="text-white animate-pulse" />}
                </div>
                <p className={`text-sm font-bold leading-relaxed`}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">Processing Queue</h3>
          <div className="bg-white/5 rounded-[2rem] p-6 border border-white/5 flex items-center gap-5 opacity-40">
            <div className="size-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
               <Info size={20} />
            </div>
            <div className="flex-1">
              <p className="text-white text-xs font-black tracking-tight truncate">Demo_Final_Render.mp4</p>
              <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-[10%] bg-slate-700"></div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
};
