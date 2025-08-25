import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../../components/gestionnaire/sidebargestionnaire";
import Header from "../../components/gestionnaire/headergestionnaire";
import Products from "./Products";
import Categories from "./Categories";
import Orders from "./Orders";
import Suppliers from "./Suppliers";
import Reports from "./Reports";
import Notifications from "./Notifications";
import OrderDetail from "./OrderDetail";
import { BarChart2 } from "lucide-react";
import HomeGestionnaire from "./Home";


export default function Dashboard() {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-white via-blue-50 to-blue-100">
      {/* Sidebar fixe */}
      <div className="fixed top-0 left-0 h-full w-64 z-20 shadow-lg bg-white">
        <Sidebar />
      </div>

      {/* Contenu principal à droite */}
      <div className="ml-64 flex-1 flex flex-col">
        {/* Header fixe */}
        <div className="fixed top-0 left-64 right-0 h-[72px] z-10 shadow bg-white">
          <Header />
        </div>

        {/* Contenu scrollable sous le header */}
        <main className="mt-[72px] p-6 overflow-y-auto h-[calc(100vh-72px)]">
          <Routes>
            <Route path="/" element={<HomeGestionnaire/>} />
            <Route path="products" element={<Products/>} />
            <Route path="categories" element={<Categories />} />
            <Route path="orders" element={<Orders />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="reports" element={<Reports />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}