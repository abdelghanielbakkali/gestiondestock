<?php

namespace App\Http\Controllers;

use App\Models\Livraison;
use Illuminate\Http\Request;

class LivraisonController extends Controller
{
    // Lister toutes les livraisons (avec pagination)
    public function index()
    {
        return response()->json(Livraison::with('commande')->paginate(20));
    }

    // Créer une nouvelle livraison
    public function store(Request $request)
    {
        $validated = $request->validate([
            'commande_id' => 'required|exists:commandes,id',
            'date' => 'required|date',
            'statut' => 'required|in:en_attente,livree,annulee',
        ]);

        $livraison = Livraison::create($validated);

        return response()->json($livraison->load('commande'), 201);
    }

    // Afficher une livraison spécifique
    public function show($id)
    {
        $livraison = Livraison::with('commande')->find($id);
        if (!$livraison) {
            return response()->json(['message' => 'Livraison non trouvée'], 404);
        }
        return response()->json($livraison);
    }

    // Mettre à jour une livraison (marquer livrée ou annulée)
    public function update(Request $request, $id)
    {
        $livraison = Livraison::with('commande')->find($id);
        if (!$livraison) {
            return response()->json(['message' => 'Livraison non trouvée'], 404);
        }

        // Vérification d'appartenance pour le fournisseur
        $user = $request->user();
        \Log::info('Fournisseur connecté : ' . ($user->fournisseur->id ?? 'null') . ' | Fournisseur de la commande : ' . ($livraison->commande->fournisseur_id ?? 'null'));
        if ($user->role === 'fournisseur') {
            if (!$livraison->commande || $livraison->commande->fournisseur_id !== $user->fournisseur->id) {
                return response()->json(['message' => 'Non autorisé'], 403);
            }
        }

        $validated = $request->validate([
            'commande_id' => 'sometimes|required|exists:commandes,id',
            'date' => 'sometimes|required|date',
            'statut' => 'sometimes|required|in:en_attente,livree,annulee',
        ]);

        $ancienStatut = $livraison->statut;
        $livraison->update($validated);

        // Synchronisation automatique si la livraison est marquée comme livrée
        if (isset($validated['statut']) && $validated['statut'] === 'livree' && $ancienStatut !== 'livree') {
            // 1. Mettre à jour le statut de la commande
            $commande = $livraison->commande;
            $commande->statut = 'livree';
            $commande->save();

            // 2. Créer une notification pour admin/gestionnaire
            \App\Models\Notification::create([
                'user_id' => $commande->user_id,
                'titre' => 'Livraison terminée',
                'message' => "La livraison de la commande #{$commande->id} a été marquée comme livrée",
                'type' => 'livraison_terminee',
                'date_creation' => now(),
                'est_lue' => false
            ]);
        }

        // Notification si la livraison est annulée
        if (isset($validated['statut']) && $validated['statut'] === 'annulee' && $ancienStatut !== 'annulee') {
            $commande = $livraison->commande;
            \App\Models\Notification::create([
                'user_id' => $commande->user_id,
                'titre' => 'Livraison annulée',
                'message' => "La livraison de la commande #{$commande->id} a été annulée par le fournisseur",
                'type' => 'livraison_annulee',
                'date_creation' => now(),
                'est_lue' => false
            ]);
        }

        // Charger toutes les relations nécessaires pour le frontend
        return response()->json(
            $livraison->load([
                'commande.utilisateur',
                'commande.lignesDeCommande.produit'
            ])
        );
    }

    // Supprimer une livraison
    public function destroy($id)
    {
        $livraison = Livraison::find($id);
        if (!$livraison) {
            return response()->json(['message' => 'Livraison non trouvée'], 404);
        }
        $livraison->delete();
        return response()->json(['message' => 'Livraison supprimée avec succès']);
    }

    // Livraisons du fournisseur connecté
    public function mesLivraisons(Request $request)
    {
        $user = $request->user();

        // Vérifie que l'utilisateur est bien un fournisseur et qu'il a un fournisseur lié
        if ($user->role !== 'fournisseur' || !$user->fournisseur) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        // Récupère les livraisons liées à ce fournisseur via la commande
        $livraisons = Livraison::with(['commande.utilisateur', 'commande.lignesDeCommande.produit'])
            ->whereHas('commande', function ($q) use ($user) {
                $q->where('fournisseur_id', $user->fournisseur->id);
            })
            ->paginate(20);

        return response()->json($livraisons);
    }
}