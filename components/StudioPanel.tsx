
import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic2, 
  Video, 
  Network, 
  BarChart3, 
  CreditCard, 
  HelpCircle, 
  Layout, 
  FileText, 
  Pencil, 
  MoreVertical,
  Layers,
  ChevronLeft,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Brain,
  Sparkles,
  Play,
  Loader2,
  AlertCircle,
  ExternalLink,
  Download,
  RotateCcw,
  Image as ImageIcon,
  Maximize2,
  ChevronRight as ChevronRightIcon,
  Presentation,
  X,
  Volume2,
  Pause,
  Waves,
  Monitor,
  Wand2,
  Gamepad2,
  Trophy,
  Target,
  Sword,
  Info,
  Scale,
  FlaskConical,
  Beaker,
  Move,
  Eye,
  Settings2,
  Activity
} from 'lucide-react';
import { Dimension } from '../types';
import { geminiService, QuizQuestion, Flashcard, Slide, GameScenario } from '../services/geminiService';
import { GoogleGenAI } from "@google/genai";

interface StudioPanelProps {
  currentDimension?: Dimension;
}

interface PhysicsObject {
  id: string;
  name: string;
  density: number; // g/cm3
  color: string;
  shape: 'rect' | 'circle';
  mass: number; // g
  volume: number; // cm3
}

const StudioPanel: React.FC<StudioPanelProps> = ({ currentDimension = Dimension.WHAT }) => {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);

  // Flashcards state
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flippedCards, setFlippedCards] = useState<boolean[]>([]);

  // Infographic state
  const [infographicUrl, setInfographicUrl] = useState<string | null>(null);
  const [isInfographicFull, setIsInfographicFull] = useState(false);

  // Slides state
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [isSlidesFull, setIsSlidesFull] = useState(false);
  const [slideImages, setSlideImages] = useState<Record<number, string>>({});
  const [generatingIndices, setGeneratingIndices] = useState<Set<number>>(new Set());

  // Game state
  const [gameScenario, setGameScenario] = useState<GameScenario | null>(null);
  const [selectedObject, setSelectedObject] = useState<PhysicsObject | null>(null);
  const [isSubmerged, setIsSubmerged] = useState(false);
  const [simulationY, setSimulationY] = useState(0); // 0: tank top, 100: bottom
  const [isGameFull, setIsGameFull] = useState(false);

  // Audio state
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Video generation states
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoError, setVideoError] = useState<string | null>(null);
  const [generationStep, setGenerationStep] = useState<'idle' | 'auth' | 'generating' | 'completed'>('idle');

  const history = [
    { title: '浮力成因深度解析', sources: 3, time: '2小时前', icon: FileText, iconColor: 'text-indigo-500' },
    { title: '阿基米德原理随堂测', sources: 1, time: '昨天', icon: HelpCircle, iconColor: 'text-sky-500' },
    { title: '物体的浮沉条件思维导图', sources: 2, time: '3天前', icon: Network, iconColor: 'text-purple-500' },
  ];

  const tools = [
    { id: 'audio', name: '音频概述', icon: Mic2, color: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100', beta: false },
    { id: 'video', name: '视频详解', icon: Video, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100', beta: true },
    { id: 'game', name: '互动游戏', icon: Gamepad2, color: 'bg-fuchsia-50 text-fuchsia-600', border: 'border-fuchsia-100', beta: true },
    { id: 'reports', name: '学习报告', icon: BarChart3, color: 'bg-amber-50 text-amber-600', border: 'border-amber-100', beta: false },
    { id: 'flashcards', name: '知识卡片', icon: CreditCard, color: 'bg-rose-50 text-rose-600', border: 'border-rose-100', beta: false },
    { id: 'quiz', name: '互动测试', icon: HelpCircle, color: 'bg-sky-50 text-sky-600', border: 'border-sky-100', beta: false },
    { id: 'infographic', name: '信息图表', icon: Layers, color: 'bg-violet-50 text-violet-600', border: 'border-violet-100', beta: true },
    { id: 'slides', name: '幻灯片生成', icon: Layout, color: 'bg-orange-50 text-orange-600', border: 'border-orange-100', beta: true },
  ];

  const PHYSICS_OBJECTS: PhysicsObject[] = [
    { id: 'wood', name: '干燥木块', density: 0.5, color: 'bg-amber-700', shape: 'rect', mass: 100, volume: 200 },
    { id: 'ice', name: '透明冰块', density: 0.9, color: 'bg-sky-100', shape: 'rect', mass: 180, volume: 200 },
    { id: 'plastic', name: '塑料球', density: 0.8, color: 'bg-indigo-400', shape: 'circle', mass: 80, volume: 100 },
    { id: 'iron', name: '精铁球', density: 7.8, color: 'bg-slate-600', shape: 'circle', mass: 390, volume: 50 },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSlidesFull) {
        if (e.key === 'ArrowRight' || e.key === ' ') {
          setCurrentSlideIdx(prev => Math.min(slides.length - 1, prev + 1));
        } else if (e.key === 'ArrowLeft') {
          setCurrentSlideIdx(prev => Math.max(0, prev - 1));
        } else if (e.key === 'Escape') {
          setIsSlidesFull(false);
        }
      }
      if (isGameFull && e.key === 'Escape') {
        setIsGameFull(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      stopAudio();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSlidesFull, isGameFull, slides.length]);

  // Physics animation effect
  useEffect(() => {
    if (activeToolId === 'game' && selectedObject && isSubmerged) {
      const waterDensity = 1.0;
      let targetY = 0;
      
      if (selectedObject.density < waterDensity) {
        const submergedRatio = selectedObject.density / waterDensity;
        targetY = 30 - (submergedRatio * 10); 
      } else {
        targetY = 82;
      }
      const timer = setTimeout(() => setSimulationY(targetY), 50);
      return () => clearTimeout(timer);
    } else {
      setSimulationY(10);
    }
  }, [selectedObject, isSubmerged, activeToolId]);

  // Audio Decoding Helpers
  function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  async function decodeAudioData(
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  const handleToolClick = (toolId: string) => {
    setActiveToolId(toolId);
    if (toolId === 'quiz') {
      if (quizQuestions.length === 0) generateNewQuiz();
    } else if (toolId === 'video') {
      setVideoPrompt(`关于“水的浮力”中“${currentDimension}”维度的科学教育动画。专业3D渲染，清晰的科学演示，展示浮力的物理机制。`);
      if (!videoUrl) setGenerationStep('idle'); else setGenerationStep('completed');
    } else if (toolId === 'flashcards') {
      if (flashcards.length === 0) generateNewFlashcards();
    } else if (toolId === 'infographic') {
      if (!infographicUrl) generateNewInfographic();
    } else if (toolId === 'slides') {
      if (slides.length === 0) generateNewSlides();
    } else if (toolId === 'audio') {
      if (!audioBuffer) generateNewAudio();
    } else if (toolId === 'game') {
      if (!gameScenario) generateNewGame();
    }
  };

  const generateNewAudio = async () => {
    setIsGenerating(true);
    stopAudio();
    try {
      const base64Audio = await geminiService.generateAudioOverview("水的浮力", currentDimension);
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const bytes = decode(base64Audio);
      const buffer = await decodeAudioData(bytes, audioContextRef.current, 24000, 1);
      setAudioBuffer(buffer);
    } catch (error) { console.error(error); } finally { setIsGenerating(false); }
  };

  const playAudio = () => {
    if (!audioBuffer || !audioContextRef.current) return;
    stopAudio();
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => setIsAudioPlaying(false);
    source.start(0);
    sourceNodeRef.current = source;
    setIsAudioPlaying(true);
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch (e) {}
      sourceNodeRef.current = null;
    }
    setIsAudioPlaying(false);
  };

  const generateNewQuiz = async () => {
    setIsGenerating(true);
    try {
      const questions = await geminiService.generateQuiz("水的浮力", currentDimension);
      setQuizQuestions(questions);
      setUserAnswers(new Array(questions.length).fill(null));
    } catch (error) { console.error(error); } finally { setIsGenerating(false); }
  };

  const generateNewFlashcards = async () => {
    setIsGenerating(true);
    try {
      const cards = await geminiService.generateFlashcards("水的浮力", currentDimension);
      setFlashcards(cards);
      setFlippedCards(new Array(cards.length).fill(false));
    } catch (error) { console.error(error); } finally { setIsGenerating(false); }
  };

  const generateNewInfographic = async () => {
    setIsGenerating(true);
    try {
      const url = await geminiService.generateInfographic("水的浮力", currentDimension);
      setInfographicUrl(url);
    } catch (error) { console.error(error); } finally { setIsGenerating(false); }
  };

  const handleGenerateSlideImage = async (idx: number) => {
    if (generatingIndices.has(idx)) return;
    setGeneratingIndices(prev => new Set(prev).add(idx));
    try {
      const url = await geminiService.generateSlideImage(slides[idx].visualPrompt);
      setSlideImages(prev => ({ ...prev, [idx]: url }));
    } catch (error) { console.error(`Slide ${idx} image generation failed:`, error); } 
    finally {
      setGeneratingIndices(prev => {
        const next = new Set(prev);
        next.delete(idx);
        return next;
      });
    }
  };

  const generateNewSlides = async () => {
    setIsGenerating(true);
    setSlideImages({});
    setGeneratingIndices(new Set());
    try {
      const deck = await geminiService.generateSlides("水的浮力", currentDimension);
      setSlides(deck);
      setCurrentSlideIdx(0);
      deck.forEach((slide, idx) => autoGenerateImage(idx, slide.visualPrompt));
    } catch (error) { console.error(error); } finally { setIsGenerating(false); }
  };

  const autoGenerateImage = async (idx: number, prompt: string) => {
    setGeneratingIndices(prev => new Set(prev).add(idx));
    try {
      const url = await geminiService.generateSlideImage(prompt);
      setSlideImages(prev => ({ ...prev, [idx]: url }));
    } catch (e) { console.error(`Auto image gen failed for slide ${idx}`, e); } 
    finally {
      setGeneratingIndices(prev => {
        const next = new Set(prev);
        next.delete(idx);
        return next;
      });
    }
  };

  const generateNewGame = async () => {
    setIsGenerating(true);
    setSelectedObject(null);
    setIsSubmerged(false);
    try {
      const scenario = await geminiService.generateGame("水的浮力", currentDimension);
      setGameScenario(scenario);
    } catch (error) { console.error(error); } finally { setIsGenerating(false); }
  };

  const toggleCardFlip = (index: number) => {
    const newFlipped = [...flippedCards];
    newFlipped[index] = !newFlipped[index];
    setFlippedCards(newFlipped);
  };

  const handleStartVideoGeneration = async () => {
    if (!(await (window as any).aistudio.hasSelectedApiKey())) {
      setGenerationStep('auth');
      return;
    }
    await startVeoGeneration();
  };

  const handleAuthAndGenerate = async () => {
    await (window as any).aistudio.openSelectKey();
    await startVeoGeneration();
  };

  const startVeoGeneration = async () => {
    setGenerationStep('generating');
    setVideoError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: videoPrompt,
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
      });
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({operation: operation});
      }
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
        setGenerationStep('completed');
      } else throw new Error("未能获取视频生成结果。");
    } catch (error: any) {
      console.error("Video Generation Error:", error);
      if (error.message?.includes("Requested entity was not found")) {
        setGenerationStep('auth');
        setVideoError("API Key 验证失败，请重新选择有效的付费项目 API Key。");
      } else {
        setVideoError(error.message || "生成视频时发生未知错误。");
        setGenerationStep('idle');
      }
    }
  };

  const handleAnswerSelect = (qIdx: number, oIdx: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[qIdx] = oIdx;
    setUserAnswers(newAnswers);
  };

  const handleObjectSelect = (obj: PhysicsObject) => {
    setSelectedObject(obj);
    setIsSubmerged(false);
    setSimulationY(10);
  };

  const activeTool = tools.find(t => t.id === activeToolId);

  // Reusable Physics Lab Component
  const PhysicsLab = ({ full = false }: { full?: boolean }) => {
    if (!gameScenario) return null;
    
    return (
      <div className={`flex gap-6 ${full ? 'h-full w-full max-w-7xl mx-auto' : 'h-full min-h-0'} flex-row animate-in fade-in duration-500`}>
        
        {/* Left Side: Side Panel (Matches provided image aesthetic: White card layout) */}
        <div className={`flex flex-col gap-4 ${full ? 'w-[340px]' : 'w-[220px]'} shrink-0 h-full`}>
           {/* Guidance Card (White bg, rounded) */}
           <div className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm flex flex-col gap-4 flex-1 overflow-hidden">
              <div className="flex items-center gap-3">
                 <div className="p-3 rounded-2xl bg-fuchsia-50 text-fuchsia-600 shrink-0">
                    <Brain className="w-5 h-5" />
                 </div>
                 <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">探究专家建议</h4>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
                 <p className={`${full ? 'text-sm' : 'text-[11px]'} text-slate-600 font-medium leading-relaxed`}>
                   {gameScenario.context}
                 </p>
                 {isSubmerged && (
                   <div className="p-4 bg-fuchsia-50 border border-fuchsia-100 rounded-2xl animate-in slide-in-from-bottom-2">
                      <p className="text-[10px] text-fuchsia-700 font-bold leading-relaxed italic">
                        “{selectedObject?.density! < 1.0 ? gameScenario.options[0].scientificReason : gameScenario.options[2].scientificReason}”
                      </p>
                   </div>
                 )}
              </div>
              
              {/* Reset/New Adventure Button */}
              <button 
                onClick={generateNewGame}
                disabled={isGenerating}
                className="w-full mt-2 py-4 bg-slate-900 text-white rounded-[1.2rem] text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} /> 开启新冒险
              </button>
           </div>

           {/* Stats Panel */}
           {selectedObject && (
              <div className="bg-slate-50 border border-slate-100 rounded-[1.5rem] p-4 space-y-3 shrink-0">
                 <div className="flex items-center gap-2 text-slate-400">
                    <Activity className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-widest">仿真参量</span>
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-2 rounded-xl border border-slate-100 text-center">
                       <p className="text-[8px] font-bold text-slate-400 uppercase">Mass</p>
                       <p className="text-[11px] font-black text-slate-800">{selectedObject.mass}g</p>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-100 text-center">
                       <p className="text-[8px] font-bold text-slate-400 uppercase">Dens</p>
                       <p className="text-[11px] font-black text-slate-800">{selectedObject.density}</p>
                    </div>
                 </div>
              </div>
           )}
        </div>

        {/* Right Side: Simulation Area (Taller Tank) */}
        <div className="flex-1 flex flex-col gap-4 min-w-0 h-full">
           {/* Simulation Canvas area - Full Height */}
           <div className={`relative w-full flex-1 bg-slate-50 border-2 border-slate-200 rounded-[2.5rem] overflow-hidden shadow-inner flex flex-col`}>
              {/* Shelf Area (Top) */}
              <div className="h-20 px-6 w-full bg-slate-100/50 border-b border-dashed border-slate-200 flex gap-4 overflow-x-auto no-scrollbar items-center justify-center shrink-0">
                <div className="flex gap-4">
                  {PHYSICS_OBJECTS.map(obj => (
                     <button 
                       key={obj.id}
                       onClick={() => handleObjectSelect(obj)}
                       className={`shrink-0 w-14 h-14 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 group
                         ${selectedObject?.id === obj.id ? 'bg-white border-fuchsia-500 shadow-md scale-105' : 'bg-white/80 border-slate-50 hover:border-slate-300'}
                       `}
                     >
                       <div className={`w-6 h-6 rounded shadow-sm ${obj.color} ${obj.shape === 'circle' ? 'rounded-full' : ''} group-hover:scale-110 transition-transform`} />
                       <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">{obj.name}</span>
                     </button>
                  ))}
                </div>
              </div>

              {/* Water Tank Area */}
              <div className="flex-1 relative">
                 {/* Tank Frame */}
                 <div className="absolute inset-x-12 bottom-10 top-10 border-x-8 border-b-8 border-slate-300 rounded-b-[3.5rem] bg-white/40 overflow-hidden shadow-[inset_0_-20px_50px_rgba(0,0,0,0.02)]">
                    {/* Water */}
                    <div className="absolute inset-x-0 bottom-0 top-[35%] bg-sky-400/25 backdrop-blur-[2px] animate-pulse">
                       <div className="absolute top-0 inset-x-0 h-6 bg-sky-200/40 blur-lg" />
                    </div>

                    {/* Simulating Object */}
                    {selectedObject && (
                       <div 
                         className={`absolute left-1/2 -translate-x-1/2 transition-all duration-[1200ms] cubic-bezier(0.17, 0.67, 0.83, 0.67) flex items-center justify-center
                           ${selectedObject.shape === 'circle' ? 'rounded-full' : 'rounded-[1.5rem]'} ${selectedObject.color} shadow-2xl
                         `}
                         style={{ 
                           top: `${simulationY}%`,
                           width: `${selectedObject.volume / (full ? 1.0 : 1.8)}px`,
                           height: `${selectedObject.volume / (full ? 1.0 : 1.8)}px`
                         }}
                       >
                          {isSubmerged && (
                            <div className="absolute inset-0 pointer-events-none">
                               <div className="absolute bottom-full left-1/2 -translate-x-1/2 flex flex-col items-center mb-2">
                                  <div className={`${full ? 'h-36 w-1.5' : 'h-20 w-0.5'} bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]`} />
                                  <div className={`${full ? 'border-x-8 border-t-8' : 'border-x-4 border-t-4'} w-0 h-0 border-x-transparent border-t-green-500`} />
                                  <span className={`${full ? 'text-xs' : 'text-[9px]'} font-black text-green-600 mt-2 bg-white/90 px-2.5 py-1 rounded-full border border-green-100 shadow-sm`}>F_浮 (Buoyancy)</span>
                               </div>
                               <div className="absolute top-full left-1/2 -translate-x-1/2 flex flex-col items-center mt-2">
                                  <div className={`${full ? 'border-x-8 border-b-8' : 'border-x-4 border-b-4'} w-0 h-0 border-x-transparent border-b-rose-500`} />
                                  <div className={`${full ? 'h-36 w-1.5' : 'h-20 w-0.5'} bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]`} />
                                  <span className={`${full ? 'text-xs' : 'text-[9px]'} font-black text-rose-600 mt-2 bg-white/90 px-2.5 py-1 rounded-full border border-rose-100 shadow-sm`}>G_重 (Gravity)</span>
                               </div>
                            </div>
                          )}
                          <Move className={`${full ? 'w-10 h-10' : 'w-4 h-4'} text-white/40`} />
                       </div>
                    )}
                 </div>

                 {/* Drop Action Button */}
                 {!isSubmerged && selectedObject && (
                   <button 
                     onClick={() => setIsSubmerged(true)}
                     className={`absolute bottom-24 left-1/2 -translate-x-1/2 ${full ? 'px-20 py-8 text-2xl' : 'px-12 py-5 text-base'} bg-fuchsia-600 text-white rounded-full font-bold shadow-2xl shadow-fuchsia-200 flex items-center gap-4 active:scale-95 transition-all animate-bounce`}
                   >
                     <Target className={`${full ? 'w-10 h-10' : 'w-6 h-6'}`} /> 投入水中
                   </button>
                 )}

                 {/* Result Detail Box */}
                 {isSubmerged && (
                   <div className={`absolute right-20 ${full ? 'top-[45%] w-80' : 'top-[40%] w-56'} animate-in slide-in-from-right duration-500`}>
                      <div className={`p-8 rounded-[2.5rem] border-2 shadow-[0_30px_60px_rgba(0,0,0,0.12)] ${selectedObject?.density! < 1.0 ? 'bg-green-50 border-green-200' : 'bg-rose-50 border-rose-200'}`}>
                         <h5 className={`${full ? 'text-xl' : 'text-xs'} font-black uppercase mb-2 ${selectedObject?.density! < 1.0 ? 'text-green-700' : 'text-rose-700'}`}>
                           {selectedObject?.density! < 1.0 ? '力学结论：漂浮' : '力学结论：下沉'}
                         </h5>
                         <p className={`${full ? 'text-base' : 'text-[11px]'} leading-relaxed text-slate-600 font-bold`}>
                           ρ物 {selectedObject?.density! < 1.0 ? '<' : '>'} ρ液
                         </p>
                         <p className={`${full ? 'text-sm' : 'text-[10px]'} mt-4 text-slate-500 italic leading-relaxed`}>
                           {selectedObject?.density! < 1.0 ? '合力方向朝上。当物体部分浸入时，受到的浮力最终与重力相等。' : '合力方向朝下。物体的重力大于它排开液体的最大重力。'}
                         </p>
                      </div>
                   </div>
                 )}

                 {/* Fullscreen Trigger */}
                 {!full && (
                   <button 
                     onClick={() => setIsGameFull(true)}
                     className="absolute bottom-10 right-10 p-3 bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-200 text-slate-400 hover:text-fuchsia-600 transition-colors shadow-sm active:scale-90"
                   >
                     <Maximize2 className="w-6 h-6" />
                   </button>
                 )}
              </div>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
      <div className="p-5 border-b flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {activeToolId && (
            <button onClick={() => { setActiveToolId(null); stopAudio(); }} className="p-1 hover:bg-slate-50 rounded-lg transition-colors mr-1">
              <ChevronLeft className="w-5 h-5 text-slate-400" />
            </button>
          )}
          <h2 className="text-lg font-bold text-slate-800">{activeTool ? `${activeTool.name}` : '学习工具箱'}</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        {activeToolId === 'game' ? (
          <div className="h-full flex flex-col">
            {isGenerating ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-fuchsia-100 animate-spin" />
                <p className="text-xs text-slate-400 font-medium animate-pulse">AI 正在准备实验室...</p>
              </div>
            ) : gameScenario ? (
              <PhysicsLab full={false} />
            ) : (
              <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
                <Gamepad2 className="w-12 h-12 text-slate-200" />
                <p className="text-xs text-slate-400">点击侧边栏开启冒险</p>
              </div>
            )}
          </div>
        ) : activeToolId === 'audio' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
             <div className="flex items-center justify-between">
              <div className="bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-indigo-600" />
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest">维度: {currentDimension}</span>
              </div>
              <button onClick={generateNewAudio} disabled={isGenerating} className="flex items-center gap-2 text-[10px] font-bold text-amber-600 hover:text-amber-700 disabled:opacity-50">
                <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} /> 重新生成
              </button>
            </div>
            {isGenerating ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-slate-100 animate-spin" />
                <p className="text-xs text-slate-400 font-medium">AI 正在生成音频概述...</p>
              </div>
            ) : audioBuffer ? (
              <div className="flex flex-col items-center gap-10 py-10">
                <div className="relative w-48 h-48 bg-indigo-50 rounded-full flex items-center justify-center shadow-inner overflow-hidden">
                  <Mic2 className={`w-10 h-10 text-indigo-500 relative z-10 ${isAudioPlaying ? 'animate-pulse' : ''}`} />
                  {isAudioPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-40">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                          <div key={i} className="w-1 bg-indigo-400 rounded-full animate-waveform" style={{ height: `${20 + Math.random() * 40}px`, animationDelay: `${i * 100}ms` }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button onClick={isAudioPlaying ? stopAudio : playAudio} className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl ${isAudioPlaying ? 'bg-rose-500 text-white' : 'bg-indigo-600 text-white'}`}>
                  {isAudioPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white ml-1" />}
                </button>
              </div>
            ) : null}
          </div>
        ) : activeToolId === 'quiz' ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
             <div className="flex items-center justify-between">
              <div className="bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-100 flex items-center gap-2">
                <Brain className="w-4 h-4 text-sky-600" />
                <span className="text-[10px] font-bold text-sky-700 uppercase tracking-widest">维度: {currentDimension}</span>
              </div>
              <button onClick={generateNewQuiz} disabled={isGenerating} className="flex items-center gap-2 text-[10px] font-bold text-amber-600 hover:text-amber-700 disabled:opacity-50 transition-colors">
                <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} /> 重新生成
              </button>
            </div>
            {isGenerating ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 text-slate-100 animate-spin" />
                <p className="text-xs text-slate-400 font-medium animate-pulse">AI 正在根据你的学习进度出题...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {quizQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 leading-snug">{qIdx + 1}. {q.question}</h3>
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = userAnswers[qIdx] === oIdx;
                        const isCorrect = oIdx === q.correctAnswer;
                        const showFeedback = userAnswers[qIdx] !== null;
                        return (
                          <button key={oIdx} onClick={() => handleAnswerSelect(qIdx, oIdx)} disabled={showFeedback} className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-between group ${isSelected ? (isCorrect ? 'bg-green-50 border-green-200 text-green-700' : 'bg-rose-50 border-rose-200 text-rose-700') : showFeedback && isCorrect ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-slate-100 hover:border-sky-200 text-slate-600'}`}>
                            <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                            {showFeedback && isCorrect && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {tools.map((tool, i) => (
                <div key={i} onClick={() => handleToolClick(tool.id)} className={`group relative p-3 rounded-2xl border ${tool.border} ${tool.color.split(' ')[0]} transition-all hover:shadow-md cursor-pointer`}>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <tool.icon className={`w-5 h-5 ${tool.color.split(' ')[1]}`} />
                      <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/50 rounded-lg">
                        <Pencil className="w-3 h-3 text-slate-500" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-slate-700 leading-tight">{tool.name}</span>
                      {tool.beta && <span className="bg-slate-900 text-white text-[8px] px-1.5 py-0.5 rounded font-black tracking-tighter scale-90 origin-left">BETA</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="h-px bg-slate-100 w-full" />
              <div className="space-y-5">
                {history.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 group cursor-pointer">
                    <div className={`mt-1 shrink-0 ${item.iconColor}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium">{item.sources} source · {item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Fullscreen Game Modal */}
      {isGameFull && gameScenario && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-2xl flex flex-col animate-in fade-in duration-300 overflow-hidden">
          <div className="p-6 flex items-center justify-between border-b border-white/5 shrink-0">
            <div className="flex items-center gap-4">
              <div className="bg-fuchsia-600 p-2.5 rounded-xl shadow-lg shadow-fuchsia-600/20">
                <Monitor className="text-white w-5 h-5" />
              </div>
              <div>
                <h4 className="text-white font-bold tracking-tight">沉浸实验室：{currentDimension}</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">探课AI · 物理交互仿真</p>
              </div>
            </div>
            <button 
              onClick={() => setIsGameFull(false)}
              className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all border border-white/10 active:scale-90"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 relative flex flex-col p-10 lg:p-16 overflow-hidden">
             <PhysicsLab full={true} />
          </div>

          {/* Footer controls for Fullscreen */}
          <div className="p-8 border-t border-white/5 bg-slate-950/80 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Settings2 className="w-7 h-7 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-base">环境参量调节</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Environment Config</p>
                  </div>
                </div>
             </div>
             <div className="flex items-center gap-4">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest mr-4">模拟引擎版本：v2.5 Professional</span>
                <button 
                  onClick={() => setIsGameFull(false)}
                  className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold border border-white/10 transition-all active:scale-95"
                >
                  返回普通视图
                </button>
             </div>
          </div>
        </div>
      )}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes waveform { 0%, 100% { height: 20px; } 50% { height: 60px; } }
        .animate-waveform { animation: waveform 0.8s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default StudioPanel;
