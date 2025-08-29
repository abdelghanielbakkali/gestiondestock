import { useEffect, useState, useRef } from "react";
import { LogOut, Bell, User, ChevronDown, Eye, Mail, Phone, MapPin } from "lucide-react";
import api from "../../lib/axios";

function buildBackendBase() {
  const apiUrl = import.meta.env.VITE_API_URL || "";
  return apiUrl.replace(/\/api\/?$/, "") || "http://127.0.0.1:8000";
}

export default function Header() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
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
      const res = await api.get("/me");
      setUser(res.data);
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth";
  };

  const getPhotoUrl = () => {
    // 1) URL Cloudinary/absolue
    if (user?.photo && /^https?:\/\//i.test(user.photo)) return user.photo;
    if (user?.photo_url && /^https?:\/\//i.test(user.photo_url)) return user.photo_url;

    // 2) Base backend depuis VITE_API_URL
    const base = buildBackendBase();
    if (user?.photo_url) return user.photo_url;
    if (user?.photo) return `${base}/storage/${user.photo}`;

    return null;
  };

  return (
    <>
      <header className="flex items-center justify-between px-8 py-4 bg-white shadow relative">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center border border-blue-200">
            {getPhotoUrl() ? (
              <img
                src={getPhotoUrl()}
                alt="Photo de profil"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <User className="w-7 h-7 text-blue-600" />
            )}
          </div>
          <div>
            <div className="font-semibold text-blue-900 text-lg">
              {user?.prenom} {user?.nom}
            </div>
            <div className="text-xs text-gray-500">{user?.email}</div>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowProfileMenu((v) => !v)}
              className="ml-2 p-2 rounded-full hover:bg-blue-50 transition"
            >
              <ChevronDown className="w-5 h-5 text-blue-600" />
            </button>
            
            {showProfileMenu && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
                <button
                  onClick={() => {
                    setShowProfileModal(true);
                    setShowProfileMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
                >
                  <Eye className="w-4 h-4 text-blue-600" />
                  Voir le profil
                </button>
                <button
                  onClick={logout}
                  className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="relative p-2 rounded-full hover:bg-blue-100 transition">
            <Bell className="text-blue-600" size={24} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 border-4 border-white shadow-lg">
                  {getPhotoUrl() ? (
                    <img
                      src={getPhotoUrl()}
                      alt="Photo de profil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <User className="w-10 h-10 text-blue-600" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {user?.prenom} {user?.nom}
                  </h2>
                  <p className="text-sm text-gray-600 mb-2">Gestionnaire</p>
                  <div className="flex items-center gap-1 text-blue-600">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs font-medium">En ligne</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium text-gray-900">{user?.email}</div>
                </div>
              </div>

              {user?.telephone && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Téléphone</div>
                    <div className="font-medium text-gray-900">{user.telephone}</div>
                  </div>
                </div>
              )}

              {user?.adresse && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-500">Adresse</div>
                    <div className="font-medium text-gray-900">{user.adresse}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 pt-0">
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}