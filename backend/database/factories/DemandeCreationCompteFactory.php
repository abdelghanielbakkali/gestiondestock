<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class DemandeCreationCompteFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nom' => fake()->name(),
            'email' => fake()->unique()->email(),
            'role_demande' => fake()->randomElement(['fournisseur', 'gestionnaire']),
            'statut' => fake()->randomElement(['en_attente', 'approuvee', 'refusee']),
        ];
    }
}