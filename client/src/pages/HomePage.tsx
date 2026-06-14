import { useEffect, useState } from "react";
import { api } from "../api";
import type { GameEvent, Sport } from "../types";
import EventCard from "../components/EventCard";

export default function HomePage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ sports: Sport[] }>("/sports").then((d) => setSports(d.sports));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const q = active ? `?sport=${active}` : "";
      const { events } = await api.get<{ events: GameEvent[] }>(`/events${q}`);
      if (!cancelled) {
        setEvents(events);
        setLoading(false);
      }
    };
    load();
    // Live odds: re-fetch periodically so movements appear automatically.
    const id = setInterval(load, 6000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [active]);

  return (
    <div>
      <section className="card mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-brand-dark to-ink-700 p-6">
          <h1 className="text-2xl font-extrabold">
            Apostas esportivas com odds ao vivo
          </h1>
          <p className="mt-1 max-w-xl text-sm text-gray-200">
            Cadastre-se, deposite via PIX e acompanhe as odds mudando em tempo
            real nos principais jogos.
          </p>
        </div>
      </section>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setActive(null)}
          className={`rounded-full px-4 py-1.5 text-sm ${
            active === null ? "bg-brand text-white" : "bg-ink-800 text-gray-300"
          }`}
        >
          Todos
        </button>
        {sports.map((s) => (
          <button
            key={s.key}
            onClick={() => setActive(s.key)}
            className={`rounded-full px-4 py-1.5 text-sm ${
              active === s.key
                ? "bg-brand text-white"
                : "bg-ink-800 text-gray-300"
            }`}
          >
            {s.icon} {s.title}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400">Carregando jogos...</p>
      ) : events.length === 0 ? (
        <p className="text-gray-400">Nenhum jogo disponível.</p>
      ) : (
        <div className="grid gap-4">
          {events.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
