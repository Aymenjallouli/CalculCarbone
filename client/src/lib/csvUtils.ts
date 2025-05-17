// Utilitaires pour la recherche de colonnes et le traitement des valeurs numériques
export function findColumn(headers: string[], possibleMatches: string[]): string | null {
  // Normalisation : supprimer les accents, passer en minuscule, supprimer espaces et ponctuations
  const normalizeStr = (str: string): string => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
      .toLowerCase()
      .replace(/[,;:.?!\-_()\[\]{}'"]/g, "") // Supprimer la ponctuation
      .replace(/\s+/g, ""); // Supprimer les espaces
  };

  // D'abord, essayer une correspondance exacte
  for (const match of possibleMatches) {
    const index = headers.findIndex(h => h === match);
    if (index !== -1) {
      return headers[index];
    }
  }

  // Ensuite, essayer une correspondance normalisée
  const normalizedHeaders = headers.map(normalizeStr);
  const normalizedMatches = possibleMatches.map(normalizeStr);

  for (const normalizedMatch of normalizedMatches) {
    const index = normalizedHeaders.findIndex(h => h === normalizedMatch);
    if (index !== -1) {
      return headers[index];
    }
  }

  // Enfin, essayer une correspondance partielle
  for (const normalizedMatch of normalizedMatches) {
    const index = normalizedHeaders.findIndex(h => h.includes(normalizedMatch) || normalizedMatch.includes(h));
    if (index !== -1) {
      return headers[index];
    }
  }

  // Aucune correspondance trouvée
  return null;
}

// Convertir une valeur qui peut être au format français (avec virgule) en nombre
export function parseNumericValue(value: string | undefined): number {
  if (!value || value.trim() === "") return 0;
  
  // Remplacer les espaces, les virgules par des points
  const normalized = value
    .replace(/\s/g, "")
    .replace(/,/g, ".");
  
  const number = parseFloat(normalized);
  return isNaN(number) ? 0 : number;
}

// Définition des correspondances de colonnes possibles
export const COLUMN_MAPPINGS = {
  // Informations de base
  id: ["ID", "Id", "Identifiant"],
  email: ["Adresse de messagerie", "Email", "Courriel", "Mail"],
  name: ["Nom", "Name", "Nom complet"],
  lastModified: ["Heure de la dernière modification", "Dernière modification", "Last modified"],
  status: ["Statut", "Status", "État"],
  residence: ["Résidence principale :", "Résidence", "Lieu de résidence", "Domicile"],
  
  // Informations de trajet quotidien
  distanceAllerRetour: [
    "Distance aller-retour domicile ↔ école (km/jour)  prend en considération le nombre d'aller-retour par jour :",
    "Distance aller-retour", 
    "Distance domicile-école",
    "Distance quotidienne"
  ],
  nbMoisEcole: [
    "Nombre de mois par an où vous vous rendez à l'école (entre 1 et 12 ):",
    "Nombre de mois",
    "Mois par an",
    "Mois à l'école"
  ],
  nbJoursEcoleMois: [
    "Nombre de jours par mois où vous vous rendez à l'école (entre 1 et 30) :",
    "Nombre de jours",
    "Jours par mois",
    "Jours à l'école"
  ],
  
  // Modes de transport
  kmBus: ["Combien de km en bus ?", "Km en bus", "Distance bus"],
  kmTrain: ["Combien de km en Train ?", "Km en train", "Distance train"],
  kmMotoScooter: ["Combien de km en Moto/Scooter ?", "Km en moto", "Distance moto/scooter"],
  typeCarburantMoto: ["Type de carburant :2", "Type carburant moto", "Carburant moto"],
  consommationMoto: ["Consommation journalière de carburant (en L):1", "Consommation moto", "Carburant moto L"],
  
  kmVoiture: ["Combien de km en Voiture ?", "Km en voiture", "Distance voiture"],
  typeCarburantVoiture: ["Type de carburant :3", "Type carburant voiture", "Carburant voiture"],
  consommationVoiture: ["Consommation journalière de carburant (en L):2", "Consommation voiture", "Carburant voiture L"],
  
  // Transport personnel
  kmVoiturePerso: ["Combien de km en Voiture personnelle/Covoiturage/Taxi?", "Km voiture perso", "Distance covoiturage"],
  typeCarburantPerso: ["Type de carburant :4", "Type carburant perso", "Carburant voiture perso"],
  consommationCarburantSemaine: ["Consommation de carburant en moyenne par semaine (en L) :", "Consommation hebdo", "Carburant par semaine"],
  consommationElectriciteSemaine: ["Consommation d'électricité en moyenne par semaine (en kWh) :", "Électricité hebdo", "KWh par semaine"],
  
  // Livraisons
  nbLivraisonsSemaine: ["Nombre moyen de livraisons (repas, colis) reçues par semaine :", "Livraisons hebdo", "Nombre livraisons"],
  distanceMoyenneLivraison: ["Distance moyenne pour une livraison (Km) :", "Distance livraison", "Km par livraison"],
  
  // Visites familiales
  frequenceRetourFamille: ["Fréquence des retours en famille pendant une semestre :", "Fréquence retours", "Visites famille"],
  distanceMoyenneRetourFamille: ["Distance moyenne en (Km) d'aller-retour :", "Distance retour famille", "Km retour famille"],
  kmBusRetourFamille: ["Combien de km en Bus ?3", "Km bus retour", "Distance bus famille"],
  kmTrainRetourFamille: ["Combien de km en Train ?3", "Km train retour", "Distance train famille"],
  kmMotoRetourFamille: ["Combien de km en Moto ?2", "Km moto retour", "Distance moto famille"],
  typeCarburantMotoRetour: ["Type de carburant :5", "Type carburant moto retour", "Carburant moto famille"],
  consommationMotoRetour: ["Consommation journalière de carburant (en L):3", "Consommation moto retour", "Carburant moto retour"],
  kmVoitureRetourFamille: ["Combien de km en Voiture ?2", "Km voiture retour", "Distance voiture famille"],
  typeCarburantVoitureRetour: ["Type de carburant :6", "Type carburant voiture retour", "Carburant voiture famille"],
  consommationVoitureRetour: ["Consommation journalière de carburant (en L):4", "Consommation voiture retour", "Carburant voiture retour"]
};
