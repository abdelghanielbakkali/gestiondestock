<?php
// app/Models/Notification.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $table = 'notifications';

    protected $fillable = [
        'titre',
        'type',
        'message',
        'date_creation',
        'user_id',
        'est_lue',
    ];

    protected $casts = [
        'est_lue' => 'boolean',
        'date_creation' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}