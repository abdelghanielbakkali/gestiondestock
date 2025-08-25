import { useEffect, useMemo, useState } from "react";
import api from "../../lib/axios";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/commandes/${id}`);
      setOrder(res.data);
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors du chargement de la commande.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const formatDate = (d) => {
    if (!d) return "-";
    try {
      const date = new Date(d);
      if (isNaN(date.getTime())) return d;
      const dd = String(date.getDate()).padStart(2, "0");
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const yyyy = date.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    } catch {
      return d;
    }
  };

  const formatMAD = (v) => {
    const num = Number(v || 0);
    return `${num.toFixed(2)} MAD`;
  };

  const statutBadge = (statut) => {
    const base = "px-2.5 py-1 rounded-full text-xs font-semibold";
    switch (statut) {
      case "en_attente":
        return <span className={`${base} bg-yellow-100 text-yellow-700`}>En attente</span>;
      case "en_cours":
        return <span className={`${base} bg-blue-100 text-blue-700`}>En cours</span>;
      case "livree":
        return <span className={`${base} bg-green-100 text-green-700`}>Livrée</span>;
      case "annulee":
        return <span className={`${base} bg-red-100 text-red-700`}>Annulée</span>;
      default:
        return <span className={`${base} bg-slate-100 text-slate-600`}>{statut || "-"}</span>;
    }
  };

  const lignes = order?.lignes_de_commande || [];

  const getUnitPrice = (lc) => {
    if (lc?.prix && Number(lc.prix) > 0) return Number(lc.prix);
    if (lc?.produit?.prix && Number(lc.produit.prix) > 0) return Number(lc.produit.prix);
    return 0;
  };

  const totalCalcule = useMemo(() => {
    return lignes.reduce((sum, lc) => sum + getUnitPrice(lc) * Number(lc.quantite || 0), 0);
  }, [lignes]);

  if (loading) return <div className="p-4">Chargement...</div>;

  if (error) {
    return (
      <div className="p-4">
        <button
          onClick={() => navigate(-1)}
          className="group relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-slate-800 bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 mb-4"
        >
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
          <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow">
            <ArrowLeft size={16} />
          </span>
          <span className="relative font-medium">Retour</span>
        </button>
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="p-4">
      <button
        onClick={() => navigate(-1)}
        className="group relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-slate-800 bg-white/70 backdrop-blur-md border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 mb-4"
      >
        <span className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
        <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow">
          <ArrowLeft size={16} />
        </span>
        <span className="relative font-medium">Retour</span>
      </button>

      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Commande #{order.id}</h2>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-slate-500">Fournisseur</div>
                <div className="font-medium">{order.fournisseur?.nom || "-"}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-slate-500">Client</div>
                <div className="font-medium">
                  {order.utilisateur?.prenom || ""} {order.utilisateur?.nom || ""}
                </div>
                <div className="text-slate-500">{order.utilisateur?.email || ""}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-slate-500">Date commande (DB)</div>
                <div className="font-medium">{formatDate(order.date)}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-slate-500">Créée le (DB)</div>
                <div className="font-medium">{formatDate(order.created_at)}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-slate-500">Statut</div>
                <div className="mt-1">{statutBadge(order.statut)}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-slate-500">Total (API)</div>
                <div className="font-semibold">{formatMAD(order.total)}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-slate-500">Total (calculé)</div>
                <div className="font-semibold">{formatMAD(totalCalcule)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow">
        <div className="px-5 py-4 border-b">
          <h3 className="text-lg font-semibold text-slate-800">Lignes de commande</h3>
        </div>
        <div className="p-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b">
                <th className="py-2 pr-4">Produit</th>
                <th className="py-2 pr-4">Quantité</th>
                <th className="py-2 pr-4">Prix unitaire</th>
                <th className="py-2 pr-0 text-right">Sous-total</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((lc) => {
                const unit = getUnitPrice(lc);
                const qty = Number(lc.quantite || 0);
                const sousTotal = unit * qty;
                return (
                  <tr key={lc.id} className="border-b last:border-0">
                    <td className="py-3 pr-4">
                      <div className="font-medium text-slate-800">{lc.produit?.nom || "-"}</div>
                      <div className="text-slate-500">{lc.produit?.categorie?.nom || ""}</div>
                    </td>
                    <td className="py-3 pr-4">{qty}</td>
                    <td className="py-3 pr-4">{formatMAD(unit)}</td>
                    <td className="py-3 pr-0 text-right font-semibold">{formatMAD(sousTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="pt-4 pr-4 text-right text-slate-500">Total</td>
                <td className="pt-4 pr-0 text-right font-bold text-slate-800">{formatMAD(totalCalcule)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}