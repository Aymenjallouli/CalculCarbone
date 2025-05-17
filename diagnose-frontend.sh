#!/bin/bash

# Script pour inspecter l'état du déploiement et vérifier les problèmes d'affichage

echo "=== Diagnostic de l'affichage ==="
echo "Date et heure: $(date)"

# Vérifier les fichiers statiques et leur structure
echo "=== Vérification des fichiers statiques ==="
if [ -d "dist/public" ]; then
  echo "Structure du répertoire dist/public:"
  ls -la dist/public
  
  echo "Structure du répertoire dist/public/assets (si existant):"
  if [ -d "dist/public/assets" ]; then
    ls -la dist/public/assets
  else
    echo "Le répertoire dist/public/assets n'existe pas!"
  fi
  
  echo "Contenu du fichier index.html:"
  if [ -f "dist/public/index.html" ]; then
    cat dist/public/index.html | head -n 20 # Affiche les 20 premières lignes
  else
    echo "Le fichier index.html n'existe pas dans dist/public!"
  fi
else
  echo "Le répertoire dist/public n'existe pas!"
fi

# Vérifier les journaux du serveur
echo "=== Journaux du serveur ==="
if [ -f "server.log" ]; then
  tail -n 50 server.log
else
  echo "Pas de fichier server.log trouvé."
fi

# Vérifier les routes d'API
echo "=== Vérification des routes d'API ==="
if command -v curl >/dev/null 2>&1; then
  echo "Test de l'API: /api/health"
  curl -s -o /dev/null -w "%{http_code}" http://localhost:10000/api/health || echo "Échec du test d'API"
else
  echo "curl non disponible pour tester l'API"
fi

# Vérifier les processus actifs
echo "=== Processus actifs ==="
ps aux | grep node

echo "=== Fin du diagnostic ==="
