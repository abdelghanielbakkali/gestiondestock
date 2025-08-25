<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('prenom')->nullable(); // Prénom
            $table->string('nom')->nullable();    // Nom de famille
            $table->string('telephone')->nullable(); // Téléphone
            $table->string('adresse')->nullable();   // Adresse
            $table->enum('role', ['admin', 'gestionnaire', 'fournisseur'])->default('gestionnaire')->index(); // Rôle
            $table->string('photo')->nullable(); // chemin de la photo de profil
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
};