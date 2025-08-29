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

# Copier Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copier tous les fichiers du projet
COPY . .

# Vérifier et installer les dépendances
RUN if [ -f composer.json ]; then \
        echo "📦 Installation des dépendances depuis composer.json existant..."; \
        composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist; \
    else \
        echo "🆕 Création d'un nouveau projet Laravel..."; \
        composer create-project laravel/laravel temp --prefer-dist --no-interaction; \
        mv temp/* temp/.* . 2>/dev/null || true; \
        rmdir temp; \
        composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist; \
    fi

# Créer les dossiers de stockage nécessaires
RUN mkdir -p storage/framework/cache/data \
    && mkdir -p storage/framework/sessions \
    && mkdir -p storage/framework/views \
    && mkdir -p storage/logs \
    && mkdir -p storage/app/public \
    && mkdir -p bootstrap/cache

# Configurer l'environnement
RUN if [ ! -f .env ]; then \
        if [ -f .env.example ]; then \
            cp .env.example .env; \
            echo "📝 Fichier .env créé depuis .env.example"; \
        else \
            echo "APP_NAME=Laravel" > .env; \
            echo "APP_ENV=production" >> .env; \
            echo "APP_KEY=" >> .env; \
            echo "APP_DEBUG=false" >> .env; \
            echo "APP_URL=http://localhost" >> .env; \
            echo "📝 Fichier .env par défaut créé"; \
        fi; \
    fi

# Générer la clé d'application
RUN php artisan key:generate --no-interaction --force || true

# Optimiser pour la production
RUN php artisan config:cache || true \
    && php artisan route:cache || true \
    && php artisan view:cache || true

# Créer le lien symbolique pour le stockage
RUN php artisan storage:link || true

# Définir les permissions correctes
RUN chown -R application:application /app \
    && chmod -R 755 /app \
    && chmod -R 775 storage bootstrap/cache

# Créer un script d'entrée robuste
RUN echo '#!/bin/bash' > /entrypoint.sh && \
    echo 'set -e' >> /entrypoint.sh && \
    echo 'echo "🚀 Démarrage de l'\''application Laravel..."' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Vérifier les permissions au démarrage' >> /entrypoint.sh && \
    echo 'chown -R application:application /app/storage /app/bootstrap/cache 2>/dev/null || true' >> /entrypoint.sh && \
    echo 'chmod -R 775 /app/storage /app/bootstrap/cache 2>/dev/null || true' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Créer le lien de stockage si nécessaire' >> /entrypoint.sh && \
    echo 'if [ ! -L /app/public/storage ]; then' >> /entrypoint.sh && \
    echo '    php artisan storage:link 2>/dev/null || true' >> /entrypoint.sh && \
    echo 'fi' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo 'echo "✅ Application prête!"' >> /entrypoint.sh && \
    echo '' >> /entrypoint.sh && \
    echo '# Démarrer le serveur web' >> /entrypoint.sh && \
    echo 'exec /opt/docker/bin/entrypoint.sh supervisord' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]