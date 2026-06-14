import { useState } from "react";
import { Link } from "react-router-dom";
import { useBetSlip } from "../betslip";
import { useAuth } from "../auth";
import { api } from "../api";
import { formatBRL } from "../format";

export default function BetSlip({
  onRequireDeposit,
}: {
  onRequireDeposit: () => void;
}) {
  const { items, remove, clear } = useBetSlip();
  const { user, setBalance } = useAuth();
  const [stake, setStake] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const totalOdds = items.reduce((acc, i) => acc * i.odds, 1);
  const potential = Math.round(stake * totalOdds);

  const placeBets = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      let lastBalance = user.balanceCents;
      for (const item of items) {
        const { balanceCents } = await api.post<{ balanceCents: number }>(
          "/bets",
          { selectionId: item.selectionId, stakeCents: stake }
        );
        lastBalance = balanceCents;
      }
      setBalance(lastBalance);
      setSuccess("Aposta registrada!");
      clear();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao apostar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card sticky top-20 p-4">
      <h3 className="font-bold">Boletim de apostas</h3>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-gray-400">
          Clique numa odd para adicionar uma seleção.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          {items.map((i) => (
            <div
              key={i.selectionId}
              className="rounded-md border border-ink-600 p-2 text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{i.selectionLabel}</span>
                <button
                  onClick={() => remove(i.selectionId)}
                  className="text-gray-400 hover:text-red-400"
                >
                  ✕
                </button>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{i.eventLabel}</span>
                <span className="font-mono text-brand-light">
                  {i.odds.toFixed(2)}
                </span>
              </div>
            </div>
          ))}

          <label className="mt-2 block text-sm text-gray-300">
            Valor por aposta (R$)
            <input
              type="number"
              min={1}
              value={stake / 100}
              onChange={(e) => setStake(Math.round(Number(e.target.value) * 100))}
              className="input mt-1"
            />
          </label>

          <div className="flex justify-between text-sm text-gray-300">
            <span>Odd total</span>
            <span className="font-mono">{totalOdds.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Retorno potencial</span>
            <span className="font-semibold text-brand-light">
              {formatBRL(potential)}
            </span>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          {user ? (
            user.balanceCents < stake ? (
              <button onClick={onRequireDeposit} className="btn-primary w-full">
                Saldo insuficiente — Depositar
              </button>
            ) : (
              <button
                onClick={placeBets}
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? "Enviando..." : "Apostar"}
              </button>
            )
          ) : (
            <Link to="/login" className="btn-primary block w-full text-center">
              Entrar para apostar
            </Link>
          )}
        </div>
      )}
      {success && <p className="mt-3 text-sm text-brand-light">{success}</p>}
    </div>
  );
}
