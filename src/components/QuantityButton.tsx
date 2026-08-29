interface QuantityButtonProps {
  count: number;
  onAdd: () => void;
  onRemove: () => void;
  min?: number;
}

export function QuantityButton({
  count,
  onAdd,
  onRemove,
  min = 0,
}: QuantityButtonProps) {
  const active = count > min;

  if (!active) {
    return (
      <button
        onClick={onAdd}
        className="btn-gold px-5 py-2.5 text-sm flex items-center gap-1.5 shadow-gold"
      >
        <span className="text-lg leading-none">+</span>
        <span>Agregar</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-ink-700/80 rounded-2xl p-1.5 border border-gold-500/30 animate-scaleIn">
      <button
        onClick={onRemove}
        className="w-9 h-9 rounded-xl bg-ink-600 text-gold-300 flex items-center justify-center text-xl font-bold transition-all active:scale-90 hover:bg-ink-500"
        aria-label="Quitar"
      >
        −
      </button>
      <span className="text-gold-200 font-semibold text-lg min-w-[1.5rem] text-center tabular-nums">
        {count}
      </span>
      <button
        onClick={onAdd}
        className="w-9 h-9 rounded-xl bg-gradient-to-b from-gold-400 to-gold-600 text-ink-900 flex items-center justify-center text-xl font-bold transition-all active:scale-90 hover:from-gold-300"
        aria-label="Agregar"
      >
        +
      </button>
    </div>
  );
}
