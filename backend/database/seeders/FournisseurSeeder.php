<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Fournisseur;
class FournisseurSeeder extends Seeder
{
    public function run()
    {
        Fournisseur::factory(10)->create(); // Crée 10 fournisseurs
    }
}