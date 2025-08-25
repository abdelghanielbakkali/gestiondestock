import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Home } from "lucide-react";
import api from "../../lib/axios";

export default function ResetPassword({ token, email }) {
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await api.post("/reset-password", {
        email,
        token,
        password,
        password_confirmation,
      });
      setMessage(res.data.message);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.email?.[0] ||
        "Erreur"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-blue-50 to-blue-100">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
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
        <h2 className="text-xl font-bold mb-4 text-blue-800 text-center">
          Réinitialiser le mot de passe
        </h2>
        <form onSubmit={handleReset} className="space-y-6">
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Nouveau mot de passe"
            required
          />
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={password_confirmation}
            onChange={e => setPasswordConfirmation(e.target.value)}
            placeholder="Confirmer le mot de passe"
            required
          />
          {message && (
            <div className="text-green-600 text-sm text-center">{message}</div>
          )}
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-2 font-semibold"
            disabled={loading}
          >
            {loading ? "Réinitialisation..." : "Réinitialiser"}
          </button>
          {message && (
            <div className="text-center mt-2">
              <button
                type="button"
                className="text-blue-700 hover:underline text-sm"
                onClick={() => navigate("/auth")}
              >
                Retour à la connexion
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}