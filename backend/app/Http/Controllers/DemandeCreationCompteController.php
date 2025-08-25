<?php

namespace App\Http\Controllers;

use App\Models\DemandeCreationCompte;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
class DemandeCreationCompteController extends Controller
{
    // Lister toutes les demandes de création de compte (avec pagination et filtre)
    public function index(Request $request)
    {
        $query = DemandeCreationCompte::query();
        if ($request->has('statut')&&$request->statut !== '') {
            $query->where('statut', $request->statut);
        }
        return response()->json($query->paginate(20));
    }

    // Créer une nouvelle demande de création de compte (depuis le register)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'prenom' => 'required|string|max:255',
            'nom' => 'required|string|max:255',
            'email' => 'required|email|unique:demandes_creation_compte,email',
            'role_demande' => 'required|in:fournisseur,gestionnaire',
            'telephone' => 'nullable|string|max:20',
            'adresse' => 'nullable|string|max:255',
            'password' => 'required|string|min:6|confirmed',
            'photo' => 'nullable|string',
        ]);

        $demande = DemandeCreationCompte::create([
            'prenom' => $validated['prenom'],
            'nom' => $validated['nom'],
            'email' => $validated['email'],
            'role_demande' => $validated['role_demande'],
            'statut' => 'en_attente',
            'telephone' => $validated['telephone'] ?? null,
            'adresse' => $validated['adresse'] ?? null,
            'password' => Hash::make($validated['password']),
            'photo' => $validated['photo'] ?? null,
        ]);

        return response()->json(['message' => 'Votre demande a été envoyée. Un administrateur doit la valider.'], 201);
    }

    // Accepter/refuser une demande (admin)
    public function update(Request $request, $id)
    {
        $demande = DemandeCreationCompte::find($id);
        if (!$demande) {
            return response()->json(['message' => 'Demande non trouvée'], 404);
        }

        $validated = $request->validate([
            'statut' => 'required|in:approuvee,refusee',
        ]);
        if (!$demande->password) {
    return response()->json(['message' => 'Impossible d\'accepter cette demande : mot de passe manquant.'], 400);
}

    if ($validated['statut'] === 'approuvee' && $demande->statut === 'en_attente') {
    // Vérifier unicité email
    if (User::where('email', $demande->email)->exists()) {
        return response()->json(['message' => 'Un utilisateur avec cet email existe déjà.'], 409);
    }
    // Créer l'utilisateur
    $user = User::create([
        'prenom' => $demande->prenom,
        'nom' => $demande->nom,
        'telephone' => $demande->telephone,
        'adresse' => $demande->adresse,
        'role' => $demande->role_demande,
        'email' => $demande->email,
        'password' => $demande->password, // déjà hashé
        'photo' => $demande->photo,
    ]);
}

        $demande->statut = $validated['statut'];
        $demande->save();

        return response()->json($demande);
    }
    public function destroy($id)
    {
        try {
            $demande = DemandeCreationCompte::findOrFail($id);
            
            // Supprimer la photo si elle existe
            if ($demande->photo && Storage::disk('public')->exists($demande->photo)) {
                Storage::disk('public')->delete($demande->photo);
            }
            
            // Supprimer la demande
            $demande->delete();
            
            return response()->json([
                'message' => 'Demande supprimée avec succès'
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la suppression de la demande',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}