<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Créer un administrateur
        User::create([
            'prenom' => 'Admin',
            'nom' => 'Système',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'telephone' => '0123456789',
            'adresse' => '123 Rue Admin, Ville',
            'photo' => null, // pas de photo pour l'instant
            'email_verified_at' => now(), // email vérifié pour les utilisateurs de test
        ]);

        // Créer un gestionnaire
        User::create([
            'prenom' => 'Jean',
            'nom' => 'Dupont',
            'email' => 'gestionnaire@example.com',
            'password' => Hash::make('password'),
            'role' => 'gestionnaire',
            'telephone' => '0987654321',
            'adresse' => '456 Rue Gestion, Ville',
            'photo' => null,
            'email_verified_at' => now(),
        ]);

        // Créer un fournisseur
        User::create([
            'prenom' => 'Marie',
            'nom' => 'Martin',
            'email' => 'fournisseur@example.com',
            'password' => Hash::make('password'),
            'role' => 'fournisseur',
            'telephone' => '0555666777',
            'adresse' => '789 Rue Fournisseur, Ville',
            'photo' => null,
            'email_verified_at' => now(),
        ]);
    }
}