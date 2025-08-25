<?php
namespace App\Notifications;

use App\Models\Commande;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class CommandeStatutNotification extends Notification
{
    use Queueable;

    public $commande;

    public function __construct(Commande $commande)
    {
        $this->commande = $commande;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
                    ->line('Le statut de la commande #' . $this->commande->id . ' a été mis à jour.')
                    ->line('Le nouveau statut est : ' . $this->commande->statut)
                    ->action('Voir la commande', url('/commandes/' . $this->commande->id))
                    ->line('Merci d\'utiliser notre application.');
    }
}
