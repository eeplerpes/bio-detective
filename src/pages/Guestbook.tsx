import { useState } from 'react';
import { Link } from 'react-router';
import { chapters, chapterMap } from '../data/chapters';
import { addGuestbookEntry, loadGuestbook, removeGuestbookEntry, validateEntry } from '../lib/store';

// 留言板：对应参考站“通过 GitHub issue 模板提交评论”的本地实现
// 校验规则与参考站一致：昵称 ≤24 字不换行、留言 ≤500 字、评分 1–5 可选

export default function Guestbook() {
  const [entries, setEntries] = useState(loadGuestbook());
  const [nickname, setNickname] = useState('');
  const [chapterId, setChapterId] = useState('all');
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const submit = () => {
    const err = validateEntry(nickname.trim(), comment.trim(), rating);
    if (err) {
      setError(err);
      setOk(false);
      return;
    }
    const entry = addGuestbookEntry({ chapterId, nickname: nickname.trim(), comment: comment.trim(), rating });
    if (!entry) {
      setError('保存失败：浏览器存储不可用。');
      return;
    }
    setEntries(loadGuestbook());
    setComment('');
    setRating(null);
    setError(null);
    setOk(true);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link to="/" className="text-sm text-[#2f5d43] hover:underline">
        ← 返回选关
      </Link>
      <h1 className="mt-2 font-serif text-2xl font-bold text-[#19392f]">✉️ 侦探留言板</h1>
      <p className="mt-1 text-sm text-[#5c665f]">
        写下你的侦探心得、对某章的评价，或粘贴成绩单。留言保存在本机浏览器中，最多保留 200 条。
      </p>

      {/* 表单 */}
      <div className="mt-6 space-y-4 rounded-2xl border border-[#d8d2c0] bg-[#fbfaf5] p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-[#5c665f]">昵称（≤24 字）</label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={24}
              placeholder="匿名侦探"
              className="mt-1 w-full rounded-lg border border-[#d8d2c0] bg-white px-3 py-2 text-sm outline-none focus:border-[#2f5d43]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#5c665f]">评价章节</label>
            <select
              value={chapterId}
              onChange={(e) => setChapterId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#d8d2c0] bg-white px-3 py-2 text-sm outline-none focus:border-[#2f5d43]"
            >
              <option value="all">整体评价</option>
              {chapters.map((c) => (
                <option key={c.id} value={c.id}>
                  《{c.title}》
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-[#5c665f]">评分（可选）</label>
          <div className="mt-1 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(rating === n ? null : n)}
                className={`text-2xl transition ${rating && n <= rating ? 'text-[#c9a24b]' : 'text-[#d8d2c0] hover:text-[#c9a24b]'}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-[#5c665f]">
            留言（{comment.length}/500）
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 500))}
            rows={4}
            placeholder="这一章哪里最打动你？哪道题让你卡住最久？"
            className="mt-1 w-full rounded-lg border border-[#d8d2c0] bg-white px-3 py-2 text-sm leading-relaxed outline-none focus:border-[#2f5d43]"
          />
        </div>

        {error && <p className="rounded-lg bg-[#f9ece7] p-3 text-sm text-[#7a3b28]">{error}</p>}
        {ok && <p className="rounded-lg bg-[#e7f2e6] p-3 text-sm text-[#24402f]">✓ 留言已保存，感谢分享。</p>}

        <button
          onClick={submit}
          className="w-full rounded-xl bg-[#19392f] py-3 text-sm font-semibold text-[#f6f5ef] transition hover:bg-[#24402f]"
        >
          提交留言
        </button>
      </div>

      {/* 列表 */}
      <div className="mt-8 space-y-3">
        {entries.length === 0 && <p className="text-center text-sm text-[#8a8571]">还没有留言，来抢沙发。</p>}
        {entries.map((e) => (
          <div key={e.id} className="rounded-xl border border-[#d8d2c0] bg-[#fbfaf5] p-4">
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm font-semibold text-[#19392f]">
                {e.nickname}
                {e.rating && <span className="ml-1 text-[#c9a24b]">{'★'.repeat(e.rating)}</span>}
                <span className="ml-2 rounded-full bg-[#eef0e9] px-2 py-0.5 text-xs font-normal text-[#5c665f]">
                  {e.chapterId === 'all' ? '整体评价' : `《${chapterMap[e.chapterId]?.title ?? e.chapterId}》`}
                </span>
              </p>
              <button
                onClick={() => {
                  removeGuestbookEntry(e.id);
                  setEntries(loadGuestbook());
                }}
                className="shrink-0 text-xs text-[#8a8571] hover:text-[#b4553a]"
              >
                删除
              </button>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#33433b]">{e.comment}</p>
            <p className="mt-2 text-xs text-[#8a8571]">{new Date(e.createdAt).toLocaleString('zh-CN')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
