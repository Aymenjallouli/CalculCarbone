#!/bin/bash

# Script de diagnostic pour CareerPulse sur Render

echo "=========== DIAGNOSTIC CARRIERPULSE RENDER ==========="
echo "Date: $(date)"
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

echo "\n=========== STRUCTURE DES RÉPERTOIRES ==========="
echo "Répertoire courant: $(pwd)"
echo "Contenu du répertoire courant:"
ls -la

echo "\n=========== VÉRIFICATION DES FICHIERS CRITIQUES ==========="
if [ -d "dist" ]; then
  echo "Le répertoire dist existe."
  echo "Contenu de dist:"
  ls -la dist
  
  if [ -d "dist/public" ]; then
    echo "Le répertoire dist/public existe."
    echo "Contenu de dist/public:"
    ls -la dist/public
    
    if [ -f "dist/public/index.html" ]; then
      echo "index.html est présent dans dist/public."
      echo "Contenu de index.html (script tags):"
      grep -i "<script" dist/public/index.html
    else
      echo "ERREUR: index.html est manquant dans dist/public."
    fi
    
    if [ -d "dist/public/assets" ]; then
      echo "Le répertoire dist/public/assets existe."
      echo "Contenu de dist/public/assets:"
      ls -la dist/public/assets
    else
      echo "ERREUR: Le répertoire assets est manquant dans dist/public."
    fi
  else
    echo "ERREUR: Le répertoire dist/public n'existe pas."
  fi
else
  echo "ERREUR: Le répertoire dist n'existe pas."
fi

echo "\n=========== VÉRIFICATION DES ROUTES EXPRESS ==========="
if [ -f "dist/index.js" ]; then
  echo "Le fichier dist/index.js existe."
else
  echo "ERREUR: Le fichier dist/index.js n'existe pas."
fi

echo "\n=========== VARIABLES D'ENVIRONNEMENT ==========="
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"

echo "\n=========== FIN DU DIAGNOSTIC ==========="
