import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { formatBRL } from "../format";
import DepositModal from "./DepositModal";
import BetSlip from "./BetSlip";

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [depositOpen, setDepositOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 border-b border-ink-700 bg-ink-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-brand font-black text-white">
              V
            </span>
            <span className="text-lg font-extrabold tracking-tight">
              Verde<span className="text-brand-light">Bet</span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <>
                <button
                  onClick={() => setDepositOpen(true)}
                  className="btn-primary"
                >
                  Depositar
                </button>
                <Link to="/conta" className="btn-ghost">
                  {formatBRL(user.balanceCents)}
                </Link>
                {user.role === "admin" && (
                  <Link to="/admin" className="btn-ghost">
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="btn-ghost"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">
                  Entrar
                </Link>
                <Link to="/register" className="btn-primary">
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 py-6">
        <main className="min-w-0 flex-1">{children}</main>
        <aside className="hidden w-80 shrink-0 lg:block">
          <BetSlip onRequireDeposit={() => setDepositOpen(true)} />
        </aside>
      </div>

      <footer className="border-t border-ink-700 px-4 py-6 text-center text-xs text-gray-500">
        <p>
          VerdeBet — plataforma demonstrativa. Aposte com responsabilidade. +18.
        </p>
        <p className="mt-1">
          Projeto de software para fins de demonstração. Operação com dinheiro
          real exige licença e gateway de pagamento regulado.
        </p>
      </footer>

      <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} />
    </div>
  );
}
