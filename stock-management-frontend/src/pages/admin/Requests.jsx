import { useEffect, useState } from "react";
import api from "../../lib/axios";
import RequestDetail from "../../components/admin/RequestDetail";
import Table from "../../components/admin/Table";
import { Eye, Trash2 } from "lucide-react";

function buildBackendBase() {
  const apiUrl = import.meta.env.VITE_API_URL || "";
  return apiUrl.replace(/\/api\/?$/, "") || "http://127.0.0.1:8000";
}

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [status, setStatus] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchRequests = async () => {
    try {
      const params = status !== "all" ? { statut: status } : {};
      const res = await api.get("/demandes-creation-compte", { params });
      setRequests(res.data.data || res.data);
    } catch (error) {
      console.error("Erreur lors du chargement des demandes :", error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [status]);

  const handleDetail = (req) => {
    setSelectedRequest(req);
    setModalOpen(true);
  };

  const handleDeleteRequest = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette demande ?")) {
      try {
        await api.delete(`/demandes-creation-compte/${id}`);
        alert("Demande supprimée avec succès.");
        fetchRequests();
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        alert("Impossible de supprimer la demande.");
      }
    }
  };

  const getPhotoUrl = (req) => {
    // 1) URL Cloudinary/absolue
    if (req?.photo && /^https?:\/\//i.test(req.photo)) return req.photo;
    if (req?.photo_url && /^https?:\/\//i.test(req.photo_url)) return req.photo_url;

    // 2) Base backend depuis VITE_API_URL
    const base = buildBackendBase();
    if (req?.photo_url) return req.photo_url;
    if (req?.photo) return `${base}/storage/${req.photo}`;

    return null;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-800">Demandes de création de compte</h2>
      </div>

      <div className="flex justify-between mb-4">
        <select
          className="border rounded px-3 py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="approuvee">Approuvée</option>
          <option value="refusee">Refusée</option>
        </select>
      </div>

      <Table
        columns={[
          { 
            label: "Photo", 
            key: "photo",
            render: (req) => getPhotoUrl(req) ? (
              <img
                src={getPhotoUrl(req)}
                alt="Profil"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                ?
              </div>
            )
          },
          { 
            label: "Nom complet", 
            key: "fullName",
            render: (req) => `${req.prenom} ${req.nom}`
          },
          { label: "Email", key: "email" },
          { 
            label: "Rôle", 
            key: "role_demande",
            render: (req) => (
              <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                {req.role_demande}
              </span>
            )
          },
          { 
            label: "Statut", 
            key: "statut",
            render: (req) => (
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                req.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                req.statut === 'approuvee' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {req.statut}
              </span>
            )
          },
          { 
            label: "Actions", 
            key: "actions",
            render: (req) => (
              <div className="flex gap-3">
                <button
                  onClick={() => handleDetail(req)}
                  aria-label="Détail"
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Eye size={20} />
                </button>
                <button
                  onClick={() => handleDeleteRequest(req.id)}
                  aria-label="Supprimer"
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            )
          },
        ]}
        data={requests}
        emptyMessage="Aucune demande trouvée."
      />

      {modalOpen && (
        <RequestDetail
          request={selectedRequest}
          onClose={() => setModalOpen(false)}
          onUpdated={fetchRequests}
        />
      )}
    </div>
  );
}