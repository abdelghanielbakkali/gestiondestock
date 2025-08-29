FROM webdevops/php-nginx:8.2

ENV APP_ENV=production \
    PHP_DISPLAY_ERRORS=0 \
    PHP_MEMORY_LIMIT=512M \
    WEB_DOCUMENT_ROOT=/app/public

WORKDIR /app

RUN apt-get update && apt-get install -y \
    git unzip libpq-dev \
 && docker-php-ext-install pdo pdo_mysql pdo_pgsql \
 && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copier les fichiers de dépendances du backend
COPY backend/composer.json backend/composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# Copier tout le code du backend
COPY backend/ .

RUN mkdir -p storage/framework/{cache,views,sessions} \
 && chown -R application:application storage bootstrap/cache \
 && chmod -R 775 storage bootstrap/cache

RUN php artisan route:clear || true \
 && php artisan config:clear || true

# Copier le script d'entrée
COPY backend/docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80
CMD ["/entrypoint.sh"]