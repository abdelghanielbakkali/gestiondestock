import { useState, useEffect } from "react";
import { 
    Truck, 
    CheckCircle, 
    Clock, 
    XCircle, 
    Search, 
    Filter,
    Calendar,
    Package,
    User,
    AlertCircle,
    RefreshCw,
    MapPin,
    Phone,
    Mail,
    ShoppingCart
} from "lucide-react";
import api from "../../lib/axios";

export default function Livraisons() {
    const [livraisons, setLivraisons] = useState([]);
    const [filteredLivraisons, setFilteredLivraisons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchLivraisons();
    }, []);

    useEffect(() => {
        let filtered = [...livraisons];

        if (searchTerm) {
            filtered = filtered.filter(livraison => 
                livraison.commande?.id.toString().includes(searchTerm) ||
                livraison.commande?.utilisateur?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                livraison.commande?.utilisateur?.prenom?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter) {
            filtered = filtered.filter(livraison => 
                livraison.statut === statusFilter
            );
        }

        setFilteredLivraisons(filtered);
    }, [livraisons, searchTerm, statusFilter]);

    const fetchLivraisons = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get("/livraisons/mes");
            console.log("📦 Livraisons reçues:", res.data);
            setLivraisons(res.data.data || []);
        } catch (error) {
            console.error("Erreur API:", error);
            setError(error.message || "Erreur de chargement");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (livraisonId, newStatus) => {
    try {
        setActionLoading(livraisonId);

        // Appel API pour changer le statut
        const res = await api.put(`/livraisons/${livraisonId}`, {
            statut: newStatus
        });

        // Met à jour la livraison dans le state avec toutes les infos à jour (commande, client, etc)
        setLivraisons(prev =>
            prev.map(liv =>
                liv.id === livraisonId
                    ? { ...liv, ...res.data, statut: newStatus, commande: res.data.commande }
                    : liv
            )
        );
    } catch (error) {
        console.error("Erreur changement statut:", error);
        alert("Erreur lors du changement de statut");
    } finally {
        setActionLoading(null);
    }
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
            'livree': {
                icon: <CheckCircle className="h-4 w-4" />,
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                label: 'Livrée'
            },
            'annulee': {
                icon: <XCircle className="h-4 w-4" />,
                color: 'text-red-600',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                label: 'Annulée'
            }
        };
        return configs[status] || configs['en_attente'];
    };

    const calculateTotal = (lignes) => {
        if (!lignes || !Array.isArray(lignes)) return 0;
        return lignes.reduce((total, ligne) => {
            const quantite = Number(ligne.quantite) || 0;
            const prix = Number(ligne.prix) || 0;
            return total + (quantite * prix);
        }, 0);
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
                    <p className="text-gray-600">Chargement des livraisons...</p>
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
                        onClick={fetchLivraisons}
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
                        <h1 className="text-2xl font-bold text-gray-900">Suivi Livraisons</h1>
                        <p className="text-gray-600">Gérez le suivi de vos livraisons</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{livraisons.length}</div>
                            <div className="text-sm text-gray-500">Total</div>
                        </div>
                        <div className="w-px h-8 bg-gray-300"></div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-amber-600">{livraisons.filter(l => l.statut === 'en_attente').length}</div>
                            <div className="text-sm text-gray-500">En attente</div>
                        </div>
                    </div>
                </div>

                {/* Statistiques rapides */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { status: 'en_attente', label: 'En attente', color: 'amber', icon: Clock },
                        { status: 'livree', label: 'Livrées', color: 'green', icon: CheckCircle },
                        { status: 'annulee', label: 'Annulées', color: 'red', icon: XCircle }
                    ].map(({ status, label, color, icon: Icon }) => (
                        <div key={status} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">{label}</p>
                                    <p className={`text-xl font-bold text-${color}-600`}>
                                        {livraisons.filter(l => l.statut === status).length}
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
                            placeholder="Rechercher par ID commande, nom ou prénom client..."
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
                        <option value="livree">Livrée</option>
                        <option value="annulee">Annulée</option>
                    </select>
                </div>
            </div>

            {/* Liste des livraisons */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Liste des livraisons</h2>
                        <span className="text-sm text-gray-500">
                            {filteredLivraisons.length} livraison(s)
                        </span>
                    </div>
                </div>
                
                <div className="p-6">
                    {filteredLivraisons.length > 0 ? (
                        <div className="space-y-4">
                            {filteredLivraisons.map((livraison) => {
                                const statusConfig = getStatusConfig(livraison.statut);
                                const commande = livraison.commande;
                                const client = commande?.utilisateur;
                                const calculatedTotal = calculateTotal(commande?.lignes_de_commande);
                                
                                return (
                                    <div key={livraison.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <Truck className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        Livraison #{livraison.id}
                                                    </h3>
                                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="h-4 w-4" />
                                                            {new Date(livraison.date).toLocaleDateString('fr-FR')}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Package className="h-4 w-4" />
                                                            Commande #{commande?.id}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <User className="h-4 w-4" />
                                                            {client?.prenom} {client?.nom}
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
                                                
                                                {livraison.statut === 'en_attente' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleStatusChange(livraison.id, 'livree')}
                                                            disabled={actionLoading === livraison.id}
                                                            className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition disabled:opacity-50 flex items-center gap-1 text-sm font-medium"
                                                        >
                                                            {actionLoading === livraison.id ? (
                                                                <div className="animate-spin rounded-full h-3 w-3 border border-green-600 border-t-transparent"></div>
                                                            ) : (
                                                                <CheckCircle size={14} />
                                                            )}
                                                            Marquer livrée
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(livraison.id, 'annulee')}
                                                            disabled={actionLoading === livraison.id}
                                                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition disabled:opacity-50 flex items-center gap-1 text-sm font-medium"
                                                        >
                                                            {actionLoading === livraison.id ? (
                                                                <div className="animate-spin rounded-full h-3 w-3 border border-red-600 border-t-transparent"></div>
                                                            ) : (
                                                                <XCircle size={14} />
                                                            )}
                                                            Annuler
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Informations du client */}
                                        {client && (
                                            <div className="mt-4">
                                                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                                                    <User className="h-4 w-4 text-blue-600" />
                                                    Informations du client
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                                <User className="h-4 w-4 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500">Nom complet</p>
                                                                <p className="font-medium text-gray-900">
                                                                    {client.prenom} {client.nom}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                                <Phone className="h-4 w-4 text-green-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500">Téléphone</p>
                                                                <p className="font-medium text-gray-900">
                                                                    {client.telephone || 'Non renseigné'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                                <Mail className="h-4 w-4 text-purple-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500">Email</p>
                                                                <p className="font-medium text-gray-900">
                                                                    {client.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                                                <MapPin className="h-4 w-4 text-orange-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500">Adresse de livraison</p>
                                                                <p className="font-medium text-gray-900">
                                                                    {client.adresse || 'Non renseignée'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                                <ShoppingCart className="h-4 w-4 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500">Total commande</p>
                                                                <p className="font-medium text-gray-900">
                                                                    {calculatedTotal.toFixed(2)} MAD
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                                                <Calendar className="h-4 w-4 text-gray-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-gray-500">Date commande</p>
                                                                <p className="font-medium text-gray-900">
                                                                    {new Date(commande?.date).toLocaleDateString('fr-FR')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune livraison trouvée</h3>
                            <p className="text-gray-500 mb-4">Aucune livraison ne correspond à vos critères.</p>
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
        </div>
    );
}