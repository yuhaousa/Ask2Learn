
import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic2, 
  Video, 
  BarChart3, 
  CreditCard, 
  HelpCircle, 
  Layout, 
  FileText, 
  Pencil, 
  Layers,
  ChevronLeft,
  RefreshCw,
  CheckCircle2,
  Brain,
  Play,
  Loader2,
  Maximize2,
  X,
  Volume2,
  Pause,
  Gamepad2,
  Target,
  Settings2,
  Activity,
  Move,
  Monitor,
  Compass,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { Dimension } from '../types.ts';
import { geminiService, QuizQuestion, Flashcard, Slide, GameScenario, TutorialGuide } from '../services/geminiService.ts';

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
  
  // States for Tutorial
  const [tutorialData, setTutorialData] = useState<TutorialGuide | null>(null);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);
  const [tutorialAnimationState, setTutorialAnimationState] = useState<'idle' | 'hanging' | 'submerged'>('idle');

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flippedCards, setFlippedCards] = useState<boolean[]>([]);

  const [infographicUrl, setInfographicUrl] = useState<string | null>(null);

  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [slideImages, setSlideImages] = useState<Record<number, string>>({});

  const [gameScenario, setGameScenario] = useState<GameScenario | null>(null);
  const [selectedObject, setSelectedObject] = useState<PhysicsObject | null>(null);
  const [isSubmerged, setIsSubmerged] = useState(false);
  const [simulationY, setSimulationY] = useState(0);

  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const tools = [
    { id: 'tutorial', name: '互动教程', icon: Compass, color: 'bg-amber-50 text-amber-600', border: 'border-amber-100', beta: false },
    { id: 'audio', name: '音频概述', icon: Mic2, color: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100', beta: false },
    { id: 'video', name: '视频详解', icon: Video, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100', beta: true },
    { id: 'game', name: '互动游戏', icon: Gamepad2, color: 'bg-fuchsia-50 text-fuchsia-600', border: 'border-fuchsia-100', beta: true },
    { id: 'flashcards', name: '知识卡片', icon: CreditCard, color: 'bg-rose-50 text-rose-600', border: 'border-rose-100', beta: false },
    { id: 'quiz', name: '互动测试', icon: HelpCircle, color: 'bg-sky-50 text-sky-600', border: 'border-sky-100', beta: false },
    { id: 'infographic', name: '信息图表', icon: Layers, color: 'bg-violet-50 text-violet-600', border: 'border-violet-100', beta: true },
    { id: 'slides', name: '幻灯片生成', icon: Layout, color: 'bg-orange-50 text-orange-600', border: 'border-orange-100', beta: true },
  ];

  const handleToolClick = (toolId: string) => {
    setActiveToolId(toolId);
    if (toolId === 'tutorial') {
      if (!tutorialData) generateNewTutorial();
    } else if (toolId === 'quiz') {
      if (quizQuestions.length === 0) generateNewQuiz();
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

  const generateNewTutorial = async () => {
    setIsGenerating(true);
    setCurrentTutorialStep(0);
    setTutorialAnimationState('idle');
    try {
      const data = await geminiService.generateTutorial("水的浮力", currentDimension);
      setTutorialData(data);
    } catch (e) { console.error(e); } finally { setIsGenerating(false); }
  };

  const generateNewAudio = async () => {
    setIsGenerating(true);
    try {
      const base64Audio = await geminiService.generateAudioOverview("水的浮力", currentDimension);
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const bytes = atob(base64Audio).split('').map(c => c.charCodeAt(0));
      const buffer = await decodeAudioData(new Uint8Array(bytes), audioContextRef.current, 24000, 1);
      setAudioBuffer(buffer);
    } catch (error) { console.error(error); } finally { setIsGenerating(false); }
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

  const generateNewSlides = async () => {
    setIsGenerating(true);
    try {
      const deck = await geminiService.generateSlides("水的浮力", currentDimension);
      setSlides(deck);
      setCurrentSlideIdx(0);
    } catch (error) { console.error(error); } finally { setIsGenerating(false); }
  };

  const generateNewGame = async () => {
    setIsGenerating(true);
    try {
      const scenario = await geminiService.generateGame("水的浮力", currentDimension);
      setGameScenario(scenario);
    } catch (error) { console.error(error); } finally { setIsGenerating(false); }
  };

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
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

  const playAudio = () => {
    if (!audioBuffer || !audioContextRef.current) return;
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => setIsAudioPlaying(false);
    source.start(0);
    sourceNodeRef.current = source;
    setIsAudioPlaying(true);
  };

  const stopAudio = () => {
    if (sourceNodeRef.current) sourceNodeRef.current.stop();
    setIsAudioPlaying(false);
  };

  const TutorialView = () => {
    if (isGenerating) return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">AI 准备课件中...</p>
      </div>
    );
    if (!tutorialData) return null;

    const steps = tutorialData.steps;
    const currentStep = steps[currentTutorialStep];
    const gravity = 5.0; // N
    const buoyancy = 2.0; // N
    const reading = tutorialAnimationState === 'submerged' ? (gravity - buoyancy).toFixed(1) : gravity.toFixed(1);

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 mb-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">Step {currentTutorialStep + 1}</span>
            <h4 className="text-xs font-black text-slate-800 uppercase">{tutorialData.title}</h4>
          </div>
          <p className="text-[11px] font-bold text-slate-600 leading-relaxed italic">“{currentStep.instruction}”</p>
        </div>

        {/* Experiment Simulation Box */}
        <div className="relative h-64 bg-slate-100 rounded-3xl border border-slate-200 overflow-hidden shadow-inner flex justify-center">
          {/* Beaker */}
          <div className="absolute bottom-4 w-32 h-32 border-x-4 border-b-4 border-slate-300 rounded-b-3xl bg-white/50 overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 h-[60%] bg-sky-300/40 animate-pulse" />
          </div>

          {/* Spring Scale SVG */}
          <div className="absolute top-0 flex flex-col items-center">
            <div className="w-0.5 h-10 bg-slate-400" /> {/* Support wire */}
            <div className="bg-white border-2 border-slate-300 w-12 h-24 rounded-lg flex flex-col items-center justify-center shadow-sm relative">
              {/* Dial markings */}
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="absolute left-1 w-2 h-0.5 bg-slate-300" style={{ top: `${i * 15}%` }} />
              ))}
              <span className="text-[10px] font-black text-amber-600">{tutorialAnimationState !== 'idle' ? reading : '0.0'} N</span>
            </div>
            
            {/* The Spring and Object */}
            <div 
              className="transition-all duration-700 ease-out flex flex-col items-center"
              style={{ 
                marginTop: tutorialAnimationState === 'idle' ? '0px' : tutorialAnimationState === 'hanging' ? '20px' : '40px' 
              }}
            >
              <div className="w-1 bg-slate-400" style={{ height: tutorialAnimationState === 'idle' ? '10px' : '30px' }} />
              <div className={`w-10 h-10 bg-amber-600 rounded-lg shadow-md flex items-center justify-center ${tutorialAnimationState === 'idle' ? 'opacity-20' : ''}`}>
                 <div className="w-4 h-1 bg-white/20 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-2">
          {currentTutorialStep === 1 && tutorialAnimationState === 'idle' && (
            <button 
              onClick={() => setTutorialAnimationState('hanging')}
              className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[11px] font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-95"
            >
              挂上铝块测量 G
            </button>
          )}
          {currentTutorialStep === 2 && tutorialAnimationState === 'hanging' && (
            <button 
              onClick={() => setTutorialAnimationState('submerged')}
              className="flex-1 py-3 bg-sky-600 text-white rounded-xl text-[11px] font-bold shadow-lg hover:bg-sky-700 transition-all active:scale-95"
            >
              浸入水中测量 F'
            </button>
          )}
        </div>

        {/* AI Insight Section */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex gap-4 items-start">
          <div className="bg-amber-500/10 p-2 rounded-xl text-amber-600 shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-[10px] font-black text-amber-600 uppercase mb-1 tracking-widest">老师深度点拨</h5>
            <p className="text-[11px] font-medium text-slate-500 leading-relaxed">{currentStep.insight}</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-2">
          <button 
            disabled={currentTutorialStep === 0}
            onClick={() => setCurrentTutorialStep(prev => prev - 1)}
            className="p-2 text-slate-400 hover:text-slate-800 disabled:opacity-30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentTutorialStep ? 'w-6 bg-amber-500' : 'w-1.5 bg-slate-200'}`} />
            ))}
          </div>
          <button 
            disabled={currentTutorialStep === steps.length - 1}
            onClick={() => setCurrentTutorialStep(prev => prev + 1)}
            className="p-2 text-slate-400 hover:text-slate-800 disabled:opacity-30 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const activeTool = tools.find(t => t.id === activeToolId);

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
        {!activeToolId ? (
          <div className="grid grid-cols-2 gap-3">
            {tools.map((tool) => (
              <div 
                key={tool.id} 
                onClick={() => handleToolClick(tool.id)} 
                className={`group relative p-3 rounded-2xl border ${tool.border} ${tool.color.split(' ')[0]} transition-all hover:shadow-md cursor-pointer`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <tool.icon className={`w-5 h-5 ${tool.color.split(' ')[1]}`} />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-slate-700 leading-tight">{tool.name}</span>
                    {tool.beta && <span className="bg-slate-900 text-white text-[8px] px-1.5 py-0.5 rounded font-black tracking-tighter scale-90 origin-left">BETA</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeToolId === 'tutorial' ? (
          <TutorialView />
        ) : activeToolId === 'audio' ? (
          <div className="space-y-6 animate-in fade-in duration-300">
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
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
            <Settings2 className="w-12 h-12 text-slate-200" />
            <p className="text-xs text-slate-400 uppercase font-black">工具开发中...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudioPanel;
