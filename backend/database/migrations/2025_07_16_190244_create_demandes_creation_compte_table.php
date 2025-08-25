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
         Schema::create('demandes_creation_compte', function (Blueprint $table) {
            $table->id();
        $table->string('prenom');
        $table->string('nom');
        $table->string('telephone')->nullable();
        $table->string('adresse')->nullable();
        $table->string('role_demande');
        $table->string('email')->unique();
        $table->string('password');
        $table->string('photo')->nullable();
        $table->enum('statut', ['en_attente', 'acceptee', 'refusee'])->default('en_attente');
        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('demandes_creation_compte');
    }
};
