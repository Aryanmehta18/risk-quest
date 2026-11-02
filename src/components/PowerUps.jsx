const ALL = [
  { id: "shield", icon: "🛡️", label: "Shield" },
  { id: "double", icon: "⚡", label: "Double Down" },
  { id: "steal", icon: "🕵️", label: "Steal" },
];

export default function PowerUps({ available }) {
  return (
    <div className="flex gap-1">
      {ALL.map((p) => {
        const has = available.includes(p.id);
        return (
          <span
            key={p.id}
            title={`${p.label}${has ? "" : " (used)"}`}
            className={`flex h-6 w-6 items-center justify-center rounded-md border text-xs transition-all duration-500 ${
              has
                ? "border-signal/50 bg-signal/10"
                : "border-edge bg-transparent opacity-25 grayscale"
            }`}
          >
            {p.icon}
          </span>
        );
      })}
    </div>
  );
}