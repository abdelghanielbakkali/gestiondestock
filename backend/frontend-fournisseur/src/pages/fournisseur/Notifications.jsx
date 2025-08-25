import { useEffect, useState } from "react";
import api from "../../lib/axios";
import { Bell, ShoppingCart, Trash2 } from "lucide-react";
import clsx from "clsx";

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState("nouvelle_commande");

    const fetchNotifications = async () => {
        try {
            const res = await api.get("/notifications", {
                params: { type: filter },
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
            fetchNotifications();
            window.dispatchEvent(new Event("refresh-notif-count"));
        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
        }
    };

    const getIcon = (type) => {
        if (type === "nouvelle_commande") return <ShoppingCart className="text-blue-600" />;
        return <Bell className="text-blue-400" />;
    };

    useEffect(() => {
        fetchNotifications();
    }, [filter]);

    return (
        <div className="max-w-3xl mx-auto mt-6 px-4">
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold">Notifications</h2>
                <select
                    className="border rounded px-3 py-2"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="nouvelle_commande">Nouvelles commandes</option>
                    <option value="">Toutes</option>
                </select>
            </div>

            <ul className="space-y-3">
                {notifications.length === 0 && (
                    <li className="text-slate-500">Aucune notification.</li>
                )}

                {notifications.map((notif) => (
                    <li
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={clsx(
                            "cursor-pointer flex items-center gap-3 bg-white rounded-xl shadow p-4 hover:bg-blue-50",
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
                        <button
                            onClick={e => {
                                e.stopPropagation();
                                deleteNotification(notif.id);
                            }}
                            className="ml-2 text-red-500 hover:text-red-700"
                            title="Supprimer"
                        >
                            <Trash2 size={18} />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

