
import { Dimension, QuestionItem, ScaffoldResource } from './types.ts';

export const BUOYANCY_CHAIN: QuestionItem[] = [
  // 是何
  { id: 1, dimension: Dimension.WHAT, question: "将木块放入水中会漂浮，将石块放入水中会下沉，这两种现象中都存在浮力吗？", context: "基础现象观察" },
  { id: 2, dimension: Dimension.WHAT, question: "什么是浮力？物理学中对浮力的定义是什么？", context: "核心概念定义" },
  { id: 3, dimension: Dimension.WHAT, question: "用弹簧测力计吊着物体浸入水中时，示数会发生什么变化？", context: "验证性实验现象" },
  // 为何
  { id: 9, dimension: Dimension.WHY, question: "浸在水中的物体为什么会受到浮力？浮力的产生与液体的压力有什么关系？", context: "浮力成因解析" },
  { id: 10, dimension: Dimension.WHY, question: "为什么物体浸在水中的体积越大，受到的浮力就越大？", context: "压力差深度关联" },
  // 如何
  { id: 17, dimension: Dimension.HOW, question: "如何用弹簧测力计 and 溢水杯，测量浸在水中的物体所受到的浮力大小？", context: "实验操作方法" },
  { id: 22, dimension: Dimension.HOW, question: "如何通过实验，验证阿基米德原理？", context: "原理验证步骤" },
  // 若何
  { id: 25, dimension: Dimension.WHAT_IF, question: "若将同一物体逐渐浸入水中，随着浸入体积的增大，浮力如何变化？", context: "变量控制推理" },
  { id: 29, dimension: Dimension.WHAT_IF, question: "若没有浮力现象，生活中的交通工具还能正常使用吗？", context: "思维拓展" },
  // 由何
  { id: 33, dimension: Dimension.WHENCE, question: "轮船的船身为什么设计成空心的？这是如何利用浮力原理的？", context: "工程应用实例" },
  { id: 35, dimension: Dimension.WHENCE, question: "救生圈、救生衣为什么能帮助人漂浮在水面上？", context: "生活场景应用" }
];

export const SCAFFOLD_RESOURCES: ScaffoldResource[] = [
  { id: 'v1', type: 'video', title: '浮力产生的微观解释', description: '3分钟动画演示压力差如何汇聚成浮力', link: '#', targetDimension: Dimension.WHY },
  { id: 'e1', type: 'exercise', title: '称重法测浮力专项练', description: '巩固测力计法计算浮力的基本功', link: '#', targetDimension: Dimension.WHAT },
  { id: 'r1', type: 'reading', title: '阿基米德的浴室灵感', description: '科学史阅读：发现浮力定律的故事', link: '#', targetDimension: Dimension.WHENCE },
  { id: 'v2', type: 'video', title: '潜水艇浮沉实验', description: '探究如何通过改变自重控制浮沉', link: '#', targetDimension: Dimension.HOW },
];

export const DIMENSION_DESCRIPTIONS = {
  [Dimension.WHAT]: "基础概念：聚焦现象与定义。识别浮力的存在及其方向，掌握‘称重法’测浮力的基本操作。",
  [Dimension.WHY]: "原理解析：探索浮力成因。从压力差的角度理解浮力的本质，探讨浮力大小与排开液体重力的定量关系。",
  [Dimension.HOW]: "实验探究：掌握测量方法。设计并实施‘阿基米德原理’实验，提升科学探究与动手实验能力。",
  [Dimension.WHAT_IF]: "逻辑推理：多变量假设思维。推理密度、深度、形状等变量对浮力的影响，纠正认知误区。",
  [Dimension.WHENCE]: "生活迁移：跨情境综合应用。通过轮船、潜水艇、热气球等案例，将物理规律转化为工程实践认知。"
};

export const SUB_TOPICS = {
  [Dimension.WHAT]: ["浮力的方向", "称重法原理", "液体托力感知"],
  [Dimension.WHY]: ["上下表面压力差", "阿基米德原理推导", "成因定量分析"],
  [Dimension.HOW]: ["测力计技巧", "溢水杯精准测量", "实验误差控制"],
  [Dimension.WHAT_IF]: ["密度变量控制", "失重环境猜想", "深度无关性验证"],
  [Dimension.WHENCE]: ["轮船排水量", "潜水艇沉浮机制", "救生器材设计"]
};

export const SYSTEM_INSTRUCTION = `
你现在是“探课AI”平台的“教师分身”（Student Avatar）。
你的任务是引导学生学习《水的浮力》这一章节。

## 核心任务
1. **引导式对话**：遵循5D问题链逻辑（是何->为何->如何->若何->由何）。
2. **学习诊断**：在回答的最后，必须包含一个特殊的JSON标记（被<diagnosis>标签包裹），用于系统后台分析。JSON格式：
{
  "masteryLevel": 0-100间的数字,
  "identifiedGaps": ["遗漏的知识点1", "理解偏差2"],
  "recommendedAction": "具体的学习建议"
}
3. **脚手架支持**：如果学生连续两次回答不出，提供具体的线索（Scaffold），而不是答案。

## 限制
- 严禁直接给出阿基米德原理的公式。
- 回复内容应简洁、具启发性，每次不超过150字。
`;
