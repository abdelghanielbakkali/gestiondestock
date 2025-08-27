#!/usr/bin/env bash
set -e

# Génère la clé si absente
if [ -z "$APP_KEY" ] || [[ "$APP_KEY" == "base64:"* && ${#APP_KEY} -lt 10 ]]; then
  php artisan key:generate --force || true
fi

# Caches Laravel
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# Migrations (non bloquant si la DB n'est pas prête)
php artisan migrate --force || true
php artisan storage:link || true

# Démarre nginx + php-fpm (image webdevops)
exec /usr/bin/supervisord -n -c /opt/docker/etc/supervisor.conf