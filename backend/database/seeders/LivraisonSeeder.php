<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Livraison;

class LivraisonSeeder extends Seeder
{
    public function run(): void
    {
        Livraison::factory(10)->create(); // Crée 10 livraisons
    }
}