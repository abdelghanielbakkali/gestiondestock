import { useEffect, useState } from "react";
import api from "../../lib/axios";
import SupplierForm from "../../components/admin/SupplierForm";
import Table from "../../components/admin/Table";
import { Plus, Search, Edit, Trash2 } from "lucide-react";

function buildBackendBase() {
  const apiUrl = import.meta.env.VITE_API_URL || "";
  return apiUrl.replace(/\/api\/?$/, "") || "http://127.0.0.1:8000";
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/fournisseurs", { params: { search } });
      setSuppliers(res.data.data || res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [search]);

  const handleEdit = (supplier) => {
    setEditSupplier(supplier);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce fournisseur ?")) {
      await api.delete(`/fournisseurs/${id}`);
      fetchSuppliers();
    }
  };

  const getPhotoUrl = (supplier) => {
    // 1) URL Cloudinary/absolue
    if (supplier?.image && /^https?:\/\//i.test(supplier.image)) return supplier.image;
    if (supplier?.image_url && /^https?:\/\//i.test(supplier.image_url)) return supplier.image_url;

    // 2) Base backend depuis VITE_API_URL
    const base = buildBackendBase();
    if (supplier?.image_url) return supplier.image_url;
    if (supplier?.image) return `${base}/storage/${supplier.image}`;

    return null;
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none" />
          <input
            type="search"
            className="border rounded pl-10 pr-3 py-2 w-full"
            placeholder="Rechercher un fournisseur"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
          onClick={() => { setEditSupplier(null); setModalOpen(true); }}
        >
          <Plus />
          Ajouter un fournisseur
        </button>
      </div>
      <Table
        columns={[
          { 
            label: "Photo", 
            key: "photo",
            render: (supplier) => getPhotoUrl(supplier) ? (
              <img
                src={getPhotoUrl(supplier)}
                alt="photo"
                className="h-10 w-10 rounded-full object-cover border"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                ?
              </div>
            )
          },
          { label: "Nom", key: "nom" },
          { label: "Email", key: "email" },
          { label: "Téléphone", key: "telephone" },
          { label: "Adresse", key: "adresse" },
          { 
            label: "Actions", 
            key: "actions",
            render: (supplier) => (
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => handleEdit(supplier)}
                  aria-label="Modifier"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleDelete(supplier.id)}
                  aria-label="Supprimer"
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            )
          },
        ]}
        data={suppliers}
        loading={loading}
      />
      {modalOpen && (
        <SupplierForm
          supplier={editSupplier}
          onClose={() => setModalOpen(false)}
          onSaved={fetchSuppliers}
        />
      )}
    </div>
  );
}