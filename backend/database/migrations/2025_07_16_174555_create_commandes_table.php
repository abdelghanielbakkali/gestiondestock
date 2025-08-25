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
         Schema::create('commandes', function (Blueprint $table) {
        $table->id();
        $table->date('date');
        $table->float('total')->nullable(); // total de la commande
        $table->enum('statut', ['en_attente', 'en_cours', 'livree', 'annulee'])->default('en_attente');
        $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
        $table->foreignId('fournisseur_id')->constrained('fournisseurs')->onDelete('cascade');
        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commandes');
    }
};
