# Image avec Nginx + PHP-FPM déjà configurés
FROM webdevops/php-nginx:8.2

# Réduire le bruit
ENV APP_ENV=production \
    PHP_DISPLAY_ERRORS=0 \
    PHP_MEMORY_LIMIT=512M \
    WEB_DOCUMENT_ROOT=/app/public

WORKDIR /app

# Installer dépendances système utiles
RUN apt-get update && apt-get install -y \
    git unzip libpq-dev \
 && docker-php-ext-install pdo pdo_mysql pdo_pgsql \
 && rm -rf /var/lib/apt/lists/*

# Installer Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copier composer pour installer les deps d'abord (meilleur cache)
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# Copier tout le backend
COPY . .

# Droits sur storage/bootstrap
RUN mkdir -p storage/framework/{cache,views,sessions} \
 && chown -R application:application storage bootstrap/cache \
 && chmod -R 775 storage bootstrap/cache

# Optimisations Laravel (routes/config/views)
RUN php artisan route:clear || true \
 && php artisan config:clear || true

# Entrypoint: migrations puis lancer services (nginx+php-fpm)
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# webdevops utilise supervisord; port exposé 80 (Koyeb le détecte)
EXPOSE 80

CMD ["/entrypoint.sh"]