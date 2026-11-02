function parse(text) {
  const blocks = [];
  let cur = null;
  const flush = () => {
    if (cur) blocks.push(cur);
    cur = null;
  };

  for (const raw of (text || "").replace(/\r/g, "").split("\n")) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    if (line.startsWith("## ")) {
      flush();
      blocks.push({ type: "h", text: line.slice(3) });
    } else if (line.startsWith("> ")) {
      flush();
      blocks.push({ type: "note", text: line.slice(2) });
    } else if (line.startsWith("- ")) {
      if (cur?.type !== "ul") {
        flush();
        cur = { type: "ul", items: [] };
      }
      cur.items.push(line.slice(2));
    } else if (line.startsWith("|")) {
      if (cur?.type !== "table") {
        flush();
        cur = { type: "table", rows: [] };
      }
      const cells = line
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((c) => c.trim());
      if (!cells.every((c) => /^:?-{2,}:?$/.test(c))) cur.rows.push(cells);
    } else {
      if (cur?.type !== "p") {
        flush();
        cur = { type: "p", lines: [] };
      }
      cur.lines.push(line);
    }
  }
  flush();
  return blocks;
}

function Inline({ text }) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 ? (
      <strong key={i} className="font-bold text-gold">
        {part}
      </strong>
    ) : (
      part
    )
  );
}

// Sizes inside use "em", so the parent's text size (text-3xl etc.) scales everything.
// columns={2} flows long text into two columns (blocks never split across columns).
export default function FormattedContext({ text, className = "", columns = 1, ref }) {
  const blocks = parse(text);
  if (!blocks.length) return null;

  return (
    <div ref={ref} className={`leading-snug ${columns === 2 ? "columns-2 gap-x-14" : ""} ${className}`}>
      {blocks.map((b, i) => (
        <div key={i} className="break-inside-avoid pb-[0.7em]">
          {b.type === "h" && (
            <h3 className="pt-[0.2em] font-display text-[0.7em] font-bold uppercase tracking-[0.25em] text-signal">
              {b.text}
            </h3>
          )}

          {b.type === "note" && (
            <div className="rounded-r-lg border-l-[0.2em] border-gold bg-gold/10 px-[0.8em] py-[0.5em] text-ink">
              <Inline text={b.text} />
            </div>
          )}

          {b.type === "ul" && (
            <ul className="space-y-[0.4em]">
              {b.items.map((it, j) => (
                <li key={j} className="flex gap-[0.7em] text-ink">
                  <span className="mt-[0.5em] h-[0.35em] w-[0.35em] shrink-0 rotate-45 bg-gold" />
                  <span>
                    <Inline text={it} />
                  </span>
                </li>
              ))}
            </ul>
          )}

          {b.type === "table" && (
            <div className="overflow-hidden rounded-lg border border-edge">
              <table className="w-full text-left text-[0.85em]">
                <thead>
                  <tr>
                    {b.rows[0].map((c, j) => (
                      <th
                        key={j}
                        className="bg-signal/15 px-[0.8em] py-[0.4em] font-semibold text-signal"
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {b.rows.slice(1).map((row, r) => (
                    <tr key={r}>
                      {row.map((c, j) => (
                        <td
                          key={j}
                          className="border-t border-edge px-[0.8em] py-[0.4em] text-ink first:font-semibold"
                        >
                          <Inline text={c} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {b.type === "p" && (
            <p className="text-ink/90">
              <Inline text={b.lines.join(" ")} />
            </p>
          )}
        </div>
      ))}
    </div>
  );
}