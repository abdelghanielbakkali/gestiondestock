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
        Schema::create('produits', function (Blueprint $table) {
        $table->id();
        $table->string('nom');
        $table->text('description')->nullable();
        $table->integer('stock');
        $table->string('image')->nullable(); // chemin de l'image du produit
        $table->float('prix')->nullable(); // prix de référence du produit
        $table->integer('seuil_alerte')->default(5); // <-- Ajouté ici
        $table->foreignId('categorie_id')->constrained('categories')->onDelete('cascade');
        $table->foreignId('fournisseur_id')->nullable()->constrained('fournisseurs')->onDelete('set null');
        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('produits');
    }
};
