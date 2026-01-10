
import React, { useState, useEffect, useRef } from 'react';
import { Dimension, ChatMessage, LearningStatus } from '../types.ts';
import { BUOYANCY_CHAIN, DIMENSION_DESCRIPTIONS } from '../constants.ts';
import QuestionChainVis from './QuestionChainVis.tsx';
import KnowledgeMap from './KnowledgeMap.tsx';
import ScaffoldPanel from './ScaffoldPanel.tsx';
import TextbookView from './TextbookView.tsx';
import StudioPanel from './StudioPanel.tsx';
import { 
  Send, 
  Sparkles, 
  ArrowRight, 
  User, 
  GraduationCap, 
  Brain, 
  Map as MapIcon, 
  Target, 
  Book, 
  MessagesSquare, 
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  Library as LibraryIcon
} from 'lucide-react';
import { geminiService } from '../services/geminiService.ts';

type FlowStage = 'library' | 'outline' | 'workbench';

interface Textbook {
  id: string;
  title: string;
  subject: string;
  grade: string;
  cover: string;
  color: string;
  brandColor: string;
}

interface OutlineCategory {
  letter: string;
  title: string;
  color: string;
  topics: { id: string; title: string; active?: boolean }[];
}

const MOCK_BOOKS: Textbook[] = [
  { 
    id: 'sci8', 
    title: '科学 八年级上册', 
    subject: '科学', 
    grade: '八年级上册', 
    color: 'bg-[#2b96d1]', 
    brandColor: '#2b96d1',
    // 使用用户提供的桥梁封面图片（模拟高质量占位符，视觉上与原图一致）
    cover: 'https://images.unsplash.com/photo-1452623668442-c6978aae0628?q=80&w=800&auto=format&fit=crop' 
  },
  { id: 'math8', title: '数学 八年级上册', subject: '数学', grade: '八年级上册', color: 'bg-[#54a32e]', brandColor: '#54a32e', cover: 'https://images.unsplash.com/photo-1509228468518-180dd48a579a?q=80&w=800&auto=format&fit=crop' },
  { id: 'eng8', title: '英语 八年级上册', subject: '英语', grade: '八年级上册', color: 'bg-[#d24627]', brandColor: '#d24627', cover: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop' },
];

const SCIENCE_OUTLINE: OutlineCategory[] = [
  {
    letter: 'A', title: '第1章 对环境的觉察', color: 'text-[#54a32e]',
    topics: [
      { id: '1-1', title: '第1节 感觉世界' },
      { id: '1-2', title: '第2节 声与听觉' },
      { id: '1-3', title: '第3节 声音的特性与应用' },
      { id: '1-4', title: '第4节 光的反射和折射' },
      { id: '1-5', title: '第5节 透镜和视觉' }
    ]
  },
  {
    letter: 'B', title: '第2章 力与空间探索', color: 'text-[#2b96d1]',
    topics: [
      { id: '2-1', title: '第1节 力' },
      { id: '2-2', title: '第2节 运动与相互作用' },
      { id: '2-3', title: '第3节 压强' },
      { id: '2-4', title: '第4节 空间探索' }
    ]
  },
  {
    letter: 'C', title: '第3章 电路探秘', color: 'text-[#d24627]',
    topics: [
      { id: '3-1', title: '第1节 电荷与电流' },
      { id: '3-2', title: '第2节 物质的导电性' },
      { id: '3-3', title: '第3节 电压' },
      { id: '3-4', title: '第4节 欧姆定律及其应用' }
    ]
  },
  {
    letter: 'D', title: '第4章 水与人类', color: 'text-[#6d28d9]',
    topics: [
      { id: '4-1', title: '第1节 人类家园中的水' },
      { id: '4-2', title: '第2节 生活中的水溶液' },
      { id: '4-3', title: '第3节 海洋的探索' },
      { id: '4-4', title: '第4节 水的浮力', active: true },
      { id: '4-5', title: '第5节 水资源的利用和保护' }
    ]
  },
  {
    letter: 'E', title: '第5章 建筑结构与工程', color: 'text-[#0d9488]',
    topics: [
      { id: '5-1', title: '第1节 建筑结构与功能' },
      { id: '5-2', title: '第2节 桥梁的结构与制作' }
    ]
  }
];

const StudentView: React.FC = () => {
  const [flowStage, setFlowStage] = useState<FlowStage>('library');
  const [selectedBook, setSelectedBook] = useState<Textbook | null>(null);
  
  const [currentDimension, setCurrentDimension] = useState<Dimension>(Dimension.WHAT);
  const [completedDimensions, setCompletedDimensions] = useState<Dimension[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastDiagnosis, setLastDiagnosis] = useState<LearningStatus>();
  const [activeTab, setActiveTab] = useState<'map' | 'task'>('task');
  const [qaMode, setQaMode] = useState<'chat' | 'textbook'>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredQuestions = BUOYANCY_CHAIN.filter(q => q.dimension === currentDimension);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  useEffect(() => {
    const introMessage = `你好！我是你的探课助手。我们即将开始对“水的浮力”进行深度探索。\n\n第一个挑战属于【${currentDimension}】维度：\n${filteredQuestions[currentQuestionIdx].question}`;
    setMessages([{ role: 'model', text: introMessage }]);
  }, []);

  useEffect(() => {
    if (scrollRef.current && qaMode === 'chat') {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, qaMode]);

  const handleSend = async (manualText?: string) => {
    const textToSend = manualText || inputText;
    if (!textToSend.trim() || isTyping) return;
    if (!manualText) setInputText('');
    
    if (flowStage !== 'workbench') setFlowStage('workbench');
    const updatedMessages: ChatMessage[] = [...messages, { role: 'user', text: textToSend }];
    setMessages(updatedMessages);
    setIsTyping(true);

    const { text, diagnosis } = await geminiService.getTeacherResponse(
      updatedMessages, 
      filteredQuestions[currentQuestionIdx].question
    );

    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'model', text, analysis: diagnosis }]);
    if (diagnosis) setLastDiagnosis(diagnosis);
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < filteredQuestions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      const nextQ = filteredQuestions[currentQuestionIdx + 1].question;
      setMessages(prev => [...prev, { role: 'model', text: `回答得不错，我们要更进一步了：\n\n${nextQ}` }]);
    } else {
      if (!completedDimensions.includes(currentDimension)) {
        setCompletedDimensions(prev => [...prev, currentDimension]);
      }
      const dims = Object.values(Dimension);
      const nextDimIdx = dims.indexOf(currentDimension) + 1;
      if (nextDimIdx < dims.length) {
        const nextDim = dims[nextDimIdx];
        setCurrentDimension(nextDim);
        setCurrentQuestionIdx(0);
        const nextDimFirstQ = BUOYANCY_CHAIN.find(q => q.dimension === nextDim)?.question;
        setMessages(prev => [...prev, { 
          role: 'model', 
          text: `🎉 太棒了！【${currentDimension}】环节已点亮。接下来进入更具挑战性的【${nextDim}】环节：\n\n${nextDimFirstQ}` 
        }]);
      }
    }
  };

  // 1. 书库阶段
  const renderLibraryStage = () => (
    <div className="flex-1 flex flex-col p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-100 text-sky-700 rounded-lg text-xs font-black tracking-widest uppercase shadow-sm">
            智能教材库
          </div>
          <h1 className="text-5xl font-black text-slate-800 tracking-tight">教材列表</h1>
          <p className="text-slate-500 font-medium text-lg">点击下方封面进入对应的课程大纲，开启你的探究之旅</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {MOCK_BOOKS.map((book) => (
            <div 
              key={book.id}
              onClick={() => { setSelectedBook(book); setFlowStage('outline'); }}
              className="group relative bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer"
            >
              <div className="aspect-[3/4.2] overflow-hidden relative">
                <img src={book.cover} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                
                {/* 仿真封面修饰 (视觉上贴近用户提供的 bridge 封面) */}
                <div className="absolute top-0 left-0 bottom-0 w-20 bg-sky-500/80 backdrop-blur-sm flex flex-col items-center py-8 text-white">
                   <div className="w-12 h-12 rounded-full border-2 border-white/50 flex items-center justify-center mb-6">
                      <GraduationCap className="w-6 h-6" />
                   </div>
                   <div className="[writing-mode:vertical-lr] tracking-[0.3em] font-black text-sm uppercase opacity-90">SCIENCE 8</div>
                </div>

                <div className="absolute top-10 right-10 flex flex-col items-end">
                   <p className="text-[10px] font-black text-white/80 uppercase tracking-widest mb-1">义务教育教科书</p>
                   <h3 className="text-4xl font-black text-white leading-tight drop-shadow-2xl">科学</h3>
                </div>

                <div className="absolute bottom-8 left-24 right-6">
                   <p className="text-sm font-black text-amber-300 mb-1">{book.grade}</p>
                </div>
              </div>
              <div className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                   <h4 className="text-lg font-black text-slate-800">{book.title}</h4>
                   <p className="text-xs font-bold text-slate-400">浙教版标准教材</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <ArrowRight className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 2. IXL 风格大纲阶段
  const renderOutlineStage = () => (
    <div className="flex-1 bg-white p-10 animate-in fade-in duration-500 overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="border-b-2 border-slate-50 pb-10">
           <div className="flex items-center gap-4 text-slate-400 mb-8 uppercase tracking-widest font-black text-xs">
              <button onClick={() => setFlowStage('library')} className="hover:text-sky-600 flex items-center gap-2 transition-colors">
                 <ChevronLeft className="w-4 h-4" /> 返回教材列表
              </button>
           </div>
           <h1 className="text-[56px] font-black text-[#d24627] tracking-tight leading-none mb-6">
              {selectedBook?.grade.replace('八年级', 'Second grade')} science
           </h1>
           <p className="text-slate-600 text-[17px] leading-relaxed max-w-5xl font-medium">
             探课AI 提供了几十项 {selectedBook?.grade} 科学技能供你探索和学习！不确定从哪里开始？去你的 <span className="text-[#2b96d1] hover:underline cursor-pointer font-bold">个性化推荐墙</span> 寻找一个看起来很有趣的技能，或者选择一个符合你教材的学习计划。
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-20 gap-y-16">
          {SCIENCE_OUTLINE.map((cat) => (
            <div key={cat.letter} className="space-y-6">
              <h3 className={`text-[24px] font-black flex items-start gap-3 ${cat.color} leading-tight`}>
                <span className="text-2xl font-serif italic opacity-50">{cat.letter}.</span>
                {cat.title}
              </h3>
              <ul className="space-y-3.5 ml-8">
                {cat.topics.map((topic, idx) => (
                  <li 
                    key={topic.id}
                    onClick={() => topic.active && setFlowStage('workbench')}
                    className={`group flex items-start gap-4 cursor-pointer transition-all ${topic.active ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    <span className="text-[13px] font-black mt-1 opacity-60 w-4">{idx + 1}</span>
                    <span className={`text-[16px] leading-snug font-medium group-hover:underline group-hover:decoration-2 underline-offset-4 ${topic.active ? 'font-bold decoration-amber-500 decoration-2 underline-offset-4' : ''}`}>
                      {topic.title}
                    </span>
                    {topic.active && (
                      <Sparkles className="w-4 h-4 text-amber-500 animate-pulse mt-1 shrink-0" />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 3. 互动工作台
  const renderWorkbench = () => (
    <div className="grid grid-cols-1 lg:grid-cols-[25%_1fr_25%] gap-6 flex-1 overflow-hidden min-h-0 w-full animate-in fade-in duration-500">
      <div className="flex flex-col bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden min-w-0">
        <div className="flex border-b shrink-0">
          <button onClick={() => setActiveTab('task')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 ${activeTab === 'task' ? 'text-amber-600 bg-amber-50/30 border-b-2 border-amber-600' : 'text-slate-400'}`}>
            <Target className="w-4 h-4" /> 任务
          </button>
          <button onClick={() => setActiveTab('map')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 ${activeTab === 'map' ? 'text-amber-600 bg-amber-50/30 border-b-2 border-amber-600' : 'text-slate-400'}`}>
            <MapIcon className="w-4 h-4" /> 地图
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {activeTab === 'map' ? <KnowledgeMap currentDimension={currentDimension} completedDimensions={completedDimensions} onQuestionClick={handleSend} /> : (
            <div className="space-y-6">
              <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-2xl" />
                <p className="text-[10px] font-black text-amber-500 uppercase mb-3 tracking-[0.2em]">探究维度: {currentDimension}</p>
                <p className="text-sm leading-relaxed text-slate-200 mb-4">{DIMENSION_DESCRIPTIONS[currentDimension]}</p>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 border-dashed">
                   <p className="text-sm font-medium italic text-amber-100">“{filteredQuestions[currentQuestionIdx]?.question}”</p>
                </div>
              </div>
              <ScaffoldPanel currentDimension={currentDimension} status={lastDiagnosis} />
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden relative min-h-0 min-w-0">
        <div className="px-6 py-2 border-b bg-slate-50/50 flex items-center shrink-0">
          <div className="flex-1">
            <QuestionChainVis currentDimension={currentDimension} completedDimensions={completedDimensions} onSelectDimension={(d) => { setCurrentDimension(d); setCurrentQuestionIdx(0); }} />
          </div>
        </div>

        {qaMode === 'chat' ? (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/30 custom-scrollbar">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md shrink-0 ${msg.role === 'user' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-amber-400'}`}>
                      {msg.role === 'user' ? <User className="w-5 h-5" /> : <GraduationCap className="w-6 h-6" />}
                    </div>
                    <div className={`p-5 rounded-[1.5rem] shadow-sm ${
                      msg.role === 'user' 
                      ? 'bg-amber-500 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                    }`}>
                      <p className="text-[14px] leading-relaxed font-medium whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                   <div className="w-10 h-10 rounded-2xl bg-slate-200 flex items-center justify-center mr-4">
                      <Brain className="text-slate-400 w-5 h-5" />
                   </div>
                   <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none h-12 w-20 flex items-center justify-center gap-1">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                   </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-white shrink-0">
              <div className="max-w-4xl mx-auto flex items-center gap-4">
                <button 
                  onClick={nextQuestion} 
                  className="shrink-0 px-5 py-3.5 text-xs font-black text-amber-600 border-2 border-amber-100 rounded-2xl hover:bg-amber-50 transition-all flex items-center gap-2"
                >
                  下一题 <ChevronRight className="w-4 h-4" />
                </button>
                <div className="flex-1 relative">
                  <input 
                    value={inputText} 
                    onChange={(e) => setInputText(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
                    className="w-full pl-6 pr-14 py-4 bg-slate-100 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-amber-400" 
                    placeholder="输入你的观察或提问..." 
                  />
                  <button 
                    onClick={() => handleSend()} 
                    disabled={!inputText.trim() || isTyping}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-amber-500 text-white rounded-xl shadow-lg hover:bg-amber-600 disabled:opacity-30 transition-all"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <TextbookView />
          </div>
        )}
      </div>

      <div className="min-h-0 min-w-0">
        <StudioPanel currentDimension={currentDimension} />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-140px)] overflow-hidden w-full">
      <div className="flex items-center justify-between px-2 shrink-0">
        <div className="flex items-center gap-3 text-slate-400 text-xs font-bold uppercase tracking-widest">
          <button onClick={() => setFlowStage('library')} className="hover:text-sky-600 flex items-center gap-1.5 transition-colors">
            <LibraryIcon className="w-4 h-4" /> 教材库
          </button>
          {flowStage !== 'library' && (
            <>
              <ChevronRight className="w-4 h-4 opacity-40" />
              <button onClick={() => setFlowStage('outline')} className="hover:text-sky-600 transition-colors">{selectedBook?.title}</button>
            </>
          )}
          {flowStage === 'workbench' && (
            <>
              <ChevronRight className="w-4 h-4 opacity-40" />
              <span className="text-slate-900 font-black">当前技能：水的浮力</span>
            </>
          )}
        </div>
        
        {flowStage === 'workbench' && (
          <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            <button 
              onClick={() => setQaMode('chat')} 
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${qaMode === 'chat' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <MessagesSquare className="w-4 h-4" /> 互动实验室
            </button>
            <button 
              onClick={() => setQaMode('textbook')} 
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${qaMode === 'textbook' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <Book className="w-4 h-4" /> 查阅教材
            </button>
          </div>
        )}
      </div>

      {flowStage === 'library' && renderLibraryStage()}
      {flowStage === 'outline' && renderOutlineStage()}
      {flowStage === 'workbench' && renderWorkbench()}
    </div>
  );
};

export default StudentView;
