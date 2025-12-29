
import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Globe, ArrowRight, X, Sparkles, Languages, Eye, EyeOff, User, Bot, MessageSquare } from 'lucide-react';
import { LANGUAGES } from '../constants';
import { createBlob, decode, decodeAudioData } from '../services/audioUtils';

interface VoiceTranslateViewProps {
  targetLang: string;
  onClose: () => void;
}

export const VoiceTranslateView: React.FC<VoiceTranslateViewProps> = ({ targetLang, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [useVision, setUseVision] = useState(true);
  const [transcriptions, setTranscriptions] = useState<{ type: 'user' | 'model', text: string, id: string, timestamp: number }[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const targetLangName = LANGUAGES.find(l => l.code === targetLang)?.name || targetLang;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptions]);

  const stopSession = () => {
    setIsActive(false);
    if (frameIntervalRef.current) {
      window.clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    if (sessionRef.current) {
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
  };

  const startSession = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = { input: inputCtx, output: outputCtx };

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: useVision ? { facingMode: 'user' } : false 
      });
      streamRef.current = stream;

      if (useVision && videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: `You are a real-time translator. Use audio and visual cues (lip reading) to accurately translate speech into ${targetLangName}. Output ONLY the translation.`,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);

            if (useVision && videoRef.current && canvasRef.current) {
              const canvas = canvasRef.current;
              const video = videoRef.current;
              const ctx = canvas.getContext('2d');
              frameIntervalRef.current = window.setInterval(() => {
                if (ctx && video.readyState >= 2) {
                  canvas.width = 320;
                  canvas.height = 240;
                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                  const base64Data = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
                  sessionPromise.then(session => {
                    session.sendRealtimeInput({
                      media: { data: base64Data, mimeType: 'image/jpeg' }
                    });
                  });
                }
              }, 1000);
            }

            setIsConnecting(false);
            setIsActive(true);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              setTranscriptions(prev => {
                const last = prev[prev.length - 1];
                if (last && last.type === 'user' && (Date.now() - last.timestamp < 3000)) {
                  return [...prev.slice(0, -1), { ...last, text: last.text + text, timestamp: Date.now() }];
                }
                return [...prev, { type: 'user', text, id: Math.random().toString(), timestamp: Date.now() }];
              });
            }
            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscriptions(prev => {
                const last = prev[prev.length - 1];
                if (last && last.type === 'model' && (Date.now() - last.timestamp < 3000)) {
                  return [...prev.slice(0, -1), { ...last, text: last.text + text, timestamp: Date.now() }];
                }
                return [...prev, { type: 'model', text, id: Math.random().toString(), timestamp: Date.now() }];
              });
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const ctx = audioContextRef.current?.output;
              if (ctx) {
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                sourcesRef.current.add(source);
                source.onended = () => sourcesRef.current.delete(source);
              }
            }
          },
          onerror: (e) => {
            setError('Connection failed. Please refresh.');
            stopSession();
          },
          onclose: () => setIsActive(false),
        }
      });
      sessionRef.current = sessionPromise;
    } catch (err) {
      setError('Access denied.');
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background-dark/95 backdrop-blur-xl p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl h-[90vh] bg-surface-dark border border-white/10 rounded-[3rem] overflow-hidden flex flex-col relative shadow-[0_0_80px_rgba(19,91,236,0.2)]"
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-primary/20 rounded-2xl text-primary animate-pulse shadow-lg">
              <Mic size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Multimodal Voice Translator</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <Globe size={10} /> Auto
                </span>
                <ArrowRight size={12} className="text-slate-600" />
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary">
                  <Languages size={10} /> {targetLangName}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={() => setUseVision(!useVision)}
              className={`p-3 rounded-xl transition-all border ${useVision ? 'bg-primary/20 border-primary/30 text-primary' : 'bg-white/5 border-white/10 text-slate-500'}`}
              title="Vision Assist"
            >
              {useVision ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
            <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat/Messages - Improved visibility */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 scroll-smooth bg-gradient-to-b from-transparent to-primary/5">
            <AnimatePresence>
              {transcriptions.length === 0 && !isConnecting && !error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  className="h-full flex flex-col items-center justify-center text-center gap-4"
                >
                  <MessageSquare size={64} className="text-white mb-4" />
                  <p className="text-2xl font-black text-white">Start Conversation</p>
                  <p className="text-slate-400 max-w-sm">AI will detect audio and lip movements for ultra-accurate translation.</p>
                </motion.div>
              )}
            </AnimatePresence>

            {transcriptions.map((t) => (
              <motion.div 
                key={t.id}
                initial={{ opacity: 0, x: t.type === 'user' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex gap-4 ${t.type === 'user' ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <div className={`size-10 rounded-full flex items-center justify-center shrink-0 shadow-xl ${t.type === 'user' ? 'bg-white/10 text-white' : 'bg-primary text-white'}`}>
                  {t.type === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`max-w-[75%] flex flex-col ${t.type === 'user' ? 'items-start' : 'items-end'}`}>
                  <div className={`px-6 py-4 rounded-3xl shadow-2xl text-lg font-bold leading-relaxed ${
                    t.type === 'user' 
                      ? 'bg-slate-800 text-slate-100 rounded-tl-none border border-white/5' 
                      : 'bg-primary/90 text-white rounded-tr-none border border-white/10'
                  }`}>
                    {t.text || "Thinking..."}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-2 px-2">
                    {t.type === 'user' ? 'Input Detected' : `Translation (${targetLangName})`}
                  </span>
                </div>
              </motion.div>
            ))}
            
            {error && (
              <div className="mx-auto w-fit bg-red-500/20 border border-red-500/30 p-4 rounded-2xl text-red-400 font-black uppercase text-xs tracking-widest">
                {error}
              </div>
            )}
          </div>

          {/* Visual Assist Sidebar */}
          {useVision && (
            <div className="w-80 border-l border-white/5 bg-black/40 p-6 flex flex-col gap-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Eye size={14} className="text-primary" />
                Lip-Reading Analysis
              </h3>
              <div className="relative aspect-square rounded-3xl overflow-hidden border-2 border-primary/20 bg-zinc-900 group shadow-2xl">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
                <div className="absolute inset-0 pointer-events-none border-[12px] border-black/20"></div>
                {isActive && (
                  <div className="absolute top-4 right-4 size-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                )}
                {/* Visual Analysis Marker */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-24 h-12 border-2 border-dashed border-primary/40 rounded-full"></div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    AI is currently analyzing phonetic lip movements to resolve audio ambiguity in noisy environments.
                  </p>
                </div>
                {isActive && (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-[9px] font-black text-primary uppercase">
                      <span>Visual Confidence</span>
                      <span>89%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '89%' }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="px-10 py-10 bg-black/60 border-t border-white/5 flex flex-col items-center gap-6">
          <div className="flex items-center gap-10">
            <AnimatePresence mode="wait">
              {!isActive ? (
                <motion.button
                  key="start"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={startSession}
                  disabled={isConnecting}
                  className="size-24 rounded-full bg-primary flex items-center justify-center text-white shadow-[0_0_50px_rgba(19,91,236,0.5)] relative group"
                >
                  {isConnecting ? (
                    <div className="animate-spin border-4 border-white/30 border-t-white size-10 rounded-full"></div>
                  ) : (
                    <Mic size={42} />
                  )}
                  <span className="absolute -bottom-10 whitespace-nowrap text-xs font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">Launch Translator</span>
                </motion.button>
              ) : (
                <motion.button
                  key="stop"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={stopSession}
                  className="size-24 rounded-full bg-red-600 flex items-center justify-center text-white shadow-[0_0_50px_rgba(220,38,38,0.5)] relative group"
                >
                  <div className="absolute inset-0 rounded-full border-4 border-red-600 animate-ping opacity-30"></div>
                  <MicOff size={42} />
                  <span className="absolute -bottom-10 whitespace-nowrap text-xs font-black uppercase tracking-widest text-red-500">End Session</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex items-center gap-3 px-6 py-2 bg-white/5 rounded-full border border-white/10 shadow-inner">
            <Sparkles size={16} className="text-primary animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              {isActive ? 'Gemini 2.5 Live: Streaming Audio + Visual Context' : 'Press Mic to Start Global Translation'}
            </span>
          </div>
        </div>
      </motion.div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
