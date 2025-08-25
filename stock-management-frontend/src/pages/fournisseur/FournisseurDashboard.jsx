import { Routes, Route } from "react-router-dom";
import Header from "../../components/fournisseur/Header";
import Sidebar from "../../components/fournisseur/Sidebar";
import Commandes from "./commandes";
import Livraisons from "./livraisons";
import Rapports from "./rapports";
import Notifications from "./Notifications";
import Home from "./Home";
//import Profil from "./Profil";

export default function FournisseurDashboard() {
    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                    <Routes>
                        <Route path="commandes" element={<Commandes />} />
                        {/* Uncomment and implement these routes as needed */}
                         <Route path="livraisons" element={<Livraisons />} />
                         <Route path="rapports" element={<Rapports />} /> 
                       <Route path="notifications" element={<Notifications />} /> 
                        <Route path="/" element={<Home />} />    
                        
                    </Routes>
                </main>
            </div>
        </div>
    );
}