
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
  ArrowLeft,
  Download
} from 'lucide-react';
import { Dimension } from '../types.ts';
import { geminiService, QuizQuestion, Flashcard, Slide, GameScenario, TutorialGuide, VideoResult } from '../services/geminiService.ts';

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
  
  // States for Tutorial (now HTML game based)
  const [tutorialData, setTutorialData] = useState<TutorialGuide | null>(null);

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flippedCards, setFlippedCards] = useState<boolean[]>([]);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);

  const [infographicUrl, setInfographicUrl] = useState<string | null>(null);

  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [slideImages, setSlideImages] = useState<Record<number, string>>({});

  const [gameScenario, setGameScenario] = useState<GameScenario | null>(null);
  const [selectedObject, setSelectedObject] = useState<PhysicsObject | null>(null);
  const [isSubmerged, setIsSubmerged] = useState(false);
  const [simulationY, setSimulationY] = useState(0);

  const [videoResult, setVideoResult] = useState<VideoResult | null>(null);
  // 视频生成设置
  const [videoSettings, setVideoSettings] = useState({ voiceOver: false, script: '', showModal: false });

  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // 全屏模式状态
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    } else if (toolId === 'video') {
      if (!videoResult) generateNewVideo();
    }
  };

  const generateNewTutorial = async () => {
    setIsGenerating(true);
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

  const generateNewVideo = async () => {
    setIsGenerating(true);
    try {
      // 传递 voiceOver 参数给服务
      const result = await geminiService.generateVideo("水的浮力", currentDimension, videoSettings.voiceOver ? 'zh' : 'zh', videoSettings.voiceOver);
      setVideoResult(result);
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
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">AI 正在生成互动式学习游戏...</p>
        <p className="text-[10px] text-slate-300">这可能需要几秒钟</p>
      </div>
    );
    if (!tutorialData) return null;

    // 下载 HTML 游戏文件
    const downloadHtml = () => {
      const blob = new Blob([tutorialData.htmlCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tutorialData.title || 'learning-game'}.html`;
      a.click();
      URL.revokeObjectURL(url);
    };

    return (
      <div className="space-y-4 animate-in fade-in duration-500 h-full flex flex-col">
        <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-black text-slate-800">{tutorialData.title}</h4>
              <p className="text-xs text-slate-500 mt-1">{tutorialData.description}</p>
            </div>
            <button
              onClick={downloadHtml}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              下载
            </button>
          </div>
        </div>
        
        {/* HTML Game iframe */}
        <div className="flex-1 rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-inner min-h-[400px] relative">
          <iframe
            srcDoc={tutorialData.htmlCode}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
            title={tutorialData.title}
          />
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-lg shadow-md transition-all"
          >
            <Maximize2 className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    );
  };

  // 视频视图
  const VideoView = () => {
    if (isGenerating) return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">AI 正在生成教学视频...</p>
        <p className="text-[10px] text-slate-300">这可能需要1-2分钟</p>
      </div>
    );
    if (!videoResult) return null;
    
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-2">
            <Video className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">维度: {currentDimension}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setVideoSettings(s => ({ ...s, showModal: true }))} className="p-2 hover:bg-emerald-100 rounded-lg transition-all" title="视频设置">
              <Settings2 className="w-4 h-4 text-emerald-600" />
            </button>
            <button onClick={generateNewVideo} disabled={isGenerating} className="flex items-center gap-2 text-[10px] font-bold text-amber-600 hover:text-amber-700 disabled:opacity-50">
              <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} /> 重新生成
            </button>
          </div>
        </div>
        {/* 视频播放器 */}
        <div className="rounded-2xl overflow-hidden border border-emerald-100 bg-black relative">
          <video
            src={videoResult.videoUrl}
            controls
            className="w-full aspect-video"
            poster=""
          />
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-lg shadow-md transition-all"
          >
            <Maximize2 className="w-4 h-4 text-slate-600" />
          </button>
        </div>
        {/* 视频脚本 */}
        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
          <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            视频脚本
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed">{videoResult.script}</p>
        </div>
        {/* 设置弹窗 */}
        {videoSettings.showModal && (
          <FullscreenModal title="视频生成设置" onClose={() => setVideoSettings(s => ({ ...s, showModal: false }))}>
            <form className="space-y-6 max-w-lg mx-auto">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="voiceOver"
                  checked={videoSettings.voiceOver}
                  onChange={e => setVideoSettings(s => ({ ...s, voiceOver: e.target.checked }))}
                  className="w-5 h-5"
                />
                <label htmlFor="voiceOver" className="text-base font-bold text-slate-700">配画外音</label>
              </div>
              <div>
                <label htmlFor="script" className="block text-base font-bold text-slate-700 mb-2">视频描述脚本</label>
                <textarea
                  id="script"
                  value={videoSettings.script}
                  onChange={e => setVideoSettings(s => ({ ...s, script: e.target.value }))}
                  rows={4}
                  className="w-full p-2 border rounded-lg"
                  placeholder="请输入视频描述或脚本..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setVideoSettings(s => ({ ...s, showModal: false }))} className="px-4 py-2 bg-slate-100 rounded-lg font-bold text-slate-700">取消</button>
                <button type="button" onClick={() => { setVideoSettings(s => ({ ...s, showModal: false })); generateNewVideo(); }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold">保存并生成</button>
              </div>
            </form>
          </FullscreenModal>
        )}
      </div>
    );
  };

  // 互动游戏视图
  const GameView = () => {
    if (isGenerating) return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-fuchsia-500 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">AI 正在生成互动游戏...</p>
      </div>
    );
    if (!gameScenario) return null;
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div className="bg-fuchsia-50 px-3 py-1.5 rounded-xl border border-fuchsia-100 flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-fuchsia-600" />
            <span className="text-[10px] font-bold text-fuchsia-700 uppercase tracking-widest">互动游戏</span>
          </div>
          <button onClick={generateNewGame} disabled={isGenerating} className="flex items-center gap-2 text-[10px] font-bold text-amber-600 hover:text-amber-700 disabled:opacity-50">
            <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} /> 重新生成
          </button>
        </div>
        <div className="bg-gradient-to-br from-fuchsia-50 to-purple-50 rounded-2xl p-6 border border-fuchsia-100">
          <h3 className="text-lg font-bold text-slate-800 mb-2">{gameScenario.title}</h3>
          <p className="text-sm text-slate-600 mb-4">{gameScenario.description}</p>
          <div className="bg-white rounded-xl p-4 border border-fuchsia-100">
            <h4 className="text-sm font-bold text-slate-700 mb-2">游戏目标</h4>
            <p className="text-xs text-slate-500">{gameScenario.objective}</p>
          </div>
        </div>
      </div>
    );
  };

  // 知识卡片视图
  const FlashcardsView = ({ isFullscreenMode = false }: { isFullscreenMode?: boolean }) => {
    if (isGenerating && !isFullscreenMode) return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">AI 正在生成知识卡片...</p>
      </div>
    );
    if (flashcards.length === 0) return null;
    
    const toggleFlip = (idx: number) => {
      const newFlipped = [...flippedCards];
      newFlipped[idx] = !newFlipped[idx];
      setFlippedCards(newFlipped);
    };

    // 全屏模式：一页一个知识点
    if (isFullscreenMode) {
      const currentCard = flashcards[currentCardIdx];
      const isFlipped = flippedCards[currentCardIdx];
      const learnedCount = flippedCards.filter(f => f).length;
      
      return (
        <div className="h-full flex flex-col">
          {/* 进度条 */}
          <div className="flex items-center gap-4 mb-6 shrink-0">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-rose-500 transition-all duration-300" 
                style={{ width: `${(learnedCount / flashcards.length) * 100}%` }}
              />
            </div>
            <span className="text-sm font-bold text-slate-600">已学习 {learnedCount}/{flashcards.length}</span>
          </div>

          {/* 卡片区域 */}
          <div className="flex-1 flex items-center justify-center">
            <div
              onClick={() => toggleFlip(currentCardIdx)}
              className="w-full max-w-2xl aspect-[4/3] cursor-pointer perspective-1000"
            >
              <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* 正面 - 问题 */}
                <div className={`absolute inset-0 bg-gradient-to-br from-rose-50 to-pink-100 rounded-3xl p-8 border-2 border-rose-200 shadow-xl flex flex-col items-center justify-center backface-hidden ${isFlipped ? 'opacity-0' : 'opacity-100'}`}>
                  <div className="absolute top-6 left-6 w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {currentCardIdx + 1}
                  </div>
                  <div className="text-center px-8">
                    <p className="text-xs uppercase tracking-widest text-rose-400 mb-4 font-bold">知识点</p>
                    <h3 className="text-2xl font-bold text-slate-800 leading-relaxed">{currentCard.front}</h3>
                  </div>
                  <p className="absolute bottom-6 text-sm text-slate-400">点击卡片查看答案</p>
                </div>
                
                {/* 背面 - 答案 */}
                <div className={`absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-100 rounded-3xl p-8 border-2 border-emerald-200 shadow-xl flex flex-col items-center justify-center backface-hidden ${isFlipped ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="absolute top-6 left-6 w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    ✓
                  </div>
                  <div className="text-center px-8">
                    <p className="text-xs uppercase tracking-widest text-emerald-400 mb-4 font-bold">答案</p>
                    <p className="text-xl text-slate-700 leading-relaxed">{currentCard.back}</p>
                  </div>
                  <p className="absolute bottom-6 text-sm text-slate-400">点击卡片返回问题</p>
                </div>
              </div>
            </div>
          </div>

          {/* 导航按钮 */}
          <div className="flex items-center justify-between mt-6 shrink-0">
            <button
              onClick={() => { setCurrentCardIdx(Math.max(0, currentCardIdx - 1)); }}
              disabled={currentCardIdx === 0}
              className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-base font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-5 h-5" /> 上一个
            </button>
            <div className="flex gap-2">
              {flashcards.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentCardIdx(idx)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    idx === currentCardIdx 
                      ? 'bg-rose-500' 
                      : flippedCards[idx] 
                        ? 'bg-emerald-400'
                        : 'bg-slate-200 hover:bg-slate-300'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => { setCurrentCardIdx(Math.min(flashcards.length - 1, currentCardIdx + 1)); }}
              disabled={currentCardIdx === flashcards.length - 1}
              className="flex items-center gap-2 px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              下一个 <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div className="bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-rose-600" />
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-widest">维度: {currentDimension}</span>
          </div>
          <button onClick={generateNewFlashcards} disabled={isGenerating} className="flex items-center gap-2 text-[10px] font-bold text-amber-600 hover:text-amber-700 disabled:opacity-50">
            <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} /> 重新生成
          </button>
        </div>
        <p className="text-xs text-slate-400 text-center">点击卡片翻转查看答案</p>
        <div className="grid gap-4">
          {flashcards.map((card, idx) => (
            <div
              key={idx}
              onClick={() => toggleFlip(idx)}
              className="min-h-[120px] bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-5 border border-rose-100 cursor-pointer hover:shadow-lg transition-all relative overflow-hidden"
            >
              <div className={`transition-all duration-300 ${flippedCards[idx] ? 'opacity-0' : 'opacity-100'}`}>
                <div className="absolute top-3 left-3 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{idx + 1}</div>
                <div className="pt-4">
                  <h4 className="text-sm font-bold text-slate-800">{card.front}</h4>
                </div>
              </div>
              {flippedCards[idx] && (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 flex items-center justify-center border border-emerald-100 animate-in fade-in duration-200">
                  <p className="text-sm text-slate-700 text-center">{card.back}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={() => { setCurrentCardIdx(0); setIsFullscreen(true); }}
          className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
        >
          <Maximize2 className="w-4 h-4" />
          全屏学习
        </button>
      </div>
    );
  };

  // 互动测试视图
  const QuizView = ({ isFullscreenMode = false }: { isFullscreenMode?: boolean }) => {
    if (isGenerating && !isFullscreenMode) return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">AI 正在生成测试题目...</p>
      </div>
    );
    if (quizQuestions.length === 0) return null;

    const handleAnswer = (qIdx: number, optIdx: number) => {
      const newAnswers = [...userAnswers];
      newAnswers[qIdx] = optIdx;
      setUserAnswers(newAnswers);
    };

    const correctCount = quizQuestions.reduce((count, q, idx) => {
      return count + (userAnswers[idx] === q.correctIndex ? 1 : 0);
    }, 0);

    const allAnswered = userAnswers.every(a => a !== null);

    // 全屏模式：一页一题
    if (isFullscreenMode) {
      const q = quizQuestions[currentQuizIdx];
      const isAnswered = userAnswers[currentQuizIdx] !== null;
      
      return (
        <div className="h-full flex flex-col">
          {/* 进度条 */}
          <div className="flex items-center gap-4 mb-6 shrink-0">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-sky-500 transition-all duration-300" 
                style={{ width: `${((currentQuizIdx + 1) / quizQuestions.length) * 100}%` }}
              />
            </div>
            <span className="text-sm font-bold text-slate-600">{currentQuizIdx + 1}/{quizQuestions.length}</span>
          </div>

          {/* 完成结果页 */}
          {allAnswered && currentQuizIdx === quizQuestions.length - 1 && isAnswered ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center ${correctCount === quizQuestions.length ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                {correctCount === quizQuestions.length ? (
                  <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                ) : (
                  <Target className="w-12 h-12 text-amber-600" />
                )}
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-slate-800 mb-2">{correctCount}/{quizQuestions.length}</p>
                <p className="text-lg text-slate-600">{correctCount === quizQuestions.length ? '太棒了！全部正确！🎉' : '继续努力！💪'}</p>
              </div>
              <button
                onClick={() => { setCurrentQuizIdx(0); setUserAnswers(new Array(quizQuestions.length).fill(null)); }}
                className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-bold transition-colors"
              >
                重新测试
              </button>
            </div>
          ) : (
            <>
              {/* 题目内容区域 */}
              <div className="flex-1 flex flex-col">
                <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 flex-1">
                  <div className="flex items-start gap-4 mb-8">
                    <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0">
                      {currentQuizIdx + 1}
                    </div>
                    <p className="text-xl font-medium text-slate-800 pt-1.5">{q.question}</p>
                  </div>
                  <div className="grid gap-4 ml-14">
                    {q.options.map((opt, optIdx) => {
                      const isSelected = userAnswers[currentQuizIdx] === optIdx;
                      const isCorrect = q.correctIndex === optIdx;
                      const showResult = userAnswers[currentQuizIdx] !== null;
                      let bgClass = 'bg-white border-slate-200 hover:border-sky-400 hover:shadow-md';
                      if (showResult) {
                        if (isCorrect) bgClass = 'bg-emerald-50 border-emerald-400';
                        else if (isSelected) bgClass = 'bg-rose-50 border-rose-400';
                      } else if (isSelected) {
                        bgClass = 'bg-sky-50 border-sky-400';
                      }
                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleAnswer(currentQuizIdx, optIdx)}
                          disabled={userAnswers[currentQuizIdx] !== null}
                          className={`text-left p-5 rounded-2xl border-2 text-lg transition-all ${bgClass} disabled:cursor-default`}
                        >
                          <span className="font-bold text-slate-500 mr-3">{String.fromCharCode(65 + optIdx)}.</span>
                          <span className="text-slate-700">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                  {isAnswered && (
                    <div className="mt-6 ml-14 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="text-base text-blue-700"><strong>解析:</strong> {q.explanation}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 导航按钮 */}
              <div className="flex items-center justify-between mt-6 shrink-0">
                <button
                  onClick={() => setCurrentQuizIdx(Math.max(0, currentQuizIdx - 1))}
                  disabled={currentQuizIdx === 0}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-base font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" /> 上一题
                </button>
                <div className="flex gap-2">
                  {quizQuestions.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuizIdx(idx)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        idx === currentQuizIdx 
                          ? 'bg-sky-500' 
                          : userAnswers[idx] !== null 
                            ? (userAnswers[idx] === quizQuestions[idx].correctIndex ? 'bg-emerald-400' : 'bg-rose-400')
                            : 'bg-slate-200 hover:bg-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setCurrentQuizIdx(Math.min(quizQuestions.length - 1, currentQuizIdx + 1))}
                  disabled={currentQuizIdx === quizQuestions.length - 1 && !isAnswered}
                  className="flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {currentQuizIdx === quizQuestions.length - 1 ? '查看结果' : '下一题'} <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div className="bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-100 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-sky-600" />
            <span className="text-[10px] font-bold text-sky-700 uppercase tracking-widest">维度: {currentDimension}</span>
          </div>
          <button onClick={generateNewQuiz} disabled={isGenerating} className="flex items-center gap-2 text-[10px] font-bold text-amber-600 hover:text-amber-700 disabled:opacity-50">
            <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} /> 重新生成
          </button>
        </div>
        
        {allAnswered && (
          <div className={`p-4 rounded-xl border ${correctCount === quizQuestions.length ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-center gap-3">
              {correctCount === quizQuestions.length ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              ) : (
                <Target className="w-6 h-6 text-amber-600" />
              )}
              <div>
                <p className="text-sm font-bold text-slate-800">得分: {correctCount}/{quizQuestions.length}</p>
                <p className="text-xs text-slate-500">{correctCount === quizQuestions.length ? '太棒了！全部正确！' : '继续努力！'}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {quizQuestions.map((q, qIdx) => (
            <div key={qIdx} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-7 h-7 bg-sky-500 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">{qIdx + 1}</div>
                <p className="text-sm font-medium text-slate-800 pt-0.5">{q.question}</p>
              </div>
              <div className="grid gap-2 ml-10">
                {q.options.map((opt, optIdx) => {
                  const isSelected = userAnswers[qIdx] === optIdx;
                  const isCorrect = q.correctIndex === optIdx;
                  const showResult = userAnswers[qIdx] !== null;
                  let bgClass = 'bg-white border-slate-200 hover:border-sky-300';
                  if (showResult) {
                    if (isCorrect) bgClass = 'bg-emerald-50 border-emerald-300';
                    else if (isSelected) bgClass = 'bg-rose-50 border-rose-300';
                  } else if (isSelected) {
                    bgClass = 'bg-sky-50 border-sky-300';
                  }
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleAnswer(qIdx, optIdx)}
                      disabled={userAnswers[qIdx] !== null}
                      className={`text-left p-3 rounded-xl border text-sm transition-all ${bgClass} disabled:cursor-default`}
                    >
                      <span className="font-medium text-slate-600 mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                      <span className="text-slate-700">{opt}</span>
                    </button>
                  );
                })}
              </div>
              {userAnswers[qIdx] !== null && (
                <div className="mt-3 ml-10 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs text-blue-700"><strong>解析:</strong> {q.explanation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={() => { setCurrentQuizIdx(0); setIsFullscreen(true); }}
          className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
        >
          <Maximize2 className="w-4 h-4" />
          全屏测试
        </button>
      </div>
    );
  };

  // 信息图表视图
  const InfographicView = () => {
    if (isGenerating) return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">AI 正在生成信息图表...</p>
      </div>
    );
    if (!infographicUrl) return null;
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div className="bg-violet-50 px-3 py-1.5 rounded-xl border border-violet-100 flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-600" />
            <span className="text-[10px] font-bold text-violet-700 uppercase tracking-widest">信息图表</span>
          </div>
          <button onClick={generateNewInfographic} disabled={isGenerating} className="flex items-center gap-2 text-[10px] font-bold text-amber-600 hover:text-amber-700 disabled:opacity-50">
            <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} /> 重新生成
          </button>
        </div>
        <div className="rounded-2xl overflow-hidden border border-violet-100 relative">
          <img src={infographicUrl} alt="信息图表" className="w-full" />
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-lg shadow-md transition-all"
          >
            <Maximize2 className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    );
  };

  // 幻灯片视图
  const SlidesView = ({ isFullscreenMode = false }: { isFullscreenMode?: boolean }) => {
    if (isGenerating && !isFullscreenMode) return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
        <p className="text-xs text-slate-400 font-medium">AI 正在生成幻灯片...</p>
      </div>
    );
    if (slides.length === 0) return null;
    const currentSlide = slides[currentSlideIdx];
    
    // 全屏模式下的布局 - 使用固定容器避免闪烁
    if (isFullscreenMode) {
      return (
        <div className="h-full flex flex-col">
          {/* 幻灯片内容区域 - 固定高度避免重排 */}
          <div className="flex-1 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 border border-orange-100 relative overflow-hidden">
            <div key={currentSlideIdx} className="h-full flex flex-col">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">{currentSlide.title}</h3>
              <ul className="space-y-4 flex-1">
                {(currentSlide.bullets || []).map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-lg text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-orange-400 mt-2.5 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
              {currentSlide.visualPrompt && (
                <div className="mt-6 p-4 bg-white/50 rounded-xl border border-orange-100">
                  <p className="text-sm text-slate-500 italic">💡 {currentSlide.visualPrompt}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* 导航控件 - 固定在底部 */}
          <div className="flex items-center justify-between mt-6 shrink-0">
            <button
              onClick={() => setCurrentSlideIdx(Math.max(0, currentSlideIdx - 1))}
              disabled={currentSlideIdx === 0}
              className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-base font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-5 h-5" /> 上一页
            </button>
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold text-slate-600">{currentSlideIdx + 1} / {slides.length}</span>
              <div className="flex gap-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIdx(idx)}
                    className={`w-3 h-3 rounded-full transition-colors ${idx === currentSlideIdx ? 'bg-orange-500' : 'bg-slate-200 hover:bg-slate-300'}`}
                  />
                ))}
              </div>
            </div>
            <button
              onClick={() => setCurrentSlideIdx(Math.min(slides.length - 1, currentSlideIdx + 1))}
              disabled={currentSlideIdx === slides.length - 1}
              className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-base font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              下一页 <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100 flex items-center gap-2">
            <Layout className="w-4 h-4 text-orange-600" />
            <span className="text-[10px] font-bold text-orange-700 uppercase tracking-widest">
              {currentSlideIdx + 1} / {slides.length}
            </span>
          </div>
          <button onClick={generateNewSlides} disabled={isGenerating} className="flex items-center gap-2 text-[10px] font-bold text-amber-600 hover:text-amber-700 disabled:opacity-50">
            <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} /> 重新生成
          </button>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100 min-h-[300px] relative">
          <h3 className="text-lg font-bold text-slate-800 mb-3">{currentSlide.title}</h3>
          <ul className="space-y-2">
            {(currentSlide.bullets || []).map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
                {point}
              </li>
            ))}
          </ul>
          {currentSlide.visualPrompt && (
            <div className="mt-4 p-3 bg-white/50 rounded-xl border border-orange-100">
              <p className="text-xs text-slate-500 italic">💡 {currentSlide.visualPrompt}</p>
            </div>
          )}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-lg shadow-md transition-all"
          >
            <Maximize2 className="w-4 h-4 text-slate-600" />
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentSlideIdx(Math.max(0, currentSlideIdx - 1))}
            disabled={currentSlideIdx === 0}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> 上一页
          </button>
          <div className="flex gap-1">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIdx(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${idx === currentSlideIdx ? 'bg-orange-500 w-4' : 'bg-slate-200 hover:bg-slate-300'}`}
              />
            ))}
          </div>
          <button
            onClick={() => setCurrentSlideIdx(Math.min(slides.length - 1, currentSlideIdx + 1))}
            disabled={currentSlideIdx === slides.length - 1}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            下一页 <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  // 全屏模态框组件
  const FullscreenModal = ({ children, title, onClose }: { children: React.ReactNode; title: string; onClose: () => void }) => {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl">
          <div className="p-4 border-b flex items-center justify-between shrink-0">
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
    );
  };

  // 获取全屏内容
  const getFullscreenContent = () => {
    switch (activeToolId) {
      case 'tutorial':
        return tutorialData ? (
          <div className="h-full">
            <iframe
              srcDoc={tutorialData.htmlCode}
              className="w-full h-full border-0 rounded-xl"
              sandbox="allow-scripts allow-same-origin"
              title={tutorialData.title}
            />
          </div>
        ) : null;
      case 'flashcards':
        return flashcards.length > 0 ? <FlashcardsView isFullscreenMode={true} /> : null;
      case 'quiz':
        return quizQuestions.length > 0 ? <QuizView isFullscreenMode={true} /> : null;
      case 'slides':
        return slides.length > 0 ? <SlidesView isFullscreenMode={true} /> : null;
      case 'infographic':
        return infographicUrl ? <img src={infographicUrl} alt="信息图表" className="max-w-full max-h-full object-contain mx-auto" /> : null;
      case 'video':
        return videoResult ? (
          <div className="h-full flex flex-col gap-4">
            <video
              src={videoResult.videoUrl}
              controls
              autoPlay
              className="w-full flex-1 rounded-xl bg-black"
            />
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
              <p className="text-sm text-slate-600">{videoResult.script}</p>
            </div>
          </div>
        ) : null;
      default:
        return null;
    }
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
                    {/* 视频详解卡片右上角设置图标 */}
                    {tool.id === 'video' && (
                      <button
                        onClick={e => { e.stopPropagation(); setVideoSettings(s => ({ ...s, showModal: true })); }}
                        className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-emerald-100 rounded-lg shadow transition-all"
                        title="视频设置"
                      >
                        <Settings2 className="w-4 h-4 text-emerald-600" />
                      </button>
                    )}
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
        ) : activeToolId === 'video' ? (
          <VideoView />
        ) : activeToolId === 'game' ? (
          <GameView />
        ) : activeToolId === 'flashcards' ? (
          <FlashcardsView />
        ) : activeToolId === 'quiz' ? (
          <QuizView />
        ) : activeToolId === 'infographic' ? (
          <InfographicView />
        ) : activeToolId === 'slides' ? (
          <SlidesView />
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center gap-4">
            <Settings2 className="w-12 h-12 text-slate-200" />
            <p className="text-xs text-slate-400 uppercase font-black">工具开发中...</p>
          </div>
        )}
      </div>

      {/* 视频设置弹窗（工具卡片也可弹出） */}
      {videoSettings.showModal && (
        <FullscreenModal title="视频生成设置" onClose={() => setVideoSettings(s => ({ ...s, showModal: false }))}>
          <form className="space-y-6 max-w-lg mx-auto">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="voiceOver"
                checked={videoSettings.voiceOver}
                onChange={e => setVideoSettings(s => ({ ...s, voiceOver: e.target.checked }))}
                className="w-5 h-5"
              />
              <label htmlFor="voiceOver" className="text-base font-bold text-slate-700">配画外音</label>
            </div>
            <div>
              <label htmlFor="script" className="block text-base font-bold text-slate-700 mb-2">视频描述脚本</label>
              <textarea
                id="script"
                value={videoSettings.script}
                onChange={e => setVideoSettings(s => ({ ...s, script: e.target.value }))}
                rows={4}
                className="w-full p-2 border rounded-lg"
                placeholder="请输入视频描述或脚本..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setVideoSettings(s => ({ ...s, showModal: false }))} className="px-4 py-2 bg-slate-100 rounded-lg font-bold text-slate-700">取消</button>
              <button type="button" onClick={() => { setVideoSettings(s => ({ ...s, showModal: false })); handleToolClick('video'); }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold">保存并进入视频</button>
            </div>
          </form>
        </FullscreenModal>
      )}

      {/* 全屏模态框 */}
      {isFullscreen && activeTool && (
        <FullscreenModal title={activeTool.name} onClose={() => setIsFullscreen(false)}>
          {getFullscreenContent()}
        </FullscreenModal>
      )}
    </div>
  );
};

export default StudioPanel;
