import React, { useState, useEffect } from 'react';
import { Settings, Check, X } from 'lucide-react';

export type ApiProvider = 'google' | 'bytedance';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: ApiSettings) => void;
  currentSettings: ApiSettings;
}

export interface ApiSettings {
  provider: ApiProvider;
  googleApiKey: string;
  bytedanceApiKey: string;
  bytedanceBaseUrl: string;
  bytedanceModelId: string;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, onSave, currentSettings }) => {
  const [settings, setSettings] = useState<ApiSettings>(currentSettings);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings]);

  const handleSave = () => {
    // 保存到 localStorage
    localStorage.setItem('apiSettings', JSON.stringify(settings));
    onSave(settings);
    onClose();
  };

  const handleTest = async () => {
    setTestStatus('testing');
    try {
      // 简单测试，检查密钥是否存在
      if (settings.provider === 'google' && settings.googleApiKey) {
        setTestStatus('success');
      } else if (settings.provider === 'bytedance' && settings.bytedanceApiKey && settings.bytedanceBaseUrl) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
      }
    } catch (error) {
      setTestStatus('error');
    }
    setTimeout(() => setTestStatus('idle'), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-6 rounded-t-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-7 h-7" />
            <h2 className="text-2xl font-black">系统设置</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-8 space-y-8">
          {/* API 提供商选择 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">API 提供商</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSettings({ ...settings, provider: 'google' })}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  settings.provider === 'google'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-lg mb-1">Google Gemini</div>
                <div className="text-xs text-slate-500">强大的多模态AI</div>
              </button>
              <button
                onClick={() => setSettings({ ...settings, provider: 'bytedance' })}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  settings.provider === 'bytedance'
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-lg mb-1">字节豆包</div>
                <div className="text-xs text-slate-500">Doubao/Seedance</div>
              </button>
            </div>
          </div>

          {/* Google API 配置 */}
          {settings.provider === 'google' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Google API Key</label>
                <input
                  type="password"
                  value={settings.googleApiKey}
                  onChange={(e) => setSettings({ ...settings, googleApiKey: e.target.value })}
                  placeholder="输入你的 Google Gemini API Key"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
                />
                <p className="text-xs text-slate-500 mt-2">
                  获取地址：<a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Google AI Studio</a>
                </p>
              </div>
            </div>
          )}

          {/* 字节 API 配置 */}
          {settings.provider === 'bytedance' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">BytePlus API Key</label>
                <input
                  type="password"
                  value={settings.bytedanceApiKey}
                  onChange={(e) => setSettings({ ...settings, bytedanceApiKey: e.target.value })}
                  placeholder="输入你的 BytePlus API Key"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
                />
                <p className="text-xs text-slate-500 mt-2">
                  获取地址：<a href="https://console.byteplus.com/" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">BytePlus 控制台</a>
                  <br />
                  <span className="text-amber-600">⚠️ 示例密钥（09fd8cff...）无法使用，请使用您自己的密钥</span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">API Base URL</label>
                <input
                  type="text"
                  value={settings.bytedanceBaseUrl}
                  onChange={(e) => setSettings({ ...settings, bytedanceBaseUrl: e.target.value })}
                  placeholder="https://ark.ap-southeast.bytepluses.com/api/v3"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
                />
                <p className="text-xs text-slate-500 mt-2">
                  获取地址：<a href="https://console.volcengine.com/ark" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">火山引擎控制台</a>
                </p>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">模型端点 ID (Endpoint ID)</label>
                <input
                  type="text"
                  value={settings.bytedanceModelId}
                  onChange={(e) => setSettings({ ...settings, bytedanceModelId: e.target.value })}
                  placeholder="ep-xxxxxxxx-xxxx"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-orange-500 focus:outline-none transition-all"
                />
                <p className="text-xs text-slate-500 mt-2">
                  在火山引擎 ARK 控制台中，进入"在线推理 - 接入点"页面获取端点ID
                  <br />
                  <span className="text-slate-600">例如：ep-20250110112532-nwfj4</span>
                </p>
              </div>
            </div>
          )}

          {/* 测试状态 */}
          {testStatus !== 'idle' && (
            <div className={`p-4 rounded-xl ${
              testStatus === 'success' ? 'bg-emerald-50 text-emerald-700' :
              testStatus === 'error' ? 'bg-rose-50 text-rose-700' :
              'bg-blue-50 text-blue-700'
            }`}>
              {testStatus === 'testing' && '正在测试连接...'}
              {testStatus === 'success' && '✓ 配置有效'}
              {testStatus === 'error' && '✗ 配置无效，请检查'}
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="sticky bottom-0 bg-slate-50 p-6 rounded-b-3xl flex gap-3">
          <button
            onClick={handleTest}
            className="flex-1 py-3 px-6 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all"
          >
            测试连接
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
          >
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
