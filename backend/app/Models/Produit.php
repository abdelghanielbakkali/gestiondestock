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

    public function categorie()
    {
        return $this->belongsTo(Categorie::class, 'categorie_id');
    }

    public function fournisseur()
    {
        return $this->belongsTo(Fournisseur::class, 'fournisseur_id');
    }

    public function lignesDeCommande()
    {
        return $this->hasMany(LigneDeCommande::class, 'produit_id');
    }

    public function getImageUrlAttribute()
    {
        if (!$this->image) {
            return null;
        }
        return str_starts_with($this->image, 'http')
            ? $this->image
            : asset('storage/' . $this->image);
    }
}