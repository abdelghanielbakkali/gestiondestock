import { useEffect, useState } from "react";
import api from "../../lib/axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar, Label
} from "recharts";
import { 
  AlertTriangle, 
  BarChart3, 
  Package, 
  Users, 
  Clock,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from "lucide-react";

const COLORS = [
  "#2563eb", "#38bdf8", "#818cf8", "#fbbf24", "#f87171",
  "#a3e635", "#f472b6", "#facc15", "#6366f1", "#f59e42"
];

function renderCustomizedLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.15;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#222"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={13}
      fontWeight={500}
    >
      {name} ({(percent * 100).toFixed(0)}%)
    </text>
  );
}

export default function Reports() {
  const [stats, setStats] = useState({
    produitsRupture: 0,
    commandesParMois: [],
    repartitionCategories: [],
    produitsRuptureList: [],
    totalProduits: 0,
    totalFournisseurs: 0,
    totalCommandes: 0,
    valeurStock: 0,
    commandesEnAttente: 0,
    topProduits: [],
    tauxRupture: 0,
    chiffre_affaires: 0,
    total_livraisons: 0,
    taux_acceptation: 0,
    top_clients: [],
    repartition_commandes: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/rapports/stats");
      setStats(res.data);
    } catch (error) {
      console.error("Erreur API:", error);
      setError(error.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${value || 0}%`;
  };

  const exportPDF = async () => {
    if (!stats) return;

    setExportLoading(true);
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Rapport Administrateur</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: #f8fafc;
            }
            .container { 
              max-width: 1000px; 
              margin: 0 auto; 
              background: white; 
              padding: 30px; 
              border-radius: 12px; 
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              padding-bottom: 20px; 
              border-bottom: 2px solid #2563eb;
            }
            .header h1 { 
              color: #1f2937; 
              margin: 0; 
              font-size: 32px; 
              font-weight: bold;
            }
            .header p { 
              color: #6b7280; 
              margin: 10px 0 0 0; 
              font-size: 14px;
            }
            .section { 
              margin-bottom: 40px; 
            }
            .section h2 { 
              color: #1f2937; 
              border-bottom: 2px solid #e5e7eb; 
              padding-bottom: 10px; 
              margin-bottom: 25px;
              font-size: 24px;
              font-weight: 700;
            }
            .stats-grid { 
              display: grid; 
              grid-template-columns: repeat(3, 1fr); 
              gap: 20px; 
              margin: 20px 0; 
            }
            .stat-card { 
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); 
              padding: 25px; 
              border-radius: 12px; 
              border-left: 6px solid #2563eb;
              text-align: center;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }
            .stat-icon { 
              font-size: 24px; 
              margin-bottom: 10px;
              color: #2563eb;
            }
            .stat-value { 
              font-size: 28px; 
              color: #1f2937; 
              font-weight: bold;
              margin-bottom: 5px;
            }
            .stat-label { 
              font-size: 14px;
              color: #6b7280;
              font-weight: 500;
            }
            .table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 25px 0; 
              background: white;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            .table th, .table td { 
              border: 1px solid #e5e7eb; 
              padding: 15px; 
              text-align: left; 
            }
            .table th { 
              background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); 
              font-weight: 700; 
              color: white;
              text-transform: uppercase;
              font-size: 12px;
              letter-spacing: 0.5px;
            }
            .table tr:nth-child(even) { 
              background: #f8fafc; 
            }
            .table tr:hover {
              background: #f1f5f9;
            }
            .footer { 
              margin-top: 50px; 
              text-align: center; 
              color: #6b7280; 
              font-size: 12px; 
              padding-top: 25px;
              border-top: 2px solid #e5e7eb;
            }
            .success { color: #10b981; font-weight: 600; }
            .warning { color: #f59e0b; font-weight: 600; }
            .danger { color: #ef4444; font-weight: 600; }
            .info { color: #2563eb; font-weight: 600; }
            .rupture-alert { 
              background: #fef2f2; 
              border: 2px solid #fecaca; 
              padding: 15px; 
              border-radius: 8px; 
              margin: 10px 0;
            }
            .no-data { 
              text-align: center; 
              padding: 40px; 
              color: #6b7280; 
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Rapport Administrateur</h1>
              <p>Tableau de bord complet du système - Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
            </div>

            <div class="section">
              <h2>📈 Vue d'Ensemble</h2>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-icon">📦</div>
                  <div class="stat-value">${stats.totalProduits}</div>
                  <div class="stat-label">Total Produits</div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">👥</div>
                  <div class="stat-value">${stats.totalFournisseurs}</div>
                  <div class="stat-label">Fournisseurs</div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">📋</div>
                  <div class="stat-value">${stats.totalCommandes}</div>
                  <div class="stat-label">Total Commandes</div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon">⏳</div>
                  <div class="stat-value warning">${stats.commandesEnAttente}</div>
                  <div class="stat-label">Commandes en Attente</div>
                </div>
                <div class="stat-card">
                  <div class="stat-icon">🚨</div>
                  <div class="stat-value danger">${stats.produitsRupture}</div>
                  <div class="stat-label">Produits en Rupture</div>
                </div>
              </div>
            </div>

            ${stats.repartition_commandes && stats.repartition_commandes.length > 0 ? `
            <div class="section">
              <h2>📊 Répartition des Commandes par Statut</h2>
              <table class="table">
                <thead>
                  <tr>
                    <th>Statut</th>
                    <th>Nombre</th>
                    <th>Pourcentage</th>
                  </tr>
                </thead>
                <tbody>
                  ${stats.repartition_commandes.map(item => `
                    <tr>
                      <td>${item.statut}</td>
                      <td>${item.nombre}</td>
                      <td class="info">${formatPercentage(item.pourcentage)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}

            ${stats.topProduits && stats.topProduits.length > 0 ? `
            <div class="section">
              <h2>🏆 Top Produits les Plus Commandés</h2>
              <table class="table">
                <thead>
                  <tr>
                    <th>Rang</th>
                    <th>Produit</th>
                    <th>Nombre de Commandes</th>
                    <th>Chiffre d'Affaires</th>
                  </tr>
                </thead>
                <tbody>
                  ${stats.topProduits.map((produit, index) => `
                    <tr>
                      <td><strong>${index + 1}</strong></td>
                      <td>${produit.nom}</td>
                      <td>${produit.total || 0}</td>
                      <td class="success">${formatCurrency(produit.chiffre_affaires || 0)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}

            ${stats.top_clients && stats.top_clients.length > 0 ? `
            <div class="section">
              <h2>👤 Clients Principaux</h2>
              <table class="table">
                <thead>
                  <tr>
                    <th>Rang</th>
                    <th>Client</th>
                    <th>Nombre de Commandes</th>
                    <th>Chiffre d'Affaires</th>
                  </tr>
                </thead>
                <tbody>
                  ${stats.top_clients.map((client, index) => `
                    <tr>
                      <td><strong>${index + 1}</strong></td>
                      <td>${client.prenom} ${client.nom}</td>
                      <td>${client.nombre_commandes}</td>
                      <td class="success">${formatCurrency(client.chiffre_affaires)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}

            ${stats.repartitionCategories && stats.repartitionCategories.length > 0 ? `
            <div class="section">
              <h2>📊 Répartition du Stock par Catégorie</h2>
              <table class="table">
                <thead>
                  <tr>
                    <th>Catégorie</th>
                    <th>Stock Total</th>
                    <th>Pourcentage</th>
                  </tr>
                </thead>
                <tbody>
                  ${stats.repartitionCategories.map(cat => {
                    const total = stats.repartitionCategories.reduce((sum, c) => sum + c.stock, 0);
                    const percentage = total > 0 ? ((cat.stock / total) * 100).toFixed(1) : 0;
                    return `
                      <tr>
                        <td>${cat.categorie}</td>
                        <td>${cat.stock} unités</td>
                        <td class="info">${percentage}%</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}

            ${stats.commandesParMois && stats.commandesParMois.length > 0 ? `
            <div class="section">
              <h2>📈 Évolution Mensuelle des Commandes</h2>
              <table class="table">
                <thead>
                  <tr>
                    <th>Mois</th>
                    <th>Nombre de Commandes</th>
                  </tr>
                </thead>
                <tbody>
                  ${stats.commandesParMois.map(item => `
                    <tr>
                      <td>${item.mois}</td>
                      <td><strong>${item.total}</strong></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            ` : ''}

            <div class="section">
              <h2>🚨 Alertes Stock</h2>
              ${stats.produitsRuptureList && stats.produitsRuptureList.length > 0 ? `
                <div class="rupture-alert">
                  <strong>⚠️ ${stats.produitsRuptureList.length} produit(s) nécessitent une attention immédiate</strong>
                </div>
                <table class="table">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Catégorie</th>
                      <th>Stock Actuel</th>
                      <th>Seuil d'Alerte</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${stats.produitsRuptureList.map(prod => `
                      <tr>
                        <td>${prod.nom}</td>
                        <td>${prod.categorie?.nom || 'N/A'}</td>
                        <td class="${prod.stock === 0 ? 'danger' : 'warning'}">${prod.stock}</td>
                        <td>${prod.seuil_alerte}</td>
                        <td class="${prod.stock === 0 ? 'danger' : 'warning'}">
                          ${prod.stock === 0 ? 'RUPTURE' : 'SEUIL CRITIQUE'}
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : `
                <div class="no-data">
                  ✅ Aucun produit en rupture de stock - Situation optimale
                </div>
              `}
            </div>

            <div class="footer">
              <p>📋 Rapport généré automatiquement par le système de gestion administrative</p>
              <p><strong>Taux de rupture global: ${formatPercentage(stats.tauxRupture)}</strong></p>
              <p>© ${new Date().getFullYear()} - Système de Gestion de Stock - Tous droits réservés</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
    } catch (error) {
      console.error("Erreur export PDF:", error);
      alert("Erreur lors de l'export du rapport");
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des rapports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button 
            onClick={fetchStats}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 px-2 md:px-0">
      {/* En-tête avec actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord Administrateur</h1>
            <p className="text-gray-600">Vue d'ensemble complète du système</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchStats}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </button>
            <button 
              onClick={exportPDF}
              disabled={exportLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              {exportLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <Download className="h-4 w-4" />
              )}
              Exporter PDF
            </button>
          </div>
        </div>
      </div>

      {/* Cards principales - Style fournisseur */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Produits</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProduits}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Fournisseurs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFournisseurs}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Commandes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCommandes}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Commandes en Attente</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.commandesEnAttente}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Produits en Rupture</p>
              <p className="text-2xl font-bold text-red-600">{stats.produitsRupture}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taux de Rupture</p>
              <p className="text-2xl font-bold text-red-600">{formatPercentage(stats.tauxRupture)}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Répartition des commandes par statut */}
      {stats.repartition_commandes && stats.repartition_commandes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Répartition des Commandes par Statut</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.repartition_commandes.map((item, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{item.statut}</p>
                <p className="text-xl font-bold text-gray-900">{item.nombre}</p>
                <p className="text-sm text-blue-600">{formatPercentage(item.pourcentage)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Graphiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Courbe commandes par mois */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-blue-700">Commandes par mois</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.commandesParMois}>
              <XAxis dataKey="mois" />
              <YAxis />
              <Tooltip
                contentStyle={{ background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                labelStyle={{ color: "#2563eb" }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 6, fill: "#2563eb", stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Doughnut répartition par catégorie */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-blue-700">Répartition du stock par catégorie</h2>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={stats.repartitionCategories}
                dataKey="stock"
                nameKey="categorie"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
                labelLine={false}
                label={renderCustomizedLabel}
                isAnimationActive={true}
              >
                {stats.repartitionCategories.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
                <Label
                  value="Stock"
                  position="center"
                  fontSize={18}
                  fill="#2563eb"
                  fontWeight={700}
                />
              </Pie>
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: 13, marginTop: 10 }}
              />
              <Tooltip
                contentStyle={{ background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }}
                labelStyle={{ color: "#2563eb" }}
                formatter={(value, name) => [`${value} unités`, "Stock"]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top produits commandés */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-blue-700">Top 5 produits les plus commandés</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats.topProduits}>
            <XAxis dataKey="nom" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#2563eb" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top clients - Style fournisseur */}
      {stats.top_clients && stats.top_clients.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Clients Principaux</h2>
          <div className="space-y-4">
            {stats.top_clients.map((client, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{client.prenom} {client.nom}</p>
                    <p className="text-sm text-gray-600">{client.nombre_commandes} commandes</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-green-600">{formatCurrency(client.chiffre_affaires)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Évolution mensuelle - Style fournisseur */}
      {stats.commandesParMois && stats.commandesParMois.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Évolution Mensuelle</h2>
          <div className="space-y-3">
            {stats.commandesParMois.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-900">{item.mois}</span>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((item.total / Math.max(...stats.commandesParMois.map(m => m.total))) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{item.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tableau des produits en rupture */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-red-600">Produits en rupture ou proches du seuil</h2>
        {stats.produitsRuptureList && stats.produitsRuptureList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 font-semibold text-gray-700">Produit</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Catégorie</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Stock</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Seuil</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Statut</th>
                </tr>
              </thead>
              <tbody>
                {stats.produitsRuptureList.map((prod, index) => (
                  <tr key={prod.id} className={index % 2 === 0 ? "bg-gray-25" : "bg-white"}>
                    <td className="p-3 font-medium text-gray-900">{prod.nom}</td>
                    <td className="p-3 text-gray-600">{prod.categorie?.nom || 'N/A'}</td>
                    <td className="p-3">
                      <span className={`font-bold ${prod.stock === 0 ? "text-red-600" : "text-yellow-600"}`}>
                        {prod.stock}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">{prod.seuil_alerte}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        prod.stock === 0 
                          ? "bg-red-100 text-red-800" 
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {prod.stock === 0 ? "RUPTURE" : "SEUIL CRITIQUE"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <div className="text-green-600 font-medium">Aucun produit en rupture de stock</div>
            <div className="text-gray-500 text-sm">Tous les produits sont bien approvisionnés</div>
          </div>
        )}
      </div>
    </div>
  );
}

// Card component - Style fournisseur amélioré
function Card({ icon, label, value, color }) {
  const colorClass = color === "red"
    ? "text-red-600"
    : color === "green"
    ? "text-green-600"
    : color === "yellow"
    ? "text-yellow-500"
    : "text-blue-600";
    
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
        </div>
        <span className={colorClass}>{icon}</span>
      </div>
    </div>
  );
}