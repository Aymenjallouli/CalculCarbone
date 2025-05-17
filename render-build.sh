#!/bin/bash

# Ajuster les dépendances pour le déploiement
echo "Ajustement des dépendances pour le déploiement..."
node adjust-dependencies.cjs

# Installer les dépendances
echo "Installation des dépendances..."
npm install

# Exécuter le build
echo "Démarrage de la compilation..."
vite build
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Créer le répertoire public pour le serveur
echo "Copie des fichiers statiques..."
mkdir -p dist/public

# Vérification des fichiers générés par Vite
echo "Vérification des fichiers générés par Vite..."
if [ -d "dist/assets" ]; then
  echo "Répertoire dist/assets trouvé"
else
  echo "ATTENTION: Le répertoire dist/assets n'existe pas!"
fi

# Copier modele_transport.csv dans dist/public s'il existe
if [ -f "client/public/modele_transport.csv" ]; then
  cp client/public/modele_transport.csv dist/public/ || echo "Erreur lors de la copie de modele_transport.csv"
fi

# Lister le contenu des répertoires pour le débogage
echo "Contenu du répertoire dist:"
ls -la dist
echo "Contenu du répertoire dist/public (s'il existe):"
ls -la dist/public || echo "Le répertoire dist/public n'existe pas ou est vide"

# Donner des instructions de débogage pour les erreurs de build
if [ $? -ne 0 ]; then
  echo "Le build a échoué. Voici quelques informations de débogage :"
  echo "Contenu du répertoire :"
  ls -la
  echo "Version de Node.js :"
  node -v
  echo "Version de NPM :"
  npm -v
  exit 1
fi

echo "Build terminé avec succès!"
