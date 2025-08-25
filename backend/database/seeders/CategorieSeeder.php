<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Categorie;

class CategorieSeeder extends Seeder
{
    public function run()
    {
        Categorie::create(['nom' => 'Informatique']);
        Categorie::create(['nom' => 'Papeterie']);
        Categorie::create(['nom' => 'Mobilier']);
        Categorie::create(['nom' => 'Électronique']);
        Categorie::create(['nom' => 'Vêtements']);
        Categorie::create(['nom' => 'Livres']);
    }
}