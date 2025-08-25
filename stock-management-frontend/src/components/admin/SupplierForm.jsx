import { useState } from "react";
import api from "../../lib/axios";

export default function SupplierForm({ supplier, onClose, onSaved }) {
  const [form, setForm] = useState({
    nom: supplier?.nom || "",
    prenom: supplier?.prenom || "",
    telephone: supplier?.telephone || "",
    adresse: supplier?.adresse || "",
    photo: null,
    email: supplier?.email || "",
  password: "",
  });
  const [error, setError] = useState("");

  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) data.append(key, value);
      });
      if (supplier) {
        await api.post(`/fournisseurs/${supplier.id}?_method=PUT`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/fournisseurs", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">{supplier ? "Modifier" : "Ajouter"} un fournisseur</h2>
        <input
          name="nom"
          placeholder="Nom"
          className="w-full border rounded px-3 py-2 mb-3"
          value={form.nom}
          onChange={handleChange}
          required
        />
        <input
          name="prenom"
          placeholder="prenom"
          className="w-full border rounded px-3 py-2 mb-3"
          value={form.prenom}
          onChange={handleChange}
          required
        />
        <input
          name="telephone"
          placeholder="Téléphone"
          className="w-full border rounded px-3 py-2 mb-3"
          value={form.telephone}
          onChange={handleChange}
        />
        <input
  name="email"
  type="email"
  placeholder="Email"
  className="w-full border rounded px-3 py-2 mb-3"
  value={form.email}
  onChange={handleChange}
  required
/>
{!supplier && (
  <input
    name="password"
    type="password"
    placeholder="Mot de passe"
    className="w-full border rounded px-3 py-2 mb-3"
    value={form.password}
    onChange={handleChange}
    required
  />
)}
        <input
          name="adresse"
          placeholder="Adresse"
          className="w-full border rounded px-3 py-2 mb-3"
          value={form.adresse}
          onChange={handleChange}
        />
        <input
          name="photo"
          type="file"
          accept="image/*"
          className="w-full border rounded px-3 py-2 mb-3"
          onChange={handleChange}
        />
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200">Annuler</button>
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">
            {supplier ? "Enregistrer" : "Ajouter"}
          </button>
        </div>
      </form>
    </div>
  );
}