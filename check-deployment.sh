#!/bin/bash

# Ce script permet de vérifier l'état du déploiement et d'afficher des informations utiles pour le débogage

echo "=== État du déploiement ==="
echo "Date et heure: $(date)"
echo "Version de Node: $(node -v)"
echo "Version de NPM: $(npm -v)"
echo ""

echo "=== Structure des répertoires ==="
echo "Répertoire courant: $(pwd)"
ls -la
echo ""

echo "=== Contenu du répertoire dist ==="
if [ -d "dist" ]; then
  ls -la dist
  echo ""
  echo "=== Contenu du répertoire dist/public ==="
  if [ -d "dist/public" ]; then
    ls -la dist/public
    
    echo ""
    echo "=== Vérification du fichier index.html ==="
    if [ -f "dist/public/index.html" ]; then
      echo "Le fichier index.html existe."
      echo "Contenu des 20 premières lignes de index.html:"
      head -n 20 dist/public/index.html
      echo "Sources de scripts dans index.html:"
      grep -o '<script[^>]*src=[^>]*>' dist/public/index.html
    else
      echo "ERREUR: Le fichier index.html n'existe pas!"
    fi
    
    echo ""
    echo "=== Vérification des assets ==="
    if [ -d "dist/public/assets" ]; then
      echo "Le répertoire assets existe."
      ls -la dist/public/assets
      echo "Vérification de l'existence du fichier index.js"
      if [ -f "dist/public/assets/index.js" ]; then
        echo "Le fichier index.js existe."
      else
        echo "ERREUR: Le fichier index.js n'existe pas!"
      fi
    else
      echo "ERREUR: Le répertoire dist/public/assets n'existe pas!"
    fi
  else
    echo "Le répertoire dist/public n'existe pas"
  fi
else
  echo "Le répertoire dist n'existe pas"
fi
echo ""

echo "=== Variables d'environnement ==="
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
# Masquer l'URL de la base de données pour des raisons de sécurité
if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL: [Défini mais masqué pour la sécurité]"
else
  echo "DATABASE_URL: [Non défini]"
fi
echo ""

echo "=== Processus en cours ==="
ps aux | grep node
echo ""

echo "=== Fin du rapport ==="
