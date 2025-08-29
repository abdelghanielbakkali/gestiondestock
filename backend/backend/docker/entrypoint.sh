#!/usr/bin/env bash
set -e

echo "🚀 Starting Laravel application..."

# Génère la clé si absente
if [ -z "$APP_KEY" ] || [[ "$APP_KEY" == "base64:"* && ${#APP_KEY} -lt 10 ]]; then
  echo "🔑 Generating application key..."
  php artisan key:generate --force || true
fi

# Caches Laravel
echo "📦 Clearing and caching Laravel..."
php artisan config:clear || true
php artisan route:clear || true
php artisan view:clear || true
php artisan cache:clear || true

php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# Attendre que la base de données soit prête
echo "⏳ Waiting for database connection..."
until php artisan tinker --execute="DB::connection()->getPdo();" 2>/dev/null; do
  echo "Database not ready, waiting..."
  sleep 2
done

# Migrations et seeds
echo "🗄️ Running database migrations..."
php artisan migrate --force || true

echo "🌱 Running database seeds..."
php artisan db:seed --force || true

# Storage link
echo "🔗 Creating storage link..."
php artisan storage:link || true

echo "✅ Laravel application ready!"

# Démarre nginx + php-fpm (image webdevops)
exec /usr/bin/supervisord -n -c /opt/docker/etc/supervisor.conf



