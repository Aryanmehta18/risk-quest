export default function CaseSpotlight({ round, qIndex = 0 }) {
  const questions = round.questions || [];

  return (
    <div className="rounded-xl border border-edge bg-surface p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-risk">● Live case</p>
      <h2 className="mt-3 font-display text-2xl font-bold">{round.caseTitle}</h2>
      <p className="mt-1 text-mute">{round.company}</p>

      {questions.length > 0 && (
        <div className="mt-4 flex items-center justify-between border-t border-edge pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-signal">
            Question {qIndex + 1} of {questions.length}
          </p>
          <div className="flex gap-1.5">
            {questions.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-5 rounded-full ${
                  i === qIndex ? "bg-signal" : i < qIndex ? "bg-signal/40" : "bg-edge"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}