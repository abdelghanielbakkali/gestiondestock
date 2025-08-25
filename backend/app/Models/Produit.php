<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Produit extends Model
{
    use HasFactory;

    protected $table = 'produits';

    protected $fillable = [
        'nom',
        'description',
         'image',
        'stock',
        'prix',  
        'seuil_alerte',
        'categorie_id',
        'fournisseur_id',
    ];
    protected $casts = [
        'prix' => 'float',
        'stock' => 'integer',
        'seuil_alerte' => 'integer',
    ];
protected $appends = ['image_url'];
    // Relation : un produit appartient à une catégorie
    public function categorie()
    {
        return $this->belongsTo(Categorie::class, 'categorie_id');
    }

    // Relation : un produit appartient à un fournisseur
    public function fournisseur()
    {
        return $this->belongsTo(Fournisseur::class, 'fournisseur_id');
    }

    // Relation : un produit peut apparaître dans plusieurs lignes de commande
    public function lignesDeCommande()
    {
        return $this->hasMany(LigneDeCommande::class, 'produit_id');
    }
    public function getImageUrlAttribute()
{
    return $this->image ? asset('storage/' . $this->image) : null;
}
}