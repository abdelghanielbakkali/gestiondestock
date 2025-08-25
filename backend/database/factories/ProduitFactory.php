<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Categorie;
use App\Models\Fournisseur;

class ProduitFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nom' => fake()->words(2, true),
            'description' => fake()->paragraph(),
            'stock' => fake()->numberBetween(0, 100),
            'seuil_alerte' => fake()->numberBetween(5, 20),
            'prix' => fake()->randomFloat(2, 10, 500),
            'image' => null, // pas d'image pour l'instant
            'categorie_id' => Categorie::inRandomOrder()->first()->id,
            'fournisseur_id' => Fournisseur::inRandomOrder()->first()->id,
        ];
    }
}