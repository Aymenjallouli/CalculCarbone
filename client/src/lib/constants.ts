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
  }
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
};
