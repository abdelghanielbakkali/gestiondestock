<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Password;
use App\Models\DemandeCreationCompte;
use App\Models\Notification;
use Carbon\Carbon;
use App\Notifications\CustomResetPassword;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
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

            \Log::info('Upload Cloudinary réussi (AuthController)', ['url' => $imageUrl]);
            return $imageUrl;

        } catch (\Exception $e) {
            \Log::error('Erreur upload Cloudinary (AuthController)', ['error' => $e->getMessage()]);
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
            \Log::warning('Fallback vers stockage local (AuthController)', ['reason' => $e->getMessage()]);
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            return $file->storeAs($folder, $filename, 'public');
        }
    }

    // Inscription : crée une demande, pas un user
    public function register(Request $request)
    {
        $validated = $request->validate([
            'prenom' => 'required|string|max:255',
            'nom' => 'required|string|max:255',
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:255',
            'role' => 'required|in:gestionnaire,fournisseur',
            'email' => 'required|string|email|max:255|unique:demandes_creation_compte,email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $this->handleImageUpload($request->file('photo'), 'photos');
        }

        DemandeCreationCompte::create([
            'prenom' => $validated['prenom'],
            'nom' => $validated['nom'],
            'telephone' => $validated['telephone'] ?? null,
            'adresse' => $validated['adresse'] ?? null,
            'role_demande' => $validated['role'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'photo' => $photoPath,
            'statut' => 'en_attente',
        ]);

        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'titre' => 'Demande de création de compte',
                'type' => 'demande_creation',
                'message' => "Nouvelle demande de création de compte par {$validated['prenom']} {$validated['nom']} ({$validated['email']})",
                'user_id' => $admin->id,
                'date_creation' => Carbon::now(),
                'est_lue' => false,
            ]);
        }

        return response()->json([
            'message' => 'Votre demande a été envoyée. Un administrateur doit la valider.',
        ], 201);
    }

    // Connexion
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            $demande = DemandeCreationCompte::where('email', $request->email)->first();
            if ($demande && $demande->statut === 'en_attente') {
                return response()->json(['message' => 'Votre compte n\'a pas encore été validé par l\'administrateur.'], 403);
            }
            if ($demande && $demande->statut === 'refusee') {
                return response()->json(['message' => 'Votre demande de compte a été refusée.'], 403);
            }
            return response()->json(['message' => 'Identifiants incorrects.'], 401);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Identifiants incorrects.'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    // Déconnexion
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnecté avec succès',
        ]);
    }

    // Infos utilisateur connecté
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    // Mise à jour du profil utilisateur
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'prenom' => 'required|string|max:255',
            'nom' => 'required|string|max:255',
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:255',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($request->hasFile('photo')) {
            // Supprimer l'ancienne photo locale si elle existe
            if ($user->photo && !str_starts_with($user->photo, 'http') && Storage::disk('public')->exists($user->photo)) {
                Storage::disk('public')->delete($user->photo);
            }

            $validated['photo'] = $this->handleImageUpload($request->file('photo'), 'photos');
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'user' => $user->fresh(),
        ]);
    }

    // Envoi email reset
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user) {
            $token = Password::broker()->createToken($user);
            $user->notify(new CustomResetPassword($token, $user->email));
            return response()->json(['message' => 'Lien de réinitialisation envoyé !']);
        }

        return response()->json(['message' => 'Impossible d\'envoyer le lien.'], 500);
    }

    // Reset mot de passe
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email|exists:users,email',
            'password' => 'required|min:6|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => 'Mot de passe réinitialisé avec succès']);
        }

        return response()->json(['message' => 'Échec de la réinitialisation.'], 500);
    }
    //final version
}