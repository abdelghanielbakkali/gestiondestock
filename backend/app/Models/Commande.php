<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Commande extends Model
{
    use HasFactory;

    protected $table = 'commandes';

    protected $fillable = [
        'date',
        'statut',
        'user_id',
        'total',    // Montant total de la commande
        'fournisseur_id',
    ];
      protected $casts = [
      'total' => 'float',
      'date' => 'date',
  ];

    // Relation : une commande appartient à un utilisateur
    public function utilisateur()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Relation : une commande appartient à un fournisseur
    public function fournisseur()
    {
        return $this->belongsTo(Fournisseur::class, 'fournisseur_id');
    }

    // Relation : une commande a plusieurs lignes de commande
    public function lignesDeCommande()
    {
        return $this->hasMany(LigneDeCommande::class, 'commande_id');
    }

    // Relation : une commande a plusieurs livraisons
    public function livraisons()
    {
        return $this->hasMany(Livraison::class, 'commande_id');
    }
}