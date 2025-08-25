<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DemandeCreationCompte extends Model
{
    use HasFactory;

    protected $table = 'demandes_creation_compte';

    protected $fillable = [
        'prenom',
        'nom',
        'email',
        'role_demande',
        'statut', // enum: en_attente, acceptee, refusee
        'telephone',
        'adresse',
        'password',
        'photo',
        'photo_url',
    ];
    protected $appends = ['photo_url'];

        public function getPhotoUrlAttribute()
        {
            return $this->photo ? asset('storage/' . $this->photo) : null;
        }
}