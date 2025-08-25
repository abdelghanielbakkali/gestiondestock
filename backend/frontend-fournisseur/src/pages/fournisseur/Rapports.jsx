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
    XCircle
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
            console.log("🔍 Début de la requête vers /rapports/mes");

            const res = await api.get("/rapports/mes");
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
                    <title>Rapport Fournisseur</title>
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
                            <h1>📊 Rapport Fournisseur</h1>
                            <p>Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
                        </div>

                        <div class="section">
                            <h2>📈 Statistiques Générales</h2>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <div class="stat-label">📦 Total Commandes</div>
                                    <div class="stat-value">${rapport.total_commandes}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">💰 Chiffre d'Affaires</div>
                                    <div class="stat-value success">${formatCurrency(rapport.chiffre_affaires)}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">✅ Taux d'Acceptation</div>
                                    <div class="stat-value highlight">${formatPercentage(rapport.taux_acceptation)}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">🚚 Total Livraisons</div>
                                    <div class="stat-value">${rapport.total_livraisons}</div>
                                </div>
                            </div>
                        </div>

                        <div class="section">
                            <h2>📊 Répartition des Commandes</h2>
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Statut</th>
                                        <th>Nombre</th>
                                        <th>Pourcentage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rapport.repartition_commandes.map(item => `
                                        <tr>
                                            <td>${item.statut}</td>
                                            <td>${item.nombre}</td>
                                            <td>${formatPercentage(item.pourcentage)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>

                        <div class="section">
                            <h2>🏆 Produits les Plus Demandés</h2>
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Rang</th>
                                        <th>Produit</th>
                                        <th>Quantité Commandée</th>
                                        <th>Chiffre d'Affaires</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rapport.top_produits.map((produit, index) => `
                                        <tr>
                                            <td>${index + 1}</td>
                                            <td>${produit.nom}</td>
                                            <td>${produit.total_commande}</td>
                                            <td class="success">${formatCurrency(produit.chiffre_affaires)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>

                        <div class="section">
                            <h2>👥 Clients Principaux</h2>
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
                                    ${rapport.top_clients.map((client, index) => `
                                        <tr>
                                            <td>${index + 1}</td>
                                            <td>${client.prenom} ${client.nom}</td>
                                            <td>${client.nombre_commandes}</td>
                                            <td class="success">${formatCurrency(client.chiffre_affaires)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>

                        <div class="section">
                            <h2>📈 Évolution Mensuelle</h2>
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Mois</th>
                                        <th>Nombre de Commandes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rapport.commandes_par_mois.map(item => `
                                        <tr>
                                            <td>${item.mois}</td>
                                            <td>${item.total}</td>
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
                        <h1 className="text-2xl font-bold text-gray-900">Mes Rapports</h1>
                        <p className="text-gray-600">Vue d'ensemble de votre activité</p>
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

            {/* Statistiques principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Commandes</p>
                            <p className="text-2xl font-bold text-gray-900">{rapport.total_commandes}</p>
                        </div>
                        <Package className="h-8 w-8 text-blue-600" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Chiffre d'Affaires</p>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(rapport.chiffre_affaires)}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Taux d'Acceptation</p>
                            <p className="text-2xl font-bold text-blue-600">{formatPercentage(rapport.taux_acceptation)}</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-blue-600" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Livraisons</p>
                            <p className="text-2xl font-bold text-gray-900">{rapport.total_livraisons}</p>
                        </div>
                        <Truck className="h-8 w-8 text-gray-600" />
                    </div>
                </div>
            </div>

            {/* Répartition des commandes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Répartition des Commandes</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {rapport.repartition_commandes.map((item, index) => (
                        <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">{item.statut}</p>
                            <p className="text-xl font-bold text-gray-900">{item.nombre}</p>
                            <p className="text-sm text-blue-600">{formatPercentage(item.pourcentage)}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top produits */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Produits les Plus Demandés</h2>
                <div className="space-y-4">
                    {rapport.top_produits.map((produit, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                                    {index + 1}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{produit.nom}</p>
                                    <p className="text-sm text-gray-600">{produit.total_commande} commandes</p>
                                </div>
                            </div>
                            <p className="text-lg font-bold text-green-600">{formatCurrency(produit.chiffre_affaires)}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top clients */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Clients Principaux</h2>
                <div className="space-y-4">
                    {rapport.top_clients.map((client, index) => (
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

            {/* Évolution mensuelle */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Évolution Mensuelle</h2>
                <div className="space-y-3">
                    {rapport.commandes_par_mois.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-900">{item.mois}</span>
                            <div className="flex items-center gap-4">
                                <div className="w-32 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${Math.min((item.total / Math.max(...rapport.commandes_par_mois.map(m => m.total))) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <span className="text-sm font-semibold text-gray-900">{item.total}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 