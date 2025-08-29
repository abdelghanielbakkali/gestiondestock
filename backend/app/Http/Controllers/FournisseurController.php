<?php

namespace App\Http\Controllers;

use App\Models\Fournisseur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FournisseurController extends Controller
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

            \Log::info('Upload Cloudinary réussi (FournisseurController)', ['url' => $imageUrl]);
            return $imageUrl;

        } catch (\Exception $e) {
            \Log::error('Erreur upload Cloudinary (FournisseurController)', ['error' => $e->getMessage()]);
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
            \Log::warning('Fallback vers stockage local (FournisseurController)', ['reason' => $e->getMessage()]);
            return $file->store($folder, 'public');
        }
    }

    public function index(Request $request)
    {
        $query = Fournisseur::query();

        if ($request->has('search') && $request->search !== null) {
            $search = $request->search;
            $query->where('nom', 'ILIKE', '%' . $search . '%');
        }

        return response()->json($query->paginate(20));
    }

    // Créer un nouveau fournisseur (création user + fournisseur)
    public function store(Request $request)
    {
        $validatedUser = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'telephone' => 'nullable|string|max:255',
            'adresse' => 'nullable|string|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($request->hasFile('photo')) {
            $validatedUser['photo'] = $this->handleImageUpload($request->file('photo'), 'photos');
        }

        $validatedUser['password'] = \Illuminate\Support\Facades\Hash::make($validatedUser['password']);
        $validatedUser['role'] = 'fournisseur';

        $user = \App\Models\User::create($validatedUser);

        $fournisseur = Fournisseur::create([
            'user_id' => $user->id,
            'nom' => $user->nom,
            'email' => $user->email,
            'telephone' => $user->telephone,
            'adresse' => $user->adresse,
            'image' => $user->photo,
        ]);

        return response()->json($fournisseur, 201);
    }

    public function show($id)
    {
        $fournisseur = Fournisseur::find($id);
        if (!$fournisseur) {
            return response()->json(['message' => 'Fournisseur non trouvé'], 404);
        }
        return response()->json($fournisseur);
    }

    public function update(Request $request, $id)
    {
        $fournisseur = Fournisseur::find($id);
        if (!$fournisseur) {
            return response()->json(['message' => 'Fournisseur non trouvé'], 404);
        }

        $user = $fournisseur->user;

        $validatedUser = $request->validate([
            'nom' => 'sometimes|required|string|max:255',
            'prenom' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', \Illuminate\Validation\Rule::unique('users')->ignore($user->id)],
            'password' => 'sometimes|nullable|string|min:6',
            'telephone' => 'nullable|string|max:255',
            'adresse' => 'nullable|string|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($request->hasFile('photo')) {
            // Supprimer l'ancienne photo locale si elle existe
            if ($user->photo && !str_starts_with($user->photo, 'http') && Storage::disk('public')->exists($user->photo)) {
                Storage::disk('public')->delete($user->photo);
            }

            $validatedUser['photo'] = $this->handleImageUpload($request->file('photo'), 'photos');
        }

        if (isset($validatedUser['password'])) {
            $validatedUser['password'] = \Illuminate\Support\Facades\Hash::make($validatedUser['password']);
        } else {
            unset($validatedUser['password']);
        }

        $user->update($validatedUser);

        $fournisseur->update([
            'nom' => $user->nom,
            'email' => $user->email,
            'telephone' => $user->telephone,
            'adresse' => $user->adresse,
            'image' => $user->photo,
        ]);

        return response()->json($fournisseur);
    }

    public function destroy($id)
    {
        $fournisseur = Fournisseur::find($id);
        if (!$fournisseur) {
            return response()->json(['message' => 'Fournisseur non trouvé'], 404);
        }

        $user = $fournisseur->user;

        // Supprimer l'image locale si elle existe
        if ($fournisseur->image && !str_starts_with($fournisseur->image, 'http') && Storage::disk('public')->exists($fournisseur->image)) {
            Storage::disk('public')->delete($fournisseur->image);
        }

        $fournisseur->delete();
        if ($user) {
            if ($user->photo && !str_starts_with($user->photo, 'http') && Storage::disk('public')->exists($user->photo)) {
                Storage::disk('public')->delete($user->photo);
            }
            $user->delete();
        }

        return response()->json(['message' => 'Fournisseur et utilisateur supprimés avec succès']);
    }
}