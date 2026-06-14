import type { GameEvent, Selection } from "../types";
import { useBetSlip } from "../betslip";
import { formatTime } from "../format";

function OddsButton({
  event,
  marketName,
  sel,
}: {
  event: GameEvent;
  marketName: string;
  sel: Selection;
}) {
  const { add, remove, has } = useBetSlip();
  const selected = has(sel.id);
  const moved =
    sel.prev_odds != null && sel.prev_odds !== sel.odds
      ? sel.odds > sel.prev_odds
        ? "up"
        : "down"
      : null;

  const toggle = () => {
    if (selected) {
      remove(sel.id);
    } else {
      add({
        selectionId: sel.id,
        odds: sel.odds,
        eventLabel: `${event.home_team} x ${event.away_team}`,
        selectionLabel: `${sel.name} (${marketName})`,
      });
    }
  };

  return (
    <button
      onClick={toggle}
      title={sel.name}
      className={`flex min-w-0 flex-1 items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm transition ${
        selected
          ? "border-brand bg-brand/20"
          : "border-ink-600 bg-ink-900 hover:border-brand/60"
      }`}
    >
      <span className="truncate text-gray-300">{sel.name}</span>
      <span
        className={`font-mono font-semibold ${
          moved === "up"
            ? "text-green-400"
            : moved === "down"
              ? "text-red-400"
              : "text-white"
        }`}
      >
        {moved === "up" && "▲ "}
        {moved === "down" && "▼ "}
        {sel.odds.toFixed(2)}
      </span>
    </button>
  );
}

export default function EventCard({ event }: { event: GameEvent }) {
  const mainMarket = event.markets[0];
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{event.league}</span>
        <span>{formatTime(event.starts_at)}</span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="font-semibold">
          {event.home_team} <span className="text-gray-500">x</span>{" "}
          {event.away_team}
        </div>
      </div>

      {event.markets.map((market) => (
        <div key={market.id} className="mt-3">
          <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">
            {market.name}
          </div>
          <div className="flex flex-wrap gap-2">
            {market.selections.map((sel) => (
              <OddsButton
                key={sel.id}
                event={event}
                marketName={market.name}
                sel={sel}
              />
            ))}
          </div>
        </div>
      ))}

      {!mainMarket && (
        <p className="mt-3 text-sm text-gray-500">Sem mercados disponíveis.</p>
      )}
    </div>
  );
}
