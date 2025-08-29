<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProduitController extends Controller
{
    public function index(Request $request)
    {
        $query = Produit::with(['categorie', 'fournisseur']);

        if ($request->has('search') && $request->search) {
            $query->where('nom', 'like', "%{$request->search}%");
        }

        if ($request->has('categorie_id')) {
            $query->where('categorie_id', $request->categorie_id);
        }

        if ($request->has('date_min')) {
            $query->whereDate('created_at', '>=', $request->date_min);
        }

        if ($request->has('date_max')) {
            $query->whereDate('created_at', '<=', $request->date_max);
        }

        return response()->json($query->paginate(20));
    }

    private function uploadToCloudinary($file)
    {
        try {
            // Vérifier si les classes Cloudinary existent
            if (!class_exists('\Cloudinary\Configuration\Configuration') || !class_exists('\Cloudinary\Api\Upload\UploadApi')) {
                throw new \Exception('Package Cloudinary non installé');
            }

            $cloudinaryUrl = env('CLOUDINARY_URL');
            $canUseCloudinary = $cloudinaryUrl
                && str_starts_with($cloudinaryUrl, 'cloudinary://')
                && !str_contains($cloudinaryUrl, '<your_api_key>')
                && !str_contains($cloudinaryUrl, '<your_api_secret>');

            if (!$canUseCloudinary) {
                throw new \Exception('Configuration Cloudinary invalide');
            }

            // Configuration Cloudinary
            \Cloudinary\Configuration\Configuration::instance($cloudinaryUrl);
            
            // Upload vers Cloudinary
            $uploadApi = new \Cloudinary\Api\Upload\UploadApi();
            $uploadResult = $uploadApi->upload(
                $file->getRealPath(),
                [
                    'folder' => 'produits',
                    'resource_type' => 'image',
                    'transformation' => [
                        'quality' => 'auto:good',
                        'fetch_format' => 'auto'
                    ]
                ]
            );

            $imageUrl = $uploadResult['secure_url'] ?? $uploadResult['url'] ?? null;

            if (!$imageUrl) {
                throw new \Exception('Réponse Cloudinary sans URL');
            }

            \Log::info('Upload Cloudinary réussi', ['url' => $imageUrl]);
            return $imageUrl;

        } catch (\Exception $e) {
            \Log::error('Erreur upload Cloudinary', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    private function handleImageUpload($file)
    {
        try {
            // Essayer d'uploader vers Cloudinary
            return $this->uploadToCloudinary($file);
        } catch (\Exception $e) {
            // Fallback vers le stockage local
            \Log::warning('Fallback vers stockage local', ['reason' => $e->getMessage()]);
            return $file->store('produits', 'public');
        }
    }

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
            $validated['image'] = $this->handleImageUpload($request->file('image'));
        }

        $produit = Produit::create($validated);

        // Gestion des alertes de stock
        if ($produit->stock <= $produit->seuil_alerte) {
            $this->createStockAlert($produit);
        }

        return response()->json($produit->load(['categorie', 'fournisseur']), 201);
    }

    public function show($id)
    {
        $produit = Produit::with(['categorie', 'fournisseur'])->find($id);
        if (!$produit) {
            return response()->json(['message' => 'Produit non trouvé'], 404);
        }
        return response()->json($produit);
    }

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
            // Supprimer l'ancienne image locale si elle existe
            if ($produit->image && !str_starts_with($produit->image, 'http') && Storage::disk('public')->exists($produit->image)) {
                Storage::disk('public')->delete($produit->image);
            }

            $validated['image'] = $this->handleImageUpload($request->file('image'));
        }

        $produit->update($validated);

        // Gestion des alertes de stock
        if ($produit->stock <= $produit->seuil_alerte) {
            $this->createStockAlert($produit);
        }

        return response()->json($produit->load(['categorie', 'fournisseur']));
    }

    public function destroy($id)
    {
        $produit = Produit::find($id);
        if (!$produit) {
            return response()->json(['message' => 'Produit non trouvé'], 404);
        }

        // Supprimer l'image locale si elle existe
        if ($produit->image && !str_starts_with($produit->image, 'http') && Storage::disk('public')->exists($produit->image)) {
            Storage::disk('public')->delete($produit->image);
        }

        $produit->delete();
        return response()->json(['message' => 'Produit supprimé avec succès']);
    }

    public function mesProduits(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'fournisseur' || !$user->fournisseur) {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $query = Produit::with(['categorie', 'fournisseur'])
            ->where('fournisseur_id', $user->fournisseur->id);

        if ($request->has('search') && $request->search) {
            $query->where('nom', 'ILIKE', '%' . $request->search . '%');
        }

        if ($request->has('categorie_id') && $request->categorie_id) {
            $query->where('categorie_id', $request->categorie_id);
        }

        if ($request->has('alerte_stock') && $request->alerte_stock) {
            $query->whereRaw('stock <= seuil_alerte');
        }

        return response()->json($query->orderBy('created_at', 'desc')->paginate(20));
    }

    private function createStockAlert($produit)
    {
        $adminsEtGestionnaires = User::whereIn('role', ['admin', 'gestionnaire'])->get();
        
        foreach ($adminsEtGestionnaires as $user) {
            $message = "Le produit {$produit->nom} a un stock de {$produit->stock} (seuil {$produit->seuil_alerte}).";
            
            $notifExists = Notification::where([
                ['user_id', $user->id],
                ['type', 'stock_bas'],
                ['titre', 'Stock bas'],
                ['est_lue', false],
                ['message', $message]
            ])->exists();

            if (!$notifExists) {
                Notification::create([
                    'titre' => 'Stock bas',
                    'type' => 'stock_bas',
                    'message' => $message,
                    'user_id' => $user->id,
                    'date_creation' => now(),
                    'est_lue' => false,
                ]);
            }
        }
    }
}