/**
 * Shown right after "Run selection." Lists everyone drawn at once behind a
 * blurred backdrop; stays on screen until the admin clicks Confirm.
 */
export default function SelectionReveal({ picks, onDone }) {
  if (!picks || picks.length === 0) return null;
  const cycleNumber = picks[0]?.cycle_number;

  return (
    <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface border border-line rounded-lg p-6 max-h-[85vh] flex flex-col">
        <p className="text-muted text-xs mb-1">Cycle {cycleNumber}</p>
        <h2 className="font-head font-extrabold text-xl sm:text-2xl text-ink mb-4">
          List of staffs to be tested today
        </h2>

        <div className="space-y-2 overflow-y-auto pr-1 -mr-1">
          {picks.map((p) => (
            <div
              key={p.selection_id}
              className="bg-raised border border-line rounded-md px-4 py-3 flex items-center justify-between gap-3"
            >
              <div>
                <p className="font-head font-bold text-ink">{p.full_name}</p>
                <p className="text-muted text-xs">{p.department}</p>
              </div>
              <span className="bg-orange-dim text-orange-soft text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap">
                Tag {p.tag_id}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onDone}
          className="mt-5 bg-orange hover:bg-orange/90 text-inkOnOrange font-head font-bold rounded-md py-2.5 transition-colors"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
