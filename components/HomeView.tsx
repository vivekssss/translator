
import React from 'react';
import { LANGUAGES, MOCK_ACTIVITY } from '../constants';
import { TranslationMode } from '../types';
import { motion } from 'framer-motion';
import { Camera, Upload, Mic, History, ArrowRightLeft, Sparkles, Globe2, ChevronRight, MoreVertical, Languages } from 'lucide-react';

interface HomeViewProps {
  onSelectMode: (mode: TranslationMode) => void;
  sourceLang: string;
  setSourceLang: (lang: string) => void;
  targetLang: string;
  setTargetLang: (lang: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ 
  onSelectMode, sourceLang, setSourceLang, targetLang, setTargetLang 
}) => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
      className="flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 hero-gradient"
    >
      <div className="w-full max-w-[1200px] flex flex-col gap-10">
        <header className="flex flex-col gap-4 text-center md:text-left">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest w-fit self-center md:self-start">
            <Sparkles size={14} />
            AI-Powered Intelligence
          </motion.div>
          <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
            Translate the world <br className="hidden md:block" />
            <span className="text-primary">in real-time.</span>
          </motion.h1>
          <motion.p variants={itemVariants} className="text-slate-500 dark:text-gray-400 text-lg max-w-2xl">
            Break language barriers instantly with high-fidelity camera OCR, voice translation, and intelligent video dubbing.
          </motion.p>
        </header>

        {/* Language Selector Glass Card */}
        <motion.div 
          variants={itemVariants}
          className="w-full glass dark:bg-surface-dark/40 rounded-3xl p-6 shadow-2xl border border-white/10"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 w-full group">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1">
                <Globe2 size={12} />
                Translate from
              </label>
              <div className="relative">
                <select 
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="w-full appearance-none bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-base rounded-2xl py-4 px-5 pr-12 focus:ring-2 focus:ring-primary/50 outline-none cursor-pointer transition-all hover:bg-white dark:hover:bg-black/30 font-semibold"
                >
                  <option value="auto">Auto-Detect Language</option>
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <motion.button 
              whileHover={{ rotate: 180 }}
              transition={{ type: "spring", stiffness: 200 }}
              onClick={() => {
                const temp = sourceLang;
                setSourceLang(targetLang);
                setTargetLang(temp === 'auto' ? 'en' : temp);
              }}
              className="mt-6 p-4 rounded-full bg-primary shadow-lg shadow-primary/30 text-white hover:scale-110 transition-transform"
            >
              <ArrowRightLeft size={24} />
            </motion.button>

            <div className="flex-1 w-full group">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary mb-3 ml-1">
                <Sparkles size={12} />
                Translate to
              </label>
              <div className="relative">
                <select 
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full appearance-none bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white text-base rounded-2xl py-4 px-5 pr-12 focus:ring-2 focus:ring-primary/50 outline-none cursor-pointer transition-all hover:bg-white dark:hover:bg-black/30 font-semibold"
                >
                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -8 }}
            onClick={() => onSelectMode(TranslationMode.LIVE_CAMERA)}
            className="group cursor-pointer relative flex flex-col glass rounded-[2.5rem] overflow-hidden shadow-xl border border-white/5 hover:border-primary/40 transition-all duration-500"
          >
            <div className="h-48 w-full bg-cover bg-center relative" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800")' }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="p-3 bg-primary rounded-2xl text-white shadow-2xl">
                  <Camera size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Live Camera</h3>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                Overlay translations on objects. Perfect for menus and signs.
              </p>
              <button className="w-full flex items-center justify-center gap-2 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-lg group-hover:scale-[1.02]">
                Open Camera
              </button>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -8 }}
            onClick={() => onSelectMode(TranslationMode.VOICE_TRANSLATE)}
            className="group cursor-pointer relative flex flex-col glass rounded-[2.5rem] overflow-hidden shadow-xl border border-white/5 hover:border-orange-400/40 transition-all duration-500"
          >
            <div className="h-48 w-full bg-cover bg-center relative" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1551029170-19130833b434?auto=format&fit=crop&q=80&w=800")' }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="p-3 bg-orange-500 rounded-2xl text-white shadow-2xl">
                  <Mic size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Live Voice</h3>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                Real-time conversation with automatic language detection.
              </p>
              <button className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-all shadow-lg group-hover:scale-[1.02]">
                Start Voice
              </button>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -8 }}
            onClick={() => onSelectMode(TranslationMode.VIDEO_UPLOAD)}
            className="group cursor-pointer relative flex flex-col glass rounded-[2.5rem] overflow-hidden shadow-xl border border-white/5 hover:border-blue-400/40 transition-all duration-500"
          >
            <div className="h-48 w-full bg-cover bg-center relative" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1574717024453-354056afd6ec?auto=format&fit=crop&q=80&w=800")' }}>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 flex items-center gap-3">
                <div className="p-3 bg-blue-500 rounded-2xl text-white shadow-2xl">
                  <Upload size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Video Gallery</h3>
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                Upload videos for AI dubbing and synchronized subtitles.
              </p>
              <button className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-slate-900 dark:text-white border border-white/10 rounded-xl font-bold transition-all group-hover:scale-[1.02]">
                Select Video
              </button>
            </div>
          </motion.div>
        </div>

        {/* Activity Section */}
        <motion.div variants={itemVariants} className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <History size={24} className="text-primary" />
              Recent Activity
            </h3>
            <button className="text-sm font-bold text-primary hover:underline">View History</button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {MOCK_ACTIVITY.map((activity, idx) => (
              <motion.div 
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group flex items-center justify-between p-5 glass rounded-3xl border border-white/5 hover:bg-white/5 dark:hover:bg-white/5 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-5">
                  <div className={`size-14 rounded-2xl flex items-center justify-center shadow-inner ${
                    activity.type === 'live' ? 'bg-blue-500/10 text-blue-500' :
                    activity.type === 'video' ? 'bg-purple-500/10 text-purple-500' :
                    'bg-orange-500/10 text-orange-500'
                  }`}>
                    {activity.type === 'live' ? <Camera size={24} /> : activity.type === 'video' ? <Sparkles size={24} /> : <Mic size={24} />}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{activity.title}</p>
                    <p className="text-sm text-slate-500 dark:text-gray-400 font-medium">
                      {activity.timestamp} • {activity.sourceLang} → {activity.targetLang}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`hidden sm:inline-flex px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    activity.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 
                    activity.status === 'Processing' ? 'bg-amber-500/10 text-amber-500 animate-pulse' : 
                    'bg-slate-500/10 text-slate-400'
                  }`}>
                    {activity.status}
                  </span>
                  <button className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
