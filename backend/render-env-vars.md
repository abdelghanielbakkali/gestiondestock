# Variables d'environnement pour Render

## Variables obligatoires à configurer dans Render :

### Application
- `APP_NAME`: "Gestion de Stock"
- `APP_ENV`: production
- `APP_DEBUG`: false
- `APP_URL`: https://your-backend-url.onrender.com

### Base de données (automatiquement configurées par Render)
- `DB_CONNECTION`: pgsql
- `DB_HOST`: (auto)
- `DB_PORT`: (auto)
- `DB_DATABASE`: (auto)
- `DB_USERNAME`: (auto)
- `DB_PASSWORD`: (auto)

### Cloudinary
- `CLOUDINARY_URL`: cloudinary://your-api-key:your-api-secret@your-cloud-name

### CORS
- `CORS_ALLOWED_ORIGINS`: https://your-frontend-url.vercel.app,http://localhost:3000

### Autres
- `LOG_CHANNEL`: stack
- `CACHE_DRIVER`: file
- `SESSION_DRIVER`: file
- `QUEUE_CONNECTION`: sync
