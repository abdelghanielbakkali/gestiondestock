import { useEffect, useState } from "react";
import api from "../../lib/axios";
import SupplierForm from "../../components/admin/SupplierForm";
import Table from "../../components/admin/Table";
import { Plus, Search, Edit, Trash2 } from "lucide-react";

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
    // eslint-disable-next-line
  }, [search]);

  const handleEdit = (supplier) => {
    setEditSupplier(supplier);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer ce fournisseur ?")) {
      await api.delete(`/fournisseurs/${id}`);
      fetchSuppliers();
    }
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
          { label: "Photo", key: "photo" },
          { label: "Nom", key: "nom" },
          { label: "Email", key: "email" },
          { label: "Téléphone", key: "telephone" },
          { label: "Adresse", key: "adresse" },
          { label: "Actions", key: "actions" },
        ]}
        data={suppliers.map(supplier => ({
          ...supplier,
          photo: supplier.image_url ? (
            <img
              src={supplier.image_url}
              alt="photo"
              className="h-10 w-10 rounded-full object-cover border"
            />
          ) : "-",
          actions: (
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
          ),
        }))}
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
