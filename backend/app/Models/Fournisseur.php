<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Fournisseur extends Model
{
    use HasFactory;

    protected $table = 'fournisseurs';
    protected $appends = ['image_url'];

    protected $fillable = [
        'nom',
        'email',
        'telephone',
        'adresse',
        'image', // <-- Ajouté ici
        'user_id', 
    ];

    // Relation : un fournisseur a plusieurs produits
    public function produits()
    {
        return $this->hasMany(Produit::class, 'fournisseur_id');
    }

    // Relation : un fournisseur a plusieurs commandes
    public function commandes()
    {
        return $this->hasMany(Commande::class, 'fournisseur_id');
    }
        public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    public function livraisons()
    {
        return $this->hasMany(Livraison::class, 'fournisseur_id');
    }
    public function getImageUrlAttribute()
    {
        return $this->image ? asset('storage/' . $this->image) : null;
    }
}