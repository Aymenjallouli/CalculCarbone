import { pgTable, text, serial, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Enhanced schema for merchandise inputs (based on Equipement_scope3)
export const merchandiseSchema = z.object({
  // Basic school supplies
  paper: z.number().min(0).default(0),
  notebook: z.number().min(0).default(0),
  textbook: z.number().min(0).default(0),
  
  // Technology
  computer: z.number().min(0).default(0),
  laptop: z.number().min(0).default(0),
  printer: z.number().min(0).default(0),
  projector: z.number().min(0).default(0),
  tablet: z.number().min(0).default(0),
  
  // Furniture
  furniture: z.number().min(0).default(0),
  desk: z.number().min(0).default(0),
  chair: z.number().min(0).default(0),
  
  // Lab equipment
  labEquipment: z.number().min(0).default(0),
  
  // Sports equipment
  sportsEquipment: z.number().min(0).default(0),
});

// Type for merchandise inputs
export type MerchandiseInput = z.infer<typeof merchandiseSchema>;

// Schema for transport mode details
const transportModeSchema = z.object({
  distance: z.number().min(0).default(0),
  frequency: z.number().min(0).max(14).default(0),
  passengers: z.number().min(1).max(8).default(1),
});

// Schema for CSV transport data
export const transportCSVSchema = z.object({
  // Identification
  id: z.string().optional(),
  email: z.string().optional(),
  nom: z.string().optional(),
  lastModified: z.string().optional(),
  statut: z.string().optional(),
  
  // Residence information
  residence: z.string().optional(),
  
  // School commute details (only for off-campus residence)
  distanceAllerRetour: z.coerce.number().min(0).default(0),
  nbMoisEcole: z.coerce.number().min(0).max(12).default(0),
  nbJoursEcoleMois: z.coerce.number().min(0).max(31).default(0),
  
  // Transportation modes
  kmBus: z.coerce.number().min(0).default(0),
  kmTrain: z.coerce.number().min(0).default(0),
  kmMotoScooter: z.coerce.number().min(0).default(0),
  typeCarburantMoto: z.string().optional(),
  consommationMoto: z.coerce.number().min(0).default(0),
  
  kmVoiture: z.coerce.number().min(0).default(0),
  typeCarburantVoiture: z.string().optional(),
  consommationVoiture: z.coerce.number().min(0).default(0),
  
  // Personal transport
  kmVoiturePerso: z.coerce.number().min(0).default(0),
  typeCarburantPerso: z.string().optional(), 
  consommationCarburantSemaine: z.coerce.number().min(0).default(0),
  consommationElectriciteSemaine: z.coerce.number().min(0).default(0),
  
  // Deliveries and other transportation
  nbLivraisonsSemaine: z.coerce.number().min(0).default(0),
  distanceMoyenneLivraison: z.coerce.number().min(0).default(0),
  
  // Family visits
  frequenceRetourFamille: z.coerce.number().min(0).default(0),
  distanceMoyenneRetourFamille: z.coerce.number().min(0).default(0),
  kmBusRetourFamille: z.coerce.number().min(0).default(0),
  kmTrainRetourFamille: z.coerce.number().min(0).default(0),
  kmMotoRetourFamille: z.coerce.number().min(0).default(0),
  typeCarburantMotoRetour: z.string().optional(),
  consommationMotoRetour: z.coerce.number().min(0).default(0),
  kmVoitureRetourFamille: z.coerce.number().min(0).default(0),
  typeCarburantVoitureRetour: z.string().optional(),
  consommationVoitureRetour: z.coerce.number().min(0).default(0),
  
  // Raw CSV data (to keep all columns not explicitly mapped)
  rawData: z.record(z.string(), z.any()).optional(),
  
  // Flag for on-campus residence
  isOnCampus: z.boolean().default(false),
});

// Schema for transport inputs
export const transportSchema = z.object({
  // Legacy form input fields
  car: transportModeSchema,
  bus: transportModeSchema,
  train: transportModeSchema,
  bicycle: transportModeSchema,
  walking: transportModeSchema,
  schoolBus: transportModeSchema,
  
  // CSV data fields
  csvData: z.array(transportCSVSchema).optional(),
  isCSVImport: z.boolean().default(false),
});

// Transport input types
export type TransportCSVData = z.infer<typeof transportCSVSchema>;
export type TransportInput = z.infer<typeof transportSchema>;

// Schema for event inputs (based on Empreinte Carbone Event Scope3)
export const eventSchema = z.object({
  // Basic event info
  name: z.string().min(1, "Le nom de l'événement est requis"),
  attendees: z.number().min(1, "Le nombre de participants doit être d'au moins 1").default(1),
  duration: z.number().min(0.5, "La durée minimale est de 0.5 jour").default(1),
  
  // Venue details
  venueSizeM2: z.number().min(0).default(0),
  
  // Materials
  marketingMaterials: z.number().min(0).default(0),
  printedDocuments: z.number().min(0).default(0),
  banners: z.number().min(0).default(0),
  
  // Food & Beverages
  mealsCount: z.number().min(0).default(0),
  mealType: z.enum(["standard", "vegetarian", "vegan"]).default("standard"),
  beverages: z.number().min(0).default(0),
  
  // Waste
  wasteGenerated: z.number().min(0).default(0),
  recyclingPercentage: z.number().min(0).max(100).default(0),
  
  // Energy
  energyConsumption: z.number().min(0).default(0),
});

// Type for event inputs
export type EventInput = z.infer<typeof eventSchema>;

// Schema for restauration inputs
export const restaurationSchema = z.object({
  // Viandes
  viandeRouge: z.number().min(0).default(0),
  viandePoulet: z.number().min(0).default(0),
  poisson: z.number().min(0).default(0),
  
  // Aliments principaux
  pates: z.number().min(0).default(0),
  couscous: z.number().min(0).default(0),
  sauce: z.number().min(0).default(0),
  petitsPois: z.number().min(0).default(0),
  haricot: z.number().min(0).default(0),
  
  // Produits laitiers et céréales
  fromage: z.number().min(0).default(0),
  beurre: z.number().min(0).default(0),
  yaourt: z.number().min(0).default(0),
  lait: z.number().min(0).default(0),
  
  // Autres aliments
  confiture: z.number().min(0).default(0),
  oeuf: z.number().min(0).default(0),
  legume: z.number().min(0).default(0),
  fruit: z.number().min(0).default(0),
  
  // Snacks et desserts
  cake: z.number().min(0).default(0),
  chocolat: z.number().min(0).default(0),
  pain: z.number().min(0).default(0),
  pizza: z.number().min(0).default(0),
  cafe: z.number().min(0).default(0),
  
  // Logistique
  distance: z.number().min(0).default(0),
  allerRetour: z.number().min(0).default(0),
  
  // Déchets (conservés comme demandé)
  foodWasteKg: z.number().min(0).default(0),
  packagingWasteKg: z.number().min(0).default(0),
  recyclingPercentage: z.number().min(0).max(100).default(0),
});

// Type for restauration inputs
export type RestaurationType = z.infer<typeof restaurationSchema>;

// Schema for study trips (Voyage d'Etude)
export const studyTripSchema = z.object({
  // Trip details
  destination: z.string().min(1, "La destination est requise"),
  tripCount: z.number().min(1, "Au moins un voyage doit être réalisé").default(1),
  distanceKm: z.number().min(0).default(0),
  duration: z.number().min(1, "La durée minimale est de 1 jour").default(1),
  participants: z.number().min(1, "Le nombre de participants doit être d'au moins 1").default(1),
  
  // Transportation
  transportMode: z.enum([
    "plane", "train", "bus", "car", "boat", "other"
  ]).default("train"),
  
  // If car or bus selected
  vehicleCount: z.number().min(0).default(0),
  
  // Accommodation
  accommodationType: z.enum([
    "hotel", "hostel", "campsite", "other"
  ]).default("hotel"),
  nightsStay: z.number().min(0).default(0),
  
  // Activities
  localTransport: z.boolean().default(false),
  localTransportKm: z.number().min(0).default(0),
  
  // Meals
  mealsCount: z.number().min(0).default(0),
  mealType: z.enum(["standard", "vegetarian", "vegan"]).default("standard"),
});

// Type for study trip inputs
export type StudyTripInput = z.infer<typeof studyTripSchema>;

// Enhanced Emission result types
export interface EmissionResult {
  merchandise: {
    totalEmissions: number;
    breakdown: Record<string, number>;
  };
  transport: {
    totalEmissions: number;
    breakdown: Record<string, number>;
  };
  restauration?: {
    totalEmissions: number;
    breakdown: Record<string, number>;
  };
  event?: {
    totalEmissions: number;
    breakdown: Record<string, number>;
  };
  studyTrip?: {
    totalEmissions: number;
    breakdown: Record<string, number>;
  };
  totalEmissions: number;
}

// Calculation results table
export const calculationResults = pgTable("calculation_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  merchandiseInput: json("merchandise_input").$type<MerchandiseInput>(),
  transportInput: json("transport_input").$type<TransportInput>(),
  restaurationInput: json("restauration_input").$type<RestaurationType | null>(),
  eventInput: json("event_input").$type<EventInput | null>(),
  studyTripInput: json("study_trip_input").$type<StudyTripInput | null>(),
  results: json("results").$type<EmissionResult>(),
  createdAt: text("created_at").notNull().default("NOW()"),
});

// Insert schema for calculation results
export const insertCalculationResultSchema = createInsertSchema(calculationResults).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type CalculationResult = typeof calculationResults.$inferSelect;
export type InsertCalculationResult = z.infer<typeof insertCalculationResultSchema>;

// User insert schema
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
