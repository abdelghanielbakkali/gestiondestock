import { useState, useEffect } from "react";
import {
    ShoppingCart,
    Check,
    X,
    Search,
    Clock,
    CheckCircle,
    XCircle,
    Truck,
    Package,
    Filter,
    Calendar,
    User,
    AlertCircle,
    RefreshCw,
    Trash2,
    AlertTriangle
} from "lucide-react";
import api from "../../lib/axios";

export default function Commandes() {
    const [commandes, setCommandes] = useState([]);
    const [filteredCommandes, setFilteredCommandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [actionLoading, setActionLoading] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [commandeToDelete, setCommandeToDelete] = useState(null);

    useEffect(() => {
        fetchCommandes();
    }, []);

    useEffect(() => {
        let filtered = [...commandes];

        if (searchTerm) {
            filtered = filtered.filter(commande =>
                commande.id.toString().includes(searchTerm)
            );
        }

        if (statusFilter) {
            filtered = filtered.filter(commande =>
                commande.statut === statusFilter
            );
        }

        setFilteredCommandes(filtered);
    }, [commandes, searchTerm, statusFilter]);

    const fetchCommandes = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get("/commandes/mes");
            setCommandes(res.data.data || []);
        } catch (error) {
            console.error("Erreur API:", error);
            setError(error.message || "Erreur de chargement");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (commandeId, newStatus) => {
        try {
            setActionLoading(commandeId);

            const statusMapping = {
                'acceptee': 'en_cours',
                'refusee': 'annulee'
            };

            await api.put(`/commandes/${commandeId}/statut`, {
                statut: statusMapping[newStatus] || newStatus
            });

            setCommandes(prev => prev.map(cmd =>
                cmd.id === commandeId
                    ? { ...cmd, statut: statusMapping[newStatus] || newStatus }
                    : cmd
            ));

        } catch (error) {
            console.error("Erreur changement statut:", error);
            alert("Erreur lors du changement de statut");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (commandeId) => {
        try {
            console.log("🚀 Début suppression commande:", commandeId);
            setDeleteLoading(commandeId);

            // Vérifier le token
            const token = localStorage.getItem('token');
            console.log("🔑 Token disponible:", token ? "Oui" : "Non");
            console.log("🔑 Token:", token);

            // Vérifier que l'utilisateur est connecté
            try {
                const meResponse = await api.get('/me');
                console.log("👤 Utilisateur connecté:", meResponse.data);
            } catch (authError) {
                console.error("❌ Erreur authentification:", authError);
                alert("Erreur d'authentification. Veuillez vous reconnecter.");
                localStorage.removeItem('token');
                window.location.href = '/auth';
                return;
            }

            const response = await api.delete(`/commandes/${commandeId}`);

            console.log("✅ Réponse suppression:", response);

            // Mise à jour immédiate de l'état local
            setCommandes(prev => prev.filter(cmd => cmd.id !== commandeId));
            setShowDeleteModal(false);
            setCommandeToDelete(null);

            console.log("🎉 Suppression réussie");

        } catch (error) {
            console.error("❌ Erreur suppression détaillée:", error);
            console.error("📊 Détails erreur:", {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message,
                headers: error.response?.headers
            });

            let errorMessage = "Erreur lors de la suppression";
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.status === 403) {
                errorMessage = "Vous n'êtes pas autorisé à supprimer cette commande";
            } else if (error.response?.status === 404) {
                errorMessage = "Commande non trouvée";
            } else if (error.response?.status === 401) {
                errorMessage = "Session expirée. Veuillez vous reconnecter.";
                localStorage.removeItem('token');
                window.location.href = '/auth';
                return;
            }

            console.error("💬 Message d'erreur affiché:", errorMessage);
            alert(errorMessage);
        } finally {
            console.log("🏁 Fin de la suppression, arrêt du loading");
            setDeleteLoading(null);
        }
    };

    const openDeleteModal = (commande) => {
        console.log("📋 Ouverture modal suppression pour commande:", commande.id);
        setCommandeToDelete(commande);
        setShowDeleteModal(true);
    };

    const calculateTotal = (lignes) => {
        if (!lignes || !Array.isArray(lignes)) return 0;
        return lignes.reduce((total, ligne) => {
            const quantite = Number(ligne.quantite) || 0;
            const prix = Number(ligne.prix) || 0;
            return total + (quantite * prix);
        }, 0);
    };

    const getStatusConfig = (status) => {
        const configs = {
            'en_attente': {
                icon: <Clock className="h-4 w-4" />,
                color: 'text-amber-600',
                bgColor: 'bg-amber-50',
                borderColor: 'border-amber-200',
                label: 'En attente'
            },
            'en_cours': {
                icon: <CheckCircle className="h-4 w-4" />,
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                label: 'Acceptée'
            },
            'annulee': {
                icon: <XCircle className="h-4 w-4" />,
                color: 'text-red-600',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                label: 'Refusée'
            },
            'livree': {
                icon: <Truck className="h-4 w-4" />,
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-200',
                label: 'Livrée'
            }
        };
        return configs[status] || configs['en_attente'];
    };

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des commandes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center max-w-md">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <button
                        onClick={fetchCommandes}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Mes Commandes</h1>
                        <p className="text-gray-600">Gérez les commandes reçues</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{commandes.length}</div>
                            <div className="text-sm text-gray-500">Total</div>
                        </div>
                        <div className="w-px h-8 bg-gray-300"></div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-amber-600">{commandes.filter(c => c.statut === 'en_attente').length}</div>
                            <div className="text-sm text-gray-500">En attente</div>
                        </div>
                    </div>
                </div>

                {/* Statistiques rapides */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { status: 'en_attente', label: 'En attente', color: 'amber', icon: Clock },
                        { status: 'en_cours', label: 'Acceptées', color: 'green', icon: CheckCircle },
                        { status: 'annulee', label: 'Refusées', color: 'red', icon: XCircle },
                        { status: 'livree', label: 'Livrées', color: 'blue', icon: Truck }
                    ].map(({ status, label, color, icon: Icon }) => (
                        <div key={status} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">{label}</p>
                                    <p className={`text-xl font-bold text-${color}-600`}>
                                        {commandes.filter(c => c.statut === status).length}
                                    </p>
                                </div>
                                <Icon className={`h-6 w-6 text-${color}-600`} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filtres */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Filter className="h-5 w-5 text-blue-600" />
                        Filtres
                    </h3>
                    {(searchTerm || statusFilter) && (
                        <button
                            onClick={clearFilters}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Effacer
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher par ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="en_attente">En attente</option>
                        <option value="en_cours">Acceptée</option>
                        <option value="annulee">Refusée</option>
                        <option value="livree">Livrée</option>
                    </select>
                </div>
            </div>

            {/* Liste des commandes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Liste des commandes</h2>
                        <span className="text-sm text-gray-500">
                            {filteredCommandes.length} commande(s)
                        </span>
                    </div>
                </div>

                <div className="p-6">
                    {filteredCommandes.length > 0 ? (
                        <div className="space-y-4">
                            {filteredCommandes.map((commande) => {
                                const statusConfig = getStatusConfig(commande.statut);
                                const calculatedTotal = calculateTotal(commande.lignes_de_commande);

                                return (
                                    <div key={commande.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">Commande #{commande.id}</h3>
                                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4" />
                                                            {new Date(commande.date).toLocaleDateString('fr-FR')}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-medium">{calculatedTotal.toFixed(2)} MAD</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <User className="h-4 w-4" />
                                                            {commande.utilisateur?.nom} {commande.utilisateur?.prenom}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor}`}>
                                                    <div className="flex items-center gap-1">
                                                        {statusConfig.icon}
                                                        <span>{statusConfig.label}</span>
                                                    </div>
                                                </span>

                                                {commande.statut === 'en_attente' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleStatusChange(commande.id, 'acceptee')}
                                                            disabled={actionLoading === commande.id}
                                                            className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition disabled:opacity-50 flex items-center gap-1 text-sm font-medium"
                                                        >
                                                            {actionLoading === commande.id ? (
                                                                <div className="animate-spin rounded-full h-3 w-3 border border-green-600 border-t-transparent"></div>
                                                            ) : (
                                                                <Check size={14} />
                                                            )}
                                                            Accepter
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(commande.id, 'refusee')}
                                                            disabled={actionLoading === commande.id}
                                                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50 flex items-center gap-1 text-sm font-medium"
                                                        >
                                                            {actionLoading === commande.id ? (
                                                                <div className="animate-spin rounded-full h-3 w-3 border border-red-600 border-t-transparent"></div>
                                                            ) : (
                                                                <X size={14} />
                                                            )}
                                                            Refuser
                                                        </button>
                                                    </div>
                                                )}

                                                {(commande.statut === 'en_cours' || commande.statut === 'annulee') && (
                                                    <button
                                                        onClick={() => openDeleteModal(commande)}
                                                        disabled={deleteLoading === commande.id}
                                                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50 flex items-center gap-1 text-sm font-medium"
                                                    >
                                                        {deleteLoading === commande.id ? (
                                                            <div className="animate-spin rounded-full h-3 w-3 border border-red-600 border-t-transparent"></div>
                                                        ) : (
                                                            <Trash2 size={14} />
                                                        )}
                                                        Supprimer
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Détails des produits */}
                                        <div className="mt-4">
                                            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                                <Package className="h-4 w-4 text-blue-600" />
                                                Produits commandés
                                            </h4>
                                            <div className="space-y-2">
                                                {commande.lignes_de_commande?.map((ligne) => (
                                                    <div key={ligne.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                                <Package className="h-4 w-4 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <span className="font-medium text-gray-900">{ligne.produit?.nom}</span>
                                                                <p className="text-xs text-gray-500">{ligne.produit?.description}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {ligne.quantite} × {ligne.prix} MAD
                                                            </div>
                                                            <div className="text-sm font-semibold text-blue-600">
                                                                {(Number(ligne.quantite) * Number(ligne.prix) || 0).toFixed(2)} MAD
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4 pt-3 border-t border-gray-200">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-semibold text-gray-900">Total de la commande</span>
                                                    <span className="text-lg font-bold text-blue-600">{calculatedTotal.toFixed(2)} MAD</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune commande trouvée</h3>
                            <p className="text-gray-500 mb-4">Aucune commande ne correspond à vos critères.</p>
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Effacer les filtres
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de confirmation de suppression */}
            {showDeleteModal && commandeToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                        <div className="text-center">
                            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Confirmer la suppression</h3>
                            <p className="text-gray-600 mb-6">
                                Êtes-vous sûr de vouloir supprimer la commande #{commandeToDelete.id} ?
                                Cette action est irréversible.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setCommandeToDelete(null);
                                    }}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => handleDelete(commandeToDelete.id)}
                                    disabled={deleteLoading === commandeToDelete.id}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {deleteLoading === commandeToDelete.id ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border border-white border-t-transparent"></div>
                                    ) : (
                                        <Trash2 size={16} />
                                    )}
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}



