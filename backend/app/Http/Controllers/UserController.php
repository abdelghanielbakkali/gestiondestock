<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
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

        // (Tu peux ajouter d'autres filtres ici, ex: date...)

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
        $path = $request->file('photo')->store('photos', 'public');
        $validated['photo'] = $path;
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
        $path = $request->file('photo')->store('photos', 'public');
        $validated['photo'] = $path;
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
        $user->delete();
        return response()->json(['message' => 'Utilisateur supprimé avec succès']);
    }
    public function getPhotoUrlAttribute()
        {
            return $this->photo ? Storage::url($this->photo) : null;
        }
}