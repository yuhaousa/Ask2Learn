
import React from 'react';
import { Dimension } from '../types';
import { CheckCircle2, Circle } from 'lucide-react';

interface QuestionChainVisProps {
  currentDimension: Dimension;
  completedDimensions: Dimension[];
  onSelectDimension: (d: Dimension) => void;
}

const QuestionChainVis: React.FC<QuestionChainVisProps> = ({ 
  currentDimension, 
  completedDimensions,
  onSelectDimension
}) => {
  const dimensions = Object.values(Dimension);

  return (
    <div className="flex items-center justify-between w-full overflow-x-auto py-6 gap-2 no-scrollbar">
      {dimensions.map((dim, idx) => {
        const isCompleted = completedDimensions.includes(dim);
        const isActive = currentDimension === dim;
        
        return (
          <React.Fragment key={dim}>
            <div 
              onClick={() => onSelectDimension(dim)}
              className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${isActive ? 'scale-110' : 'opacity-70 hover:opacity-100'}`}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2
                ${isActive ? 'bg-amber-500 border-amber-600 text-white shadow-lg' : 
                  isCompleted ? 'bg-green-100 border-green-500 text-green-600' : 'bg-white border-slate-300 text-slate-400'}
              `}>
                {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <span className="font-bold text-xs">{idx + 1}</span>}
              </div>
              <span className={`text-xs font-bold whitespace-nowrap ${isActive ? 'text-amber-600' : 'text-slate-500'}`}>
                {dim}
              </span>
            </div>
            {idx < dimensions.length - 1 && (
              <div className={`h-0.5 flex-1 min-w-[20px] ${isCompleted ? 'bg-green-400' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default QuestionChainVis;
