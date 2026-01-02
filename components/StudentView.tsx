
import React, { useState, useEffect, useRef } from 'react';
import { Dimension, ChatMessage, LearningStatus } from '../types.ts';
import { BUOYANCY_CHAIN, DIMENSION_DESCRIPTIONS } from '../constants.ts';
import QuestionChainVis from './QuestionChainVis.tsx';
import KnowledgeMap from './KnowledgeMap.tsx';
import ScaffoldPanel from './ScaffoldPanel.tsx';
import TextbookView from './TextbookView.tsx';
import StudioPanel from './StudioPanel.tsx';
import { Send, Sparkles, MessageCircle, ArrowRight, HelpCircle, User, GraduationCap, Brain, Map, Target, Lightbulb, Book, MessagesSquare, ChevronRight } from 'lucide-react';
import { geminiService } from '../services/geminiService.ts';

const StudentView: React.FC = () => {
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
    
    if (qaMode !== 'chat') setQaMode('chat');

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
      } else {
        setMessages(prev => [...prev, { role: 'model', text: "恭喜你！你已经通过 5D 问题链完成了对“水的浮力”的通关学习！你展现出了卓越的科学素养。" }]);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-140px)] overflow-hidden w-full">
      <div className="flex items-center justify-between shrink-0 px-2">
        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
          <span className="hover:text-amber-500 cursor-pointer transition-colors">科学 8年级上册</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 font-bold">水的浮力</span>
        </div>

        <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-sm shrink-0">
          <button 
            onClick={() => setQaMode('chat')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${qaMode === 'chat' ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            <MessagesSquare className="w-4 h-4" /> 交互对话
          </button>
          <button 
            onClick={() => setQaMode('textbook')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${qaMode === 'textbook' ? 'bg-amber-500 text-white shadow-lg shadow-amber-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            <Book className="w-4 h-4" /> 教材参考
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[25%_1fr_25%] gap-6 flex-1 overflow-hidden min-h-0 w-full">
        <div className="flex flex-col bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden min-w-0">
          <div className="flex border-b shrink-0">
            <button 
              onClick={() => setActiveTab('task')}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${activeTab === 'task' ? 'text-amber-600 bg-amber-50/50 border-b-2 border-amber-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Target className="w-4 h-4" /> 探究任务
            </button>
            <button 
              onClick={() => setActiveTab('map')}
              className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${activeTab === 'map' ? 'text-amber-600 bg-amber-50/50 border-b-2 border-amber-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Map className="w-4 h-4" /> 教学大纲
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
            {activeTab === 'map' ? (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <KnowledgeMap 
                  currentDimension={currentDimension} 
                  completedDimensions={completedDimensions} 
                  onQuestionClick={(text) => handleSend(text)}
                />
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl" />
                  <h2 className="text-sm font-bold flex items-center gap-2 mb-4 relative z-10 text-amber-400">
                    <Sparkles className="w-4 h-4" /> 当前挑战
                  </h2>
                  <div className="space-y-4 relative z-10">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">当前维度: {currentDimension}</p>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                        <p className="text-sm leading-relaxed text-slate-200">{DIMENSION_DESCRIPTIONS[currentDimension]}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2">核心探究点</p>
                      <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 border-dashed">
                        <p className="text-sm text-amber-100 leading-relaxed italic font-medium">
                          “{filteredQuestions[currentQuestionIdx]?.question}”
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                  <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <HelpCircle className="w-4 h-4 text-amber-500" /> 解惑锦囊
                  </h3>
                  <div className="space-y-3">
                    {[
                      '尝试观察物体的排水情况',
                      '考虑浮力方向与重力的关系',
                      '回想称重法测力的基本步骤'
                    ].map((tip, i) => (
                      <div key={i} className="flex gap-3 items-start group">
                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 group-hover:scale-125 transition-transform" />
                        <span className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors leading-relaxed font-medium">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-1">
                  <ScaffoldPanel currentDimension={currentDimension} status={lastDiagnosis} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative min-h-0 min-w-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50/50 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
          
          <div className="px-6 py-3 border-b bg-slate-50/50 flex items-center justify-between gap-6 shrink-0">
            <div className="flex-1 overflow-hidden">
              <QuestionChainVis 
                currentDimension={currentDimension} 
                completedDimensions={completedDimensions}
                onSelectDimension={(d) => {
                  setCurrentDimension(d);
                  setCurrentQuestionIdx(0);
                }}
              />
            </div>
          </div>

          {qaMode === 'chat' ? (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/30 animate-in fade-in slide-in-from-bottom-2 duration-300 custom-scrollbar">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-4 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center shadow-md transition-transform hover:scale-105 ${msg.role === 'user' ? 'bg-amber-500' : 'bg-slate-800'}`}>
                        {msg.role === 'user' ? <User className="text-white w-4 h-4" /> : <GraduationCap className="text-amber-400 w-5 h-5" />}
                      </div>
                      <div className={`p-4 rounded-2xl ${
                        msg.role === 'user' 
                        ? 'bg-amber-500 text-white rounded-tr-none shadow-amber-100 shadow-xl' 
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-md leading-relaxed'
                      }`}>
                        <p className="whitespace-pre-wrap text-[13px] leading-relaxed font-medium">{msg.text}</p>
                        
                        {msg.role === 'model' && msg.analysis && i === messages.length - 1 && (
                          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-[10px] text-amber-600 font-bold">
                            <Lightbulb className="w-3 h-3" /> 建议：{msg.analysis.recommendedAction}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex gap-4">
                      <div className="w-9 h-9 rounded-xl bg-slate-200 flex items-center justify-center animate-pulse shadow-sm">
                        <Brain className="text-slate-400 w-4 h-4" />
                      </div>
                      <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-sm">
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-5 border-t bg-white relative z-10 shrink-0">
                <div className="max-w-4xl mx-auto flex items-center gap-3">
                  <button 
                    onClick={nextQuestion}
                    className="flex-shrink-0 px-4 py-3 text-xs font-bold text-amber-600 border-2 border-amber-100 hover:bg-amber-50 active:scale-95 transition-all flex items-center gap-2 rounded-2xl"
                  >
                    下一题 <ArrowRight className="w-4 h-4" />
                  </button>
                  <div className="flex-1 relative group">
                    <input 
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="在此输入你的回答、疑问或对实验的观察..."
                      className="w-full pl-5 pr-12 py-3.5 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-amber-400 text-[13px] transition-all group-hover:bg-slate-200/50 shadow-inner font-medium"
                    />
                    <button 
                      onClick={() => handleSend()}
                      disabled={!inputText.trim() || isTyping}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-30 disabled:hover:bg-amber-500 transition-all shadow-lg shadow-amber-100 active:scale-90"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto bg-slate-100/50 custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-300">
              <TextbookView />
            </div>
          )}
        </div>

        <div className="overflow-hidden min-h-0 min-w-0">
          <StudioPanel currentDimension={currentDimension} />
        </div>
      </div>
    </div>
  );
};

export default StudentView;
