
import React from 'react';
import { Database, BookText, FileSpreadsheet, BrainCircuit, PlusCircle, Search, Filter, ChevronRight } from 'lucide-react';
import { BUOYANCY_CHAIN } from '../constants.ts';

const TeacherView: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">备课外脑 (Teaching Brain)</h1>
          <p className="text-slate-500 mt-2">基于“三库一体”架构，自动生成并优化本校专属问题链。</p>
        </div>
        <button className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-amber-200 transition-all flex items-center gap-2">
          <PlusCircle className="w-5 h-5" /> 生成新课件
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: BookText, title: '校本知识库', label: '"方"', desc: '新课标、学科大概念、问题链', color: 'bg-blue-500' },
          { icon: Database, title: '校本资源库', label: '"药"', desc: '试题、课件、实验手册', color: 'bg-green-500' },
          { icon: FileSpreadsheet, title: '校本学情库', label: '"体检报告"', desc: '学生难度分布、得分率统计', color: 'bg-purple-500' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-amber-200 transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className={`${item.color} p-3 rounded-xl text-white shadow-lg`}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded uppercase">已同步</span>
            </div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              {item.title} <span className="text-slate-400 font-normal">({item.label})</span>
            </h3>
            <p className="text-sm text-slate-500 mt-2">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">当前教案：水的浮力</h3>
              <p className="text-xs text-slate-400">浙教版 - 八年级上册 - 第二章</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4">维度</th>
                <th className="px-6 py-4">探究核心问题</th>
                <th className="px-6 py-4">教学资源/支架</th>
                <th className="px-6 py-4">预期学情</th>
                <th className="px-6 py-4">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {BUOYANCY_CHAIN.slice(0, 6).map((q, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-bold px-2 py-1 bg-amber-50 text-amber-600 rounded">
                      {q.dimension}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-800 line-clamp-1">{q.question}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{q.context}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <div className="w-6 h-6 rounded bg-blue-50 flex items-center justify-center text-blue-500 text-[10px] font-bold">PPT</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">
                    {80 - i * 5}%
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-slate-400 hover:text-amber-500 transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherView;
