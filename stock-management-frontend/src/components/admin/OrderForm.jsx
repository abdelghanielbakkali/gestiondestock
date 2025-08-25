import { useState, useEffect } from "react";
import api from "../../lib/axios";

function formatDateToInput(dateStr) {
  if (!dateStr) return "";
  // Accepte déjà le format yyyy-mm-dd
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  // Sinon, tente de parser jj-mm-aaaa ou autre
  const d = new Date(dateStr);
  if (!isNaN(d)) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  return "";
}

function formatDateToDisplay(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (!isNaN(d)) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }
  return dateStr;
}

export default function OrderForm({ order, onClose, onSaved, suppliers }) {
  const [form, setForm] = useState({
    fournisseur_id: order?.fournisseur_id || "",
    date: formatDateToInput(order?.date) || "",
    statut: order?.statut || "en_attente",
    total: order?.total || "",
    user_id: order?.user_id || "",
  });
  const [lignes, setLignes] = useState(order?.lignes_de_commande || [
    { produit_id: "", quantite: 1, prix: 0 }
  ]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/produits").then(res => {
      setProducts(res.data.data || res.data);
    });
  }, []);
  useEffect(() => {
    api.get("/me").then(res => {
      setForm(f => ({ ...f, user_id: res.data.id }));
    });
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLigneChange = (idx, field, value) => {
    setLignes(lignes =>
      lignes.map((l, i) => i === idx ? { ...l, [field]: value } : l)
    );
  };

  const addLigne = () => setLignes([...lignes, { produit_id: "", quantite: 1, prix: 0 }]);
  const removeLigne = idx => setLignes(lignes => lignes.filter((_, i) => i !== idx));

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    try {
      const data = {
        ...form,
        date: form.date, // déjà au format yyyy-mm-dd
        lignes,
      };
      if (order) {
        await api.put(`/commandes/${order.id}`, data);
      } else {
        await api.post("/commandes", data);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">{order ? "Modifier" : "Ajouter"} une commande</h2>
        {order && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700">ID de la commande</label>
            <input
              type="text"
              value={order.id}
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
            />
          </div>
        )}
        <select
          name="fournisseur_id"
          className="w-full border rounded px-3 py-2 mb-3"
          value={form.fournisseur_id}
          onChange={handleChange}
          required
        >
          <option value="">Choisir un fournisseur</option>
          {suppliers.map(f => (
            <option key={f.id} value={f.id}>{f.nom}</option>
          ))}
        </select>
        <input
          name="date"
          type="date"
          className="w-full border rounded px-3 py-2 mb-3"
          value={form.date}
          onChange={handleChange}
          required
        />
        <input
          name="total"
          type="number"
          placeholder="Total"
          className="w-full border rounded px-3 py-2 mb-3"
          value={form.total}
          onChange={handleChange}
          required
        />
        <select
          name="statut"
          className="w-full border rounded px-3 py-2 mb-3"
          value={form.statut}
          onChange={handleChange}
        >
          <option value="en_attente">En attente</option>
          <option value="en_cours">En cours</option>
          <option value="livree">Livrée</option>
          <option value="annulee">Annulée</option>
        </select>
        <div className="mb-3">
          <h3 className="font-semibold mb-2">Produits de la commande</h3>
          {lignes.map((ligne, idx) => (
            <div key={idx} className="flex gap-2 mb-2 items-center">
              <select
                value={ligne.produit_id}
                onChange={e => handleLigneChange(idx, "produit_id", e.target.value)}
                className="border rounded px-2 py-1"
                required
              >
                <option value="">Produit</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.nom}</option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={ligne.quantite}
                onChange={e => handleLigneChange(idx, "quantite", e.target.value)}
                placeholder="Quantité"
                className="border rounded px-2 py-1 w-20"
                required
              />
              <input
                type="number"
                min={0}
                value={ligne.prix}
                onChange={e => handleLigneChange(idx, "prix", e.target.value)}
                placeholder="Prix"
                className="border rounded px-2 py-1 w-24"
                required
              />
              <button type="button" onClick={() => removeLigne(idx)} className="text-red-600">Suppr</button>
            </div>
          ))}
          <button type="button" onClick={addLigne} className="text-blue-600 font-semibold">+ Ajouter un produit</button>
        </div>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200">Annuler</button>
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">
            {order ? "Enregistrer" : "Ajouter"}
          </button>
        </div>
      </form>
    </div>
  );
} 