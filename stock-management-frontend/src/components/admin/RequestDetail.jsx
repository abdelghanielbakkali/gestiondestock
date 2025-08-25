import api from "../../lib/axios";
import { useState } from "react";

export default function RequestDetail({ request, onClose, onUpdated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!request) return null;

  // Récupérer l'URL de la photo
  const getPhotoUrl = () => {
    if (request?.photo_url) {
      return request.photo_url;
    }
    if (request?.photo) {
      return `${
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
      }/storage/${request.photo}`;
    }
    return null;
  };

  // Action d'approbation / refus
  const handleAction = async (action) => {
    setLoading(true);
    setError("");
    try {
      await api.put(`/demandes-creation-compte/${request.id}`, {
        statut: action,
      });
      onUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  // Suppression de la demande de création de compte
  const handleDeleteRequest = async () => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette demande ?")) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.delete(`/demandes-creation-compte/${request.id}`);
      onUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Détail de la demande</h2>

        {/* Image de profil */}
        <div className="flex justify-center mb-4">
          {getPhotoUrl() ? (
            <img
              src={getPhotoUrl()}
              alt="Photo de profil"
              className="w-24 h-24 rounded-full object-cover border border-blue-400"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
              ?
            </div>
          )}
        </div>

        {/* Informations */}
        <div className="mb-2">
          <strong>Prénom :</strong> {request.prenom}
        </div>
        <div className="mb-2">
          <strong>Nom :</strong> {request.nom}
        </div>
        <div className="mb-2">
          <strong>Email :</strong> {request.email}
        </div>
        <div className="mb-2">
          <strong>Téléphone :</strong> {request.telephone || "Non renseigné"}
        </div>
        <div className="mb-2">
          <strong>Adresse :</strong> {request.adresse || "Non renseignée"}
        </div>
        <div className="mb-2">
          <strong>Rôle :</strong> {request.role_demande}
        </div>
        <div className="mb-2">
          <strong>Statut :</strong> 
          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
            request.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
            request.statut === 'approuvee' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {request.statut}
          </span>
        </div>

        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}

        {/* Boutons */}
        <div className="flex justify-end gap-2 mt-4 flex-wrap">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200"
            disabled={loading}
          >
            Fermer
          </button>

          {/* Bouton supprimer la demande */}
          <button
            onClick={handleDeleteRequest}
            className="px-4 py-2 rounded bg-red-700 text-white"
            disabled={loading}
          >
            Supprimer la demande
          </button>

          {/* Actions de statut */}
          {request.statut === "en_attente" && (
            <>
              <button
                onClick={() => handleAction("approuvee")}
                className="px-4 py-2 rounded bg-green-600 text-white"
                disabled={loading}
              >
                Approuver
              </button>
              <button
                onClick={() => handleAction("refusee")}
                className="px-4 py-2 rounded bg-red-600 text-white"
                disabled={loading}
              >
                Refuser
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}