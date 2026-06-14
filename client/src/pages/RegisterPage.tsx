import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register({ name, email, phone: phone || undefined, password });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h1 className="text-xl font-bold">Criar conta</h1>
        <p className="mt-1 text-xs text-gray-400">
          Seus dados ficam registrados na plataforma. +18. Aposte com
          responsabilidade.
        </p>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <label className="block text-sm text-gray-300">
            Nome completo
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input mt-1"
            />
          </label>
          <label className="block text-sm text-gray-300">
            E-mail
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input mt-1"
            />
          </label>
          <label className="block text-sm text-gray-300">
            Telefone (opcional)
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input mt-1"
            />
          </label>
          <label className="block text-sm text-gray-300">
            Senha
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input mt-1"
            />
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-400">
          Já tem conta?{" "}
          <Link to="/login" className="text-brand-light">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
