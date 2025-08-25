<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Categorie extends Model
{
    use HasFactory;

    protected $table = 'categories'; // nom de la table

    protected $fillable = [
        'nom',
        'description',
    ];

    // Relation : une catégorie a plusieurs produits
    public function produits()
    {
        return $this->hasMany(Produit::class, 'categorie_id');
    }
}