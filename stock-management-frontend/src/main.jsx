import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/landing";
import Auth from "./pages/Auth/Auth";
import Dashboard from "./pages/admin/Dashboard";
import GestionnaireDashboard from "./pages/gestionnaire/GestionnaireDashboard";
import FournisseurDashboard from "./pages/fournisseur/FournisseurDashboard";
import "./index.css";
import ResetPasswordPage from "./pages/Auth/ResetPasswordPage";


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/admin/*" element={<Dashboard />} />
        <Route path="/gestionnaire/*" element={<GestionnaireDashboard />} />
        <Route path="/fournisseur/*" element={<FournisseurDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);