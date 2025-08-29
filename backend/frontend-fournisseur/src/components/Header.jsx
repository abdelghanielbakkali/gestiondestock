import { useEffect, useState, useRef } from "react";
import { LogOut, Bell, User, Edit, Settings, ChevronDown, Camera, X, Truck } from "lucide-react";
import api from "../../lib/axios";

export default function Header() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [user, setUser] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        prenom: '',
        nom: '',
        telephone: '',
        adresse: '',
        image: null
    });
    const [previewImage, setPreviewImage] = useState(null);
    const menuRef = useRef(null);

    const fetchUnread = async () => {
        try {
            const res = await api.get("/notifications/unread-count", {
                params: { type: "nouvelle_commande" },
            });
            setUnreadCount(res.data.count);
        } catch (error) {
            console.error("Erreur chargement notifications", error);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const res = await api.get('/me');
            setUser(res.data);
            setFormData({
                prenom: res.data.prenom || '',
                nom: res.data.nom || '',
                telephone: res.data.telephone || '',
                adresse: res.data.adresse || '',
                image: null
            });
        } catch (error) {
            console.error("Erreur chargement profil:", error);
        }
    };

    useEffect(() => {
        fetchUnread();
        fetchUserProfile();
        window.addEventListener("refresh-notif-count", fetchUnread);
        const interval = setInterval(fetchUnread, 10000);
        return () => {
            clearInterval(interval);
            window.removeEventListener("refresh-notif-count", fetchUnread);
        };
    }, []);

    // Fermer le menu si on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

            // Créer un aperçu de l'image
            const reader = new FileReader();
            reader.onload = (e) => setPreviewImage(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('prenom', formData.prenom);
            formDataToSend.append('nom', formData.nom);
            formDataToSend.append('telephone', formData.telephone);
            formDataToSend.append('adresse', formData.adresse);

            if (formData.image) {
                formDataToSend.append('photo', formData.image);
            }

            await api.put('/me', formDataToSend);
            await fetchUserProfile(); // Recharger les données
            setShowEditModal(false);
            setPreviewImage(null);
            setFormData(prev => ({ ...prev, image: null }));
        } catch (error) {
            console.error("Erreur mise à jour profil:", error);
            alert("Erreur lors de la mise à jour");
        } finally {
            setSaving(false);
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        window.location.href = "/auth";
    };

    const getPhotoUrl = () => {
        if (user?.photo) {
            return user.photo.startsWith('http') ? user.photo : `/storage/${user.photo}`;
        }
        return null;
    };

    return (
        <>
            <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo/Title côté gauche */}
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Truck className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-xl font-bold">GestionStock</span>
                            </div>
                        </div>

                        {/* Côté droit - Notifications et Profil */}
                        <div className="flex items-center space-x-4">
                            {/* Bouton Notifications */}
                            <button className="relative p-2 rounded-full hover:bg-white/20 transition-all duration-200 group">
                                <Bell className="w-6 h-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                    Notifications
                                </span>
                            </button>

                            {/* Profil utilisateur */}
                            <div className="relative" ref={menuRef}>
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex items-center space-x-3 p-2 rounded-full hover:bg-white/20 transition-all duration-200 group"
                                >
                                    {/* Photo de profil */}
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 shadow-lg">
                                            {getPhotoUrl() ? (
                                                <img
                                                    src={getPhotoUrl()}
                                                    alt="Photo de profil"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-white/20 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                                    </div>

                                    {/* Nom et prénom */}
                                    <div className="text-left">
                                        <div className="font-medium text-sm">
                                            {user?.prenom} {user?.nom}
                                        </div>
                                        <div className="text-xs text-blue-100">
                                            Fournisseur
                                        </div>
                                    </div>

                                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Menu déroulant */}
                                {showProfileMenu && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <div className="text-sm font-medium text-gray-900">
                                                {user?.prenom} {user?.nom}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {user?.email}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setShowEditModal(true);
                                                setShowProfileMenu(false);
                                            }}
                                            className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors duration-200"
                                        >
                                            <Edit className="w-4 h-4 text-blue-600" />
                                            <span>Modifier le profil</span>
                                        </button>

                                        <button
                                            onClick={logout}
                                            className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors duration-200"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Déconnexion</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Modal d'édition du profil */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        {/* Header du modal */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-xl font-semibold text-gray-900">Modifier le profil</h3>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setPreviewImage(null);
                                    setFormData(prev => ({ ...prev, image: null }));
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Photo de profil */}
                            <div className="text-center">
                                <div className="relative inline-block">
                                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center overflow-hidden mx-auto border-4 border-white shadow-lg">
                                        {(previewImage || getPhotoUrl()) ? (
                                            <img
                                                src={previewImage || getPhotoUrl()}
                                                alt="Photo de profil"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-12 h-12 text-blue-600" />
                                        )}
                                    </div>
                                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl">
                                        <Camera className="w-4 h-4" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Cliquez sur l'icône pour changer la photo</p>
                            </div>

                            {/* Champs de formulaire */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Prénom
                                    </label>
                                    <input
                                        type="text"
                                        name="prenom"
                                        value={formData.prenom}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        placeholder="Votre prénom"
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
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        placeholder="Votre nom"
                                    />
                                </div>
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                    placeholder="Votre numéro de téléphone"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Adresse
                                </label>
                                <textarea
                                    name="adresse"
                                    value={formData.adresse}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                                    placeholder="Votre adresse complète"
                                />
                            </div>

                            {/* Boutons d'action */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
                                >
                                    {saving ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Enregistrement...</span>
                                        </div>
                                    ) : (
                                        'Enregistrer'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setPreviewImage(null);
                                        setFormData(prev => ({ ...prev, image: null }));
                                    }}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium"
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}




