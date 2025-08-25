<?php

namespace App\Http\Controllers;

use App\Models\Rapport;
use App\Models\Produit;
use App\Models\Fournisseur;
use App\Models\Commande;
use App\Models\Categorie;
use Illuminate\Http\Request;
use App\Models\Livraison;

class RapportController extends Controller
{
    // Lister tous les rapports (avec pagination)
    public function index()
    {
        return response()->json(Rapport::with('utilisateur')->paginate(20));
    }

    // Statistiques globales pour le dashboard
    public function stats()
    {
        \Log::info('RapportController@stats appelé');
        
        $totalProduits = Produit::count();
        $totalFournisseurs = Fournisseur::count();
        $totalCommandes = Commande::count();
        $produitsRupture = Produit::whereColumn('stock', '<=', 'seuil_alerte')->count();
        $valeurStock = Produit::selectRaw('SUM(stock * prix) as total')->value('total');
        $commandesEnAttente = Commande::where('statut', 'en_attente')->count();

        \Log::info('Statistiques calculées:', [
            'totalProduits' => $totalProduits,
            'totalFournisseurs' => $totalFournisseurs,
            'totalCommandes' => $totalCommandes,
            'produitsRupture' => $produitsRupture,
            'valeurStock' => $valeurStock,
            'commandesEnAttente' => $commandesEnAttente,
        ]);

        $dateCol = \Schema::hasColumn('commandes', 'date') ? 'date' : 'created_at';
        $commandesParMois = Commande::selectRaw("to_char($dateCol, 'Mon') as mois, count(*) as total")
            ->where($dateCol, '>=', now()->subMonths(12))
            ->groupByRaw("to_char($dateCol, 'Mon'), date_part('month', $dateCol)")
            ->orderByRaw("date_part('month', $dateCol)")
            ->get();

        $repartitionCategories = Categorie::select('categories.nom as categorie')
            ->selectRaw('COALESCE(SUM(produits.stock),0) as stock')
            ->leftJoin('produits', 'categories.id', '=', 'produits.categorie_id')
            ->groupBy('categories.id', 'categories.nom')
            ->get();

        $topProduits = \App\Models\LigneDeCommande::select('produits.nom')
            ->selectRaw('SUM(lignes_de_commande.quantite) as total')
            ->join('produits', 'lignes_de_commande.produit_id', '=', 'produits.id')
            ->groupBy('produits.nom')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        $produitsRuptureList = Produit::with('categorie')
            ->whereColumn('stock', '<=', 'seuil_alerte')
            ->get();

        $tauxRupture = $totalProduits > 0 ? round($produitsRupture / $totalProduits * 100, 1) : 0;

        $response = [
            "totalProduits" => $totalProduits,
            "totalFournisseurs" => $totalFournisseurs,
            "totalCommandes" => $totalCommandes,
            "produitsRupture" => $produitsRupture,
            "valeurStock" => $valeurStock,
            "commandesEnAttente" => $commandesEnAttente,
            "commandesParMois" => $commandesParMois,
            "repartitionCategories" => $repartitionCategories,
            "topProduits" => $topProduits,
            "produitsRuptureList" => $produitsRuptureList,
            "tauxRupture" => $tauxRupture,
        ];

        \Log::info('Réponse envoyée:', $response);

        return response()->json($response);
    }

    // ... autres méthodes CRUD inchangées ...
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string|max:255',
            'date_generation' => 'nullable|date',
            'donnees' => 'required|json',
            'user_id' => 'required|exists:users,id',
        ]);

        $rapport = Rapport::create($validated);

        return response()->json($rapport->load('utilisateur'), 201);
    }

    public function show($id)
    {
        $rapport = Rapport::with('utilisateur')->find($id);
        if (!$rapport) {
            return response()->json(['message' => 'Rapport non trouvé'], 404);
        }
        return response()->json($rapport);
    }

    public function update(Request $request, $id)
    {
        $rapport = Rapport::find($id);
        if (!$rapport) {
            return response()->json(['message' => 'Rapport non trouvé'], 404);
        }

        $validated = $request->validate([
            'type' => 'sometimes|required|string|max:255',
            'date_generation' => 'nullable|date',
            'donnees' => 'sometimes|required|json',
            'user_id' => 'sometimes|required|exists:users,id',
        ]);

        $rapport->update($validated);

        return response()->json($rapport->load('utilisateur'));
    }

    public function destroy($id)
    {
        $rapport = Rapport::find($id);
        if (!$rapport) {
            return response()->json(['message' => 'Rapport non trouvé'], 404);
        }
        $rapport->delete();
        return response()->json(['message' => 'Rapport supprimé avec succès']);
    }
    // Rapports spécifiques au fournisseur connecté
public function mesRapports(Request $request)
{
    $user = $request->user();
    
    // Vérifie que l'utilisateur est bien un fournisseur
    if ($user->role !== 'fournisseur' || !$user->fournisseur) {
        return response()->json(['message' => 'Non autorisé'], 403);
    }

    $fournisseurId = $user->fournisseur->id;

    // Statistiques de base pour le fournisseur
    $totalCommandes = Commande::where('fournisseur_id', $fournisseurId)->count();
    $commandesEnAttente = Commande::where('fournisseur_id', $fournisseurId)->where('statut', 'en_attente')->count();
    $commandesAcceptees = Commande::where('fournisseur_id', $fournisseurId)->where('statut', 'en_cours')->count();
    $commandesLivrees = Commande::where('fournisseur_id', $fournisseurId)->where('statut', 'livree')->count();
    $commandesRefusees = Commande::where('fournisseur_id', $fournisseurId)->where('statut', 'annulee')->count();
    
    $totalLivraisons = Livraison::whereHas('commande', function($q) use ($fournisseurId) {
        $q->where('fournisseur_id', $fournisseurId);
    })->count();
    
    $livraisonsEnAttente = Livraison::whereHas('commande', function($q) use ($fournisseurId) {
        $q->where('fournisseur_id', $fournisseurId);
    })->where('statut', 'en_attente')->count();
    
    $livraisonsLivrees = Livraison::whereHas('commande', function($q) use ($fournisseurId) {
        $q->where('fournisseur_id', $fournisseurId);
    })->where('statut', 'livree')->count();

    // Chiffre d'affaires (commandes acceptées + livrées)
    $chiffreAffaires = Commande::where('fournisseur_id', $fournisseurId)
        ->whereIn('statut', ['en_cours', 'livree'])
        ->sum('total');

    // Taux d'acceptation
    $tauxAcceptation = $totalCommandes > 0 ? round(($commandesAcceptees + $commandesLivrees) / $totalCommandes * 100, 1) : 0;

    // Commandes par mois (12 derniers mois)
    $dateCol = \Schema::hasColumn('commandes', 'date') ? 'date' : 'created_at';
    $commandesParMois = Commande::selectRaw("to_char($dateCol, 'Mon') as mois, count(*) as total")
        ->where('fournisseur_id', $fournisseurId)
        ->where($dateCol, '>=', now()->subMonths(12))
        ->groupByRaw("to_char($dateCol, 'Mon'), date_part('month', $dateCol)")
        ->orderByRaw("date_part('month', $dateCol)")
        ->get();

    // Top 5 des produits les plus commandés
    $topProduits = \App\Models\LigneDeCommande::select('produits.nom')
        ->selectRaw('SUM(lignes_de_commande.quantite) as total_commande')
        ->selectRaw('SUM(lignes_de_commande.quantite * lignes_de_commande.prix) as chiffre_affaires')
        ->join('produits', 'lignes_de_commande.produit_id', '=', 'produits.id')
        ->join('commandes', 'lignes_de_commande.commande_id', '=', 'commandes.id')
        ->where('commandes.fournisseur_id', $fournisseurId)
        ->groupBy('produits.nom')
        ->orderByDesc('total_commande')
        ->limit(5)
        ->get();

    // Top 5 des clients
    $topClients = Commande::select('users.prenom', 'users.nom')
        ->selectRaw('COUNT(*) as nombre_commandes')
        ->selectRaw('SUM(commandes.total) as chiffre_affaires')
        ->join('users', 'commandes.user_id', '=', 'users.id')
        ->where('commandes.fournisseur_id', $fournisseurId)
        ->groupBy('users.id', 'users.prenom', 'users.nom')
        ->orderByDesc('nombre_commandes')
        ->limit(5)
        ->get();

    // Répartition des statuts de commandes
    $repartitionCommandes = [
        ['statut' => 'En attente', 'nombre' => $commandesEnAttente, 'pourcentage' => $totalCommandes > 0 ? round($commandesEnAttente / $totalCommandes * 100, 1) : 0],
        ['statut' => 'Acceptées', 'nombre' => $commandesAcceptees, 'pourcentage' => $totalCommandes > 0 ? round($commandesAcceptees / $totalCommandes * 100, 1) : 0],
        ['statut' => 'Livrées', 'nombre' => $commandesLivrees, 'pourcentage' => $totalCommandes > 0 ? round($commandesLivrees / $totalCommandes * 100, 1) : 0],
        ['statut' => 'Refusées', 'nombre' => $commandesRefusees, 'pourcentage' => $totalCommandes > 0 ? round($commandesRefusees / $totalCommandes * 100, 1) : 0],
    ];

    // Répartition des statuts de livraisons
    $repartitionLivraisons = [
        ['statut' => 'En attente', 'nombre' => $livraisonsEnAttente, 'pourcentage' => $totalLivraisons > 0 ? round($livraisonsEnAttente / $totalLivraisons * 100, 1) : 0],
        ['statut' => 'Livrées', 'nombre' => $livraisonsLivrees, 'pourcentage' => $totalLivraisons > 0 ? round($livraisonsLivrees / $totalLivraisons * 100, 1) : 0],
    ];

    return response()->json([
        // Statistiques générales
        'total_commandes' => $totalCommandes,
        'commandes_en_attente' => $commandesEnAttente,
        'commandes_acceptees' => $commandesAcceptees,
        'commandes_livrees' => $commandesLivrees,
        'commandes_refusees' => $commandesRefusees,
        'total_livraisons' => $totalLivraisons,
        'livraisons_en_attente' => $livraisonsEnAttente,
        'livraisons_livrees' => $livraisonsLivrees,
        'chiffre_affaires' => $chiffreAffaires,
        'taux_acceptation' => $tauxAcceptation,

        // Graphiques et données détaillées
        'commandes_par_mois' => $commandesParMois,
        'top_produits' => $topProduits,
        'top_clients' => $topClients,
        'repartition_commandes' => $repartitionCommandes,
        'repartition_livraisons' => $repartitionLivraisons,
    ]);
}
}