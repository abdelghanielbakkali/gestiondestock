import { NavLink } from "react-router-dom";
import {
    Home,
    ShoppingCart,
    Truck,
    BarChart2,
    Bell,
    User
} from "lucide-react";

const links = [
    { to: "/fournisseur", label: "Accueil", icon: <Home size={20} /> },
    { to: "/fournisseur/commandes", label: "Mes Commandes", icon: <ShoppingCart size={20} /> },
    { to: "/fournisseur/livraisons", label: "Suivi Livraisons", icon: <Truck size={20} /> },
    { to: "/fournisseur/rapports", label: "Rapports", icon: <BarChart2 size={20} /> },
    { to: "/fournisseur/notifications", label: "Notifications", icon: <Bell size={20} /> },
];

export default function Sidebar() {
    return (
        <aside className="w-64 min-h-screen bg-white shadow-lg flex flex-col py-8 px-4">
            <div className="flex items-center gap-2 mb-10">
                <Truck className="text-blue-600" size={32} />
                <span className="font-extrabold text-2xl tracking-tight text-blue-800">Fournisseur</span>
            </div>
            <nav className="flex flex-col gap-2">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.to === "/fournisseur"}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${isActive
                                ? "bg-blue-100 text-blue-700"
                                : "text-slate-700 hover:bg-blue-50"
                            }`
                        }
                    >
                        {link.icon}
                        {link.label}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
}