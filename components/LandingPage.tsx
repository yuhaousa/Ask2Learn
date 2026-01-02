
import React from 'react';
import { Sparkles, ArrowRight, Brain, Zap, Target, Layers } from 'lucide-react';

interface LandingPageProps {
  onStart: (view: 'student' | 'teacher') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="space-y-20 py-10">
      {/* Hero Section */}
      <section className="text-center space-y-8 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-bold shadow-sm border border-amber-200 animate-bounce">
          <Sparkles className="w-4 h-4" /> 中国第一个规模化因材施教Agent
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight">
          AI 让教育 <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
            蓬勃生长
          </span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          探课AI 致力于解决学校“规模化因材施教”的痛点，通过三库一体架构，打造专属教学智能体。
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button 
            onClick={() => onStart('student')}
            className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-amber-200 transition-all flex items-center justify-center gap-3 group"
          >
            学生开始探索 <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => onStart('teacher')}
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 rounded-2xl font-bold text-lg transition-all"
          >
            教师备课入口
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
          <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
            <div className="bg-amber-100 w-12 h-12 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
              <f.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">{f.title}</h3>
            <p className="text-slate-500 leading-relaxed text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Architecture Visual */}
      <section className="bg-slate-900 rounded-[3rem] p-8 md:p-16 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-bold uppercase tracking-widest">
              产品架构
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">三库一体 核心底座</h2>
            <p className="text-slate-400 leading-relaxed">
              通过语料库、内容结构化、智能体训练，将校本知识、资源与学情深度融合，形成动态更新的教育AI大脑。
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium">知识图谱化</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium">思维模型化</span>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 backdrop-blur-sm">
             <img 
               src="https://picsum.photos/seed/edu/800/600" 
               alt="Architecture" 
               className="rounded-xl opacity-80"
             />
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
