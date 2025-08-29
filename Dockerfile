FROM webdevops/php-nginx:8.2

ENV APP_ENV=production \
    PHP_DISPLAY_ERRORS=0 \
    PHP_MEMORY_LIMIT=512M \
    WEB_DOCUMENT_ROOT=/app/public

WORKDIR /app

# Installation des extensions PHP nécessaires
RUN apt-get update && apt-get install -y \
    git unzip libpq-dev libzip-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql zip \
    && rm -rf /var/lib/apt/lists/*

# Installer Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Créer un nouveau projet Laravel
RUN composer create-project laravel/laravel . --prefer-dist --no-interaction

# Copier votre composer.json personnalisé si il existe
COPY composer.json ./composer.json 2>/dev/null || echo "Utilisation du composer.json par défaut"

# Réinstaller les dépendances si composer.json a changé
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Créer et configurer .env
RUN cp .env.example .env \
    && php artisan key:generate --no-interaction

# Optimiser pour la production
RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

# Permissions
RUN chown -R application:application /app \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 80

# Utiliser le point d'entrée par défaut de l'image
CMD ["/opt/docker/bin/entrypoint.sh", "supervisord"]