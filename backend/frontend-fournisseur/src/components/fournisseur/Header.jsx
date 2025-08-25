import { useEffect, useState } from "react";
import { LogOut, Bell, Truck } from "lucide-react";
import api from "../../lib/axios";

export default function Header() {
    const [unreadCount, setUnreadCount] = useState(0);

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

    useEffect(() => {
        fetchUnread();
        window.addEventListener("refresh-notif-count", fetchUnread);
        const interval = setInterval(fetchUnread, 10000);
        return () => {
            clearInterval(interval);
            window.removeEventListener("refresh-notif-count", fetchUnread);
        };
    }, []);

    return (
        <header className="flex items-center justify-between px-8 py-4 bg-white shadow">
            <div>
                <span className="font-bold text-blue-800 text-xl">Dashboard Fournisseur</span>
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
                <button
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                    onClick={() => {
                        localStorage.removeItem("token");
                        window.location.href = "/auth";
                    }}
                >
                    <LogOut size={18} />
                    Déconnexion
                </button>
            </div>
        </header>
    );
} 