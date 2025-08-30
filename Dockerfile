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

# Configurer Git pour éviter les erreurs de ownership
RUN git config --global --add safe.directory /app \
    && git config --global --add safe.directory '*'

# Copier Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copier tout le projet
COPY . .

# Installation conditionnelle des dépendances
RUN if [ -f composer.json ]; then \
        echo "Installation des dépendances depuis composer.json existant..."; \
        composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist; \
    else \
        echo "Création d'un nouveau projet Laravel..."; \
        composer create-project laravel/laravel temp --prefer-dist --no-interaction; \
        cp -r temp/* .; \
        cp temp/.env.example . 2>/dev/null || true; \
        rm -rf temp; \
        composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist; \
    fi

# Créer les dossiers de stockage
RUN mkdir -p storage/framework/cache/data \
    && mkdir -p storage/framework/sessions \
    && mkdir -p storage/framework/views \
    && mkdir -p storage/logs \
    && mkdir -p storage/app/public \
    && mkdir -p bootstrap/cache

# Configuration de l'environnement
RUN if [ ! -f .env ]; then \
        if [ -f .env.example ]; then \
            cp .env.example .env; \
        else \
            echo "APP_NAME=GestionStock" > .env; \
            echo "APP_ENV=production" >> .env; \
            echo "APP_KEY=" >> .env; \
            echo "APP_DEBUG=false" >> .env; \
            echo "APP_URL=http://localhost" >> .env; \
            echo "LOG_CHANNEL=stack" >> .env; \
            echo "DB_CONNECTION=sqlite" >> .env; \
            echo "DB_DATABASE=/app/database/database.sqlite" >> .env; \
        fi; \
    fi

# Générer la clé d'application
RUN php artisan key:generate --no-interaction --force

# Créer une base SQLite par défaut si pas de DB configurée
RUN touch database/database.sqlite || true

# Optimiser pour la production
RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

# Créer le lien symbolique pour le stockage
RUN php artisan storage:link

# Définir les permissions
RUN chown -R application:application /app \
    && chmod -R 755 /app \
    && chmod -R 775 storage bootstrap/cache

# Script d'entrée intégré
RUN cat > /entrypoint.sh << 'EOF'


RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]