<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use App\Models\Fournisseur;

class CommandeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'date' => fake()->date(),
            'statut' => fake()->randomElement(['en_attente', 'en_cours', 'livree', 'annulee']),
            'total' => fake()->randomFloat(2, 100, 2000),
            'user_id' => User::inRandomOrder()->first()->id,
            'fournisseur_id' => Fournisseur::inRandomOrder()->first()->id,
        ];
    }
}