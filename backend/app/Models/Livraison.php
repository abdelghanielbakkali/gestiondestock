<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Livraison extends Model
{
        use HasFactory;

        protected $table = 'livraisons';

        protected $fillable = [
            'commande_id',
            'date',
            'statut', // enum: en_attente, livree, annulee
        ];
        protected $casts = [
            'date' => 'date',
        ];
        public function commande()
        {
            return $this->belongsTo(Commande::class, 'commande_id');
        }
        // Getter pratique pour accéder au fournisseur via la commande
        public function getFournisseurAttribute()
        {
            return $this->commande ? $this->commande->fournisseur : null;
        }
}