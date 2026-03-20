
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import LandingPage from './components/LandingPage.tsx';
import StudentView from './components/StudentView.tsx';
import TeacherView from './components/TeacherView.tsx';
import SettingsPanel, { ApiSettings } from './components/SettingsPanel.tsx';
import LoginModal from './components/LoginModal.tsx';
import { geminiService } from './services/geminiService.ts';

const AUTH_KEY = 'ask2learn_auth';

const App: React.FC = () => {
  const [view, setView] = useState<'student' | 'teacher' | 'landing'>('landing');
  const [showSettings, setShowSettings] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pendingView, setPendingView] = useState<'student' | 'teacher' | null>(null);
  const [authUser, setAuthUser] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        const { user } = JSON.parse(stored);
        return user || null;
      }
    } catch {}
    return null;
  });
  const [apiSettings, setApiSettings] = useState<ApiSettings>({
    provider: 'google',
    googleApiKey: import.meta.env.VITE_API_KEY || '',
    bytedanceApiKey: import.meta.env.VITE_BYTEDANCE_API_KEY || '',
    bytedanceBaseUrl: import.meta.env.VITE_BYTEDANCE_BASE_URL || 'https://ark.ap-southeast.bytepluses.com/api/v3',
    bytedanceModelId: import.meta.env.VITE_BYTEDANCE_MODEL_ID || ''
  });

  // 从 localStorage 加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('apiSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setApiSettings(parsed);
        // 同步设置到 geminiService
        geminiService.updateSettings(parsed);
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }
  }, []);

  const handleSaveSettings = (newSettings: ApiSettings) => {
    setApiSettings(newSettings);
    // 更新 geminiService 的设置
    geminiService.updateSettings(newSettings);
    // 更新环境变量（仅用于当前会话）
    if (newSettings.provider === 'google') {
      (window as any).VITE_API_KEY = newSettings.googleApiKey;
    }
  };

  const handleViewChange = (newView: 'student' | 'teacher' | 'landing') => {
    if ((newView === 'student' || newView === 'teacher') && !authUser) {
      setPendingView(newView);
      setShowLogin(true);
      return;
    }
    setView(newView);
  };

  const handleLogin = (username: string) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ user: username, loggedAt: Date.now() }));
    setAuthUser(username);
    setShowLogin(false);
    if (pendingView) {
      setView(pendingView);
      setPendingView(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setAuthUser(null);
    setView('landing');
  };

  return (
    <>
      <Layout 
        activeView={view} 
        onViewChange={handleViewChange}
        onSettingsClick={() => setShowSettings(true)}
        apiProvider={apiSettings.provider}
        authUser={authUser}
        onLoginClick={() => setShowLogin(true)}
        onLogout={handleLogout}
      >
        {view === 'landing' && <LandingPage onStart={handleViewChange} />}
        {view === 'student' && <StudentView />}
        {view === 'teacher' && <TeacherView />}
      </Layout>
      
      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSaveSettings}
        currentSettings={apiSettings}
      />

      <LoginModal
        isOpen={showLogin}
        onLogin={handleLogin}
        onClose={() => { setShowLogin(false); setPendingView(null); }}
      />
    </>
  );
};

export default App;
