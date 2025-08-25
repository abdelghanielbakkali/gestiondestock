<?php

// app/Http/Controllers/NotificationController.php
namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    // Lister les notifications de l'utilisateur connecté, avec filtre type
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Notification::where('user_id', $user->id);

        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        // Optionnel: filtrer par statut de lecture
        if ($request->has('est_lue') && $request->est_lue !== '') {
            $query->where('est_lue', $request->est_lue === 'true');
        }

        return response()->json($query->orderBy('date_creation', 'desc')->paginate(20));
    }

    // Marquer une notification comme lue
    public function markAsRead(Request $request, $id)
    {
        $user = $request->user();
        $notification = Notification::where('id', $id)->where('user_id', $user->id)->first();
        if (!$notification) {
            return response()->json(['message' => 'Notification non trouvée'], 404);
        }
        $notification->est_lue = true;
        $notification->save();

        return response()->json(['message' => 'Notification marquée comme lue']);
    }

    // Compteur de notifications non lues
    public function unreadCount(Request $request)
    {
        $user = $request->user();
        $query = Notification::where('user_id', $user->id)
            ->where('est_lue', false);
        
        // Filtrer par type si fourni (ex: nouvelle_commande)
        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        $count = $query->count();

        return response()->json(['count' => $count]);
    }

    // Supprimer une notification
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $notification = Notification::where('id', $id)->where('user_id', $user->id)->first();
        if (!$notification) {
            return response()->json(['message' => 'Notification non trouvée'], 404);
        }
        $notification->delete();
        return response()->json(['message' => 'Notification supprimée avec succès']);
    }

    // Notifications du fournisseur connecté
    public function mesNotifications(Request $request)
    {
        $user = $request->user();
        
        // Vérifie que l'utilisateur est bien un fournisseur
        if ($user->role !== 'fournisseur') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $query = Notification::where('user_id', $user->id);

        // Filtre par type
        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
        }

        // Filtre par statut (lue/non lue)
        if ($request->has('est_lue') && $request->est_lue !== '') {
            $query->where('est_lue', $request->est_lue === 'true');
        }

        return response()->json($query->orderBy('date_creation', 'desc')->paginate(20));
    }
}