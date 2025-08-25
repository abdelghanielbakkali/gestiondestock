<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\DemandeCreationCompte;

class DemandeCreationCompteSeeder extends Seeder
{
    public function run(): void
    {
        DemandeCreationCompte::factory(12)->create(); // Crée 12 demandes
    }
}