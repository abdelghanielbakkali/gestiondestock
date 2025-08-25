<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

class RapportFactory extends Factory
{
    public function definition(): array
    {
        return [
            'type' => fake()->randomElement(['stock', 'commandes', 'fournisseurs', 'performance']),
            'date_generation' => fake()->dateTime(),
            'donnees' => json_encode([
                'total_produits' => fake()->numberBetween(50, 200),
                'total_commandes' => fake()->numberBetween(10, 50),
                'chiffre_affaires' => fake()->numberBetween(5000, 50000),
            ]),
            'user_id' => User::inRandomOrder()->first()->id,
        ];
    }
}