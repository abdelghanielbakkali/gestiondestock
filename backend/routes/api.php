<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategorieController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\FournisseurController;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\CommandeController;
use App\Http\Controllers\LigneDeCommandeController;
use App\Http\Controllers\LivraisonController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\RapportController;
use App\Http\Controllers\DemandeCreationCompteController;

// Routes publiques (auth, inscription, mot de passe oublié)
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Routes accessibles à tous les utilisateurs connectés
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    //Route::get('/notifications/mes', [NotificationController::class, 'mesNotifications']);
    Route::get('/livraisons/mes', [LivraisonController::class, 'mesLivraisons']);
    Route::get('/commandes/mes', [CommandeController::class, 'index']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']); // à adapter si besoin pour filtrer par fournisseur
});

//Route::middleware(['auth:sanctum', 'role:admin,gestionnaire'])->group(function () {
    //Route::get('/rapports/stats', [\App\Http\Controllers\RapportController::class, 'stats']);

//});

Route::middleware(['auth:sanctum', 'role:admin,fournisseur'])->delete(
    'commandes/{id}',
    [CommandeController::class, 'destroy']
);

// Routes réservées à l'admin
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::apiResource('users', UserController::class);
    Route::apiResource('demandes-creation-compte', DemandeCreationCompteController::class);
});

// Routes réservées au gestionnaire et à l'admin

Route::middleware(['auth:sanctum', 'role:gestionnaire,admin'])->group(function () {
    Route::apiResource('users', UserController::class);
    Route::get('/rapports/stats', [\App\Http\Controllers\RapportController::class, 'stats']);
    //Route::apiResource('demandes-creation-compte', DemandeCreationCompteController::class);
    Route::apiResource('categories', CategorieController::class);
    Route::apiResource('fournisseurs', FournisseurController::class);
    Route::apiResource('produits', ProduitController::class);
    // On exclut destroy ici : la route DELETE est définie plus haut pour admin+fournisseur
    Route::apiResource('commandes', CommandeController::class)->except(['destroy']);
    Route::apiResource('lignes-de-commande', LigneDeCommandeController::class);
    //Route::apiResource('livraisons', LivraisonController::class);
    Route::get('livraisons', [LivraisonController::class, 'index']);
    Route::post('livraisons', [LivraisonController::class, 'store']);
    Route::get('livraisons/{id}', [LivraisonController::class, 'show']);
    Route::put('livraisons/{id}', [LivraisonController::class, 'update']);
    Route::delete('livraisons/{id}', [LivraisonController::class, 'destroy']);
    Route::get('/rapports/mes', [\App\Http\Controllers\RapportController::class, 'stats']);
    //Route::get('/notifications', [NotificationController::class, 'index']);
    //Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    //Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::apiResource('demandes-creation-compte', DemandeCreationCompteController::class);
});

// Routes réservées au fournisseur
Route::middleware(['auth:sanctum', 'role:fournisseur'])->group(function () {
    Route::get('livraisons/mes', [LivraisonController::class, 'mesLivraisons']);
    //Route::get('notifications/mes', [NotificationController::class, 'mesNotifications']);
    Route::get('produits/mes', [ProduitController::class, 'mesProduits']); // produits du fournisseur connecté
    Route::get('commandes/mes', [CommandeController::class, 'mesCommandes']); // commandes du fournisseur connecté
    Route::put('fournisseurs/{id}', [FournisseurController::class, 'update']); // mise à jour de son profil
    Route::post('demandes-creation-compte', [DemandeCreationCompteController::class, 'store']);
    
    // Pour accepter/refuser une commande
    Route::put('commandes/{id}/statut', [CommandeController::class, 'changerStatut']);
    
    // Note : la route DELETE('commandes/{id}') est définie plus haut (admin + fournisseur)
    // Notifications
    //Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    // Pour mettre à jour une livraison (marquer livrée/annulée)
    Route::put('livraisons/{id}', [LivraisonController::class, 'update']);
    Route::get('/rapports/mes', [\App\Http\Controllers\RapportController::class, 'mesRapports']);
});