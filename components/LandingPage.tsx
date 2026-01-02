
import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Brain, Zap, Target, Layers } from 'lucide-react';

interface LandingPageProps {
  onStart: (view: 'student' | 'teacher') => void;
}

const backgrounds = [
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2500&auto=format&fit=crop", // Modern Classroom
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2500&auto=format&fit=crop", // Tech Lab
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2500&auto=format&fit=crop"  // Collaborative Learning
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
      {/* Refined Sliding Hero Banner Section */}
      <section className="relative h-[65vh] min-h-[550px] w-full overflow-hidden flex items-center justify-center">
        {/* Sliding Background Container */}
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
          {/* Multi-stage Overlay: Dark for top contrast, fades to white at bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-white z-10" />
        </div>

        {/* Hero Banner Content */}
        <div className="relative z-20 text-center space-y-8 max-w-4xl mx-auto px-4 mt-[-4vh]">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 text-amber-500 rounded-full text-xs md:text-sm font-bold shadow-lg border border-amber-500/30 animate-pulse backdrop-blur-md">
            <Sparkles className="w-4 h-4" /> 中国第一个规模化因材施教Agent
          </div>
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-white leading-tight drop-shadow-2xl">
            AI 让教育 <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
              蓬勃生长
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-100 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-lg opacity-90">
            探课AI 致力于解决学校“规模化因材施教”的痛点，通过三库一体架构，打造专属教学智能体。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={() => onStart('student')}
              className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-amber-500/30 transition-all flex items-center justify-center gap-3 group active:scale-95"
            >
              学生开始探索 <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => onStart('teacher')}
              className="w-full sm:w-auto px-8 py-4 bg-white/20 hover:bg-white/30 text-white border-2 border-white/40 rounded-2xl font-bold text-lg transition-all backdrop-blur-md active:scale-95 shadow-lg"
            >
              教师备课入口
            </button>
          </div>
        </div>

        {/* Slide Navigation Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {backgrounds.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentBg(i)}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === currentBg ? 'w-10 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Main Page Content (White Background) */}
      <div className="relative z-20 space-y-28 py-20 px-4 bg-white">
        {/* Core Methodology Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            { 
              icon: Brain, 
              title: '问题链驱动', 
              desc: '基于“是何、为何、如何、若何、由何”五维引导，激发学生深度思考与科学探究。' 
            },
            { 
              icon: Zap, 
              title: '双轮驱动模式', 
              desc: '“备课外脑”辅助教师高效备课，“教师分身”为每个学生提供个性化、高品质辅导。' 
            },
            { 
              icon: Target, 
              title: '全链路闭环数据', 
              desc: '实时追踪学习进度，动态调整教学策略，基于真实表现实现“一生一案”。' 
            }
          ].map((f, i) => (
            <div key={i} className="bg-slate-50 p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:border-amber-500/40 hover:bg-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="bg-amber-500/10 w-14 h-14 rounded-2xl flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
                <f.icon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">{f.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm font-medium">{f.desc}</p>
            </div>
          ))}
        </section>

        {/* Technical Architecture Overview */}
        <section className="bg-slate-900 rounded-[3.5rem] p-8 md:p-16 text-white overflow-hidden relative border border-slate-800 max-w-6xl mx-auto shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full -mr-48 -mt-48" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-block px-4 py-1.5 bg-amber-500/20 text-amber-400 rounded-xl text-xs font-bold uppercase tracking-widest border border-amber-500/30">
                AI 核心能力
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                三库一体 <br />
                <span className="text-amber-500">智能教学底座</span>
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed font-medium">
                深度融合语料库、内容结构化与智能体训练，将校本特有的教学资源与学生真实学情转化为可进化的 AI 大脑。
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="space-y-3">
                  <div className="p-3 bg-amber-500/10 w-fit rounded-xl border border-amber-500/20">
                    <Layers className="w-6 h-6 text-amber-500" />
                  </div>
                  <h4 className="font-bold text-white">知识结构化</h4>
                  <p className="text-xs text-slate-400">将教材与考纲转化为机器可理解的知识图谱。</p>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-amber-500/10 w-fit rounded-xl border border-amber-500/20">
                    <Brain className="w-6 h-6 text-amber-500" />
                  </div>
                  <h4 className="font-bold text-white">思维模型化</h4>
                  <p className="text-xs text-slate-400">模拟特级教师思维路径，提供高可信引导。</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-sm shadow-inner relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 to-transparent pointer-events-none" />
              <img 
                src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop" 
                alt="AI Platform Interface" 
                className="rounded-2xl opacity-80 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-700 w-full h-auto object-cover shadow-2xl"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
