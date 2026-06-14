import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth";
import { formatBRL, formatTime } from "../format";
import type { Bet, Transaction } from "../types";

export default function AccountPage() {
  const { user } = useAuth();
  const [bets, setBets] = useState<Bet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    api.get<{ bets: Bet[] }>("/bets").then((d) => setBets(d.bets));
    api
      .get<{ transactions: Transaction[] }>("/wallet/transactions")
      .then((d) => setTransactions(d.transactions));
  }, []);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-xl font-bold">Minha conta</h1>
        <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Nome</p>
            <p className="font-semibold">{user.name}</p>
          </div>
          <div>
            <p className="text-gray-400">E-mail</p>
            <p className="font-semibold">{user.email}</p>
          </div>
          <div>
            <p className="text-gray-400">Saldo</p>
            <p className="font-semibold text-brand-light">
              {formatBRL(user.balanceCents)}
            </p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-bold">Minhas apostas</h2>
        {bets.length === 0 ? (
          <p className="mt-2 text-sm text-gray-400">Nenhuma aposta ainda.</p>
        ) : (
          <table className="mt-3 w-full text-sm">
            <thead className="text-left text-gray-400">
              <tr>
                <th className="py-1">Evento</th>
                <th>Seleção</th>
                <th>Odd</th>
                <th>Valor</th>
                <th>Retorno</th>
              </tr>
            </thead>
            <tbody>
              {bets.map((b) => (
                <tr key={b.id} className="border-t border-ink-700">
                  <td className="py-1.5">{b.event_label}</td>
                  <td>{b.selection_label}</td>
                  <td className="font-mono">{b.odds.toFixed(2)}</td>
                  <td>{formatBRL(b.stake_cents)}</td>
                  <td className="text-brand-light">
                    {formatBRL(b.potential_return_cents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card p-6">
        <h2 className="font-bold">Extrato</h2>
        {transactions.length === 0 ? (
          <p className="mt-2 text-sm text-gray-400">Sem movimentações.</p>
        ) : (
          <ul className="mt-3 space-y-1 text-sm">
            {transactions.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between border-t border-ink-700 py-1.5"
              >
                <span className="capitalize text-gray-300">{t.type}</span>
                <span className="text-gray-500">{formatTime(t.created_at)}</span>
                <span
                  className={
                    t.amount_cents >= 0 ? "text-brand-light" : "text-red-400"
                  }
                >
                  {formatBRL(t.amount_cents)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
