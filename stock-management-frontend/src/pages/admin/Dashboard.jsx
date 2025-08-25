import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../../components/admin/sidebaradmin";
import Header from "../../components/admin/headeradmin";

// Pages
import Home from "./Home";
import Users from "./Users";
import Products from "./Products";
import Categories from "./Categories";
import Fournisseurs from "./Suppliers";
import Orders from "./Orders";
import Requests from "./Requests";
import Reports from "./Reports";
import Notifications from "./Notifications";
import OrderDetail from "./OrderDetail";

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
            <Route path="/" element={<Home />} />
            <Route path="users" element={<Users />} />
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="suppliers" element={<Fournisseurs />} />
            <Route path="orders" element={<Orders />} />
            <Route path="requests" element={<Requests />} />
            <Route path="reports" element={<Reports />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}