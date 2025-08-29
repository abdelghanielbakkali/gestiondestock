<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Notifications\CustomResetPassword;
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'prenom',
        'nom',
        'telephone',
        'adresse',
        'role',
        'email',
        'password',
        'photo',
        'photo_url',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    protected $appends = ['photo_url'];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function commandes()
    {
        return $this->hasMany(Commande::class, 'user_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'user_id');
    }

    public function rapports()
    {
        return $this->hasMany(Rapport::class, 'user_id');
    }

    public function fournisseur()
    {
        return $this->hasOne(Fournisseur::class, 'user_id');
    }

    public function getPhotoUrlAttribute()
    {
        if (!$this->photo) {
            return null;
        }
        return str_starts_with($this->photo, 'http')
            ? $this->photo
            : asset('storage/' . $this->photo);
    }

    public function sendPasswordResetNotification($token)
    {
        $this->notify(new CustomResetPassword($token, $this->email));
    }
}