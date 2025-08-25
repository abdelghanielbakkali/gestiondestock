<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;

class ProduitController extends Controller
{
    // Lister tous les produits avec filtres et pagination
    public function index(Request $request)
    {
        $query = Produit::with(['categorie', 'fournisseur']);
        
        // Recherche par nom
        if ($request->has('search') && $request->search) {
            $query->where('nom', 'like', "%{$request->search}%");
        }

        // Filtre par catégorie
        if ($request->has('categorie_id')) {
            $query->where('categorie_id', $request->categorie_id);
        }

        // Filtre par date de création minimale
        if ($request->has('date_min')) {
            $query->whereDate('created_at', '>=', $request->date_min);
        }

        // Filtre par date de création maximale
        if ($request->has('date_max')) {
            $query->whereDate('created_at', '<=', $request->date_max);
        }

        $produits = $query->paginate(20);
        return response()->json($produits);
    }

    // Créer un nouveau produit (avec upload d'image)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255|unique:produits,nom',
            'description' => 'nullable|string',
            'stock' => 'required|integer|min:0',
            'seuil_alerte' => 'required|integer|min:0',
            'prix' => 'required|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'categorie_id' => 'required|exists:categories,id',
            'fournisseur_id' => 'nullable|exists:fournisseurs,id',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('produits', 'public');
            $validated['image'] = $path;
        }

        $produit = Produit::create($validated);

        // Notification stock bas (création)
        if ($produit->stock <= $produit->seuil_alerte) {
            $adminsEtGestionnaires = User::whereIn('role', ['admin', 'gestionnaire'])->get();
            foreach ($adminsEtGestionnaires as $user) {
                $notifExists = Notification::where([
                    ['user_id', $user->id],
                    ['type', 'stock_bas'],
                    ['titre', 'Stock bas'],
                    ['est_lue', false],
                ])
                ->where('message', "Le produit {$produit->nom} a un stock de {$produit->stock} (seuil {$produit->seuil_alerte}).")
                ->exists();

                if (!$notifExists) {
                    Notification::create([
                        'titre' => 'Stock bas',
                        'type' => 'stock_bas',
                        'message' => "Le produit {$produit->nom} a un stock de {$produit->stock} (seuil {$produit->seuil_alerte}).",
                        'user_id' => $user->id,
                        'date_creation' => now(),
                        'est_lue' => false,
                    ]);
                }
            }
        }

        return response()->json($produit->load(['categorie', 'fournisseur']), 201);
    }

    // Afficher un produit spécifique
    public function show($id)
    {
        $produit = Produit::with(['categorie', 'fournisseur'])->find($id);
        if (!$produit) {
            return response()->json(['message' => 'Produit non trouvé'], 404);
        }
        return response()->json($produit);
    }

    // Mettre à jour un produit (avec upload d'image)
    public function update(Request $request, $id)
    {
        $produit = Produit::find($id);
        if (!$produit) {
            return response()->json(['message' => 'Produit non trouvé'], 404);
        }

        $validated = $request->validate([
            'nom' => 'sometimes|required|string|max:255|unique:produits,nom,' . $produit->id,
            'description' => 'nullable|string',
            'stock' => 'sometimes|required|integer|min:0',
            'seuil_alerte' => 'sometimes|required|integer|min:0',
            'prix' => 'sometimes|required|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'categorie_id' => 'sometimes|required|exists:categories,id',
            'fournisseur_id' => 'nullable|exists:fournisseurs,id',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('produits', 'public');
            $validated['image'] = $path;
        }

        $produit->update($validated);

        // Notification stock bas (modification)
        if ($produit->stock <= $produit->seuil_alerte) {
            $adminsEtGestionnaires = User::whereIn('role', ['admin', 'gestionnaire'])->get();
            foreach ($adminsEtGestionnaires as $user) {
                $notifExists = Notification::where([
                    ['user_id', $user->id],
                    ['type', 'stock_bas'],
                    ['titre', 'Stock bas'],
                    ['est_lue', false],
                ])
                ->where('message', "Le produit {$produit->nom} a un stock de {$produit->stock} (seuil {$produit->seuil_alerte}).")
                ->exists();

                if (!$notifExists) {
                    Notification::create([
                        'titre' => 'Stock bas',
                        'type' => 'stock_bas',
                        'message' => "Le produit {$produit->nom} a un stock de {$produit->stock} (seuil {$produit->seuil_alerte}).",
                        'user_id' => $user->id,
                        'date_creation' => now(),
                        'est_lue' => false,
                    ]);
                }
            }
        }

        return response()->json($produit->load(['categorie', 'fournisseur']));
    }

    // Supprimer un produit
    public function destroy($id)
    {
        $produit = Produit::find($id);
        if (!$produit) {
            return response()->json(['message' => 'Produit non trouvé'], 404);
        }
        $produit->delete();
        return response()->json(['message' => 'Produit supprimé avec succès']);
    }

    // Produits du fournisseur connecté
    public function mesProduits(Request $request)
    {
        $user = $request->user();
        
        // Vérifie que l'utilisateur est bien un fournisseur et qu'il a un fournisseur lié
        if ($user->role !== 'fournisseur' || !$user->fournisseur) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $query = Produit::with(['categorie', 'fournisseur'])
            ->where('fournisseur_id', $user->fournisseur->id);

        // Recherche par nom
        if ($request->has('search') && $request->search) {
            $query->where('nom', 'ILIKE', '%' . $request->search . '%');
        }

        // Filtre par catégorie
        if ($request->has('categorie_id') && $request->categorie_id) {
            $query->where('categorie_id', $request->categorie_id);
        }

        // Filtre par stock (alerte)
        if ($request->has('alerte_stock') && $request->alerte_stock) {
            $query->whereRaw('stock <= seuil_alerte');
        }

        return response()->json($query->orderBy('created_at', 'desc')->paginate(20));
    }
}