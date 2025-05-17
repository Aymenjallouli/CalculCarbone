// Carbon emission factors (kg CO2e per unit)
export const EMISSION_FACTORS = {
  // Merchandise emission factors (kg CO2e per item)
  merchandise: {
    // Basic school supplies
    paper: 0.03, // per sheet
    notebook: 0.5, // per notebook
    textbook: 2.0, // per textbook
    machine: 150.0, // per washing machine
    refrigerator: 200.0,// per refrigerator
    
    // Technology
    computer: 300.0, // per desktop computer
    laptop: 160.0, // per laptop
    printer: 85.0, // per printer
    projector: 110.0, // per projector
    tablet: 95.0, // per tablet
    
    // Furniture
    furniture: 25.0, // per generic piece
    desk: 80.0, // per desk
    chair: 40.0, // per chair
    
    // Other equipment
    labEquipment: 120.0, // per piece of lab equipment
    sportsEquipment: 50.0, // per piece of sports equipment
  },
  
  // Transport emission factors (kg CO2e per km)
  transport: {
    car: 0.19, // per km
    bus: 0.105, // per km
    train: 0.041, // per km
    bicycle: 0.0, // per km
    walking: 0.0, // per km
    schoolBus: 0.068, // per km per student
  },
  
  // Event emission factors
  event: {
    // Venue emissions (kg CO2e per m² per day)
    venue: 0.025,
    
    // Materials (kg CO2e per item)
    marketingMaterials: 0.5, // per item
    printedDocuments: 0.2, // per document
    banners: 3.0, // per banner
    
    // Food & beverages (kg CO2e per serving)
    standardMeal: 2.5,
    vegetarianMeal: 1.2,
    veganMeal: 0.7,
    beverage: 0.3, // per serving
    
    // Waste (kg CO2e per kg)
    waste: 0.7,
    
    // Energy (kg CO2e per kWh)
    energy: 0.1,
  },
  
  // Study trip emission factors
  studyTrip: {
    // Transportation (kg CO2e per km per person)
    plane: 0.255,
    train: 0.041,
    bus: 0.105,
    car: 0.19,
    boat: 0.12,
    otherTransport: 0.2,
    
    // Accommodation (kg CO2e per night per person)
    hotel: 15.0,
    hostel: 8.0,
    campsite: 3.0,
    otherAccommodation: 10.0,
    
    // Local transport (kg CO2e per km)
    localTransport: 0.1,
    
    // Food (kg CO2e per meal)
    standardMeal: 2.5,
    vegetarianMeal: 1.2,
    veganMeal: 0.7,
  },
  
  // Restauration emission factors
  restauration: {
    // Viandes (kg CO2e par portion)
    viandeRouge: 7.0,
    viandePoulet: 2.0,
    poisson: 3.0,
    
    // Aliments principaux (kg CO2e par portion)
    pates: 0.8,
    couscous: 0.7,
    sauce: 0.5,
    petitsPois: 0.2,
    haricot: 0.3,
    
    // Produits laitiers et céréales (kg CO2e par portion/unité)
    fromage: 2.5,
    beurre: 1.2,
    yaourt: 0.6,
    lait: 1.0, // par litre
    
    // Autres aliments (kg CO2e par portion/unité)
    confiture: 0.4,
    oeuf: 0.3, // par œuf
    legume: 0.2,
    fruit: 0.1,
    
    // Snacks et desserts (kg CO2e par portion)
    cake: 0.8,
    chocolat: 1.0,
    pain: 0.3,
    pizza: 1.5,
    cafe: 0.15,
    
    // Logistique (kg CO2e)
    distance: 0.1, // par km
    allerRetour: 0.5, // par aller-retour
    
    // Déchets (kg CO2e par kg)
    foodWaste: 1.2,
    packagingWaste: 0.8,
  },
};

// Categories for merchandise equipment
export const MERCHANDISE_CATEGORIES = [
  // Basic school supplies
  { id: "paper", label: "Papier (feuilles)", unit: "feuilles", category: "Fournitures de base" },
  { id: "notebook", label: "Cahiers", unit: "cahiers", category: "Fournitures de base" },
  { id: "textbook", label: "Manuels scolaires", unit: "manuels", category: "Fournitures de base" },{ id: "machine", label: "Machine à laver", unit: "machine", category: "electronique" },
  { id: "refrigerator", label: "Réfrigérateur", unit: "réfrigérateur", category: "électronique"},
  
  // Technology
  { id: "computer", label: "Ordinateurs de bureau", unit: "unités", category: "Équipement technologique" },
  { id: "laptop", label: "Ordinateurs portables", unit: "unités", category: "Équipement technologique" },
  { id: "printer", label: "Imprimantes", unit: "unités", category: "Équipement technologique" },
  { id: "projector", label: "Projecteurs", unit: "unités", category: "Équipement technologique" },
  { id: "tablet", label: "Tablettes", unit: "unités", category: "Équipement technologique" },
  
  // Furniture
  { id: "furniture", label: "Mobilier divers", unit: "pièces", category: "Mobilier" },
  { id: "desk", label: "Bureaux", unit: "unités", category: "Mobilier" },
  { id: "chair", label: "Chaises", unit: "unités", category: "Mobilier" },
  
  // Other equipment
  { id: "labEquipment", label: "Équipements de laboratoire", unit: "pièces", category: "Équipements spécialisés" },
  { id: "sportsEquipment", label: "Équipements sportifs", unit: "pièces", category: "Équipements spécialisés" },
];

// Transportation modes
export const TRANSPORT_MODES = [
  { id: "car", label: "Voiture", unit: "km" },
  { id: "bus", label: "Bus public", unit: "km" },
  { id: "train", label: "Train", unit: "km" },
  { id: "bicycle", label: "Vélo", unit: "km" },
  { id: "walking", label: "Marche", unit: "km" },
  { id: "schoolBus", label: "Bus scolaire", unit: "km" },
];

// Study trip transportation modes
export const STUDY_TRIP_TRANSPORT_MODES = [
  { id: "plane", label: "Avion", unit: "km" },
  { id: "train", label: "Train", unit: "km" },
  { id: "bus", label: "Bus", unit: "km" },
  { id: "car", label: "Voiture", unit: "km" },
  { id: "boat", label: "Bateau", unit: "km" },
  { id: "other", label: "Autre", unit: "km" },
];

// Study trip accommodation types
export const STUDY_TRIP_ACCOMMODATION_TYPES = [
  { id: "hotel", label: "Hôtel" },
  { id: "hostel", label: "Auberge de jeunesse" },
  { id: "campsite", label: "Camping" },
  { id: "other", label: "Autre" },
];

// Meal types
export const MEAL_TYPES = [
  { id: "standard", label: "Standard" },
  { id: "vegetarian", label: "Végétarien" },
  { id: "vegan", label: "Végétalien" },
];

// Categories for restauration inputs
export const RESTAURATION_CATEGORIES = [
  // Viandes
  { id: "viandeRouge", label: "Viande rouge", unit: "portions", category: "Viandes", max: 100000 },
  { id: "viandePoulet", label: "Poulet", unit: "portions", category: "Viandes", max: 100000 },
  { id: "poisson", label: "Poisson", unit: "portions", category: "Viandes", max: 100000 },
  
  // Aliments principaux
  { id: "pates", label: "Pâtes", unit: "portions", category: "Aliments principaux", max: 100000 },
  { id: "couscous", label: "Couscous", unit: "portions", category: "Aliments principaux", max: 100000 },
  { id: "sauce", label: "Sauce", unit: "portions", category: "Aliments principaux", max: 100000 },
  { id: "petitsPois", label: "Petits pois", unit: "portions", category: "Aliments principaux", max: 100000 },
  { id: "haricot", label: "Haricot", unit: "portions", category: "Aliments principaux", max: 100000 },
  
  // Produits laitiers et céréales
  { id: "fromage", label: "Fromage", unit: "portions", category: "Produits laitiers", max: 100000 },
  { id: "beurre", label: "Beurre", unit: "portions", category: "Produits laitiers", max: 100000 },
  { id: "yaourt", label: "Yaourt", unit: "unités", category: "Produits laitiers", max: 100000 },
  { id: "lait", label: "Lait", unit: "litres", category: "Produits laitiers", max: 100000 },
  
  // Autres aliments
  { id: "confiture", label: "Confiture", unit: "portions", category: "Autres aliments", max: 100000 },
  { id: "oeuf", label: "Œufs", unit: "unités", category: "Autres aliments", max: 100000 },
  { id: "legume", label: "Légumes", unit: "portions", category: "Autres aliments", max: 100000 },
  { id: "fruit", label: "Fruits", unit: "portions", category: "Autres aliments", max: 100000 },
  
  // Snacks et desserts
  { id: "cake", label: "Cake", unit: "portions", category: "Snacks et Desserts", max: 100000 },
  { id: "chocolat", label: "Chocolat", unit: "portions", category: "Snacks et Desserts", max: 100000 },
  { id: "pain", label: "Pain", unit: "portions", category: "Snacks et Desserts", max: 100000 },
  { id: "pizza", label: "Pizza", unit: "portions", category: "Snacks et Desserts", max: 100000 },
  { id: "cafe", label: "Café", unit: "tasses", category: "Snacks et Desserts", max: 100000 },
  
  // Logistique
  { id: "distance", label: "Distance d'approvisionnement", unit: "km", category: "Logistique", max: 10000 },
  { id: "allerRetour", label: "Nombre d'aller-retour par jour", unit: "voyages", category: "Logistique", max: 100 },
  
  // Déchets (conservés comme demandé)
  { id: "foodWasteKg", label: "Déchets alimentaires", unit: "kg", category: "Déchets", max: 10000 },
  { id: "packagingWasteKg", label: "Déchets d'emballage", unit: "kg", category: "Déchets", max: 10000 },
  { id: "recyclingPercentage", label: "Taux de recyclage", unit: "%", category: "Déchets", max: 100 },
];

// Tooltips for various fields
export const TOOLTIPS = {
  merchandise: {
    // Basic supplies
    paper: "Inclut les feuilles de papier standard (80g/m²). L'empreinte carbone comprend la production et le transport.",
    notebook: "Cahiers de différentes tailles. L'empreinte carbone inclut la production de papier, la reliure et le transport.",
    textbook: "Manuels scolaires en format papier. L'empreinte comprend l'ensemble du cycle de production.",
    
    // Technology
    computer: "Ordinateurs de bureau. Inclut l'empreinte de fabrication, mais pas la consommation électrique d'utilisation.",
    laptop: "Ordinateurs portables. L'empreinte inclut la fabrication de la batterie et des composants électroniques.",
    printer: "Imprimantes de bureau. Inclut la fabrication mais pas la consommation d'encre ou d'électricité.",
    projector: "Projecteurs pour salles de classe. Inclut la fabrication des composants électroniques.",
    tablet: "Tablettes numériques. Inclut la fabrication de la batterie et des composants.",
    
    // Furniture
    furniture: "Mobilier scolaire divers comme les tableaux, étagères, etc. L'empreinte varie selon le matériau.",
    desk: "Bureaux pour les salles de classe ou l'administration. L'empreinte dépend du matériau (bois, métal, plastique).",
    chair: "Chaises pour les élèves et le personnel. L'empreinte inclut les matériaux et la fabrication.",
    
    // Other equipment
    labEquipment: "Équipement de laboratoire de sciences comme les microscopes, béchers, etc.",
    sportsEquipment: "Équipement sportif comme les ballons, tapis, matériel de gymnastique, etc.",
  },
  
  transport: {
    car: "Émissions moyennes d'une voiture standard par kilomètre.",
    bus: "Transport en commun urbain. Émissions par personne.",
    train: "Train régional ou intercités. Émissions par passager.",
    bicycle: "Le vélo n'émet pas directement de CO₂ lors de son utilisation.",
    walking: "La marche n'émet pas de CO₂.",
    schoolBus: "Bus scolaire dédié. Émissions par élève transporté.",
  },
  
  event: {
    name: "Nom de l'événement organisé (ex: conférence, journée portes ouvertes, spectacle scolaire)",
    attendees: "Nombre total de participants attendus à l'événement",
    duration: "Durée de l'événement en jours (peut être une fraction pour les événements plus courts)",
    venueSizeM2: "Taille du lieu en mètres carrés (salles utilisées)",
    marketingMaterials: "Quantité de matériaux promotionnels (flyers, affiches, etc.)",
    printedDocuments: "Nombre de documents imprimés pour l'événement (programmes, handouts)",
    banners: "Nombre de bannières, affiches grand format ou roll-ups",
    mealsCount: "Nombre total de repas servis pendant l'événement",
    mealType: "Type de repas prédominant servi lors de l'événement",
    beverages: "Nombre de boissons servies (café, eau en bouteille, etc.)",
    wasteGenerated: "Quantité totale de déchets générés en kg",
    recyclingPercentage: "Pourcentage des déchets qui seront recyclés",
    energyConsumption: "Consommation d'énergie estimée en kWh (éclairage, son, chauffage/climatisation)",
  },
  
  studyTrip: {
    destination: "Lieu de destination du voyage d'étude",
    tripCount: "Nombre de voyages effectués sur l'année pour cette destination",
    distanceKm: "Distance totale parcourue (aller-retour) en kilomètres",
    duration: "Durée totale du voyage en jours",
    participants: "Nombre total d'élèves et d'accompagnateurs",
    transportMode: "Principal mode de transport utilisé pour se rendre à destination",
    vehicleCount: "Nombre de véhicules utilisés (pour voiture ou bus)",
    accommodationType: "Type d'hébergement utilisé pendant le séjour",
    nightsStay: "Nombre de nuits passées à l'hébergement",
    localTransport: "Utilisation de transports locaux sur place",
    localTransportKm: "Distance totale parcourue en transports locaux (en km)",
    mealsCount: "Nombre total de repas pris pendant le voyage",
    mealType: "Type de repas prédominant pendant le voyage",
  },
  
  restauration: {
    // Viandes
    viandeRouge: "Nombre de portions de viande rouge consommées. Impact élevé sur les émissions de CO₂ par rapport aux autres aliments.",
    viandePoulet: "Nombre de portions de poulet consommées. Impact modéré sur les émissions de CO₂, moins que la viande rouge.",
    poisson: "Nombre de portions de poisson consommées. L'impact carbone varie selon le type de pêche et l'espèce.",
    
    // Aliments principaux
    pates: "Nombre de portions de pâtes consommées. Inclut l'impact de la production, du transport et de la préparation.",
    couscous: "Nombre de portions de couscous consommées. Prend en compte la culture, la transformation et la préparation.",
    sauce: "Nombre de portions de sauce utilisées. L'impact varie selon les ingrédients.",
    petitsPois: "Nombre de portions de petits pois consommées. Impact relativement faible par rapport aux protéines animales.",
    haricot: "Nombre de portions de haricots consommées. Bonne source de protéines végétales à faible impact carbone.",
    
    // Produits laitiers et céréales
    fromage: "Nombre de portions de fromage consommées. Impact carbone significatif dû à la production laitière.",
    beurre: "Nombre de portions de beurre utilisées. Impact carbone élevé lié à la production laitière.",
    yaourt: "Nombre de yaourts consommés. Impact modéré lié à la production laitière et aux emballages.",
    lait: "Quantité de lait consommée en litres. Impact lié à l'élevage et à la transformation.",
    
    // Autres aliments
    confiture: "Nombre de portions de confiture utilisées. Impact lié à la production de fruits et de sucre.",
    oeuf: "Nombre d'œufs consommés. Impact carbone modéré par rapport aux autres protéines animales.",
    legume: "Nombre de portions de légumes consommées. Faible impact carbone, varie selon la saisonnalité et le mode de production.",
    fruit: "Nombre de portions de fruits consommées. Faible impact carbone, varie selon la saisonnalité et l'origine.",
    
    // Snacks et desserts
    cake: "Nombre de portions de cake consommées. Impact lié aux ingrédients et à la cuisson.",
    chocolat: "Nombre de portions de chocolat consommées. Impact significatif lié à la production du cacao et du sucre.",
    pain: "Nombre de portions de pain consommées. Impact lié à la culture des céréales et à la cuisson.",
    pizza: "Nombre de pizzas consommées. Impact varié selon les garnitures et le mode de préparation.",
    cafe: "Nombre de tasses de café servies. Inclut l'impact de la culture, du transport et de la préparation du café.",
    
    // Logistique
    distance: "Distance moyenne d'approvisionnement en kilomètres. Impact lié au transport des aliments.",
    allerRetour: "Nombre moyen d'aller-retour par jour pour l'approvisionnement. Impact lié au transport.",
    
    // Déchets
    foodWasteKg: "Quantité totale de déchets alimentaires générés, en kg. Prend en compte l'impact du gaspillage alimentaire.",
    packagingWasteKg: "Quantité totale de déchets d'emballage générés, en kg. Prend en compte l'impact de la production et de la fin de vie des emballages.",
    recyclingPercentage: "Pourcentage des déchets qui sont recyclés. Réduit l'impact carbone global de la restauration.",
  },
};
