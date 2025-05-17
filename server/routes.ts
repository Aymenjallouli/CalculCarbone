import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  merchandiseSchema, 
  transportSchema, 
  eventSchema, 
  studyTripSchema,
  restaurationSchema
} from "@shared/schema";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // put application routes here
  // prefix all routes with /api

  // API route for saving merchandise data
  app.post("/api/merchandise", async (req, res) => {
    try {
      const validatedData = merchandiseSchema.parse(req.body);
      
      // Get userId from authenticated session if available
      const userId = req.isAuthenticated() ? req.user.id : null;
      
      await storage.saveMerchandiseData(userId, validatedData);
      
      res.status(200).json({ 
        success: true, 
        message: "Données d'équipement enregistrées avec succès" 
      });
    } catch (error) {
      console.error("Error saving merchandise data:", error);
      res.status(400).json({ 
        success: false, 
        message: "Données d'équipement invalides" 
      });
    }
  });

  // API route for saving transport data
  app.post("/api/transport", async (req, res) => {
    try {
      const validatedData = transportSchema.parse(req.body);
      
      // Get userId from authenticated session if available
      const userId = req.isAuthenticated() ? req.user.id : null;
      
      await storage.saveTransportData(userId, validatedData);
      
      res.status(200).json({ 
        success: true, 
        message: "Données de transport enregistrées avec succès" 
      });
    } catch (error) {
      console.error("Error saving transport data:", error);
      res.status(400).json({ 
        success: false, 
        message: "Données de transport invalides" 
      });
    }
  });
  
  // API route for saving event data
  app.post("/api/event", async (req, res) => {
    try {
      const validatedData = eventSchema.parse(req.body);
      
      // Get userId from authenticated session if available
      const userId = req.isAuthenticated() ? req.user.id : null;
      
      await storage.saveEventData(userId, validatedData);
      
      res.status(200).json({ 
        success: true, 
        message: "Données d'événement enregistrées avec succès" 
      });
    } catch (error) {
      console.error("Error saving event data:", error);
      res.status(400).json({ 
        success: false, 
        message: "Données d'événement invalides" 
      });
    }
  });
  
  // API route for saving study trip data
  app.post("/api/study-trip", async (req, res) => {
    try {
      const validatedData = studyTripSchema.parse(req.body);
      
      // Get userId from authenticated session if available
      const userId = req.isAuthenticated() ? req.user.id : null;
      
      await storage.saveStudyTripData(userId, validatedData);
      
      res.status(200).json({ 
        success: true, 
        message: "Données de voyage d'étude enregistrées avec succès" 
      });
    } catch (error) {
      console.error("Error saving study trip data:", error);
      res.status(400).json({ 
        success: false, 
        message: "Données de voyage d'étude invalides" 
      });
    }
  });

  // API route for saving restauration data
  app.post("/api/restauration", async (req, res) => {
    try {
      const validatedData = restaurationSchema.parse(req.body);
      
      // Get userId from authenticated session if available
      const userId = req.isAuthenticated() ? req.user.id : null;
      
      await storage.saveRestaurantData(userId, validatedData);
      
      res.status(200).json({ 
        success: true, 
        message: "Données de restauration enregistrées avec succès" 
      });
    } catch (error) {
      console.error("Error saving restauration data:", error);
      res.status(400).json({ 
        success: false, 
        message: "Données de restauration invalides" 
      });
    }
  });

  // API route for getting calculation results
  app.get("/api/results", async (req, res) => {
    try {
      // Get userId from authenticated session if available
      const userId = req.isAuthenticated() ? req.user.id : null;
      console.log('DEBUG - API /results - User ID:', userId);
      
      const results = await storage.getCalculationResult(userId);
      console.log('DEBUG - API /results - Results returned:', JSON.stringify(results));
      
      if (results) {
        const response = {
          success: true,
          results
        };
        console.log('DEBUG - API /results - Sending success response');
        res.status(200).json(response);
      } else {
        console.log('DEBUG - API /results - No results found');
        res.status(200).json({ 
          success: false, 
          message: "Aucun résultat de calcul trouvé",
          results: null
        });
      }
    } catch (error) {
      console.error("Error retrieving calculation results:", error);
      res.status(500).json({ 
        success: false, 
        message: "Erreur lors de la récupération des résultats" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
