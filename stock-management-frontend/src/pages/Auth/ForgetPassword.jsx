import { useState } from "react";
import api from "../../lib/axios";
import { useNavigate } from "react-router-dom";
import { Home, Sparkles } from "lucide-react";

export default function ForgetPassword({ onBack }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleForgot = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const res = await api.post("/forgot-password", { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.email?.[0] ||
          "Erreur"
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
      <form onSubmit={handleForgot} className="space-y-6">
        <input
          type="email"
          placeholder="Email"
          className="w-full border rounded px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {message && <div className="text-green-600 text-sm">{message}</div>}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-2 font-semibold"
        >
          Envoyer le lien de réinitialisation
        </button>
        <div className="text-center mt-2">
          <button
            type="button"
            className="text-blue-700 hover:underline text-sm"
            onClick={onBack}
          >
            Retour à la connexion
          </button>
        </div>
      </form>
    </div>
  );
}