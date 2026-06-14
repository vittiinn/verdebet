import { useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth";
import { formatBRL } from "../format";

const PRESETS = [2000, 5000, 10000, 20000];

export default function DepositModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, setBalance } = useAuth();
  const [amount, setAmount] = useState(5000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const { balanceCents } = await api.post<{ balanceCents: number }>(
        "/wallet/deposit",
        { amountCents: amount }
      );
      setBalance(balanceCents);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-30 grid place-items-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Depositar via PIX</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        {!user ? (
          <p className="mt-4 text-sm text-gray-300">
            Faça login para depositar.
          </p>
        ) : done ? (
          <div className="mt-4 text-sm">
            <p className="text-brand-light">Depósito confirmado (modo demo).</p>
            <p className="mt-1 text-gray-300">
              Novo saldo: {formatBRL(user.balanceCents)}
            </p>
            <button onClick={onClose} className="btn-primary mt-4 w-full">
              Fechar
            </button>
          </div>
        ) : (
          <>
            <p className="mt-2 text-xs text-gray-400">
              Ambiente de demonstração: o depósito é confirmado na hora, sem
              cobrança real. Em produção, gera-se um QR Code PIX por um gateway
              regulado.
            </p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setAmount(p)}
                  className={`rounded-md border px-2 py-2 text-sm ${
                    amount === p
                      ? "border-brand bg-brand/20 text-white"
                      : "border-ink-600 text-gray-300"
                  }`}
                >
                  {formatBRL(p)}
                </button>
              ))}
            </div>
            <label className="mt-4 block text-sm text-gray-300">
              Valor (R$)
              <input
                type="number"
                min={1}
                value={amount / 100}
                onChange={(e) =>
                  setAmount(Math.round(Number(e.target.value) * 100))
                }
                className="input mt-1"
              />
            </label>
            {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
            <button
              onClick={submit}
              disabled={loading || amount <= 0}
              className="btn-primary mt-4 w-full disabled:opacity-50"
            >
              {loading ? "Processando..." : `Depositar ${formatBRL(amount)}`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
