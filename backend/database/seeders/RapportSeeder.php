<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Rapport;

class RapportSeeder extends Seeder
{
    public function run(): void
    {
        Rapport::factory(8)->create(); // Crée 8 rapports
    }
}