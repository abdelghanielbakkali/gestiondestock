import { useState } from "react";
import api from "../../lib/axios";
import { useNavigate } from "react-router-dom";
import { Home, Sparkles } from "lucide-react";

export default function Register({ onSuccess }) {
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    adresse: "",
    role: "gestionnaire",
    email: "",
    password: "",
    password_confirmation: "",
    photo: null,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });
      await api.post("/auth/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSuccess();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          Object.values(err.response?.data || {})[0] ||
          "Erreur d'inscription"
      );
    } finally {
      setLoading(false);
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
      <form onSubmit={handleRegister} className="space-y-4">
        <div className="flex gap-2">
          <input
            name="prenom"
            placeholder="Prénom"
            className="w-full border rounded px-3 py-2"
            value={form.prenom}
            onChange={handleChange}
            required
          />
          <input
            name="nom"
            placeholder="Nom"
            className="w-full border rounded px-3 py-2"
            value={form.nom}
            onChange={handleChange}
            required
          />
        </div>
        <input
          name="telephone"
          placeholder="Téléphone"
          className="w-full border rounded px-3 py-2"
          value={form.telephone}
          onChange={handleChange}
        />
        <input
          name="adresse"
          placeholder="Adresse"
          className="w-full border rounded px-3 py-2"
          value={form.adresse}
          onChange={handleChange}
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        >
          <option value="admin">Admin</option>
          <option value="gestionnaire">Gestionnaire</option>
          <option value="fournisseur">Fournisseur</option>
        </select>
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full border rounded px-3 py-2"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Mot de passe"
          className="w-full border rounded px-3 py-2"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          name="password_confirmation"
          type="password"
          placeholder="Confirmer le mot de passe"
          className="w-full border rounded px-3 py-2"
          value={form.password_confirmation}
          onChange={handleChange}
          required
        />
        <input
          name="photo"
          type="file"
          accept="image/*"
          className="w-full border rounded px-3 py-2"
          onChange={handleChange}
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-2 font-semibold"
          disabled={loading}
        >
          {loading ? "Inscription..." : "S'inscrire"}
        </button>
      </form>
    </div>
  );
}