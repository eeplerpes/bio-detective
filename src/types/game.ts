// 游戏数据结构 —— 参考 socrates-question 的章节/短页/推理点模型

export interface QuizOption {
  id: string; // 'a' | 'b' | 'c'
  label: string;
  explanation: string; // 针对该选项的反馈：正确项说明为什么对，错误项指出漏掉了什么条件
}

export interface Quiz {
  prompt: string;
  options: QuizOption[];
  answerId: string;
  reason: string; // 答对后的总结陈词（这一问教会我们的方法）
}

export interface Clue {
  title: string;
  text: string;
}

export interface Reveal {
  title: string;
  text: string;
}

export type PageKind = 'story' | 'quiz';

export interface StoryPage {
  id: string;
  kind: PageKind;
  title: string;
  caption: string; // 叙事正文
  visual?: { icon: string; label: string }; // 简单图解（图标 + 说明）
  clue?: Clue; // 线索卡：答题前可主动查看，查看后答对记为“借助线索”
  keyQuestion?: string; // 本页悬置的关键问题
  quiz?: Quiz; // kind === 'quiz' 时存在
  reveal?: Reveal; // 答对后揭示
}

export interface Chapter {
  id: string;
  order: number;
  title: string; // 章节名，如《发霉的培养皿》
  subtitle: string; // 一句话钩子
  era: string; // 年代与地点
  icon: string; // emoji
  theme: string; // 本章训练的思维方法
  intro: string; // 章节导语
  pages: StoryPage[];
  closing: string; // 章节结语
  sourcesNote: string; // 史实依据说明
}

// 单题结果：f = 首次答对，r = 改正后答对，h = 借助线索答对（与参考站 marks 编码一致）
export type Mark = 'f' | 'r' | 'h';

export interface ChapterRecord {
  chapterId: string;
  runId: string;
  completedAt: string; // ISO
  marks: string; // 如 "frfh"
  attempts: number; // 本章累计完成次数
}

export interface GuestbookEntry {
  id: string;
  chapterId: string; // 章节 id 或 'all'
  nickname: string; // ≤24 字，不可含换行
  comment: string; // ≤500 字
  rating: number | null; // 1-5 星，可选
  createdAt: string; // ISO
}

export function countMarks(marks: string) {
  const c = { f: 0, r: 0, h: 0 };
  for (const m of marks) {
    if (m === 'f') c.f++;
    else if (m === 'r') c.r++;
    else if (m === 'h') c.h++;
  }
  return c;
}
