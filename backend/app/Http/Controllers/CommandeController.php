<?php

namespace App\Http\Controllers;

use App\Models\Commande;
use App\Models\Produit;
use Illuminate\Http\Request;

class CommandeController extends Controller
{
    // Lister toutes les commandes avec recherche et filtre
    public function index(Request $request)
    {
        $query = Commande::with(['utilisateur', 'fournisseur', 'lignesDeCommande.produit']);

        // Recherche par ID
        if ($request->has('search') && $request->search) {
            $query->where('id', $request->search);
        }

        // Filtre par fournisseur
        if ($request->has('supplier') && $request->supplier) {
            $query->where('fournisseur_id', $request->supplier);
        }

        return response()->json($query->paginate(20));
    }

    // Créer une nouvelle commande
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'statut' => 'required|in:en_attente,en_cours,livree,annulee',
            'total' => 'required|numeric|min:0',
            'user_id' => 'required|exists:users,id',
            'fournisseur_id' => 'required|exists:fournisseurs,id',
            'lignes' => 'required|array|min:1',
            'lignes.*.produit_id' => 'required|exists:produits,id',
            'lignes.*.quantite' => 'required|integer|min:1',
            'lignes.*.prix' => 'required|numeric|min:0',
        ]);

        // NE PAS vérifier ni décrémenter le stock ici

        // Créer la commande
        $commandeData = $validated;
        unset($commandeData['lignes']);
        $commande = Commande::create($commandeData);

        // Créer les lignes de commande
        foreach ($validated['lignes'] as $ligne) {
            $commande->lignesDeCommande()->create([
                'produit_id' => $ligne['produit_id'],
                'quantite' => $ligne['quantite'],
                'prix' => $ligne['prix'],
            ]);
        }

        // Créer une notification pour le fournisseur
        $fournisseur = \App\Models\Fournisseur::find($validated['fournisseur_id']);
        if ($fournisseur && $fournisseur->user) {
            \App\Models\Notification::create([
                'user_id' => $fournisseur->user->id,
                'titre' => 'Nouvelle commande reçue',
                'message' => "Vous avez reçu une nouvelle commande #{$commande->id} d'un montant de " . number_format($validated['total'], 2) . "€",
                'type' => 'nouvelle_commande',
                'date_creation' => now(),
                'est_lue' => false
            ]);
        }

        return response()->json($commande->load(['utilisateur', 'fournisseur', 'lignesDeCommande.produit']), 201);
    }

    // Afficher une commande spécifique
    public function show($id)
    {
        $commande = Commande::with(['utilisateur', 'fournisseur', 'lignesDeCommande.produit'])->find($id);
        if (!$commande) {
            return response()->json(['message' => 'Commande non trouvée'], 404);
        }
        return response()->json($commande);
    }

    // Mettre à jour une commande
    public function update(Request $request, $id)
    {
        $commande = Commande::find($id);
        if (!$commande) {
            return response()->json(['message' => 'Commande non trouvée'], 404);
        }

        $validated = $request->validate([
            'date' => 'sometimes|required|date',
            'statut' => 'sometimes|required|in:en_attente,en_cours,livree,annulee',
            'total' => 'sometimes|required|numeric|min:0',
            'user_id' => 'sometimes|required|exists:users,id',
            'fournisseur_id' => 'sometimes|required|exists:fournisseurs,id',
        ]);

        $commande->update($validated);

        return response()->json($commande->load(['utilisateur', 'fournisseur', 'lignesDeCommande.produit']));
    }

    // Supprimer une commande
    public function destroy(Request $request, $id)
    {
        \Log::info("🔍 Tentative de suppression commande ID: " . $id);
        
        $user = $request->user();
        $commande = Commande::find($id);
        
        if (!$commande) {
            \Log::warning("❌ Commande non trouvée ID: " . $id);
            return response()->json(['message' => 'Commande non trouvée'], 404);
        }

        \Log::info("✅ Commande trouvée - Statut: " . $commande->statut . ", Fournisseur ID: " . $commande->fournisseur_id);

        // Si c'est un fournisseur, vérifier qu'il peut supprimer cette commande
        if ($user->role === 'fournisseur') {
            \Log::info("👤 Utilisateur fournisseur - ID: " . $user->id . ", Fournisseur ID: " . ($user->fournisseur ? $user->fournisseur->id : 'null'));
            
            if (!$user->fournisseur || $commande->fournisseur_id !== $user->fournisseur->id) {
                \Log::warning("🚫 Accès interdit - Fournisseur ne correspond pas");
                return response()->json(['message' => 'Accès interdit à cette commande'], 403);
            }
            
            // Les fournisseurs ne peuvent supprimer que les commandes acceptées ou refusées
            if (!in_array($commande->statut, ['en_cours', 'annulee'])) {
                \Log::warning("🚫 Statut non autorisé pour suppression: " . $commande->statut);
                return response()->json(['message' => 'Vous ne pouvez supprimer que les commandes acceptées ou refusées'], 403);
            }
        } elseif (!in_array($user->role, ['admin', 'gestionnaire'])) {
            // Seuls admin, gestionnaire et fournisseur peuvent supprimer des commandes
            \Log::warning("🚫 Rôle non autorisé pour suppression: " . $user->role);
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        \Log::info("✅ Suppression autorisée, suppression de la commande");
        $commande->delete();
        
        \Log::info("🎉 Commande supprimée avec succès");
        return response()->json(['message' => 'Commande supprimée avec succès']);
    }

    // Accepter ou refuser une commande (pour le fournisseur)
    public function changerStatut(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'fournisseur' || !$user->fournisseur) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }
        
        $commande = Commande::with(['lignesDeCommande.produit'])->find($id);
        if (!$commande) {
            return response()->json(['message' => 'Commande non trouvée'], 404);
        }
        
        if ($commande->fournisseur_id !== $user->fournisseur->id) {
            return response()->json(['message' => 'Accès interdit à cette commande'], 403);
        }
        
        $validated = $request->validate([
            'statut' => 'required|in:en_cours,annulee',
        ]);
        
        $ancienStatut = $commande->statut;
        $commande->statut = $validated['statut'];
        $commande->save();

        // Synchronisation automatique si la commande est acceptée (en_cours)
        if ($validated['statut'] === 'en_cours') {
            // 1. Mettre à jour le stock automatiquement
            foreach ($commande->lignesDeCommande as $ligne) {
                $produit = $ligne->produit;
                $produit->stock += $ligne->quantite;
                $produit->save();
            }

            // 2. Créer une livraison automatiquement
            \App\Models\Livraison::create([
                'commande_id' => $commande->id,
                'fournisseur_id' => $user->fournisseur->id,
                'date' => now(),
                'statut' => 'en_attente'
            ]);

            // 3. Créer une notification pour admin/gestionnaire
            \App\Models\Notification::create([
                'user_id' => $commande->user_id,
                'titre' => 'Commande acceptée',
                'message' => "La commande #{$commande->id} a été acceptée par le fournisseur",
                'type' => 'commande_acceptee',
                'date_creation' => now(),
                'est_lue' => false
            ]);
        } elseif ($validated['statut'] === 'annulee') {
            // Créer une notification pour admin/gestionnaire
            \App\Models\Notification::create([
                'user_id' => $commande->user_id,
                'titre' => 'Commande refusée',
                'message' => "La commande #{$commande->id} a été refusée par le fournisseur",
                'type' => 'commande_refusee',
                'date_creation' => now(),
                'est_lue' => false
            ]);
        }

        return response()->json($commande->load(['utilisateur', 'fournisseur', 'lignesDeCommande.produit']));
    }

    // Commandes du fournisseur connecté
    public function mesCommandes(Request $request)
    {
        $user = $request->user();
        
        // Vérifie que l'utilisateur est bien un fournisseur et qu'il a un fournisseur lié
        if ($user->role !== 'fournisseur' || !$user->fournisseur) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $query = Commande::with(['utilisateur', 'fournisseur', 'lignesDeCommande.produit'])
            ->where('fournisseur_id', $user->fournisseur->id);

        // Recherche par ID
        if ($request->has('search') && $request->search) {
            $query->where('id', $request->search);
        }

        // Filtre par statut
        if ($request->has('statut') && $request->statut) {
            $query->where('statut', $request->statut);
        }

        return response()->json($query->orderBy('created_at', 'desc')->paginate(20));
    }
}