// Ajuster les dépendances pour Render
const fs = require('fs');
const path = require('path');

// Lire le fichier package.json
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Liste des dépendances de développement qui devraient être des dépendances régulières pour le build
const depsToMove = [
  '@vitejs/plugin-react',
  'esbuild',
  'typescript',
  'vite',
  'cross-env',
  'tsx'
];

// Déplacer les dépendances
depsToMove.forEach(dep => {
  if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
    packageJson.dependencies = packageJson.dependencies || {};
    packageJson.dependencies[dep] = packageJson.devDependencies[dep];
    delete packageJson.devDependencies[dep];
    console.log(`Moved ${dep} from devDependencies to dependencies`);
  }
});

// Enregistrer les modifications
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('Package.json updated for Render deployment');
