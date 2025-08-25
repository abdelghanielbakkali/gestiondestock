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
        Schema::table('livraisons', function (Blueprint $table) {
            $table->foreignId('fournisseur_id')->nullable()->constrained('fournisseurs')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('livraisons', function (Blueprint $table) {
            $table->dropForeign(['fournisseur_id']);
            $table->dropColumn('fournisseur_id');
        });
    }
};