import { useState, useEffect } from "react";
import {
    BarChart3,
    TrendingUp,
    Users,
    Package,
    DollarSign,
    Download,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Clock,
    Truck,
    XCircle,
    AlertTriangle
} from "lucide-react";
import api from "../../lib/axios";

export default function Rapports() {
    const [rapport, setRapport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [exportLoading, setExportLoading] = useState(false);

    useEffect(() => {
        fetchRapport();
    }, []);

    const fetchRapport = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log("🔍 Début de la requête vers /rapports/stats");

            const res = await api.get("/rapports/stats");
            console.log("✅ Réponse reçue:", res.data);
            setRapport(res.data);
        } catch (error) {
            console.error("❌ Erreur API:", error);
            console.error("❌ Détails de l'erreur:", {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
            setError(error.response?.data?.message || error.message || "Erreur de chargement");
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
        if (!rapport) return;

        setExportLoading(true);
        try {
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Rapport Admin - Gestion de Stock</title>
                    <style>
                        body { 
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                            margin: 0; 
                            padding: 20px; 
                            background: #f8fafc;
                        }
                        .container { 
                            max-width: 800px; 
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
                            border-bottom: 2px solid #3b82f6;
                        }
                        .header h1 { 
                            color: #1f2937; 
                            margin: 0; 
                            font-size: 28px; 
                            font-weight: bold;
                        }
                        .header p { 
                            color: #6b7280; 
                            margin: 10px 0 0 0; 
                            font-size: 14px;
                        }
                        .section { 
                            margin-bottom: 30px; 
                        }
                        .section h2 { 
                            color: #1f2937; 
                            border-bottom: 1px solid #e5e7eb; 
                            padding-bottom: 8px; 
                            margin-bottom: 20px;
                            font-size: 20px;
                            font-weight: 600;
                        }
                        .stats-grid { 
                            display: grid; 
                            grid-template-columns: repeat(2, 1fr); 
                            gap: 20px; 
                            margin: 20px 0; 
                        }
                        .stat-item { 
                            background: #f9fafb; 
                            padding: 20px; 
                            border-radius: 8px; 
                            border-left: 4px solid #3b82f6;
                        }
                        .stat-label { 
                            font-weight: 600; 
                            color: #374151; 
                            font-size: 14px;
                            margin-bottom: 5px;
                        }
                        .stat-value { 
                            font-size: 24px; 
                            color: #1f2937; 
                            font-weight: bold;
                        }
                        .table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin: 20px 0; 
                            background: white;
                            border-radius: 8px;
                            overflow: hidden;
                            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                        }
                        .table th, .table td { 
                            border: 1px solid #e5e7eb; 
                            padding: 12px; 
                            text-align: left; 
                        }
                        .table th { 
                            background: #f3f4f6; 
                            font-weight: 600; 
                            color: #374151;
                        }
                        .table tr:nth-child(even) { 
                            background: #f9fafb; 
                        }
                        .footer { 
                            margin-top: 40px; 
                            text-align: center; 
                            color: #6b7280; 
                            font-size: 12px; 
                            padding-top: 20px;
                            border-top: 1px solid #e5e7eb;
                        }
                        .highlight { 
                            color: #3b82f6; 
                            font-weight: 600; 
                        }
                        .success { 
                            color: #10b981; 
                        }
                        .warning { 
                            color: #f59e0b; 
                        }
                        .danger { 
                            color: #ef4444; 
                        }
                        .icon { 
                            font-size: 18px; 
                            margin-right: 8px; 
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>📊 Rapport Admin - Gestion de Stock</h1>
                            <p>Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
                        </div>

                        <div class="section">
                            <h2>📈 Statistiques Générales</h2>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <div class="stat-label">📦 Total Produits</div>
                                    <div class="stat-value">${rapport.totalProduits}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">👥 Total Fournisseurs</div>
                                    <div class="stat-value">${rapport.totalFournisseurs}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">📋 Total Commandes</div>
                                    <div class="stat-value">${rapport.totalCommandes}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">💰 Valeur du Stock</div>
                                    <div class="stat-value success">${formatCurrency(rapport.valeurStock)}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">⚠️ Produits en Rupture</div>
                                    <div class="stat-value danger">${rapport.produitsRupture}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">⏳ Commandes en Attente</div>
                                    <div class="stat-value warning">${rapport.commandesEnAttente}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">📊 Taux de Rupture</div>
                                    <div class="stat-value danger">${formatPercentage(rapport.tauxRupture)}</div>
                                </div>
                            </div>
                        </div>

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
                                    ${rapport.commandesParMois.map(item => `
                                        <tr>
                                            <td>${item.mois}</td>
                                            <td>${item.total}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>

                        <div class="section">
                            <h2>🏆 Top 5 Produits les Plus Commandés</h2>
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Rang</th>
                                        <th>Produit</th>
                                        <th>Quantité Commandée</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rapport.topProduits.map((produit, index) => `
                                        <tr>
                                            <td>${index + 1}</td>
                                            <td>${produit.nom}</td>
                                            <td>${produit.total}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>

                        <div class="section">
                            <h2>📊 Répartition du Stock par Catégorie</h2>
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Catégorie</th>
                                        <th>Stock Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rapport.repartitionCategories.map(item => `
                                        <tr>
                                            <td>${item.categorie}</td>
                                            <td>${item.stock} unités</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>

                        <div class="section">
                            <h2>⚠️ Produits en Rupture ou Proches du Seuil</h2>
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Produit</th>
                                        <th>Catégorie</th>
                                        <th>Stock Actuel</th>
                                        <th>Seuil d'Alerte</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rapport.produitsRuptureList.map(produit => `
                                        <tr>
                                            <td>${produit.nom}</td>
                                            <td>${produit.categorie?.nom || 'N/A'}</td>
                                            <td class="${produit.stock === 0 ? 'danger' : 'warning'}">${produit.stock}</td>
                                            <td>${produit.seuil_alerte}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>

                        <div class="footer">
                            <p>📋 Rapport généré automatiquement par le système de gestion de stock</p>
                            <p>© ${new Date().getFullYear()} - Tous droits réservés</p>
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
                        onClick={fetchRapport}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    if (!rapport) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucun rapport disponible</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* En-tête */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Rapports Admin</h1>
                        <p className="text-gray-600">Vue d'ensemble du système de gestion de stock</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchRapport}
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

            {/* Statistiques principales - Design amélioré */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Produits */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Total Produits</p>
                            <p className="text-3xl font-bold text-blue-900">{rapport.totalProduits}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                {/* Total Fournisseurs */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 font-medium">Total Fournisseurs</p>
                            <p className="text-3xl font-bold text-green-900">{rapport.totalFournisseurs}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                {/* Total Commandes */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border border-purple-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-600 font-medium">Total Commandes</p>
                            <p className="text-3xl font-bold text-purple-900">{rapport.totalCommandes}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                            <BarChart3 className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                {/* Valeur du Stock */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-sm border border-emerald-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-emerald-600 font-medium">Valeur du Stock</p>
                            <p className="text-3xl font-bold text-emerald-900">{formatCurrency(rapport.valeurStock)}</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                {/* Produits en Rupture */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-sm border border-red-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-red-600 font-medium">Produits en Rupture</p>
                            <p className="text-3xl font-bold text-red-900">{rapport.produitsRupture}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                {/* Commandes en Attente */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-sm border border-yellow-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-yellow-600 font-medium">Commandes en Attente</p>
                            <p className="text-3xl font-bold text-yellow-900">{rapport.commandesEnAttente}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                            <Clock className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>

                {/* Taux de Rupture */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm border border-orange-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-orange-600 font-medium">Taux de Rupture</p>
                            <p className="text-3xl font-bold text-orange-900">{formatPercentage(rapport.tauxRupture)}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                            <XCircle className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Évolution mensuelle */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Évolution Mensuelle des Commandes</h2>
                <div className="space-y-3">
                    {rapport.commandesParMois.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-900">{item.mois}</span>
                            <div className="flex items-center gap-4">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${Math.min((item.total / Math.max(...rapport.commandesParMois.map(m => m.total))) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm font-semibold text-gray-900">{item.total}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top produits */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Top 5 Produits les Plus Commandés</h2>
                <div className="space-y-4">
                    {rapport.topProduits.map((produit, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                                    {index + 1}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{produit.nom}</p>
                                    <p className="text-sm text-gray-600">{produit.total} commandes</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Répartition par catégorie */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Répartition du Stock par Catégorie</h2>
                <div className="space-y-4">
                    {rapport.repartitionCategories.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                                    {index + 1}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{item.categorie}</p>
                                    <p className="text-sm text-gray-600">{item.stock} unités en stock</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Section des alertes - Produits en rupture */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-6 w-6" />
                    Produits en Rupture ou Proches du Seuil
                </h2>
                <div className="space-y-4">
                    {rapport.produitsRuptureList && rapport.produitsRuptureList.length > 0 ? (
                        rapport.produitsRuptureList.map((produit, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                        <span className="text-red-600 font-bold text-lg">⚠️</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{produit.nom}</p>
                                        <p className="text-sm text-gray-600">
                                            {produit.categorie?.nom || 'Catégorie non définie'} •
                                            Stock: <span className={produit.stock === 0 ? "text-red-600 font-bold" : "text-yellow-600"}>{produit.stock}</span> /
                                            Seuil: {produit.seuil_alerte}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${produit.stock === 0
                                            ? "bg-red-100 text-red-800"
                                            : "bg-yellow-100 text-yellow-800"
                                        }`}>
                                        {produit.stock === 0 ? "RUPTURE" : "ALERTE"}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center p-8 bg-green-50 rounded-lg border border-green-200">
                            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                            <p className="text-green-800 font-semibold">Aucun produit en rupture</p>
                            <p className="text-green-600 text-sm">Tous les stocks sont dans les normes</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
