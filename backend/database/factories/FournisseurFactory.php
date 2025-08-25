<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
class FournisseurFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory()->state(['role' => 'fournisseur']),
            'nom' => fake()->company(),
            'email' => fake()->unique()->companyEmail(),
            'telephone' => fake()->phoneNumber(),
            'adresse' => fake()->address(),
            'image' => null, // pas d'image pour l'instant
        ];
    }
}