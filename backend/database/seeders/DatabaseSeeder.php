<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
        CategorieSeeder::class,
        UserSeeder::class,
        FournisseurSeeder::class,
        ProduitSeeder::class,
        CommandeSeeder::class,
        LigneDeCommandeSeeder::class,
        LivraisonSeeder::class, 
        NotificationSeeder::class,
        RapportSeeder::class,
        DemandeCreationCompteSeeder::class,
    ]);

        
    }
}
