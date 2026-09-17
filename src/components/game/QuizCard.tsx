import { useState } from 'react';
import type { Mark, StoryPage } from '../../types/game';

// 答题卡：三选一、每选项针对性反馈、答错可重试、线索卡、答对后揭示
// 结果编码与参考站一致：f 首次答对 / r 改正后答对 / h 借助线索答对

interface Props {
  page: StoryPage;
  onSolved: (mark: Mark) => void;
}

export default function QuizCard({ page, onSolved }: Props) {
  const quiz = page.quiz!;
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [lastWrong, setLastWrong] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const [clueUsed, setClueUsed] = useState(false);
  const [showClue, setShowClue] = useState(false);
  const [advanced, setAdvanced] = useState(false);

  const pick = (id: string) => {
    if (solved) return;
    if (id === quiz.answerId) {
      setSolved(true);
      setLastWrong(null);
    } else {
      if (!wrongIds.includes(id)) setWrongIds([...wrongIds, id]);
      setLastWrong(id);
    }
  };

  const mark: Mark = wrongIds.length > 0 ? 'r' : clueUsed ? 'h' : 'f';

  const toggleClue = () => {
    if (!showClue) setClueUsed(true);
    setShowClue(!showClue);
  };

  const correctOption = quiz.options.find((o) => o.id === quiz.answerId)!;

  return (
    <div className="space-y-4">
      {/* 题干 */}
      <div className="rounded-xl border border-[#d8d2c0] bg-[#fbfaf5] p-5">
        <p className="mb-1 text-xs font-semibold tracking-widest text-[#8a6d3b]">推理点</p>
        <p className="text-base font-medium leading-relaxed text-[#1c2b25]">{quiz.prompt}</p>
      </div>

      {/* 线索卡 */}
      {page.clue && (
        <div>
          <button
            onClick={toggleClue}
            disabled={solved}
            className="text-sm text-[#2f5d43] underline decoration-dotted underline-offset-4 hover:text-[#19392f] disabled:opacity-50"
          >
            {showClue ? '收起线索' : '查看线索（答对将记为“借助线索”）'}
          </button>
          {showClue && (
            <div className="mt-2 rounded-lg border-l-4 border-[#8a6d3b] bg-[#f4ecd8] p-4">
              <p className="text-sm font-semibold text-[#6b5310]">🔎 {page.clue.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-[#4a3f1e]">{page.clue.text}</p>
            </div>
          )}
        </div>
      )}

      {/* 选项 */}
      <div className="space-y-2">
        {quiz.options.map((opt) => {
          const isAnswer = opt.id === quiz.answerId;
          const isWrong = wrongIds.includes(opt.id);
          let cls = 'border-[#d8d2c0] bg-white hover:border-[#2f5d43] hover:bg-[#f2f7f0]';
          if (solved && isAnswer) cls = 'border-[#2f5d43] bg-[#e7f2e6]';
          else if (isWrong) cls = 'border-[#b4553a] bg-[#f9ece7] opacity-80';
          return (
            <div key={opt.id}>
              <button
                onClick={() => pick(opt.id)}
                disabled={solved || isWrong}
                className={`w-full rounded-xl border-2 p-4 text-left transition ${cls} disabled:cursor-default`}
              >
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs font-bold">
                  {opt.id.toUpperCase()}
                </span>
                <span className="text-sm leading-relaxed text-[#1c2b25]">{opt.label}</span>
                {solved && isAnswer && <span className="ml-2 text-sm font-semibold text-[#2f5d43]">✓ 正确</span>}
                {isWrong && !solved && <span className="ml-2 text-sm font-semibold text-[#b4553a]">✗</span>}
              </button>
              {/* 错误选项的针对性反馈 */}
              {isWrong && lastWrong === opt.id && !solved && (
                <div className="mt-1 rounded-lg bg-[#f9ece7] p-3 text-sm leading-relaxed text-[#7a3b28]">
                  {opt.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 答错横幅：与参考站一致的话术 */}
      {lastWrong && !solved && (
        <div className="rounded-lg border border-[#e0b8ab] bg-[#fdf3ef] p-3 text-sm text-[#7a3b28]">
          选错了，但调查没有结束。看看少了哪个条件，再试一次。
        </div>
      )}

      {/* 答对反馈 + 总结 + 揭示 */}
      {solved && (
        <div className="space-y-3">
          <div className="rounded-lg border border-[#bcd8c0] bg-[#eef6ec] p-4">
            <p className="text-sm leading-relaxed text-[#24402f]">{correctOption.explanation}</p>
          </div>
          <div className="rounded-lg border-l-4 border-[#2f5d43] bg-[#e7f2e6] p-4">
            <p className="text-sm font-semibold text-[#24402f]">侦探笔记</p>
            <p className="mt-1 text-sm leading-relaxed text-[#24402f]">{quiz.reason}</p>
          </div>
          {page.reveal && (
            <div className="rounded-xl border border-[#d8d2c0] bg-[#fbf6e8] p-5">
              <p className="text-sm font-semibold text-[#6b5310]">📖 {page.reveal.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-[#4a3f1e]">{page.reveal.text}</p>
            </div>
          )}
          {!advanced && (
            <button
              onClick={() => {
                setAdvanced(true);
                onSolved(mark);
              }}
              className="w-full rounded-xl bg-[#19392f] py-3 text-sm font-semibold text-[#f6f5ef] transition hover:bg-[#24402f]"
            >
              继续调查 →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
