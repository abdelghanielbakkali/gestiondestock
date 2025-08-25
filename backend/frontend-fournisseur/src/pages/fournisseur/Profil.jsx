import { useState, useEffect } from "react";
import { User, Edit, Save, X, Camera } from "lucide-react";
import api from "../../lib/axios";

export default function Profil() {
    const [user, setUser] = useState(null);
    const [fournisseur, setFournisseur] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [formData, setFormData] = useState({
        prenom: '',
        nom: '',
        email: '',
        telephone: '',
        adresse: '',
        image: null
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const [userRes, fournisseurRes] = await Promise.all([
                api.get('/me'),
                api.get('/fournisseurs/mes')
            ]);

            const userData = userRes.data;
            const fournisseurData = fournisseurRes.data.data?.[0] || fournisseurRes.data?.[0];

            setUser(userData);
            setFournisseur(fournisseurData);

            setFormData({
                prenom: userData.prenom || '',
                nom: userData.nom || '',
                email: userData.email || '',
                telephone: userData.telephone || '',
                adresse: userData.adresse || '',
                image: null
            });
        } catch (error) {
            console.error("Erreur chargement profil:", error);
            setError("Erreur lors du chargement du profil");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('prenom', formData.prenom);
            formDataToSend.append('nom', formData.nom);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('telephone', formData.telephone);
            formDataToSend.append('adresse', formData.adresse);

            if (formData.image) {
                formDataToSend.append('photo', formData.image);
            }

            // Mettre à jour le profil utilisateur
            await api.put('/me', formDataToSend);

            // Mettre à jour le profil fournisseur si nécessaire
            if (fournisseur) {
                await api.put(`/fournisseurs/${fournisseur.id}`, {
                    // Ajoutez ici les champs spécifiques au fournisseur si nécessaire
                });
            }

            setSuccess("Profil mis à jour avec succès !");
            setEditing(false);
            fetchProfile(); // Recharger les données
        } catch (error) {
            console.error("Erreur mise à jour profil:", error);
            setError(error.response?.data?.message || "Erreur lors de la mise à jour");
        } finally {
            setSaving(false);
        }
    };

    const cancelEdit = () => {
        setEditing(false);
        setFormData({
            prenom: user?.prenom || '',
            nom: user?.nom || '',
            email: user?.email || '',
            telephone: user?.telephone || '',
            adresse: user?.adresse || '',
            image: null
        });
        setError(null);
        setSuccess(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto mt-6 px-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
                    {!editing && (
                        <button
                            onClick={() => setEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Edit className="h-4 w-4" />
                            Modifier
                        </button>
                    )}
                </div>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-600">{success}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Photo de profil */}
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                {user?.photo_url ? (
                                    <img
                                        src={user.photo_url}
                                        alt="Photo de profil"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-12 h-12 text-gray-400" />
                                )}
                            </div>
                            {editing && (
                                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition">
                                    <Camera className="w-4 h-4" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {user?.prenom} {user?.nom}
                            </h3>
                            <p className="text-gray-600">Fournisseur</p>
                        </div>
                    </div>

                    {/* Informations personnelles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Prénom
                            </label>
                            <input
                                type="text"
                                name="prenom"
                                value={formData.prenom}
                                onChange={handleInputChange}
                                disabled={!editing}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nom
                            </label>
                            <input
                                type="text"
                                name="nom"
                                value={formData.nom}
                                onChange={handleInputChange}
                                disabled={!editing}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={!editing}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Téléphone
                            </label>
                            <input
                                type="tel"
                                name="telephone"
                                value={formData.telephone}
                                onChange={handleInputChange}
                                disabled={!editing}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                            />
                        </div>
                    </div>

                    {/* Adresse */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Adresse
                        </label>
                        <textarea
                            name="adresse"
                            value={formData.adresse}
                            onChange={handleInputChange}
                            disabled={!editing}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        />
                    </div>

                    {/* Boutons d'action */}
                    {editing && (
                        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {saving ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {saving ? 'Enregistrement...' : 'Enregistrer'}
                            </button>
                            <button
                                type="button"
                                onClick={cancelEdit}
                                className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            >
                                <X className="h-4 w-4" />
                                Annuler
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

