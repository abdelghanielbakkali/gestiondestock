#!/bin/bash
set -e

echo "Démarrage de l'application Laravel..."

# Vérifier les permissions au démarrage
chown -R application:application /app/storage /app/bootstrap/cache 2>/dev/null || true
chmod -R 775 /app/storage /app/bootstrap/cache 2>/dev/null || true

# Créer le lien de stockage si nécessaire
if [ ! -L /app/public/storage ]; then
    php artisan storage:link 2>/dev/null || true
fi

# Exécuter les migrations si DATABASE_URL est défini
if [ ! -z "$DATABASE_URL" ] || [ ! -z "$DB_HOST" ]; then
    echo "Migration de la base de données..."
    php artisan migrate --force --no-interaction || echo "Migration échouée, continuons..."
fi

echo "Application prête!"

# Démarrer le serveur web
exec /opt/docker/bin/entrypoint.sh supervisord
EOF