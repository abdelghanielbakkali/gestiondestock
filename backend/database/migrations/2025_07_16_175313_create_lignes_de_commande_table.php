<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
         Schema::create('lignes_de_commande', function (Blueprint $table) {
        $table->id();
        $table->foreignId('commande_id')->constrained('commandes')->onDelete('cascade');
        $table->foreignId('produit_id')->constrained('produits')->onDelete('cascade');
        $table->integer('quantite');
        $table->float('prix');
        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lignes_de_commande');
    }
};
