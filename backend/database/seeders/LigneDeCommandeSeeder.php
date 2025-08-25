<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LigneDeCommande;

class LigneDeCommandeSeeder extends Seeder
{
    public function run(): void
    {
        LigneDeCommande::factory(30)->create(); // Crée 30 lignes de commande
    }
}