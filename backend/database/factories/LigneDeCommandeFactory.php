<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Commande;
use App\Models\Produit;

class LigneDeCommandeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'commande_id' => Commande::inRandomOrder()->first()->id,
            'produit_id' => Produit::inRandomOrder()->first()->id,
            'quantite' => fake()->numberBetween(1, 10),
            'prix' => fake()->randomFloat(2, 10, 200),
        ];
    }
}