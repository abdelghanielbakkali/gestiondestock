import { useEffect, useState } from "react";
import api from "../../lib/axios";
import CategoryForm from "../../components/admin/CategoryForm";
import Modal from "../../components/admin/Modal";
import { Edit, Trash2, Search } from "lucide-react";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);

  const fetchCategories = async () => {
    const res = await api.get("/categories", { params: { search } });
    setCategories(res.data.data || res.data);
  };

  useEffect(() => {
    fetchCategories();
  }, [search]);

  const handleEdit = (cat) => {
    setEditCategory(cat);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cette catégorie ?")) {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* Barre de recherche + bouton Ajouter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Rechercher une catégorie"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
        <button
          onClick={() => {
            setEditCategory(null);
            setModalOpen(true);
          }}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition flex items-center gap-2"
        >
          Ajouter une catégorie
        </button>
      </div>

      {/* Tableau responsive */}
      <div className="overflow-x-auto border rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Nom
              </th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Description
              </th>
              <th className="text-center px-6 py-3 text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-8 text-gray-500">
                  Aucune catégorie trouvée.
                </td>
              </tr>
            )}
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-gray-800">{cat.nom}</td>
                <td className="px-6 py-4 text-gray-600">{cat.description || "-"}</td>
                <td className="px-6 py-4 text-center flex justify-center gap-6">
                  <button
                    onClick={() => handleEdit(cat)}
                    aria-label="Modifier"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    aria-label="Supprimer"
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal ajout / modification */}
      {modalOpen && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editCategory ? "Modifier la catégorie" : "Ajouter une catégorie"}>
          <CategoryForm
            category={editCategory}
            onClose={() => setModalOpen(false)}
            onSaved={() => {
              fetchCategories();
              setModalOpen(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
