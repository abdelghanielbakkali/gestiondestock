import { NavLink } from "react-router-dom";
import { Users, Box, List, ShoppingCart, UserPlus, BarChart2, Bell } from "lucide-react";

const links = [
  { to: "/admin", label: "Accueil", icon: <BarChart2 size={20} /> },
  { to: "/admin/users", label: "Utilisateurs", icon: <Users size={20} /> },
  { to: "/admin/products", label: "Produits", icon: <Box size={20} /> },
  { to: "/admin/categories", label: "Catégories", icon: <List size={20} /> },
  { to: "/admin/orders", label: "Commandes", icon: <ShoppingCart size={20} /> },
  { to: "/admin/suppliers", label: "Fournisseurs", icon: <UserPlus size={20} /> },
  { to: "/admin/requests", label: "Demandes", icon: <Bell size={20} /> },
  { to: "/admin/reports", label: "Rapports", icon: <BarChart2 size={20} /> },
  { to: "/admin/notifications", label: "Notifications", icon: <Bell size={20} /> },
];

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-white shadow-lg flex flex-col py-8 px-4">
      <div className="flex items-center gap-2 mb-10">
        <BarChart2 className="text-blue-600" size={32} />
        <span className="font-extrabold text-2xl tracking-tight text-blue-800">Admin</span>
      </div>
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/admin"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive
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