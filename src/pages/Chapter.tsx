import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import QuizCard from '../components/game/QuizCard';
import { chapterMap, quizCount } from '../data/chapters';
import { buildShareText, loadRecords, saveRecord } from '../lib/store';
import { countMarks, type Mark } from '../types/game';

const MARK_LABEL: Record<string, string> = { f: '首次答对', r: '改正后答对', h: '借助线索' };
const MARK_STYLE: Record<string, string> = {
  f: 'bg-[#2f5d43] text-white',
  r: 'bg-[#c9a24b] text-white',
  h: 'bg-[#7d9bb3] text-white',
};

export default function Chapter() {
  const { id } = useParams();
  const navigate = useNavigate();
  const chapter = id ? chapterMap[id] : undefined;
  const [pageIdx, setPageIdx] = useState(0);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [finished, setFinished] = useState(false);
  const [recordSaved, setRecordSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalQuiz = useMemo(() => (chapter ? quizCount(chapter) : 0), [chapter]);

  if (!chapter) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center">
        <p className="text-lg">没有找到这一章。</p>
        <Link to="/" className="mt-4 inline-block text-[#2f5d43] underline">
          返回选关
        </Link>
      </div>
    );
  }

  const page = chapter.pages[pageIdx];
  const best = loadRecords()[chapter.id];

  const handleSolved = (mark: Mark) => {
    const next = [...marks, mark];
    setMarks(next);
    goNext(next);
  };

  const goNext = (nextMarks: Mark[]) => {
    if (pageIdx + 1 < chapter.pages.length) {
      setPageIdx(pageIdx + 1);
      window.scrollTo({ top: 0 });
    } else {
      setFinished(true);
      if (!recordSaved) {
        saveRecord(chapter.id, nextMarks.join(''));
        setRecordSaved(true);
      }
      window.scrollTo({ top: 0 });
    }
  };

  const restart = () => {
    setPageIdx(0);
    setMarks([]);
    setFinished(false);
    setRecordSaved(false);
    setCopied(false);
    window.scrollTo({ top: 0 });
  };

  /* ── 成绩单 ── */
  if (finished) {
    const markStr = marks.join('');
    const c = countMarks(markStr);
    const latest = loadRecords()[chapter.id];
    const share = buildShareText(chapter.title, markStr, '');
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="rounded-2xl border border-[#d8d2c0] bg-[#fbfaf5] p-6 shadow-sm">
          <p className="text-xs font-semibold tracking-widest text-[#8a6d3b]">调查报告 · 结案</p>
          <h1 className="mt-1 font-serif text-2xl font-bold text-[#19392f]">
            {chapter.icon} 《{chapter.title}》
          </h1>

          {/* 逐题成绩（marks 编码可视化，与参考站一致） */}
          <div className="mt-5 flex flex-wrap gap-2">
            {marks.map((m, i) => (
              <span key={i} className={`rounded-lg px-3 py-2 text-xs font-semibold ${MARK_STYLE[m]}`}>
                第 {i + 1} 题 · {MARK_LABEL[m]}
              </span>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-[#e7f2e6] p-3">
              <p className="text-2xl font-bold text-[#2f5d43]">{c.f}</p>
              <p className="text-xs text-[#24402f]">首次答对</p>
            </div>
            <div className="rounded-xl bg-[#f4ecd8] p-3">
              <p className="text-2xl font-bold text-[#8a6d3b]">{c.r}</p>
              <p className="text-xs text-[#6b5310]">改正后答对</p>
            </div>
            <div className="rounded-xl bg-[#e8eef3] p-3">
              <p className="text-2xl font-bold text-[#4a6b84]">{c.h}</p>
              <p className="text-xs text-[#3d586b]">借助线索</p>
            </div>
          </div>

          {latest && (
            <p className="mt-4 text-sm text-[#5c665f]">
              本章最佳：首次答对 {countMarks(latest.marks).f}/{latest.marks.length} · 编号 {latest.runId} · 完成于{' '}
              {new Date(latest.completedAt).toLocaleString('zh-CN')} · 累计挑战 {latest.attempts} 次
            </p>
          )}

          <div className="mt-6 rounded-xl bg-[#eef0e9] p-4">
            <p className="text-xs leading-relaxed text-[#5c665f]">
              <span className="font-semibold">史实依据：</span>
              {chapter.sourcesNote}
            </p>
          </div>

          {/* 成绩分享：对应参考站“上报成绩”的动作 */}
          <div className="mt-6 space-y-3">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(share).then(() => setCopied(true));
              }}
              className="w-full rounded-xl border-2 border-[#19392f] py-3 text-sm font-semibold text-[#19392f] transition hover:bg-[#19392f] hover:text-[#f6f5ef]"
            >
              {copied ? '✓ 已复制，去留言板粘贴分享吧' : '📋 复制成绩分享文本'}
            </button>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={restart}
                className="rounded-xl border border-[#d8d2c0] py-3 text-sm font-medium text-[#1c2b25] hover:bg-white"
              >
                重玩本章
              </button>
              <button
                onClick={() => navigate('/')}
                className="rounded-xl border border-[#d8d2c0] py-3 text-sm font-medium text-[#1c2b25] hover:bg-white"
              >
                返回选关
              </button>
              <button
                onClick={() => navigate('/guestbook')}
                className="rounded-xl bg-[#19392f] py-3 text-sm font-semibold text-[#f6f5ef] hover:bg-[#24402f]"
              >
                去留言
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#d8d2c0] bg-[#fbf6e8] p-5">
          <p className="text-sm leading-relaxed text-[#4a3f1e]">{chapter.closing}</p>
        </div>
      </div>
    );
  }

  /* ── 故事页 / 推理页 ── */
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* 章节头 */}
      <div className="mb-6">
        <Link to="/" className="text-sm text-[#2f5d43] hover:underline">
          ← 返回选关
        </Link>
        <h1 className="mt-2 font-serif text-2xl font-bold text-[#19392f]">
          {chapter.icon} 《{chapter.title}》
        </h1>
        <p className="mt-1 text-sm text-[#5c665f]">
          {chapter.era} · 本章训练：{chapter.theme}
        </p>
        {/* 进度 */}
        <div className="mt-3 flex items-center gap-1.5">
          {chapter.pages.map((p, i) => (
            <span
              key={p.id}
              className={`h-1.5 flex-1 rounded-full ${
                i < pageIdx ? 'bg-[#2f5d43]' : i === pageIdx ? 'bg-[#8a6d3b]' : 'bg-[#ddd7c6]'
              }`}
            />
          ))}
        </div>
        <p className="mt-1 text-xs text-[#8a8571]">
          第 {pageIdx + 1}/{chapter.pages.length} 页{page.kind === 'quiz' ? ' · 推理点' : ''} · 已完成推理 {marks.length}/
          {totalQuiz}
        </p>
      </div>

      {/* 页面正文 */}
      <div className="rounded-2xl border border-[#d8d2c0] bg-[#fbfaf5] p-6 shadow-sm">
        <h2 className="font-serif text-xl font-bold text-[#1c2b25]">{page.title}</h2>
        <p className="mt-3 leading-relaxed text-[#33433b]">{page.caption}</p>

        {page.visual && (
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#eef0e9] p-4">
            <span className="text-3xl">{page.visual.icon}</span>
            <p className="text-sm text-[#5c665f]">{page.visual.label}</p>
          </div>
        )}

        {page.keyQuestion && (
          <div className="mt-4 rounded-lg border border-dashed border-[#8a6d3b] bg-[#fbf6e8] p-3 text-sm text-[#6b5310]">
            ❓ 悬置的问题：{page.keyQuestion}
          </div>
        )}

        {page.kind === 'story' && page.clue && (
          <details className="mt-4 rounded-lg border-l-4 border-[#8a6d3b] bg-[#f4ecd8] p-4">
            <summary className="cursor-pointer text-sm font-semibold text-[#6b5310]">🔎 {page.clue.title}</summary>
            <p className="mt-1 text-sm leading-relaxed text-[#4a3f1e]">{page.clue.text}</p>
          </details>
        )}

        <div className="mt-6">
          {page.kind === 'quiz' ? (
            <QuizCard key={page.id} page={page} onSolved={handleSolved} />
          ) : (
            <button
              onClick={() => goNext(marks)}
              className="w-full rounded-xl bg-[#19392f] py-3 text-sm font-semibold text-[#f6f5ef] transition hover:bg-[#24402f]"
            >
              继续 →
            </button>
          )}
        </div>
      </div>

      {best && (
        <p className="mt-4 text-center text-xs text-[#8a8571]">
          本章最佳记录：首次答对 {countMarks(best.marks).f}/{best.marks.length}
        </p>
      )}
    </div>
  );
}
