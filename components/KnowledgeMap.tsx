
import React from 'react';
import { Dimension } from '../types';
import { DIMENSION_DESCRIPTIONS, SUB_TOPICS, BUOYANCY_CHAIN } from '../constants';
import { 
  MessageCircle, 
  CheckCircle2, 
  Sparkles,
  MousePointer2
} from 'lucide-react';

interface KnowledgeMapProps {
  currentDimension: Dimension;
  completedDimensions: Dimension[];
  onQuestionClick?: (questionText: string) => void;
}

const KnowledgeMap: React.FC<KnowledgeMapProps> = ({ 
  currentDimension, 
  completedDimensions,
  onQuestionClick 
}) => {
  const dimensions = Object.values(Dimension);

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500 pb-4">
      {/* 顶部简易进度提示 */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 shadow-lg mb-2 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">教学路径探索</p>
            <h3 className="text-white font-black text-xs uppercase italic">5D Buoyancy Chain</h3>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-amber-500">{completedDimensions.length}</span>
            <span className="text-[10px] text-slate-500 font-bold"> / {dimensions.length}</span>
          </div>
        </div>
      </div>

      {/* 全展开的维度列表 */}
      <div className="space-y-4">
        {dimensions.map((dim, dimIdx) => {
          const isActive = currentDimension === dim;
          const isCompleted = completedDimensions.includes(dim);
          const dimQuestions = BUOYANCY_CHAIN.filter(q => q.dimension === dim);
          const topics = SUB_TOPICS[dim] || [];

          return (
            <div 
              key={dim} 
              className={`transition-all duration-300 ${isActive ? 'scale-[1.01]' : 'opacity-90'}`}
            >
              <div className={`
                p-4 rounded-[1.5rem] border transition-all
                ${isActive ? 'bg-white border-amber-200 shadow-md' : 'bg-slate-50/50 border-slate-100'}
              `}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`
                      w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black
                      ${isActive ? 'bg-amber-500 text-white shadow-sm' : isCompleted ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'}
                    `}>
                      {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : dimIdx + 1}
                    </div>
                    <h4 className={`text-[11px] font-black ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>
                      【{dim}】维度
                    </h4>
                  </div>
                  {isActive && <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />}
                </div>

                {/* 问题列表 - 点击直接触发对话 */}
                <div className="space-y-1.5">
                  {dimQuestions.map((q, qIdx) => (
                    <button 
                      key={q.id} 
                      onClick={() => onQuestionClick?.(q.question)}
                      className={`
                        w-full text-left p-2.5 rounded-xl border text-[10px] leading-relaxed font-bold flex gap-2 group transition-all
                        ${isActive 
                          ? 'bg-amber-50/50 border-amber-100 text-slate-700 hover:bg-amber-100 hover:border-amber-200' 
                          : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600'}
                      `}
                    >
                      <div className="shrink-0 flex items-center h-full">
                        <MessageCircle className={`w-3 h-3 ${isActive ? 'text-amber-500' : 'text-slate-300'}`} />
                      </div>
                      <p className="flex-1">{q.question}</p>
                      <MousePointer2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-amber-500 shrink-0 self-center" />
                    </button>
                  ))}
                </div>

                {/* 底部微型概念标签 */}
                <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-slate-100/50">
                  {topics.map((topic, tIdx) => (
                    <span 
                      key={tIdx} 
                      className="px-1.5 py-0.5 bg-slate-100 text-slate-400 text-[8px] font-black uppercase rounded"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KnowledgeMap;
