// Script de diagnostic côté client pour CareerPulse
// Ajoutez ce script dans index.html pour résoudre les problèmes d'affichage
console.log('=== DIAGNOSTIC CARRIERPULSE CLIENT ===');
console.log('Date:', new Date().toISOString());
console.log('URL:', window.location.href);
console.log('User Agent:', navigator.userAgent);

// Vérifier si l'élément root existe
const rootElement = document.getElementById('root');
console.log('Élément root trouvé:', !!rootElement);
if (rootElement) {
  console.log('Contenu de root:', rootElement.innerHTML);
}

// Vérifier les scripts chargés
const scripts = document.querySelectorAll('script');
console.log('Scripts chargés:');
scripts.forEach((script, index) => {
  console.log(`[${index}] Type: ${script.type}, Src: ${script.src || 'inline'}`);
});

// Vérifier si des erreurs sont survenues lors du chargement
window.addEventListener('error', (event) => {
  console.error('Erreur de chargement:', event.message, 'Source:', event.filename, 'Ligne:', event.lineno);
});

// Afficher les requêtes réseau échouées
if (window.performance && window.performance.getEntries) {
  const resources = window.performance.getEntries();
  console.log('Ressources chargées:', resources.length);
  resources.forEach(resource => {
    if (resource.name.includes('assets') || resource.name.includes('js')) {
      console.log('Ressource:', resource.name, 'Durée:', resource.duration);
    }
  });
}

console.log('=== FIN DIAGNOSTIC CLIENT ===');
