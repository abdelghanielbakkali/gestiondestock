FROM webdevops/php-nginx:8.2

ENV APP_ENV=production \
    PHP_DISPLAY_ERRORS=0 \
    PHP_MEMORY_LIMIT=512M \
    WEB_DOCUMENT_ROOT=/app/public \
    WEB_PHP_TIMEOUT=600 \
    PHP_OPCACHE_ENABLE=1

WORKDIR /app

# Installation des dépendances système
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    libzip-dev \
    zip \
    && docker-php-ext-install \
        pdo \
        pdo_mysql \
        pdo_pgsql \
        zip \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copier Composer depuis l'image officielle
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copier les fichiers de dépendances en premier pour optimiser le cache Docker
COPY composer.json composer.lock ./

# Installer les dépendances PHP
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --no-interaction \
    --prefer-dist \
    && composer clear-cache

# Copier le code source de l'application
COPY app/ ./app/
COPY bootstrap/ ./bootstrap/
COPY config/ ./config/
COPY database/ ./database/
COPY public/ ./public/
COPY resources/ ./resources/
COPY routes/ ./routes/
COPY artisan ./

# Copier le fichier .env.example si pas de .env
COPY .env.example ./.env.example

# Finaliser l'installation Composer avec autoloader optimisé
RUN composer dump-autoload --optimize --classmap-authoritative

# Créer les dossiers de stockage avec les bonnes permissions
RUN mkdir -p storage/app/public \
    && mkdir -p storage/framework/cache/data \
    && mkdir -p storage/framework/sessions \
    && mkdir -p storage/framework/views \
    && mkdir -p storage/logs \
    && mkdir -p bootstrap/cache

# Définir les permissions correctes
RUN chown -R application:application /app \
    && chmod -R 755 /app \
    && chmod -R 775 storage bootstrap/cache \
    && chmod 644 .env.example

# Créer un lien symbolique pour le stockage public
RUN php artisan storage:link || true

# Copier et configurer le script d'entrée
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Exposer le port 80
EXPOSE 80

# Point d'entrée
ENTRYPOINT ["/entrypoint.sh"]