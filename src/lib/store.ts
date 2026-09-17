import type { ChapterRecord, GuestbookEntry } from '../types/game';

// 本地持久化层 —— 对应参考站的 localStorage 成绩记录与社区留言，
// 本地版改为：成绩存本机、留言存本机，另提供“成绩分享文本”复制功能。

const RECORDS_KEY = 'bio-trail-records-v1';
const GUESTBOOK_KEY = 'bio-trail-guestbook-v1';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadRecords(): Record<string, ChapterRecord> {
  return read<Record<string, ChapterRecord>>(RECORDS_KEY, {});
}

// 保存本章成绩：与历史最佳比较，首次答对数更多者留作最佳记录
export function saveRecord(chapterId: string, marks: string): { record: ChapterRecord; isBest: boolean } {
  const records = loadRecords();
  const prev = records[chapterId];
  const firstCount = (s: string) => (s.match(/f/g) || []).length;
  const isBest = !prev || firstCount(marks) > firstCount(prev.marks);
  const record: ChapterRecord = isBest
    ? {
        chapterId,
        runId: crypto.randomUUID().slice(0, 8),
        completedAt: new Date().toISOString(),
        marks,
        attempts: (prev?.attempts ?? 0) + 1,
      }
    : { ...prev, attempts: prev.attempts + 1 };
  records[chapterId] = record;
  write(RECORDS_KEY, records);
  return { record, isBest };
}

export function clearRecords(): void {
  try {
    localStorage.removeItem(RECORDS_KEY);
  } catch {
    /* ignore */
  }
}

export function loadGuestbook(): GuestbookEntry[] {
  const list = read<GuestbookEntry[]>(GUESTBOOK_KEY, []);
  return Array.isArray(list) ? list : [];
}

export function addGuestbookEntry(input: Omit<GuestbookEntry, 'id' | 'createdAt'>): GuestbookEntry | null {
  const entry: GuestbookEntry = {
    ...input,
    id: crypto.randomUUID().slice(0, 8),
    createdAt: new Date().toISOString(),
  };
  const list = loadGuestbook();
  list.unshift(entry);
  if (write(GUESTBOOK_KEY, list.slice(0, 200))) return entry;
  return null;
}

export function removeGuestbookEntry(id: string): void {
  write(
    GUESTBOOK_KEY,
    loadGuestbook().filter((e) => e.id !== id),
  );
}

// 校验规则与参考站一致：昵称 ≤24 字且不含换行，留言 ≤500 字，评分 1-5 或空
export function validateEntry(nickname: string, comment: string, rating: number | null): string | null {
  if (!nickname || nickname.length > 24 || /[\r\n\t]/.test(nickname)) return '昵称必填、不超过 24 字，且不能换行。';
  if (!comment || comment.length > 500) return '留言必填，不超过 500 字。';
  if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) return '评分须为 1–5 星。';
  return null;
}

// 成绩分享文本：对应参考站“上报成绩到 GitHub issue”的动作，本地版生成可复制文本
export function buildShareText(chapterTitle: string, marks: string, nickname: string): string {
  const f = (marks.match(/f/g) || []).length;
  const total = marks.length;
  const seq = marks
    .split('')
    .map((m) => (m === 'f' ? '首次答对' : m === 'r' ? '改正后答对' : '借助线索答对'))
    .join(' / ');
  return `我完成了《${chapterTitle}》（生物学发现侦探）：首次答对 ${f}/${total}。逐题：${seq}。——${nickname || '匿名侦探'}`;
}
