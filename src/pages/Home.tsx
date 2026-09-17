import { useState } from 'react';
import { Link } from 'react-router';
import { chapters, quizCount } from '../data/chapters';
import { clearRecords, loadGuestbook, loadRecords } from '../lib/store';
import { countMarks } from '../types/game';

export default function Home() {
  const [records, setRecords] = useState(loadRecords());
  const [confirmReset, setConfirmReset] = useState(false);
  const guestbook = loadGuestbook();

  const doneCount = chapters.filter((c) => records[c.id]).length;
  const totalQuiz = chapters.reduce((s, c) => s + quizCount(c), 0);
  const bestFirst = chapters.reduce((s, c) => s + (records[c.id] ? countMarks(records[c.id].marks).f : 0), 0);
  const answeredQuiz = chapters.reduce((s, c) => s + (records[c.id] ? records[c.id].marks.length : 0), 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* 头部 */}
      <header className="rounded-2xl border border-[#d8d2c0] bg-[#19392f] p-8 text-[#f6f5ef] shadow-sm">
        <p className="text-xs font-semibold tracking-[0.3em] text-[#c9a24b]">生物学发现 · 科学侦探故事</p>
        <h1 className="mt-2 font-serif text-4xl font-bold">生命的线索</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#cfe0d4]">
          五篇独立的生物学发现调查：发霉的培养皿、鹅颈瓶、豌豆田、第 51 号照片、会发光的水母。自由选关，也可沿推荐路线
          练习复现、对照、定量、证据链与工具思维。答错不会被惩罚——看看少了哪个条件，再试一次。
        </p>
        <div className="mt-5 flex flex-wrap gap-4 text-sm">
          <span className="rounded-lg bg-[#24402f] px-3 py-1.5">
            进度 {doneCount}/{chapters.length} 章
          </span>
          <span className="rounded-lg bg-[#24402f] px-3 py-1.5">
            最佳成绩：首次答对 {bestFirst}/{answeredQuiz || totalQuiz} 题
          </span>
          <Link to="/guestbook" className="rounded-lg bg-[#c9a24b] px-3 py-1.5 font-semibold text-[#19392f] hover:bg-[#d8b56a]">
            ✉️ 留言板（{guestbook.length}）
          </Link>
        </div>
      </header>

      {/* 推荐路线提示 */}
      <p className="mt-6 text-sm text-[#5c665f]">
        💡 推荐按顺序游玩：每章训练一种思维方法，后面的章节会悄悄用到前面的本领。也可以自由选关。
      </p>

      {/* 章节卡片 */}
      <div className="mt-4 space-y-4">
        {chapters.map((ch) => {
          const rec = records[ch.id];
          const n = quizCount(ch);
          return (
            <Link
              key={ch.id}
              to={`/chapter/${ch.id}`}
              className="block rounded-2xl border border-[#d8d2c0] bg-[#fbfaf5] p-5 shadow-sm transition hover:border-[#2f5d43] hover:shadow"
            >
              <div className="flex items-start gap-4">
                <span className="text-4xl">{ch.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-xs font-semibold text-[#8a6d3b]">第 {ch.order} 章</span>
                    <h2 className="font-serif text-lg font-bold text-[#1c2b25]">《{ch.title}》</h2>
                    {rec && (
                      <span className="rounded-full bg-[#e7f2e6] px-2 py-0.5 text-xs font-semibold text-[#2f5d43]">
                        ✓ 最佳：首次答对 {countMarks(rec.marks).f}/{rec.marks.length}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-[#33433b]">{ch.subtitle}</p>
                  <p className="mt-1 text-xs text-[#8a8571]">
                    {ch.era} · {n} 处推理 · 训练：{ch.theme}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#5c665f]">{ch.intro}</p>
                </div>
                <span className="mt-1 shrink-0 rounded-xl bg-[#19392f] px-4 py-2 text-sm font-semibold text-[#f6f5ef]">
                  {rec ? '重玩' : '开始'}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 最近留言 */}
      {guestbook.length > 0 && (
        <div className="mt-8">
          <div className="flex items-baseline justify-between">
            <h3 className="font-serif text-lg font-bold text-[#1c2b25]">侦探留言</h3>
            <Link to="/guestbook" className="text-sm text-[#2f5d43] hover:underline">
              全部 {guestbook.length} 条 →
            </Link>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {guestbook.slice(0, 3).map((e) => (
              <div key={e.id} className="rounded-xl border border-[#d8d2c0] bg-[#fbfaf5] p-4">
                <p className="text-sm font-semibold text-[#19392f]">
                  {e.nickname}
                  {e.rating && <span className="ml-1 text-[#c9a24b]">{'★'.repeat(e.rating)}</span>}
                </p>
                <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-[#5c665f]">{e.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 页脚 */}
      <footer className="mt-10 rounded-2xl border border-[#d8d2c0] bg-[#fbf6e8] p-5 text-xs leading-relaxed text-[#6b5310]">
        <p>
          玩法致敬《迷雾中的探险 · 科学侦探故事》（socrates-question）：图文短页 + 推理点、三选一针对性反馈、答错重试、
          成绩 marks 编码（首次答对 / 改正后答对 / 借助线索）。本作为本地单机版：成绩与留言保存在本机浏览器中。
        </p>
        {doneCount > 0 && (
          <button
            onClick={() => {
              if (confirmReset) {
                clearRecords();
                setRecords({});
                setConfirmReset(false);
              } else {
                setConfirmReset(true);
              }
            }}
            className="mt-3 text-[#b4553a] underline decoration-dotted underline-offset-4"
          >
            {confirmReset ? '再点一次确认清除所有成绩记录' : '清除我的成绩记录'}
          </button>
        )}
      </footer>
    </div>
  );
}
