# CareerPulse

Une application pour calculer et visualiser l'empreinte carbone liée aux activités académiques et professionnelles.

## Déploiement sur Render

Ce projet est configuré pour être facilement déployé sur Render.com en utilisant le fichier `render.yaml`.

### Prérequis

- Un compte sur [Render.com](https://render.com)
- Git installé sur votre machine (pour push le code à utiliser par Render)

### Instructions de déploiement

1. **Créer un nouveau répertoire Git (optionnel si déjà fait)**

```bash
git init
git add .
git commit -m "Initial commit for deployment"
```

2. **Connecter Render à votre dépôt Git**

   - Créez un nouveau repository sur GitHub, GitLab ou un autre service Git
   - Poussez votre code vers ce repository
   - Connectez-vous à Render.com
   - Allez dans le dashboard et cliquez sur "New" > "Blueprint"
   - Sélectionnez votre repository contenant ce projet
   - Render détectera automatiquement le fichier `render.yaml` et configurera les services nécessaires

3. **Vérification des paramètres**

   - Render va créer un web service et une base de données PostgreSQL
   - Vérifiez que les variables d'environnement sont correctement configurées

4. **Finaliser le déploiement**

   - Cliquez sur "Apply" pour démarrer le déploiement
   - Render va construire et déployer l'application
   - Une fois terminé, vous recevrez une URL pour accéder à votre application

### Variables d'environnement

Les variables d'environnement nécessaires sont configurées automatiquement par Render via le fichier `render.yaml` :

- `NODE_ENV` : défini sur "production"
- `DATABASE_URL` : URL de connexion à la base de données, fournie automatiquement par Render
- `PORT` : le port sur lequel l'application doit écouter, configuré par Render

### Maintenance et mises à jour

Pour mettre à jour votre application déployée :

1. Effectuez les modifications dans votre code
2. Committez vos changements et poussez-les vers votre dépôt Git
3. Render détectera automatiquement les changements et redéploiera l'application

## Développement local

Pour exécuter l'application en local :

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

Le serveur sera disponible sur `http://localhost:5001`.
