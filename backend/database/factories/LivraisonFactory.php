<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Commande;

class LivraisonFactory extends Factory
{
    public function definition(): array
    {
        return [
            'commande_id' => Commande::inRandomOrder()->first()->id,
            'date' => fake()->date(),
            'statut' => fake()->randomElement(['en_attente', 'livree', 'annulee']),
        ];
    }
}