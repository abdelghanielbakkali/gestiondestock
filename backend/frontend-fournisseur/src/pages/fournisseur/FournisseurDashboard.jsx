import { Routes, Route } from "react-router-dom";
import Header from "../../components/fournisseur/Header";
import Sidebar from "../../components/fournisseur/Sidebar";
import Home from "./Home";
import Commandes from "./Commandes";
import Livraisons from "./Livraisons";
import Produits from "./Produits";
import Rapports from "./Rapports";
import Notifications from "./Notifications";
import Profil from "./Profil";

export default function FournisseurDashboard() {
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/commandes" element={<Commandes />} />
                        <Route path="/livraisons" element={<Livraisons />} />
                        <Route path="/produits" element={<Produits />} />
                        <Route path="/rapports" element={<Rapports />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/profil" element={<Profil />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
} 