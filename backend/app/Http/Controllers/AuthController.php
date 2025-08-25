<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Password;
use App\Models\DemandeCreationCompte;
use App\Models\Notification;
use carbon\Carbon;
use App\Notifications\CustomResetPassword;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
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
        $photoUrl = null;
        $photoPath = null;
        if ($request->hasFile('photo')) {
            $file = $request->file('photo');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $photoPath = $file->storeAs('photos', $filename, 'public'); // stockage
            $photoUrl = Storage::url($photoPath); // /storage/photos/...

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
    'message' => 'Votre demande a été envoyée. Un administrateur doit la valider.',], 201);
    }

     // Connexion : refuse si le user n'existe pas mais une demande existe
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

    // ✅ Déconnexion
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnecté avec succès',
        ]);
    }

    // ✅ Infos utilisateur connecté
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    // ✅ Mise à jour du profil utilisateur
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

        // Gestion de la photo
        if ($request->hasFile('photo')) {
            // Supprimer l'ancienne photo si elle existe
            if ($user->photo && Storage::disk('public')->exists($user->photo)) {
                Storage::disk('public')->delete($user->photo);
            }
            
            $file = $request->file('photo');
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $photoPath = $file->storeAs('photos', $filename, 'public');
            $validated['photo'] = $photoPath;
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'user' => $user->fresh()
        ]);
    }

    // ✅ Envoi de l'email de réinitialisation de mot de passe
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

    // ✅ Réinitialisation du mot de passe via token
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
}