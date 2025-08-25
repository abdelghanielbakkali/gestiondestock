import { useState } from "react";
import api from "../../lib/axios";
import { useNavigate } from "react-router-dom";
import { Home, Sparkles } from "lucide-react";

export default function Login({ onForgot }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      const user = res.data.user;
      if (user.role === "admin") navigate("/admin");
      else if (user.role === "gestionnaire") navigate("/gestionnaire");
      else if (user.role === "fournisseur") navigate("/fournisseur");
      else setError("Rôle inconnu");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.email?.[0] ||
          "Erreur de connexion"
      );
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Sparkles className="text-blue-600" size={32} />
        <button
          onClick={() => navigate("/")}
          className="p-2 rounded-full hover:bg-blue-100 transition"
          title="Retour à l'accueil"
        >
          <Home className="text-blue-600" size={28} />
        </button>
      </div>
      <form onSubmit={handleLogin} className="space-y-6">
        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          className="w-full border rounded px-3 py-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-2 font-semibold"
        >
          Se connecter
        </button>
        <div className="flex justify-between text-sm mt-2">
          <button
            type="button"
            className="text-blue-700 hover:underline"
            onClick={onForgot}
          >
            Mot de passe oublié ?
          </button>
        </div>
      </form>
    </div>
  );
}