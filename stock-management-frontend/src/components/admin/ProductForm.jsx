import { useState } from "react";

export default function ProductForm({ initial, categories, onSubmit, loading }) {
  const [form, setForm] = useState(
    initial || {
      nom: "",
      description: "",
      stock: 0,
      seuil_alerte: 0,
      prix: 0,
      image: null,
      categorie_id: categories?.[0]?.id || "",
    }
  );

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 max-w-sm mx-auto text-sm"
      style={{ minWidth: 0 }}
    >
      <div>
        <label className="block font-medium mb-0.5">Nom du produit</label>
        <input
          name="nom"
          placeholder="Nom du produit"
          className="w-full border rounded px-2 py-1"
          value={form.nom}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label className="block font-medium mb-0.5">Description</label>
        <textarea
          name="description"
          placeholder="Description"
          className="w-full border rounded px-2 py-1"
          value={form.description}
          onChange={handleChange}
          rows={2}
        />
      </div>
      <div className="flex gap-2">
        <div className="w-1/3">
          <label className="block font-medium mb-0.5">Stock</label>
          <input
            name="stock"
            type="number"
            placeholder="Stock"
            className="w-full border rounded px-2 py-1"
            value={form.stock}
            onChange={handleChange}
            required
          />
        </div>
        <div className="w-1/3">
          <label className="block font-medium mb-0.5">Seuil</label>
          <input
            name="seuil_alerte"
            type="number"
            placeholder="Seuil"
            className="w-full border rounded px-2 py-1"
            value={form.seuil_alerte}
            onChange={handleChange}
            required
          />
        </div>
        <div className="w-1/3">
          <label className="block font-medium mb-0.5">Prix</label>
          <input
            name="prix"
            type="number"
            placeholder="Prix"
            className="w-full border rounded px-2 py-1"
            value={form.prix}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div>
        <label className="block font-medium mb-0.5">Catégorie</label>
        <select
          name="categorie_id"
          className="w-full border rounded px-2 py-1"
          value={form.categorie_id}
          onChange={handleChange}
          required
        >
          <option value="">Sélectionner une catégorie</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.nom}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-medium mb-0.5">Image</label>
        <input
          name="image"
          type="file"
          accept="image/*"
          className="w-full border rounded px-2 py-1"
          onChange={handleChange}
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-1.5 font-semibold text-base"
        disabled={loading}
      >
        {loading ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
