<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    private function uploadToCloudinary($file, $folder = 'photos')
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
                    'folder' => $folder,
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

            \Log::info('Upload Cloudinary réussi (UserController)', ['url' => $imageUrl]);
            return $imageUrl;

        } catch (\Exception $e) {
            \Log::error('Erreur upload Cloudinary (UserController)', ['error' => $e->getMessage()]);
            throw $e;
        }
    }

    private function handleImageUpload($file, $folder = 'photos')
    {
        try {
            // Essayer d'uploader vers Cloudinary
            return $this->uploadToCloudinary($file, $folder);
        } catch (\Exception $e) {
            // Fallback vers le stockage local
            \Log::warning('Fallback vers stockage local (UserController)', ['reason' => $e->getMessage()]);
            return $file->store($folder, 'public');
        }
    }

    // Lister tous les utilisateurs (avec pagination, recherche, filtre)
    public function index(Request $request)
    {
        $query = User::query();

        // Recherche par nom, prénom ou email
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('prenom', 'like', "%$search%")
                  ->orWhere('nom', 'like', "%$search%")
                  ->orWhere('email', 'like', "%$search%");
            });
        }

        // Filtre par rôle
        if ($request->has('role') && $request->role) {
            $query->where('role', $request->role);
        }

        return response()->json($query->paginate(20));
    }

    // Créer un nouvel utilisateur (avec upload d'image)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'prenom' => 'required|string|max:255',
            'nom' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => ['required', Rule::in(['admin', 'gestionnaire', 'fournisseur'])],
            'telephone' => 'nullable|string|max:255',
            'adresse' => 'nullable|string|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo'] = $this->handleImageUpload($request->file('photo'), 'photos');
        }

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        // Ajout automatique dans la table fournisseurs si rôle = fournisseur
        if ($user->role === 'fournisseur') {
            \App\Models\Fournisseur::create([
                'user_id' => $user->id,
                'nom' => $user->nom,
                'email' => $user->email,
                'telephone' => $user->telephone,
                'adresse' => $user->adresse,
                'image' => $user->photo,
            ]);
        }

        return response()->json($user, 201);
    }

    // Afficher un utilisateur spécifique
    public function show($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }
        return response()->json($user);
    }

    // Mettre à jour un utilisateur (avec upload d'image)
    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        $validated = $request->validate([
            'prenom' => 'sometimes|required|string|max:255',
            'nom' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', Rule::unique('users')->ignore($user->id)],
            'password' => 'sometimes|nullable|string|min:6',
            'role' => ['sometimes', 'required', Rule::in(['admin', 'gestionnaire', 'fournisseur'])],
            'telephone' => 'nullable|string|max:255',
            'adresse' => 'nullable|string|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($request->hasFile('photo')) {
            // Supprimer l'ancienne photo locale si elle existe
            if ($user->photo && !str_starts_with($user->photo, 'http') && Storage::disk('public')->exists($user->photo)) {
                Storage::disk('public')->delete($user->photo);
            }

            $validated['photo'] = $this->handleImageUpload($request->file('photo'), 'photos');
        }

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        // Synchronisation fournisseur
        if ($user->role === 'fournisseur') {
            $fournisseur = \App\Models\Fournisseur::where('user_id', $user->id)->first();
            if ($fournisseur) {
                $fournisseur->update([
                    'nom' => $user->nom,
                    'email' => $user->email,
                    'telephone' => $user->telephone,
                    'adresse' => $user->adresse,
                    'image' => $user->photo,
                ]);
            } else {
                \App\Models\Fournisseur::create([
                    'user_id' => $user->id,
                    'nom' => $user->nom,
                    'email' => $user->email,
                    'telephone' => $user->telephone,
                    'adresse' => $user->adresse,
                    'image' => $user->photo,
                ]);
            }
        }

        return response()->json($user);
    }

    // Supprimer un utilisateur
    public function destroy($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        // Supprimer la photo locale si elle existe
        if ($user->photo && !str_starts_with($user->photo, 'http') && Storage::disk('public')->exists($user->photo)) {
            Storage::disk('public')->delete($user->photo);
        }

        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé avec succès']);
    }

    public function getPhotoUrlAttribute()
    {
        return $this->photo ? Storage::url($this->photo) : null;
    }
}