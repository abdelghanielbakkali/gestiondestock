import { useEffect, useState, useRef } from "react";
import { fetchUsers, createUser, updateUser, deleteUser } from "../../api/admin";
import Table from "../../components/admin/Table";
import Modal from "../../components/admin/Modal";
import UserForm from "../../components/admin/UserForm";
import { UserPlus, Edit, Trash2, Search } from "lucide-react";

function buildBackendBase() {
  const apiUrl = import.meta.env.VITE_API_URL || "";
  return apiUrl.replace(/\/api\/?$/, "") || "http://127.0.0.1:8000";
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    const params = { page, search, role: roleFilter };
    try {
      const res = await fetchUsers(params);
      setUsers(res.data.data);
      setMeta(res.data.meta);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, search, roleFilter]);

  const getPhotoUrl = (user) => {
    // 1) URL Cloudinary/absolue
    if (user?.photo && /^https?:\/\//i.test(user.photo)) return user.photo;
    if (user?.photo_url && /^https?:\/\//i.test(user.photo_url)) return user.photo_url;

    // 2) Base backend depuis VITE_API_URL
    const base = buildBackendBase();
    if (user?.photo_url) return user.photo_url;
    if (user?.photo) return `${base}/storage/${user.photo}`;

    return null;
  };

  const columns = [
    {
      key: "photo",
      label: "Photo",
      render: (user) => {
        const photoUrl = getPhotoUrl(user);
        if (photoUrl) {
          return (
            <img
              src={photoUrl}
              alt="profil"
              className="w-10 h-10 rounded-full object-cover"
            />
          );
        }
        return (
          <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            {user.prenom?.[0] || "?"}
          </span>
        );
      },
    },
    { key: "fullName", label: "Nom", render: (user) => `${user.prenom} ${user.nom}` },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Rôle",
      render: (user) => (
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
          {user.role}
        </span>
      ),
    },
    { key: "telephone", label: "Téléphone" },
    { key: "adresse", label: "Adresse" },
  ];

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-blue-800">Utilisateurs</h2>
        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow hover:bg-blue-700 transition"
          onClick={() => {
            setEditUser(null);
            setModalOpen(true);
          }}
        >
          <UserPlus size={18} />
          Ajouter
        </button>
      </div>
      <div className="flex gap-4 mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Recherche par nom ou email"
            className="border rounded px-3 py-2 pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Search className="absolute left-2 top-2.5 text-blue-400" size={18} />
        </div>
        <select
          className="border rounded px-3 py-2"
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
        >
          <option value="">Tous les rôles</option>
          <option value="admin">Admin</option>
          <option value="gestionnaire">Gestionnaire</option>
          <option value="fournisseur">Fournisseur</option>
        </select>
      </div>
      <Table
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="Aucun utilisateur trouvé."
        actions={(user) => (
          <>
            <button
              className="p-2 rounded hover:bg-blue-50"
              onClick={() => {
                setEditUser(user);
                setModalOpen(true);
              }}
            >
              <Edit size={18} className="text-blue-600" />
            </button>
            <button
              className="p-2 rounded hover:bg-red-50"
              onClick={() => {
                setDeleteId(user.id);
                setConfirmOpen(true);
              }}
            >
              <Trash2 size={18} className="text-red-600" />
            </button>
          </>
        )}
      />
      <div className="flex justify-end mt-4 gap-2">
        {meta?.links?.map(
          (link, idx) =>
            link.url && (
              <button
                key={idx}
                className={`px-3 py-1 rounded ${
                  link.active
                    ? "bg-blue-600 text-white"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
                onClick={() => handlePageChange(Number(link.label))}
                disabled={link.active}
              >
                {link.label}
              </button>
            )
        )}
      </div>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editUser ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
      >
        <UserForm
          initial={editUser}
          loading={formLoading}
          onSubmit={async (form) => {
            setFormLoading(true);
            try {
              const data = new FormData();
              Object.entries(form).forEach(([key, value]) => {
                if (value) data.append(key, value);
              });
              if (editUser) {
                await updateUser(editUser.id, data);
              } else {
                await createUser(data);
              }
              setModalOpen(false);
              setEditUser(null);
              loadUsers();
            } catch (e) {
              alert("Erreur lors de l'enregistrement.");
            } finally {
              setFormLoading(false);
            }
          }}
        />
      </Modal>
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirmer la suppression"
      >
        <div className="space-y-4">
          <p>Voulez-vous vraiment supprimer cet utilisateur ?</p>
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
                  await deleteUser(deleteId);
                  setConfirmOpen(false);
                  loadUsers();
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
    </div>
  );
}