#!/bin/bash
set -e

echo "🚀 Démarrage de l'application Laravel..."

# Attendre que la base de données soit disponible (si DB_HOST est défini)
if [ ! -z "$DB_HOST" ]; then
    echo "⏳ Attente de la base de données..."
    while ! nc -z $DB_HOST ${DB_PORT:-3306}; do
        sleep 1
    done
    echo "✅ Base de données accessible"
fi

# Créer le fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    cp .env.example .env
fi

# Générer la clé d'application si elle n'existe pas
if ! grep -q "APP_KEY=base64:" .env; then
    echo "🔑 Génération de la clé d'application..."
    php artisan key:generate --no-interaction
fi

# Optimiser l'autoloader
echo "⚡ Optimisation de l'autoloader..."
composer dump-autoload --optimize --classmap-authoritative

# Mettre en cache les configurations (seulement en production)
if [ "$APP_ENV" = "production" ]; then
    echo "🏗️  Mise en cache des configurations..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

# Exécuter les migrations (optionnel - décommenter si nécessaire)
# echo "🔄 Exécution des migrations..."
# php artisan migrate --force --no-interaction

# Créer le lien symbolique pour le stockage public
echo "🔗 Création du lien symbolique pour le stockage..."
php artisan storage:link || true

# Définir les permissions finales
echo "🔐 Configuration des permissions..."
chown -R application:application /app/storage /app/bootstrap/cache
chmod -R 775 /app/storage /app/bootstrap/cache

echo "✅ Application Laravel prête !"

# Démarrer le serveur web
exec /opt/docker/bin/entrypoint.sh supervisord