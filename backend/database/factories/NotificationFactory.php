<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;

class NotificationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'message' => fake()->sentence(),
            'date_creation' => fake()->dateTime(),
            'user_id' => User::inRandomOrder()->first()->id,
            'est_lue' => fake()->boolean(),
        ];
    }
}