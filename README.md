# Gestion de Stock App

Application complète de gestion de stock avec interface multi-rôles.

## 🚀 Fonctionnalités

### Interface Admin
- Gestion des utilisateurs et demandes de création de compte
- Gestion des catégories et fournisseurs
- Gestion des produits et commandes
- Rapports et statistiques détaillés
- Notifications en temps réel

### Interface Gestionnaire
- Gestion des produits et commandes
- Suivi des livraisons
- Rapports de stock
- Notifications système

### Interface Fournisseur
- Consultation des commandes reçues
- Acceptation/refus des commandes
- Suivi des livraisons
- Rapports personnalisés
- Notifications de nouvelles commandes

## 🛠️ Technologies

- **Backend :** Laravel 10, PostgreSQL
- **Frontend :** React 18, Tailwind CSS
- **Authentification :** Laravel Sanctum
- **Déploiement :** Vercel

##  Structure

├── backend/ # API Laravel
├── stock-management-frontend/ # Interface React
└── frontend-fournisseur/ # Interface Fournisseur



## 🔧 Installation

1. Cloner le repository
2. Configurer la base de données
3. Installer les dépendances
4. Lancer les migrations
5. Démarrer les serveurs

## �� Base de données

- **Users** : Utilisateurs (admin, gestionnaire, fournisseur)
- **Categories** : Catégories de produits
- **Fournisseurs** : Fournisseurs
- **Produits** : Produits avec stock
- **Commandes** : Commandes de produits
- **Livraisons** : Suivi des livraisons
- **Notifications** : Système de notifications

## 🔐 Rôles et permissions

- **Admin** : Accès complet à toutes les fonctionnalités
- **Gestionnaire** : Gestion des produits, commandes et livraisons
- **Fournisseur** : Consultation et gestion de ses commandes

## 📱 Interface responsive

Application optimisée pour desktop et mobile avec design moderne et intuitif.


