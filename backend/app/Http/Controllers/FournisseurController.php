<?php

namespace App\Http\Controllers;

use App\Models\Fournisseur;
use Illuminate\Http\Request;

class FournisseurController extends Controller
{
    // Lister tous les fournisseurs (avec pagination)
    public function index(Request $request)
    {
            $query = Fournisseur::query();

            if ($request->has('search') && $request->search !== null) {
                $search = $request->search;
                $query->where('nom', 'ILIKE', '%' . $search . '%'); // PostgreSQL only
            }

        return response()->json($query->paginate(20));
    }

    // Créer un nouveau fournisseur (avec upload d'image)
    public function store(Request $request)
{
    // Validation pour l'utilisateur
    $validatedUser = $request->validate([
        'nom' => 'required|string|max:255',
        'prenom' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email',
        'password' => 'required|string|min:6',
        'telephone' => 'nullable|string|max:255',
        'adresse' => 'nullable|string|max:255',
        'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
    ]);

    // Gestion de la photo
    if ($request->hasFile('photo')) {
        $path = $request->file('photo')->store('photos', 'public');
        $validatedUser['photo'] = $path;
    }

    $validatedUser['password'] = \Illuminate\Support\Facades\Hash::make($validatedUser['password']);
    $validatedUser['role'] = 'fournisseur';

    // Création de l'utilisateur
    $user = \App\Models\User::create($validatedUser);

    // Création du fournisseur lié à ce user
    $fournisseur = Fournisseur::create([
        'user_id' => $user->id,
        'nom' => $user->nom,
        'prenom' => $user->prenom,
        'email' => $user->email,
        'telephone' => $user->telephone,
        'adresse' => $user->adresse,
        'image' => $user->photo,
    ]);

    return response()->json($fournisseur, 201);
}

    // Afficher un fournisseur spécifique
    public function show($id)
    {
        $fournisseur = Fournisseur::find($id);
        if (!$fournisseur) {
            return response()->json(['message' => 'Fournisseur non trouvé'], 404);
        }
        return response()->json($fournisseur);
    }

    // Mettre à jour un fournisseur (avec upload d'image)
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
        $path = $request->file('photo')->store('photos', 'public');
        $validatedUser['photo'] = $path;
    }

    if (isset($validatedUser['password'])) {
        $validatedUser['password'] = \Illuminate\Support\Facades\Hash::make($validatedUser['password']);
    } else {
        unset($validatedUser['password']);
    }

    // Mise à jour du user
    $user->update($validatedUser);

    // Mise à jour du fournisseur
    $fournisseur->update([
        'nom' => $user->nom,
        'prenom' => $user->prenom,
        'email' => $user->email,
        'telephone' => $user->telephone,
        'adresse' => $user->adresse,
        'image' => $user->photo,
    ]);

    return response()->json($fournisseur);
}
    // Supprimer un fournisseur
    public function destroy($id)
{
    $fournisseur = Fournisseur::find($id);
    if (!$fournisseur) {
        return response()->json(['message' => 'Fournisseur non trouvé'], 404);
    }

    $user = $fournisseur->user;
    $fournisseur->delete();
    if ($user) {
        $user->delete();
    }

    return response()->json(['message' => 'Fournisseur et utilisateur supprimés avec succès']);
}
}