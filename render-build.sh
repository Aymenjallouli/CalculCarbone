#!/bin/bash

# Ajuster les dépendances
echo "Ajustement des dépendances pour le déploiement..."
node adjust-dependencies.cjs

# Installer les dépendances
echo "Installation des dépendances..."
npm install

# Exécuter le build
echo "Démarrage de la compilation..."
vite build
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

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
