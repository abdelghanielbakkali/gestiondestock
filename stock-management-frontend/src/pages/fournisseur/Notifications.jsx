import { useEffect, useState } from "react";
import api from "../../lib/axios";
import { Bell, ShoppingCart, Trash2 } from "lucide-react";
import clsx from "clsx";

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get("/notifications", {
                params: { type: "nouvelle_commande" },
            });
            setNotifications(res.data.data || res.data);
        } catch (error) {
            console.error("Erreur chargement des notifications :", error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            fetchNotifications();
            window.dispatchEvent(new Event("refresh-notif-count"));
        } catch (error) {
            console.error("Erreur lors du marquage comme lue :", error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            // Mise à jour immédiate de l'état local
            setNotifications(prev => prev.filter(notif => notif.id !== id));
            window.dispatchEvent(new Event("refresh-notif-count"));
        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
            alert("Erreur lors de la suppression de la notification");
        }
    };

    const getIcon = (type) => {
        if (type === "nouvelle_commande") return <ShoppingCart className="text-blue-600" />;
        return <Bell className="text-blue-400" />;
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <div className="max-w-3xl mx-auto mt-6 px-4">
            <div className="mb-4">
                <h2 className="text-xl font-semibold">Notifications</h2>
            </div>

            <ul className="space-y-3">
                {notifications.length === 0 && (
                    <li className="text-slate-500">Aucune notification.</li>
                )}

                {notifications.map((notif) => (
                    <li
                        key={notif.id}
                        className={clsx(
                            "flex items-center gap-3 bg-white rounded-xl shadow p-4",
                            !notif.est_lue && "border-l-4 border-blue-600"
                        )}
                    >
                        {getIcon(notif.type)}
                        <div className="flex-1">
                            <div className="font-semibold">{notif.titre || "Nouvelle commande"}</div>
                            <div className="text-slate-600 text-sm">{notif.message}</div>
                            <div className="text-xs text-slate-400">
                                {new Date(notif.date_creation).toLocaleString()}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {!notif.est_lue && (
                                <button
                                    onClick={() => markAsRead(notif.id)}
                                    className="text-blue-500 hover:text-blue-700"
                                    title="Marquer comme lue"
                                >
                                    <Bell size={18} />
                                </button>
                            )}
                            <button
                                onClick={() => deleteNotification(notif.id)}
                                className="text-red-500 hover:text-red-700"
                                title="Supprimer"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}