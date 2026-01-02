
import React from 'react';
import { BookOpen, User, Settings, GraduationCap, LayoutDashboard } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: 'student' | 'teacher' | 'landing') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <nav className="glass-morphism sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b shrink-0">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onViewChange('landing')}
        >
          <div className="bg-amber-500 p-2 rounded-lg group-hover:rotate-12 transition-transform">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-800">
            探课<span className="text-amber-500">AI</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button 
            onClick={() => onViewChange('student')}
            className={`flex items-center gap-2 transition-colors ${activeView === 'student' ? 'text-amber-600' : 'text-slate-600 hover:text-amber-500'}`}
          >
            <User className="w-4 h-4" /> 教师分身 (学生端)
          </button>
          <button 
            onClick={() => onViewChange('teacher')}
            className={`flex items-center gap-2 transition-colors ${activeView === 'teacher' ? 'text-amber-600' : 'text-slate-600 hover:text-amber-500'}`}
          >
            <LayoutDashboard className="w-4 h-4" /> 备课外脑 (教师端)
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <Settings className="w-5 h-5 text-slate-500" />
          </button>
          <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-amber-200">
            <img src="https://picsum.photos/seed/user/100/100" alt="Avatar" />
          </div>
        </div>
      </nav>
      
      {/* Changed max-w-7xl to max-w-full to utilize the whole screen width */}
      <main className="flex-1 w-full max-w-full mx-auto p-4 md:px-10 lg:px-12 overflow-hidden flex flex-col">
        {children}
      </main>

      {/* Only show footer on landing page to maximize focus on learning/exploration pages */}
      {activeView === 'landing' && (
        <footer className="bg-white border-t py-8 px-6 text-center text-slate-400 text-sm shrink-0">
          <p>© 2024 探课AI - 规模化因材施教智能体. 浙大计算机创新技术研究院合作项目</p>
        </footer>
      )}
    </div>
  );
};

export default Layout;
