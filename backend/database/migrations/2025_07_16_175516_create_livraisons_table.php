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
        Schema::create('livraisons', function (Blueprint $table) {
        $table->id();
        $table->foreignId('commande_id')->constrained('commandes')->onDelete('cascade');
        $table->foreignId('fournisseur_id')->constrained('fournisseurs')->onDelete('cascade'); // Ajouté pour la relation directe
        $table->date('date');
        $table->enum('statut', ['en_attente', 'livree', 'annulee'])->default('en_attente');
        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('livraisons');
    }
};
