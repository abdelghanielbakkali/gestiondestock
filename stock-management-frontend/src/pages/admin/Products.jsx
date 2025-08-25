import { useEffect, useState } from "react";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchCategories,
} from "../../api/admin";
import CardProduct from "../../components/admin/CardProduct";
import Modal from "../../components/admin/Modal";
import ProductForm from "../../components/admin/ProductForm";
import { Plus, Search } from "lucide-react";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);

  const [categories, setCategories] = useState([]);

  const loadProducts = async () => {
    setLoading(true);
    const params = { page, search };
    if (categoryFilter) params.categorie_id = categoryFilter;
    try {
      const res = await fetchProducts(params);
      setProducts(res.data.data);
      setMeta(res.data);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    const res = await fetchCategories();
    setCategories(res.data.data);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [page, search, categoryFilter]);

  const getPageNumber = (url) => {
    if (!url) return 1;
    const params = new URLSearchParams(url.split("?")[1]);
    return Number(params.get("page") || 1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-800">Produits</h2>
        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow hover:bg-blue-700 transition"
          onClick={() => {
            setEditProduct(null);
            setModalOpen(true);
          }}
        >
          <Plus size={18} />
          Ajouter
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Recherche par nom"
            className="w-full border rounded px-3 py-2 pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search
            className="absolute left-2 top-2.5 text-blue-400"
            size={18}
          />
        </div>
        <select
          className="border rounded px-3 py-2"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Toutes les catégories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nom}
            </option>
          ))}
        </select>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">
            Chargement...
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-full text-center py-8">
            Aucun produit trouvé.
          </div>
        ) : (
          products.map((product) => (
            <CardProduct
              key={product.id}
              product={product}
              onEdit={(p) => {
                setEditProduct(p);
                setModalOpen(true);
              }}
              onDelete={(p) => {
                setDeleteId(p.id);
                setConfirmOpen(true);
              }}
              onView={(p) => setViewProduct(p)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-end mt-4 gap-2 flex-wrap">
        {meta?.links?.map((link, idx) => {
          let label = link.label;
          if (
            label === "&laquo; Previous" ||
            label === "Previous &laquo;" ||
            label === "Previous"
          )
            label = "Précédent";
          if (
            label === "&raquo; Next" ||
            label === "Next &raquo;" ||
            label === "Next"
          )
            label = "Suivant";
          if (!link.url) return null;
          return (
            <button
              key={idx}
              className={`px-3 py-1 rounded ${
                link.active
                  ? "bg-blue-600 text-white"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
              onClick={() => handlePageChange(getPageNumber(link.url))}
              disabled={link.active}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Modal Ajout/Modif */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editProduct ? "Modifier le produit" : "Ajouter un produit"}
      >
        <ProductForm
          initial={editProduct}
          categories={categories}
          loading={formLoading}
          onSubmit={async (form) => {
            setFormLoading(true);
            try {
              const data = new FormData();
              Object.entries(form).forEach(([key, value]) => {
                if (value) data.append(key, value);
              });
              if (editProduct) {
                await updateProduct(editProduct.id, data);
              } else {
                await createProduct(data);
              }
              setModalOpen(false);
              setEditProduct(null);
              loadProducts();
            } catch (e) {
              alert("Erreur lors de l'enregistrement.");
            } finally {
              setFormLoading(false);
            }
          }}
        />
      </Modal>

      {/* Modal Confirmation Suppression */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirmer la suppression"
      >
        <div className="space-y-4">
          <p>Voulez-vous vraiment supprimer ce produit ?</p>
          <div className="flex gap-4 justify-end">
            <button
              className="px-4 py-2 rounded bg-gray-200"
              onClick={() => setConfirmOpen(false)}
            >
              Annuler
            </button>
            <button
              className="px-4 py-2 rounded bg-red-600 text-white"
              onClick={async () => {
                try {
                  await deleteProduct(deleteId);
                  setConfirmOpen(false);
                  loadProducts();
                } catch {
                  alert("Erreur lors de la suppression.");
                }
              }}
            >
              Supprimer
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Détail Produit - image fixe */}
      <Modal
        open={!!viewProduct}
        onClose={() => setViewProduct(null)}
        title="Détail du produit"
      >
        {viewProduct && (
          <div className="max-h-[80vh] overflow-y-auto px-4 space-y-6">
            {/* Image produit fixe 200x200 */}
            <div className="flex justify-center">
              <img
                src={
                  viewProduct.image_url ||
                  viewProduct.image ||
                  "/src/assets/stock-management.jpeg"
                }
                alt={viewProduct.nom}
                className="w-[200px] h-[200px] object-cover rounded-2xl shadow-lg border"
              />
            </div>

            {/* Nom et description */}
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-blue-800">
                {viewProduct.nom}
              </h3>
              {viewProduct.description && (
                <p className="text-slate-600 mt-2 text-sm sm:text-base whitespace-pre-line break-words">
                  {viewProduct.description}
                </p>
              )}
            </div>

            {/* Infos principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-3 rounded-xl text-center">
                <p className="text-xs text-slate-500">Stock</p>
                <p className="text-lg font-semibold text-blue-700">
                  {viewProduct.stock}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl text-center">
                <p className="text-xs text-slate-500">Seuil</p>
                <p className="text-lg font-semibold text-blue-700">
                  {viewProduct.seuil_alerte}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl text-center">
                <p className="text-xs text-slate-500">Prix</p>
                <p className="text-lg font-semibold text-blue-700">
                  {viewProduct.prix} DH
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-xl text-center">
                <p className="text-xs text-slate-500">Catégorie</p>
                <p className="text-lg font-semibold text-blue-700">
                  {viewProduct.categorie?.nom || "Sans catégorie"}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
