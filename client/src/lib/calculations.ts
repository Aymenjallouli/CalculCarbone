import { EMISSION_FACTORS, MEAL_TYPES } from "./constants";
import { 
  MerchandiseInput, 
  TransportInput, 
  TransportCSVData,
  EventInput,
  StudyTripInput,
  RestaurationType,
  EmissionResult 
} from "@shared/schema";


// Helper function to get emission factor based on fuel type
function getFuelEmissionFactor(fuelType: string | undefined): number {
  // Default emission factor for diesel
  let factor = 0.2;
  
  // If fuel type is not provided, return default
  if (!fuelType) {
    return factor;
  }
  
  // Adjust based on fuel type (actual values should be researched)
  const fuelTypeLower = fuelType.toLowerCase();
  if (fuelTypeLower.includes('essence')) {
    factor = 0.22; // Higher for gas/petrol
  } else if (fuelTypeLower.includes('diesel')) {
    factor = 0.2; // Standard for diesel
  } else if (fuelTypeLower.includes('électrique') || fuelTypeLower.includes('electrique')) {
    factor = 0.04; // Much lower for electric vehicles
  } else if (fuelTypeLower.includes('hybride')) {
    factor = 0.14; // Medium for hybrid vehicles
  } else if (fuelTypeLower.includes('gpl') || fuelTypeLower.includes('lpg')) {
    factor = 0.18; // LPG
  } else if (fuelTypeLower.includes('biofuel') || fuelTypeLower.includes('biocarburant')) {
    factor = 0.1; // Biofuel
  }
  
  return factor;
}

// Calculate emissions based on CSV transport data
export function calculateCSVTransportEmissions(data: TransportCSVData[]) {
  console.log('DEBUG - Calculating emissions from CSV data:', data.length, 'records');
  
  const breakdown: Record<string, number> = {};
  let totalEmissions = 0;

  // Process data for each student
  data.forEach((student, index) => {
    // Logs de débogage
    if (index === 0) {
      console.log('DEBUG - Processing first student data:', JSON.stringify(student, null, 2));
    }
    
    // Vérifier si l'étudiant est hors campus pour le trajet quotidien
    const isOffCampus = !student.isOnCampus;
    console.log(`DEBUG - Student ${student.nom} (id: ${student.id}) isOnCampus: ${student.isOnCampus}, isOffCampus: ${isOffCampus}`);
    
    // Daily commute emissions (only for off-campus students)
    if (isOffCampus) {
      // Calculate commute emissions based on distance, months per year, and days per month
      const distanceAR = student.distanceAllerRetour || 0;
      const nbMois = student.nbMoisEcole || 9; // Valeur par défaut 9 mois
      const nbJours = student.nbJoursEcoleMois || 20; // Valeur par défaut 20 jours
      
      // Log les valeurs pour vérifier qu'elles sont correctes
      console.log(`DEBUG - Student ${student.nom} commute: distance=${distanceAR} km, mois=${nbMois}, jours=${nbJours}`);
      
      // Calcul des émissions annuelles pour le trajet domicile-école
      const commuteEmissions = distanceAR * nbMois * nbJours * 0.15;
      console.log(`DEBUG - Student ${student.nom} commute emissions: ${commuteEmissions} kg CO2e`);
      
      totalEmissions += commuteEmissions;
      breakdown.commuteTravel = (breakdown.commuteTravel || 0) + commuteEmissions;
      
      // Calculate bus emissions for daily commute
      const kmBus = student.kmBus || 0;
      const busEmissions = kmBus * EMISSION_FACTORS.transport.bus;
      console.log(`DEBUG - Student ${student.nom} bus: ${kmBus} km, emissions: ${busEmissions} kg CO2e`);
      
      totalEmissions += busEmissions;
      breakdown.bus = (breakdown.bus || 0) + busEmissions;
      
      // Calculate train emissions
      const kmTrain = student.kmTrain || 0;
      const trainEmissions = kmTrain * EMISSION_FACTORS.transport.train;
      console.log(`DEBUG - Student ${student.nom} train: ${kmTrain} km, emissions: ${trainEmissions} kg CO2e`);
      
      totalEmissions += trainEmissions;
      breakdown.train = (breakdown.train || 0) + trainEmissions;
      
      // Calculate motorcycle/scooter emissions with fuel type consideration
      const kmMoto = student.kmMotoScooter || 0;
      const motoFactor = getFuelEmissionFactor(student.typeCarburantMoto);
      const motoEmissions = kmMoto * motoFactor;
      console.log(`DEBUG - Student ${student.nom} moto: ${kmMoto} km, carburant: ${student.typeCarburantMoto}, facteur: ${motoFactor}, emissions: ${motoEmissions} kg CO2e`);
      
      totalEmissions += motoEmissions;
      breakdown.motoScooter = (breakdown.motoScooter || 0) + motoEmissions;
      
      // Calculate car emissions with fuel type consideration
      const kmVoiture = student.kmVoiture || 0;
      const carFactor = getFuelEmissionFactor(student.typeCarburantVoiture);
      const carEmissions = kmVoiture * carFactor;
      console.log(`DEBUG - Student ${student.nom} voiture: ${kmVoiture} km, carburant: ${student.typeCarburantVoiture}, facteur: ${carFactor}, emissions: ${carEmissions} kg CO2e`);
      
      totalEmissions += carEmissions;
      breakdown.car = (breakdown.car || 0) + carEmissions;
      
      // Calculate personal car emissions
      const kmVoiturePerso = student.kmVoiturePerso || 0;
      const personalCarFactor = getFuelEmissionFactor(student.typeCarburantPerso);
      const personalCarEmissions = kmVoiturePerso * personalCarFactor;
      totalEmissions += personalCarEmissions;
      breakdown.personalCar = (breakdown.personalCar || 0) + personalCarEmissions;
      
      // Debug log for first student
      if (index === 0) {
        console.log(`DEBUG - Transport modes: 
          Bus: ${kmBus} km × ${EMISSION_FACTORS.transport.bus} = ${busEmissions}
          Train: ${kmTrain} km × ${EMISSION_FACTORS.transport.train} = ${trainEmissions}
          Moto: ${kmMoto} km × ${motoFactor} = ${motoEmissions}
          Voiture: ${kmVoiture} km × ${carFactor} = ${carEmissions}
          Voiture perso: ${kmVoiturePerso} km × ${personalCarFactor} = ${personalCarEmissions}`);
      }
    }
    
    // Emissions from deliveries (applies to all students)
    const nbLivraisons = student.nbLivraisonsSemaine || 0;
    const distLivraison = student.distanceMoyenneLivraison || 0;
    if (nbLivraisons > 0 && distLivraison > 0) {
      const deliveryEmissions = nbLivraisons * distLivraison * 0.2 * 40; // 40 weeks per year
      totalEmissions += deliveryEmissions;
      breakdown.deliveries = (breakdown.deliveries || 0) + deliveryEmissions;
      
      if (index === 0) {
        console.log(`DEBUG - Deliveries: ${nbLivraisons} × ${distLivraison} km × 0.2 × 40 = ${deliveryEmissions}`);
      }
    }
    
    // Family visits (applies to all students)
    const freqRetour = student.frequenceRetourFamille || 0;
    const distRetour = student.distanceMoyenneRetourFamille || 0;
    if (freqRetour > 0 && distRetour > 0) {
      // Base family visit distance
      const familyVisitBaseDistance = freqRetour * distRetour;
      
      // Calculate emissions for each transport mode used for family visits
      const busFamilyEmissions = (student.kmBusRetourFamille || 0) * EMISSION_FACTORS.transport.bus;
      const trainFamilyEmissions = (student.kmTrainRetourFamille || 0) * EMISSION_FACTORS.transport.train;
      
      // Motorcycle with fuel consideration
      const motoFamilyFactor = getFuelEmissionFactor(student.typeCarburantMotoRetour);
      const motoFamilyEmissions = (student.kmMotoRetourFamille || 0) * motoFamilyFactor;
      
      // Car with fuel consideration
      const carFamilyFactor = getFuelEmissionFactor(student.typeCarburantVoitureRetour);
      const carFamilyEmissions = (student.kmVoitureRetourFamille || 0) * carFamilyFactor;
      
      // Calculate total family visit emissions
      const totalFamilyVisitEmissions = busFamilyEmissions + trainFamilyEmissions + 
                                       motoFamilyEmissions + carFamilyEmissions;
      
      // If no specific transport modes were filled in, use a default calculation
      const familyVisitEmissions = totalFamilyVisitEmissions > 0 
                                 ? totalFamilyVisitEmissions 
                                 : familyVisitBaseDistance * 0.15;
      
      totalEmissions += familyVisitEmissions;
      breakdown.familyVisits = (breakdown.familyVisits || 0) + familyVisitEmissions;
      
      if (index === 0) {
        console.log(`DEBUG - Family visits: 
          Fréquence: ${freqRetour}, Distance: ${distRetour} km
          Bus: ${student.kmBusRetourFamille || 0} km × ${EMISSION_FACTORS.transport.bus} = ${busFamilyEmissions}
          Train: ${student.kmTrainRetourFamille || 0} km × ${EMISSION_FACTORS.transport.train} = ${trainFamilyEmissions}
          Moto: ${student.kmMotoRetourFamille || 0} km × ${motoFamilyFactor} = ${motoFamilyEmissions}
          Voiture: ${student.kmVoitureRetourFamille || 0} km × ${carFamilyFactor} = ${carFamilyEmissions}
          Total: ${familyVisitEmissions}`);
      }
    }
  });

  console.log('DEBUG - Total emissions calculated:', totalEmissions);
  console.log('DEBUG - Emissions breakdown:', breakdown);

  return {
    totalEmissions,
    breakdown,
  };
}

// Calculate emissions for merchandise
export function calculateMerchandiseEmissions(input: MerchandiseInput) {
  console.log('DEBUG - Merchandise input data:', input);
  const breakdown: Record<string, number> = {};
  let totalEmissions = 0;
  
  // Vérifier si l'entrée contient des valeurs non nulles
  const hasNonZeroValues = Object.values(input).some(val => val > 0);
  
  // Log si aucune valeur significative n'est trouvée, mais utiliser les valeurs réelles quand même
  if (!hasNonZeroValues) {
    console.warn('ATTENTION: Aucune donnée significative dans les entrées de marchandises. Les résultats peuvent être nuls.');
  }
  
  Object.entries(input).forEach(([key, quantity]) => {
    if (key in EMISSION_FACTORS.merchandise) {
      const category = key as keyof typeof EMISSION_FACTORS.merchandise;
      const factor = EMISSION_FACTORS.merchandise[category];
      const emissions = Number(quantity) * factor; // Assurer que quantity est un nombre
      console.log(`DEBUG - Calcul pour ${key}: ${quantity} × ${factor} = ${emissions} kg CO2e`);
      breakdown[key] = emissions;
      totalEmissions += emissions;
    }
  });

  return {
    totalEmissions,
    breakdown,
  };
}

// Calculate emissions for transport
export function calculateTransportEmissions(input: TransportInput) {
  console.log('DEBUG - Transport input data:', input);
  const breakdown: Record<string, number> = {};
  let totalEmissions = 0;

  // Check if we're using CSV import data
  if (input.isCSVImport && input.csvData && input.csvData.length > 0) {
    // Calculate emissions from CSV data
    return calculateCSVTransportEmissions(input.csvData);
  }

  // Vérifier si l'entrée contient des valeurs non nulles
  const hasNonZeroValues = Object.entries(input).some(([key, value]) => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value) && 'distance' in value) {
      return value.distance > 0 && value.frequency > 0;
    }
    return false;
  });
  
  // Log si aucune valeur significative n'est trouvée, mais utiliser les valeurs réelles quand même
  if (!hasNonZeroValues) {
    console.warn('ATTENTION: Aucune donnée significative dans les entrées de transport. Les résultats peuvent être nuls.');
  }

  // Otherwise calculate with manual input
  Object.entries(input).forEach(([key, value]) => {
    if (key in EMISSION_FACTORS.transport && typeof value === 'object' && value !== null && !Array.isArray(value) && 'distance' in value) {
      const mode = key as keyof typeof EMISSION_FACTORS.transport;
      const transportData = value as { distance: number; frequency: number; passengers: number };
      
      // Weekly emissions calculation
      const weeklyDistance = transportData.distance * transportData.frequency;
      
      // Annual emissions (assuming 40 school weeks)
      const annualDistance = weeklyDistance * 40;
      
      // Calculate emissions based on distance and passenger count
      const factor = EMISSION_FACTORS.transport[mode];
      let emissions = annualDistance * factor;
      
      console.log(`DEBUG - Calcul pour ${key}: distance=${transportData.distance}, fréquence=${transportData.frequency}, 
                   passagers=${transportData.passengers}, facteur=${factor}, 
                   émissions annuelles=${annualDistance} × ${factor} = ${emissions} kg CO2e`);
      
      // For shared transport, divide by number of passengers if applicable
      if (mode === 'car' && transportData.passengers > 1) {
        const initialEmissions = emissions;
        emissions = emissions / transportData.passengers;
        console.log(`DEBUG - Ajustement covoiturage pour ${key}: ${initialEmissions} ÷ ${transportData.passengers} = ${emissions} kg CO2e`);
      }
      
      breakdown[key] = emissions;
      totalEmissions += emissions;
    }
  });

  return {
    totalEmissions,
    breakdown,
  };
}

// Calculate emissions for events
export function calculateEventEmissions(input: EventInput) {
  const breakdown: Record<string, number> = {};
  let totalEmissions = 0;

  // Venue emissions
  const venueEmissions = input.venueSizeM2 * EMISSION_FACTORS.event.venue * input.duration;
  breakdown.venue = venueEmissions;
  totalEmissions += venueEmissions;

  // Materials emissions
  const marketingEmissions = input.marketingMaterials * EMISSION_FACTORS.event.marketingMaterials;
  breakdown.marketingMaterials = marketingEmissions;
  totalEmissions += marketingEmissions;

  const documentsEmissions = input.printedDocuments * EMISSION_FACTORS.event.printedDocuments;
  breakdown.printedDocuments = documentsEmissions;
  totalEmissions += documentsEmissions;

  const bannersEmissions = input.banners * EMISSION_FACTORS.event.banners;
  breakdown.banners = bannersEmissions;
  totalEmissions += bannersEmissions;

  // Food & beverages
  let mealEmissionFactor = EMISSION_FACTORS.event.standardMeal;
  if (input.mealType === 'vegetarian') {
    mealEmissionFactor = EMISSION_FACTORS.event.vegetarianMeal;
  } else if (input.mealType === 'vegan') {
    mealEmissionFactor = EMISSION_FACTORS.event.veganMeal;
  }

  const mealsEmissions = input.mealsCount * mealEmissionFactor;
  breakdown.meals = mealsEmissions;
  totalEmissions += mealsEmissions;

  const beveragesEmissions = input.beverages * EMISSION_FACTORS.event.beverage;
  breakdown.beverages = beveragesEmissions;
  totalEmissions += beveragesEmissions;

  // Waste emissions (adjust based on recycling percentage)
  const wasteEmissions = input.wasteGenerated * EMISSION_FACTORS.event.waste * (1 - (input.recyclingPercentage / 100));
  breakdown.waste = wasteEmissions;
  totalEmissions += wasteEmissions;

  // Energy emissions
  const energyEmissions = input.energyConsumption * EMISSION_FACTORS.event.energy;
  breakdown.energy = energyEmissions;
  totalEmissions += energyEmissions;

  return {
    totalEmissions,
    breakdown,
  };
}

// Calculate emissions for study trips
export function calculateStudyTripEmissions(input: StudyTripInput) {
  const breakdown: Record<string, number> = {};
  let totalEmissions = 0;
  
  // Get trip count with default of 1 if not provided
  const tripCount = input.tripCount || 1;

  // Transportation emissions
  if (input.transportMode in EMISSION_FACTORS.studyTrip) {
    const transportMode = input.transportMode as keyof typeof EMISSION_FACTORS.studyTrip;
    const transportEmissions = input.distanceKm * EMISSION_FACTORS.studyTrip[transportMode] * input.participants;
    
    // Adjust for vehicle count if applicable
    const adjustedTransportEmissions = (input.transportMode === 'car' || input.transportMode === 'bus') && input.vehicleCount > 0
      ? transportEmissions * (input.vehicleCount / Math.ceil(input.participants / 4)) // assuming 4 passengers per vehicle
      : transportEmissions;
    
    // Multiply by the number of trips
    const totalTransportEmissions = adjustedTransportEmissions * tripCount;
    
    breakdown.transport = totalTransportEmissions;
    totalEmissions += totalTransportEmissions;
  }

  // Accommodation emissions
  let accommodationEmissionFactor = 0;
  switch(input.accommodationType) {
    case 'hotel':
      accommodationEmissionFactor = EMISSION_FACTORS.studyTrip.hotel;
      break;
    case 'hostel':
      accommodationEmissionFactor = EMISSION_FACTORS.studyTrip.hostel;
      break;
    case 'campsite':
      accommodationEmissionFactor = EMISSION_FACTORS.studyTrip.campsite;
      break;
    case 'other':
      accommodationEmissionFactor = EMISSION_FACTORS.studyTrip.otherAccommodation;
      break;
  }
  
  const accommodationEmissions = input.nightsStay * accommodationEmissionFactor * input.participants * tripCount;
  breakdown.accommodation = accommodationEmissions;
  totalEmissions += accommodationEmissions;

  // Local transport emissions
  if (input.localTransport && input.localTransportKm > 0) {
    const localTransportEmissions = input.localTransportKm * EMISSION_FACTORS.studyTrip.localTransport * input.participants * tripCount;
    breakdown.localTransport = localTransportEmissions;
    totalEmissions += localTransportEmissions;
  }

  // Meals emissions
  let mealEmissionFactor = EMISSION_FACTORS.studyTrip.standardMeal;
  if (input.mealType === 'vegetarian') {
    mealEmissionFactor = EMISSION_FACTORS.studyTrip.vegetarianMeal;
  } else if (input.mealType === 'vegan') {
    mealEmissionFactor = EMISSION_FACTORS.studyTrip.veganMeal;
  }

  const mealsEmissions = input.mealsCount * mealEmissionFactor * input.participants * tripCount;
  breakdown.meals = mealsEmissions;
  totalEmissions += mealsEmissions;

  return {
    totalEmissions,
    breakdown,
  };
}

// Calculate emissions for restauration
export function calculateRestaurantEmissions(input: RestaurationType) {
  console.log('DEBUG - Restauration input data:', input);
  const breakdown: Record<string, number> = {};
  let totalEmissions = 0;
  
  // Vérifier si l'entrée contient des valeurs non nulles
  const hasNonZeroValues = Object.values(input).some(val => val > 0);
  
  // Log si aucune valeur significative n'est trouvée, mais utiliser les valeurs réelles quand même
  if (!hasNonZeroValues) {
    console.warn('ATTENTION: Aucune donnée significative dans les entrées de restauration. Les résultats peuvent être nuls.');
  }
  
  // Viandes
  const viandeRougeEmissions = input.viandeRouge * EMISSION_FACTORS.restauration.viandeRouge;
  breakdown.viandeRouge = viandeRougeEmissions;
  totalEmissions += viandeRougeEmissions;
  
  const viandePouletEmissions = input.viandePoulet * EMISSION_FACTORS.restauration.viandePoulet;
  breakdown.viandePoulet = viandePouletEmissions;
  totalEmissions += viandePouletEmissions;
  
  const poissonEmissions = input.poisson * EMISSION_FACTORS.restauration.poisson;
  breakdown.poisson = poissonEmissions;
  totalEmissions += poissonEmissions;
  
  // Aliments principaux
  const patesEmissions = input.pates * EMISSION_FACTORS.restauration.pates;
  breakdown.pates = patesEmissions;
  totalEmissions += patesEmissions;
  
  const couscousEmissions = input.couscous * EMISSION_FACTORS.restauration.couscous;
  breakdown.couscous = couscousEmissions;
  totalEmissions += couscousEmissions;
  
  const sauceEmissions = input.sauce * EMISSION_FACTORS.restauration.sauce;
  breakdown.sauce = sauceEmissions;
  totalEmissions += sauceEmissions;
  
  const petitsPoisEmissions = input.petitsPois * EMISSION_FACTORS.restauration.petitsPois;
  breakdown.petitsPois = petitsPoisEmissions;
  totalEmissions += petitsPoisEmissions;
  
  const haricotEmissions = input.haricot * EMISSION_FACTORS.restauration.haricot;
  breakdown.haricot = haricotEmissions;
  totalEmissions += haricotEmissions;
  
  // Produits laitiers et céréales
  const fromageEmissions = input.fromage * EMISSION_FACTORS.restauration.fromage;
  breakdown.fromage = fromageEmissions;
  totalEmissions += fromageEmissions;
  
  const beurreEmissions = input.beurre * EMISSION_FACTORS.restauration.beurre;
  breakdown.beurre = beurreEmissions;
  totalEmissions += beurreEmissions;
  
  const yaourtEmissions = input.yaourt * EMISSION_FACTORS.restauration.yaourt;
  breakdown.yaourt = yaourtEmissions;
  totalEmissions += yaourtEmissions;
  
  const laitEmissions = input.lait * EMISSION_FACTORS.restauration.lait;
  breakdown.lait = laitEmissions;
  totalEmissions += laitEmissions;
  
  // Autres aliments
  const confitureEmissions = input.confiture * EMISSION_FACTORS.restauration.confiture;
  breakdown.confiture = confitureEmissions;
  totalEmissions += confitureEmissions;
  
  const oeufEmissions = input.oeuf * EMISSION_FACTORS.restauration.oeuf;
  breakdown.oeuf = oeufEmissions;
  totalEmissions += oeufEmissions;
  
  const legumeEmissions = input.legume * EMISSION_FACTORS.restauration.legume;
  breakdown.legume = legumeEmissions;
  totalEmissions += legumeEmissions;
  
  const fruitEmissions = input.fruit * EMISSION_FACTORS.restauration.fruit;
  breakdown.fruit = fruitEmissions;
  totalEmissions += fruitEmissions;
  
  // Snacks et desserts
  const cakeEmissions = input.cake * EMISSION_FACTORS.restauration.cake;
  breakdown.cake = cakeEmissions;
  totalEmissions += cakeEmissions;
  
  const chocolatEmissions = input.chocolat * EMISSION_FACTORS.restauration.chocolat;
  breakdown.chocolat = chocolatEmissions;
  totalEmissions += chocolatEmissions;
  
  const painEmissions = input.pain * EMISSION_FACTORS.restauration.pain;
  breakdown.pain = painEmissions;
  totalEmissions += painEmissions;
  
  const pizzaEmissions = input.pizza * EMISSION_FACTORS.restauration.pizza;
  breakdown.pizza = pizzaEmissions;
  totalEmissions += pizzaEmissions;
  
  const cafeEmissions = input.cafe * EMISSION_FACTORS.restauration.cafe;
  breakdown.cafe = cafeEmissions;
  totalEmissions += cafeEmissions;
  
  // Logistique
  const distanceEmissions = input.distance * EMISSION_FACTORS.restauration.distance;
  breakdown.distance = distanceEmissions;
  totalEmissions += distanceEmissions;
  
  const allerRetourEmissions = input.allerRetour * EMISSION_FACTORS.restauration.allerRetour;
  breakdown.allerRetour = allerRetourEmissions;
  totalEmissions += allerRetourEmissions;
  
  // Calcul des émissions pour les déchets
  const foodWasteEmissions = input.foodWasteKg * EMISSION_FACTORS.restauration.foodWaste;
  breakdown.foodWaste = foodWasteEmissions;
  totalEmissions += foodWasteEmissions;
  
  const packagingWasteEmissions = input.packagingWasteKg * EMISSION_FACTORS.restauration.packagingWaste;
  breakdown.packagingWaste = packagingWasteEmissions;
  totalEmissions += packagingWasteEmissions;
  
  // Réduction liée au recyclage
  if (input.recyclingPercentage > 0) {
    const recyclingReduction = (foodWasteEmissions + packagingWasteEmissions) * (input.recyclingPercentage / 100) * 0.5;
    breakdown.recyclingReduction = -recyclingReduction;
    totalEmissions -= recyclingReduction;
  }
  
  return {
    totalEmissions,
    breakdown,
  };
}

// Calculate total emissions with all components
export function calculateTotalEmissions(
  merchandiseEmissions: {
    totalEmissions: number;
    breakdown: Record<string, number>;
  },
  transportEmissions: {
    totalEmissions: number;
    breakdown: Record<string, number>;
  },
  eventEmissions?: {
    totalEmissions: number;
    breakdown: Record<string, number>;
  },
  studyTripEmissions?: {
    totalEmissions: number;
    breakdown: Record<string, number>;
  },
  restaurationEmissions?: {
    totalEmissions: number;
    breakdown: Record<string, number>;
  }
): EmissionResult {
  console.log('DEBUG - Calcul des émissions totales:');
  console.log(`DEBUG - Marchandises: ${merchandiseEmissions.totalEmissions} kg CO2e`);
  console.log(`DEBUG - Transport: ${transportEmissions.totalEmissions} kg CO2e`);
  
  if (eventEmissions) {
    console.log(`DEBUG - Événements: ${eventEmissions.totalEmissions} kg CO2e`);
  }
  
  if (studyTripEmissions) {
    console.log(`DEBUG - Voyages d'étude: ${studyTripEmissions.totalEmissions} kg CO2e`);
  }
  
  if (restaurationEmissions) {
    console.log(`DEBUG - Restauration: ${restaurationEmissions.totalEmissions} kg CO2e`);
  }
  
  // Si toutes les émissions sont à 0, uniquement log l'information
  if (merchandiseEmissions.totalEmissions === 0 && transportEmissions.totalEmissions === 0 &&
      (!eventEmissions || eventEmissions.totalEmissions === 0) &&
      (!studyTripEmissions || studyTripEmissions.totalEmissions === 0) &&
      (!restaurationEmissions || restaurationEmissions.totalEmissions === 0)) {
    console.warn('ATTENTION: Toutes les émissions sont à 0. Les résultats reflètent les données saisies par l\'utilisateur.');
  }
  
  let total = merchandiseEmissions.totalEmissions + transportEmissions.totalEmissions;
  
  if (eventEmissions) {
    total += eventEmissions.totalEmissions;
  }
  
  if (studyTripEmissions) {
    total += studyTripEmissions.totalEmissions;
  }
  
  if (restaurationEmissions) {
    total += restaurationEmissions.totalEmissions;
  }
  
  return {
    merchandise: merchandiseEmissions,
    transport: transportEmissions,
    event: eventEmissions,
    studyTrip: studyTripEmissions,
    restauration: restaurationEmissions,
    totalEmissions: total,
  };
}

