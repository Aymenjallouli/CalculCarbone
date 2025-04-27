// Carbon emission factors (kg CO2e per unit)
export const EMISSION_FACTORS = {
  // Merchandise emission factors (kg CO2e per item)
  merchandise: {
    paper: 0.03, // per sheet
    notebook: 0.5, // per notebook
    textbook: 2.0, // per textbook
    computer: 300.0, // per computer
    furniture: 25.0, // per piece
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
};

export const MERCHANDISE_CATEGORIES = [
  { id: "paper", label: "Papier (feuilles)", unit: "feuilles" },
  { id: "notebook", label: "Cahiers", unit: "cahiers" },
  { id: "textbook", label: "Manuels scolaires", unit: "manuels" },
  { id: "computer", label: "Ordinateurs", unit: "ordinateurs" },
  { id: "furniture", label: "Mobilier scolaire", unit: "pièces" },
];

export const TRANSPORT_MODES = [
  { id: "car", label: "Voiture", unit: "km" },
  { id: "bus", label: "Bus public", unit: "km" },
  { id: "train", label: "Train", unit: "km" },
  { id: "bicycle", label: "Vélo", unit: "km" },
  { id: "walking", label: "Marche", unit: "km" },
  { id: "schoolBus", label: "Bus scolaire", unit: "km" },
];

export const TOOLTIPS = {
  merchandise: {
    paper: "Inclut les feuilles de papier standard (80g/m²). L'empreinte carbone comprend la production et le transport.",
    notebook: "Cahiers de différentes tailles. L'empreinte carbone inclut la production de papier, la reliure et le transport.",
    textbook: "Manuels scolaires en format papier. L'empreinte comprend l'ensemble du cycle de production.",
    computer: "Ordinateurs de bureau ou portables. Inclut l'empreinte de fabrication, mais pas la consommation électrique d'utilisation.",
    furniture: "Mobilier scolaire comme les tables, chaises, tableaux, etc. L'empreinte varie selon le matériau.",
  },
  transport: {
    car: "Émissions moyennes d'une voiture standard par kilomètre.",
    bus: "Transport en commun urbain. Émissions par personne.",
    train: "Train régional ou intercités. Émissions par passager.",
    bicycle: "Le vélo n'émet pas directement de CO₂ lors de son utilisation.",
    walking: "La marche n'émet pas de CO₂.",
    schoolBus: "Bus scolaire dédié. Émissions par élève transporté.",
  },
};
