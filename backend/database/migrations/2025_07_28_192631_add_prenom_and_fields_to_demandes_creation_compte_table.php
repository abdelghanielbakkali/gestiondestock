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
        Schema::table('demandes_creation_compte', function (Blueprint $table) {
            if (!Schema::hasColumn('demandes_creation_compte', 'prenom')) {
               $table->string('prenom')->nullable();
           }
           if (!Schema::hasColumn('demandes_creation_compte', 'telephone')) {
               $table->string('telephone')->nullable();
           }
           if (!Schema::hasColumn('demandes_creation_compte', 'adresse')) {
               $table->string('adresse')->nullable();
           }
           if (!Schema::hasColumn('demandes_creation_compte', 'password')) {
               $table->string('password')->nullable();
           }
           if (!Schema::hasColumn('demandes_creation_compte', 'photo')) {
               $table->string('photo')->nullable();
           }
           if (!Schema::hasColumn('demandes_creation_compte', 'statut')) {
               $table->enum('statut', ['en_attente', 'acceptee', 'refusee'])->default('en_attente')->nullable();
           }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('demandes_creation_compte', function (Blueprint $table) {
        $table->dropColumn(['prenom', 'nom', 'telephone', 'adresse', 'role_demande', 'password', 'photo', 'statut']);
    });
    }
};
