
import React from 'react';
import { Dimension, ScaffoldResource, LearningStatus } from '../types';
import { SCAFFOLD_RESOURCES } from '../constants';
import { PlayCircle, FileText, CheckSquare, Lightbulb, Compass } from 'lucide-react';

interface ScaffoldPanelProps {
  currentDimension: Dimension;
  status?: LearningStatus;
}

const ScaffoldPanel: React.FC<ScaffoldPanelProps> = ({ currentDimension, status }) => {
  // 筛选与当前维度相关的资源，或者基于AI诊断推荐
  const recommendations = SCAFFOLD_RESOURCES.filter(r => r.targetDimension === currentDimension);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-600" /> 智能脚手架推荐
        </h3>
        {status && (
          <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
             <span className="text-[10px] font-bold text-green-700">掌握度: {status.masteryLevel}%</span>
          </div>
        )}
      </div>

      {status?.identifiedGaps && status.identifiedGaps.length > 0 && (
        <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 mb-4">
          <p className="text-[10px] font-bold text-amber-700 uppercase mb-2 flex items-center gap-1">
            <Lightbulb className="w-3 h-3" /> 诊断出薄弱环节：
          </p>
          <div className="flex flex-wrap gap-1">
            {status.identifiedGaps.map((gap, i) => (
              <span key={i} className="text-[10px] bg-white text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                {gap}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {recommendations.length > 0 ? recommendations.map(r => (
          <a 
            href={r.link} 
            key={r.id}
            className="group block p-3 bg-white border border-slate-100 rounded-xl hover:border-amber-300 hover:shadow-sm transition-all"
          >
            <div className="flex gap-3">
              <div className={`p-2 rounded-lg ${
                r.type === 'video' ? 'bg-blue-50 text-blue-500' : 
                r.type === 'exercise' ? 'bg-green-50 text-green-500' : 'bg-purple-50 text-purple-500'
              }`}>
                {r.type === 'video' && <PlayCircle className="w-4 h-4" />}
                {r.type === 'exercise' && <CheckSquare className="w-4 h-4" />}
                {r.type === 'reading' && <FileText className="w-4 h-4" />}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-amber-700 transition-colors">{r.title}</h4>
                <p className="text-[10px] text-slate-400 mt-1">{r.description}</p>
              </div>
            </div>
          </a>
        )) : (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-[10px] text-slate-400">正在根据你的表现匹配资源...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScaffoldPanel;
