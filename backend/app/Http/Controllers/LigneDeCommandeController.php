<?php

namespace App\Http\Controllers;

use App\Models\LigneDeCommande;
use Illuminate\Http\Request;

class LigneDeCommandeController extends Controller
{
    // Lister toutes les lignes de commande
    public function index()
    {
        return response()->json(LigneDeCommande::with(['commande', 'produit'])->paginate(20));
    }

    // Créer une nouvelle ligne de commande
    public function store(Request $request)
    {
        $validated = $request->validate([
            'commande_id' => 'required|exists:commandes,id',
            'produit_id' => 'required|exists:produits,id',
            'quantite' => 'required|integer|min:1',
            'prix' => 'required|numeric|min:0',
        ]);

        $ligne = LigneDeCommande::create($validated);

        return response()->json($ligne->load(['commande', 'produit']), 201);
    }

    // Afficher une ligne de commande spécifique
    public function show($id)
    {
        $ligne = LigneDeCommande::with(['commande', 'produit'])->find($id);
        if (!$ligne) {
            return response()->json(['message' => 'Ligne de commande non trouvée'], 404);
        }
        return response()->json($ligne);
    }

    // Mettre à jour une ligne de commande
    public function update(Request $request, $id)
    {
        $ligne = LigneDeCommande::find($id);
        if (!$ligne) {
            return response()->json(['message' => 'Ligne de commande non trouvée'], 404);
        }

        $validated = $request->validate([
            'commande_id' => 'sometimes|required|exists:commandes,id',
            'produit_id' => 'sometimes|required|exists:produits,id',
            'quantite' => 'sometimes|required|integer|min:1',
            'prix' => 'sometimes|required|numeric|min:0',
        ]);

        $ligne->update($validated);

        return response()->json($ligne->load(['commande', 'produit']));
    }

    // Supprimer une ligne de commande
    public function destroy($id)
    {
        $ligne = LigneDeCommande::find($id);
        if (!$ligne) {
            return response()->json(['message' => 'Ligne de commande non trouvée'], 404);
        }
        $ligne->delete();
        return response()->json(['message' => 'Ligne de commande supprimée avec succès']);
    }
}