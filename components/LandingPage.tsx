
import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Brain, Zap, Target, Layers } from 'lucide-react';

interface LandingPageProps {
  onStart: (view: 'student' | 'teacher') => void;
}

const backgrounds = [
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2500&auto=format&fit=crop", // Modern Classroom
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2500&auto=format&fit=crop", // Collaboration/Learning
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2500&auto=format&fit=crop"  // Tech/Education
];

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [currentBg, setCurrentBg] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-white">
      {/* Sliding Hero Banner Section */}
      <section className="relative h-[75vh] min-h-[600px] w-full overflow-hidden flex items-center justify-center">
        {/* Sliding Background Images */}
        <div className="absolute inset-0 z-0">
          {backgrounds.map((bg, index) => (
            <div
              key={bg}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out bg-cover bg-center ${
                index === currentBg ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url(${bg})` }}
            />
          ))}
          {/* Gradient Overlay for Text Contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/40 to-white z-10" />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center space-y-8 max-w-4xl mx-auto px-4 mt-[-5vh]">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-500 rounded-full text-sm font-bold shadow-lg border border-amber-500/30 animate-pulse backdrop-blur-md">
            <Sparkles className="w-4 h-4" /> 中国第一个规模化因材施教Agent
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight drop-shadow-xl">
            AI 让教育 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              蓬勃生长
            </span>
          </h1>
          <p className="text-xl text-slate-100 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-lg">
            探课AI 致力于解决学校“规模化因材施教”的痛点，通过三库一体架构，打造专属教学智能体。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={() => onStart('student')}
              className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-3 group active:scale-95"
            >
              学生开始探索 <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => onStart('teacher')}
              className="w-full sm:w-auto px-8 py-4 bg-white/20 hover:bg-white/30 text-white border-2 border-white/40 rounded-2xl font-bold text-lg transition-all backdrop-blur-md active:scale-95"
            >
              教师备课入口
            </button>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {backgrounds.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentBg(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentBg ? 'w-8 bg-amber-500' : 'w-2 bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Main Content Sections (Below the banner) */}
      <div className="relative z-20 space-y-24 py-24 px-4 bg-white">
        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { 
              icon: Brain, 
              title: '问题链驱动', 
              desc: '基于“是何、为何、如何、若何、由何”五维引导，激发学生深度思考。' 
            },
            { 
              icon: Zap, 
              title: '双轮驱动模式', 
              desc: '“备课外脑”辅助教学设计，“教师分身”提供高可信度个性化辅导。' 
            },
            { 
              icon: Target, 
              title: '真实全流程数据', 
              desc: '打通校内采集与家庭辅导，基于真实学情实现动态循环进化。' 
            }
          ].map((f, i) => (
            <div key={i} className="bg-slate-50 p-8 rounded-3xl shadow-sm border border-slate-100 hover:border-amber-500/30 hover:bg-white hover:shadow-xl transition-all group">
              <div className="bg-amber-500/10 w-12 h-12 rounded-2xl flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{f.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm font-medium">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* Architecture Visual */}
        <section className="bg-slate-900 rounded-[3rem] p-8 md:p-16 text-white overflow-hidden relative border border-slate-800 max-w-6xl mx-auto">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-bold uppercase tracking-widest">
                产品架构
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">三库一体 核心底座</h2>
              <p className="text-slate-300 leading-relaxed font-medium">
                通过语料库、内容结构化、智能体训练，将校本知识、资源与学情深度融合，形成动态更新的教育AI大脑。
              </p>
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/20 rounded-lg"><Layers className="w-5 h-5 text-amber-500" /></div>
                  <span className="text-sm font-bold text-white uppercase">知识图谱化</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-500/20 rounded-lg"><Brain className="w-5 h-5 text-amber-500" /></div>
                  <span className="text-sm font-bold text-white uppercase">思维模型化</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-3xl border border-white/5 backdrop-blur-sm shadow-2xl relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent pointer-events-none rounded-3xl" />
               <img 
                 src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop" 
                 alt="Tech Education" 
                 className="rounded-2xl opacity-90 w-full h-auto object-cover shadow-inner"
               />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
