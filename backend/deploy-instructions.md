# Guide de Déploiement - Gestion de Stock

## Étape 1: Préparation

### 1.1 Vérifier les fichiers créés
- ✅ `render.yaml` - Configuration Render
- ✅ `docker-compose.yml` - Test local
- ✅ `Dockerfile` - Image Docker
- ✅ `docker/entrypoint.sh` - Script de démarrage
- ✅ `.dockerignore` - Optimisation

### 1.2 Variables d'environnement nécessaires
Vous aurez besoin de :
- `CLOUDINARY_URL` - Votre URL Cloudinary
- URL de votre frontend (pour CORS)

## Étape 2: Déploiement sur Render

### 2.1 Créer un compte Render
1. Allez sur [render.com](https://render.com)
2. Connectez-vous avec GitHub
3. Cliquez sur "New" → "Blueprint"

### 2.2 Connecter le repository
1. Sélectionnez votre repository GitHub
2. Render détectera automatiquement `render.yaml`
3. Cliquez sur "Apply"

### 2.3 Configurer les variables d'environnement
Dans Render, ajoutez manuellement :
```
CLOUDINARY_URL=cloudinary://your-api-key:your-api-secret@your-cloud-name
CORS_ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
```

### 2.4 Déployer
1. Cliquez sur "Create New Resources"
2. Render va automatiquement :
   - Créer la base de données PostgreSQL
   - Déployer l'application Laravel
   - Configurer les variables d'environnement

## Étape 3: Test du Déploiement

### 3.1 Vérifier l'API
```bash
# Test de santé
curl https://your-app.onrender.com/api/health

# Test d'authentification
curl https://your-app.onrender.com/api/auth/login
```

### 3.2 Vérifier les logs
Dans Render Dashboard → Logs

## Étape 4: Configuration Frontend

Une fois le backend déployé, notez l'URL :
`https://your-app.onrender.com`

Cette URL sera utilisée dans le frontend pour les appels API.

## Commandes utiles

### Test local avec Docker
```bash
docker-compose up --build
```

### Vérifier les logs
```bash
docker-compose logs app
```

### Arrêter les services
```bash
docker-compose down
```
