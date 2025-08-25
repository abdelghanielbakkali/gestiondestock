<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Commande;

class CommandeSeeder extends Seeder
{
    public function run(): void
    {
        Commande::factory(15)->create(); // Crée 15 commandes
    }
}