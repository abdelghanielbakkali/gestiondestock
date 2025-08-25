<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use Illuminate\Http\Request;

class CategorieController extends Controller
{
    // Lister toutes les catégories avec recherche par nom
    public function index(Request $request)
    {
        $query = Categorie::query();
        // Recherche par nom
        if ($request->has('search') && $request->search) {
            $query->where('nom', 'like', "%{$request->search}%");
        }
        return response()->json($query->paginate(20));
    }

    // Créer une nouvelle catégorie
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255|unique:categories,nom',
            'description' => 'nullable|string',
        ]);

        $categorie = Categorie::create($validated);

        return response()->json($categorie, 201);
    }

    // Afficher une catégorie spécifique
    public function show($id)
    {
        $categorie = Categorie::find($id);
        if (!$categorie) {
            return response()->json(['message' => 'Catégorie non trouvée'], 404);
        }
        return response()->json($categorie);
    }

    // Mettre à jour une catégorie
    public function update(Request $request, $id)
    {
        $categorie = Categorie::find($id);
        if (!$categorie) {
            return response()->json(['message' => 'Catégorie non trouvée'], 404);
        }

        $validated = $request->validate([
            'nom' => 'sometimes|required|string|max:255|unique:categories,nom,' . $categorie->id,
            'description' => 'nullable|string',
        ]);

        $categorie->update($validated);

        return response()->json($categorie);
    }

    // Supprimer une catégorie
    public function destroy($id)
    {
        $categorie = Categorie::find($id);
        if (!$categorie) {
            return response()->json(['message' => 'Catégorie non trouvée'], 404);
        }
        $categorie->delete();
        return response()->json(['message' => 'Catégorie supprimée avec succès']);
    }
}