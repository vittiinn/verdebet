import { useEffect, useState } from "react";
import { api } from "../api";
import type { GameEvent } from "../types";
import { formatTime } from "../format";

export default function AdminPage() {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = async () => {
    const { events } = await api.get<{ events: GameEvent[] }>("/events");
    setEvents(events);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (selectionId: number) => {
    const value = Number(drafts[selectionId]);
    if (!value || value <= 1) return;
    setSavingId(selectionId);
    try {
      await api.patch(`/selections/${selectionId}/odds`, { odds: value });
      await load();
      setDrafts((d) => {
        const next = { ...d };
        delete next[selectionId];
        return next;
      });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold">Painel admin — Odds</h1>
      <p className="mt-1 text-sm text-gray-400">
        Edite manualmente as odds. As alterações refletem na home em alguns
        segundos. O motor automático também ajusta as odds continuamente.
      </p>

      <div className="mt-4 space-y-4">
        {events.map((event) => (
          <div key={event.id} className="card p-4">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>{event.league}</span>
              <span>{formatTime(event.starts_at)}</span>
            </div>
            <div className="font-semibold">
              {event.home_team} x {event.away_team}
            </div>
            {event.markets.map((market) => (
              <div key={market.id} className="mt-3">
                <div className="mb-1 text-xs uppercase text-gray-500">
                  {market.name}
                </div>
                <div className="space-y-2">
                  {market.selections.map((sel) => (
                    <div
                      key={sel.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span className="w-40 truncate text-gray-300">
                        {sel.name}
                      </span>
                      <span className="w-16 font-mono text-white">
                        {sel.odds.toFixed(2)}
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="nova odd"
                        value={drafts[sel.id] ?? ""}
                        onChange={(e) =>
                          setDrafts((d) => ({ ...d, [sel.id]: e.target.value }))
                        }
                        className="input w-28"
                      />
                      <button
                        onClick={() => save(sel.id)}
                        disabled={savingId === sel.id || !drafts[sel.id]}
                        className="btn-primary disabled:opacity-40"
                      >
                        Salvar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
