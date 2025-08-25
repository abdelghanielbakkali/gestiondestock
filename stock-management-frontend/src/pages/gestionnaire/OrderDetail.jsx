import { useEffect, useState } from "react";
import api from "../../lib/axios";
import { useParams, useNavigate } from "react-router-dom";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/commandes/${id}`).then(res => setOrder(res.data));
  }, [id]);

  if (!order) return <div>Chargement...</div>;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600">← Retour</button>
      <h2 className="text-2xl font-bold mb-2">Commande #{order.id}</h2>
      <div className="mb-4">
        <div><strong>Fournisseur :</strong> {order.fournisseur?.nom}</div>
        <div><strong>Date :</strong> {order.date}</div>
        <div><strong>Total :</strong> {order.total} MAD</div>
        <div><strong>Statut :</strong> {order.statut}</div>
      </div>
      <h3 className="text-xl font-semibold mb-2">Lignes de commande</h3>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border px-2 py-1">Produit</th>
            <th className="border px-2 py-1">Quantité</th>
            <th className="border px-2 py-1">Prix</th>
          </tr>
        </thead>
        <tbody>
          {order.lignes_de_commande?.map(lc => (
            <tr key={lc.id}>
              <td className="border px-2 py-1">{lc.produit?.nom}</td>
              <td className="border px-2 py-1">{lc.quantite}</td>
              <td className="border px-2 py-1">{lc.prix} MAD</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}