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

# Copier les fichiers de dépendances
COPY composer.json composer.lock ./

# Installer les dépendances sans exécuter les scripts
RUN composer install --no-dev --no-scripts --no-autoloader --no-interaction --prefer-dist

# Copier le code source (excluant storage et vendor)
COPY app/ ./app/
COPY bootstrap/ ./bootstrap/
COPY config/ ./config/
COPY database/ ./database/
COPY public/ ./public/
COPY resources/ ./resources/
COPY routes/ ./routes/
COPY tests/ ./tests/
COPY artisan ./
COPY .env.example ./.env.example

# Générer l'autoloader optimisé
RUN composer dump-autoload --optimize --classmap-authoritative

# Créer les dossiers nécessaires
RUN mkdir -p storage/app/public \
 && mkdir -p storage/framework/cache/data \
 && mkdir -p storage/framework/sessions \
 && mkdir -p storage/framework/views \
 && mkdir -p storage/logs \
 && chown -R application:application /app \
 && chmod -R 755 /app \
 && chmod -R 775 storage bootstrap/cache

# Créer le lien storage
RUN php artisan storage:link || true

# Copier le script d'entrée
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80
CMD ["/entrypoint.sh"]
