<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LigneDeCommande extends Model
{
    use HasFactory;

    protected $table = 'lignes_de_commande';

    protected $fillable = [
        'commande_id',
        'produit_id',
        'quantite',
        'prix',
    ];
      protected $casts = [
      'quantite' => 'integer',
      'prix' => 'float',
  ];

    // Relation : une ligne de commande appartient à une commande
    public function commande()
    {
        return $this->belongsTo(Commande::class, 'commande_id');
    }

    // Relation : une ligne de commande concerne un produit
    public function produit()
    {
        return $this->belongsTo(Produit::class, 'produit_id');
    }
}