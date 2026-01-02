
import React from 'react';
import { Bookmark, HelpCircle, Info, Target } from 'lucide-react';

const TextbookView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-12 bg-white min-h-full shadow-inner space-y-12">
      {/* Chapter Header */}
      <div className="relative border-b-2 border-sky-100 pb-8">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <img src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=2070&auto=format&fit=crop" alt="Water Background" className="w-64 h-64 object-cover" />
        </div>
        <div className="flex items-center gap-6">
          <div className="bg-sky-500 text-white px-6 py-2 rounded-2xl font-bold text-2xl shadow-lg shadow-sky-100">
            第 4 节
          </div>
          <h1 className="text-5xl font-extrabold text-slate-800 tracking-tight">水的浮力</h1>
        </div>
      </div>

      {/* Intro Section with Aircraft Carrier */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <p className="text-lg leading-relaxed text-slate-700 indent-8">
            我国第一艘自主设计、自主建造的航空母舰<span className="font-bold text-slate-900 underline decoration-sky-500 decoration-2 underline-offset-4">“山东舰”</span>，舰长超过300米，甲板面积达到3个足球场那么大。
          </p>
          <p className="text-lg leading-relaxed text-slate-700 indent-8">
            这艘又大又重的航空母舰能够在海洋中破浪前行，还能承载多达36架的舰载机和其他舰载武器设备，而一枚铁钉放入水中却会下沉，这是什么原因？
          </p>
        </div>
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-sky-400 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <img 
            src="https://images.unsplash.com/photo-1547043736-b2247cb34b01?q=80&w=2070&auto=format&fit=crop" 
            alt="Shandong Carrier Aircraft Carrier" 
            className="relative rounded-2xl shadow-2xl border-4 border-white aspect-video object-cover w-full h-full min-h-[220px]" 
          />
          <div className="mt-2 text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">山东舰航空母舰</span>
          </div>
        </div>
      </div>

      {/* Main Buoyancy Concept */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-sky-600 flex items-center gap-3">
          <span className="w-1.5 h-8 bg-sky-500 rounded-full" /> 一、浮力
        </h2>
        
        <p className="text-lg leading-relaxed text-slate-700 indent-8">
          泳池中游泳的运动员、湖中游弋的游船、海洋中漂浮的冰山，都受到自身重力的作用，但它们并没有因此沉入水中，这是因为水产生了<span className="font-bold text-sky-600 border-b-2 border-sky-200">向上的托力</span>，托住了它们。
        </p>

        <div className="bg-sky-50 border-l-8 border-sky-400 p-8 rounded-r-3xl shadow-sm relative overflow-hidden">
          <div className="absolute top-2 right-4 opacity-10">
            <Bookmark className="w-12 h-12 text-sky-600" />
          </div>
          <p className="text-xl leading-relaxed text-slate-800">
            浸在水中的物体受到向上的力，这个力叫做<span className="font-extrabold text-sky-700 text-2xl mx-1">浮力</span>
            <span className="text-sky-600 font-medium ml-2">(buoyancy)</span>。
          </p>
        </div>
      </div>

      {/* Balloon Experiment Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start py-8">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-slate-50">
          <img 
            src="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=2070&auto=format&fit=crop" 
            alt="Buoyancy Exp" 
            className="w-full aspect-square object-cover" 
          />
          <div className="absolute bottom-0 inset-x-0 bg-slate-900/60 backdrop-blur-sm p-4 text-center">
            <span className="text-white text-sm font-bold">图 4.4-1 手按气球入水</span>
          </div>
        </div>
        <div className="space-y-6 py-4">
          <div className="flex items-center gap-3 text-sky-500">
            <Info className="w-6 h-6" />
            <h4 className="font-bold text-xl">感官体验</h4>
          </div>
          <p className="text-lg leading-relaxed text-slate-700">
            我们可以用一只气球来感受浮力的作用。如图 4.4-1 所示，把气球按入水中，可以感觉到水对气球的浮力。
          </p>
          <p className="text-lg leading-relaxed text-slate-700">
            气球浸入水中的体积越大，手往下用力也越大，说明气球受到的浮力也越大。
          </p>
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
             <HelpCircle className="w-6 h-6 text-amber-500 shrink-0" />
             <p className="text-amber-800 font-bold italic leading-relaxed">
               浮在水面的物体受到水的浮力，那么，在水中下沉的物体（如石块、铁钉）也受到水的浮力吗？
             </p>
          </div>
        </div>
      </div>

      {/* Exploration Activity footer */}
      <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-10 mt-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-green-500 p-3 rounded-2xl text-white shadow-lg shadow-green-100">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">探索活动</h3>
        </div>
        <div className="space-y-6 pl-2">
          <div className="flex gap-6 items-start">
            <span className="w-8 h-8 rounded-full bg-white border-2 border-green-200 flex items-center justify-center font-bold text-green-600 shrink-0 shadow-sm">1</span>
            <p className="text-lg text-slate-700 pt-1">
              如图 4.4-2 甲所示，在弹簧测力计下悬挂一块圆柱体铝块，观察弹簧测力计的示数。
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pt-8 border-t border-slate-100">
        <p className="text-slate-300 text-xs font-medium uppercase tracking-[0.2em]">170 | 科学 八年级上册</p>
      </div>
    </div>
  );
};

export default TextbookView;
