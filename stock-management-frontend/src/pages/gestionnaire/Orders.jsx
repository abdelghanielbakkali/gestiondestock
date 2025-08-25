import { useEffect, useState } from "react";
import api from "../../lib/axios";
import OrderForm from "../../components/admin/OrderForm";
import Table from "../../components/admin/Table";
import { useNavigate } from "react-router-dom";
import { Eye, Edit, Trash2 } from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [supplier, setSupplier] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    const res = await api.get("/commandes", { params: { search, supplier } });
    setOrders(res.data.data || res.data);
  };

  const fetchSuppliers = async () => {
    const res = await api.get("/fournisseurs");
    setSuppliers(res.data.data || res.data);
  };

  useEffect(() => {
    fetchOrders();
    fetchSuppliers();
  }, [search, supplier]);

  const handleEdit = (order) => {
    setEditOrder(order);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cette commande ?")) {
      await api.delete(`/commandes/${id}`);
      fetchOrders();
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          className="border rounded px-3 py-2"
          placeholder="Rechercher par ID"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2"
          value={supplier}
          onChange={e => setSupplier(e.target.value)}
        >
          <option value="">Tous les fournisseurs</option>
          {suppliers.map(f => (
            <option key={f.id} value={f.id}>{f.nom}</option>
          ))}
        </select>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => { setEditOrder(null); setModalOpen(true); }}
        >
          Ajouter une commande
        </button>
      </div>
      <Table
        columns={[
          { label: "ID", key: "id" },
          { label: "Fournisseur", key: "fournisseur_nom" },
          { label: "Date", key: "date" },
          { label: "Total", key: "total" },
          { label: "Statut", key: "statut" },
          { label: "Actions", key: "actions" },
        ]}
        data={orders.map(order => ({
          ...order,
          fournisseur_nom: order.fournisseur?.nom || "-",
          date: order.date ? new Date(order.date).toISOString().slice(0, 10) : "-",
          actions: (
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate(`/admin/orders/${order.id}`)}
                aria-label="Détail"
                className="text-blue-600 hover:text-blue-800"
              >
                <Eye size={20} />
              </button>
              <button
                onClick={() => handleEdit(order)}
                aria-label="Modifier"
                className="text-green-600 hover:text-green-800"
              >
                <Edit size={20} />
              </button>
              <button
                onClick={() => handleDelete(order.id)}
                aria-label="Supprimer"
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ),
        }))}
      />
      {modalOpen && (
        <OrderForm
          order={editOrder}
          onClose={() => setModalOpen(false)}
          onSaved={fetchOrders}
          suppliers={suppliers}
        />
      )}
    </div>
  );
}
