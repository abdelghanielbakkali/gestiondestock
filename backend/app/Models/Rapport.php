<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rapport extends Model
{
    use HasFactory;

    protected $table = 'rapports';

    protected $fillable = [
        'type',
        'date_generation',
        'donnees',
        'user_id',
    ];
            protected $casts = [
            'date_generation' => 'datetime',
            'donnees' => 'array', // ou 'json' selon l'usage
        ];
    // Relation : un rapport appartient à un utilisateur
    public function utilisateur()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}