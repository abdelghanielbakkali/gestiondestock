# Guide de Déploiement - Gestion de Stock

## Structure du Projet
```
GestionDeStock/
├── backend/                 # Backend Laravel
├── frontend-admin/          # Frontend Admin
├── frontend-fournisseur/    # Frontend Fournisseur
├── stock-management-frontend/ # Frontend Principal
├── Dockerfile              # Dockerfile pour le backend
├── .dockerignore           # Fichiers à ignorer pour Docker
├── render.yaml             # Configuration Render
└── DEPLOYMENT_GUIDE.md     # Ce guide
```

## Étape 1: Déploiement de la Base de Données PostgreSQL (Railway)

### 1.1 Créer un compte Railway
1. Allez sur [railway.app](https://railway.app)
2. Connectez-vous avec GitHub
3. Cliquez sur "New Project"

### 1.2 Créer la base de données
1. Cliquez sur "Add Service"
2. Sélectionnez "Database" → "PostgreSQL"
3. Notez les informations de connexion :
   - **Host**: `containers-us-west-XX.railway.app`
   - **Port**: `5432`
   - **Database**: `railway`
   - **Username**: `postgres`
   - **Password**: (cliquez sur "Show" pour voir)

## Étape 2: Déploiement du Backend Laravel (Render)

### 2.1 Créer un compte Render
1. Allez sur [render.com](https://render.com)
2. Connectez-vous avec GitHub
3. Cliquez sur "New" → "Web Service"

### 2.2 Connecter le repository
1. Connectez votre repository GitHub
2. Sélectionnez le repository `GestionDeStock`

### 2.3 Configurer le service
- **Name**: `stock-management-backend`
- **Environment**: `Docker`
- **Region**: `Oregon (US West)`
- **Branch**: `main`
- **Build Command**: `docker build -t stock-management-backend .`
- **Start Command**: `docker run -p $PORT:80 stock-management-backend`

### 2.4 Variables d'environnement
Ajoutez ces variables dans Render :

#### Variables de base
```
APP_NAME=Gestion de Stock
APP_ENV=production
APP_DEBUG=false
APP_URL=https://votre-url-render.onrender.com
LOG_CHANNEL=stack
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
```

#### Variables de base de données (Railway)
```
DB_CONNECTION=pgsql
DB_HOST=containers-us-west-XX.railway.app
DB_PORT=5432
DB_DATABASE=railway
DB_USERNAME=postgres
DB_PASSWORD=votre-mot-de-passe-railway
```

#### Variables Cloudinary et CORS
```
CLOUDINARY_URL=cloudinary://votre-api-key:votre-api-secret@votre-cloud-name
CORS_ALLOWED_ORIGINS=*
```

### 2.5 Déployer
1. Cliquez sur "Create Web Service"
2. Attendez 5-10 minutes pour le déploiement
3. Notez l'URL générée : `https://stock-management-backend-xxx.onrender.com`

## Étape 3: Déploiement du Frontend (Vercel)

### 3.1 Préparer le frontend
1. Allez dans le dossier `stock-management-frontend`
2. Mettez à jour l'URL de l'API dans les variables d'environnement

### 3.2 Déployer sur Vercel
1. Allez sur [vercel.com](https://vercel.com)
2. Connectez votre repository GitHub
3. Sélectionnez le dossier `stock-management-frontend`
4. Configurez les variables d'environnement :
   ```
   VITE_API_URL=https://votre-url-render.onrender.com/api
   ```

## Étape 4: Test et Validation

### 4.1 Tester l'API
- **Test de santé**: `https://votre-url-render.onrender.com/api/health`
- **Test d'authentification**: `https://votre-url-render.onrender.com/api/auth/login`

### 4.2 Tester le frontend
- Accédez à votre URL Vercel
- Testez la connexion et les fonctionnalités

## Variables d'environnement complètes

### Backend (Render)
```
APP_NAME=Gestion de Stock
APP_ENV=production
APP_DEBUG=false
APP_URL=https://votre-url-render.onrender.com
LOG_CHANNEL=stack
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
DB_CONNECTION=pgsql
DB_HOST=containers-us-west-XX.railway.app
DB_PORT=5432
DB_DATABASE=railway
DB_USERNAME=postgres
DB_PASSWORD=votre-mot-de-passe-railway
CLOUDINARY_URL=cloudinary://votre-api-key:votre-api-secret@votre-cloud-name
CORS_ALLOWED_ORIGINS=*
```

### Frontend (Vercel)
```
VITE_API_URL=https://votre-url-render.onrender.com/api
```

## Support
En cas de problème, vérifiez :
1. Les logs dans Render
2. Les logs dans Railway
3. Les variables d'environnement
4. La connexion entre les services
