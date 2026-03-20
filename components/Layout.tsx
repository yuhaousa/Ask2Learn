
import React from 'react';
import { User, Settings, GraduationCap, LayoutDashboard, LogIn, LogOut } from 'lucide-react';
import type { ApiProvider } from './SettingsPanel.tsx';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: 'student' | 'teacher' | 'landing') => void;
  onSettingsClick?: () => void;
  apiProvider?: ApiProvider;
  authUser?: string | null;
  onLoginClick?: () => void;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange, onSettingsClick, apiProvider = 'google', authUser, onLoginClick, onLogout }) => {
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
          <div className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
            {apiProvider === 'google' ? 'Google' : '字节'}
          </div>
          <button 
            onClick={onSettingsClick}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors relative group"
          >
            <Settings className="w-5 h-5 text-slate-500 group-hover:rotate-90 transition-transform" />
          </button>
          {authUser ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
                <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center text-white text-xs font-bold">
                  {authUser.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-amber-700 hidden sm:block">{authUser}</span>
              </div>
              <button
                onClick={onLogout}
                title="退出登录"
                className="p-2 hover:bg-red-50 rounded-full transition-colors group"
              >
                <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-full transition-colors"
            >
              <LogIn className="w-4 h-4" />
              登录
            </button>
          )}
        </div>
      </nav>
      
      <main className="flex-1 w-full max-w-full mx-auto p-4 md:px-10 lg:px-12 overflow-hidden flex flex-col">
        {children}
      </main>

      {activeView === 'landing' && (
        <footer className="bg-white border-t py-8 px-6 text-center text-slate-400 text-sm shrink-0">
          <p>© 2024 探课AI - 规模化因材施教智能体. 浙大计算机创新技术研究院合作项目</p>
        </footer>
      )}
    </div>
  );
};

export default Layout;
