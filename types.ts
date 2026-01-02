
export enum Dimension {
  WHAT = '是何',
  WHY = '为何',
  HOW = '如何',
  WHAT_IF = '若何',
  WHENCE = '由何'
}

export interface QuestionItem {
  id: number;
  dimension: Dimension;
  question: string;
  context: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  analysis?: LearningStatus; // AI 隐藏的诊断分析
}

export interface LearningStatus {
  masteryLevel: number; // 0-100
  identifiedGaps: string[];
  recommendedAction: string;
}

export interface ScaffoldResource {
  id: string;
  type: 'video' | 'exercise' | 'reading';
  title: string;
  description: string;
  link: string;
  targetDimension: Dimension;
}

export interface KnowledgeNode {
  id: string;
  label: string;
  dimension: Dimension;
  status: 'locked' | 'active' | 'completed';
}

export interface AppState {
  view: 'student' | 'teacher' | 'landing';
  currentDimension: Dimension;
  completedQuestions: number[];
}
