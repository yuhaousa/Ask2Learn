import React, { useState } from 'react';
import { GraduationCap, LogIn, Eye, EyeOff, X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onLogin: (username: string) => void;
  onClose?: () => void;
}

const CORRECT_PASSWORD = import.meta.env.VITE_APP_PASSWORD || 'ask2learn2024';

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLogin, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('请输入您的姓名');
      return;
    }
    if (!password) {
      setError('请输入访问密码');
      return;
    }
    if (password !== CORRECT_PASSWORD) {
      setError('密码错误，请联系管理员获取访问密码');
      return;
    }

    setLoading(true);
    // Simulate brief loading for UX
    setTimeout(() => {
      setLoading(false);
      onLogin(username.trim());
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 px-8 py-8 text-white text-center relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <div className="flex justify-center mb-3">
            <div className="bg-white/20 p-3 rounded-xl">
              <GraduationCap className="w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-bold">探课 AI</h2>
          <p className="text-amber-100 text-sm mt-1">规模化因材施教平台</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
          <p className="text-slate-500 text-sm text-center">请登录以使用 AI 功能</p>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              姓名 / 昵称
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入您的姓名"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-slate-800 placeholder-slate-400"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              访问密码
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入访问密码"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent text-slate-800 placeholder-slate-400 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                登录
              </>
            )}
          </button>

          <p className="text-center text-xs text-slate-400">
            请向管理员索取访问密码
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
