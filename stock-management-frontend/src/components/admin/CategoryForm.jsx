import { useState } from "react";
import api from "../../lib/axios";

export default function CategoryForm({ category, onClose, onSaved }) {
  const [form, setForm] = useState({
    nom: category?.nom || "",
    description: category?.description || "",
  });
  const [error, setError] = useState("");

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    try {
      if (category) {
        await api.put(`/categories/${category.id}`, form);
      } else {
        await api.post("/categories", form);
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
        <h2 className="text-xl font-bold mb-4">{category ? "Modifier" : "Ajouter"} une catégorie</h2>
        <input
          name="nom"
          placeholder="Nom"
          className="w-full border rounded px-3 py-2 mb-3"
          value={form.nom}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          className="w-full border rounded px-3 py-2 mb-3"
          value={form.description}
          onChange={handleChange}
        />
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200">Annuler</button>
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">
            {category ? "Enregistrer" : "Ajouter"}
          </button>
        </div>
      </form>
    </div>
  );
}