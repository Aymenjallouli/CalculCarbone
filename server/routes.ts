import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  merchandiseSchema, 
  transportSchema, 
  eventSchema, 
  studyTripSchema 
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
      
      // For this application, we'll store data for anonymous users (no auth required)
      // In a real app, you'd get userId from authenticated session
      const userId = null;
      
      await storage.saveMerchandiseData(userId, validatedData);
      
      res.status(200).json({ 
        success: true, 
        message: "Merchandise data saved successfully" 
      });
    } catch (error) {
      console.error("Error saving merchandise data:", error);
      res.status(400).json({ 
        success: false, 
        message: "Invalid merchandise data" 
      });
    }
  });

  // API route for saving transport data
  app.post("/api/transport", async (req, res) => {
    try {
      const validatedData = transportSchema.parse(req.body);
      
      // For this application, we'll store data for anonymous users (no auth required)
      const userId = null;
      
      await storage.saveTransportData(userId, validatedData);
      
      res.status(200).json({ 
        success: true, 
        message: "Transport data saved successfully" 
      });
    } catch (error) {
      console.error("Error saving transport data:", error);
      res.status(400).json({ 
        success: false, 
        message: "Invalid transport data" 
      });
    }
  });
  
  // API route for saving event data
  app.post("/api/event", async (req, res) => {
    try {
      const validatedData = eventSchema.parse(req.body);
      
      // For this application, we'll store data for anonymous users (no auth required)
      const userId = null;
      
      await storage.saveEventData(userId, validatedData);
      
      res.status(200).json({ 
        success: true, 
        message: "Event data saved successfully" 
      });
    } catch (error) {
      console.error("Error saving event data:", error);
      res.status(400).json({ 
        success: false, 
        message: "Invalid event data" 
      });
    }
  });
  
  // API route for saving study trip data
  app.post("/api/study-trip", async (req, res) => {
    try {
      const validatedData = studyTripSchema.parse(req.body);
      
      // For this application, we'll store data for anonymous users (no auth required)
      const userId = null;
      
      await storage.saveStudyTripData(userId, validatedData);
      
      res.status(200).json({ 
        success: true, 
        message: "Study trip data saved successfully" 
      });
    } catch (error) {
      console.error("Error saving study trip data:", error);
      res.status(400).json({ 
        success: false, 
        message: "Invalid study trip data" 
      });
    }
  });

  // API route for getting calculation results
  app.get("/api/results", async (req, res) => {
    try {
      // For this application, we'll get data for anonymous users
      const userId = null;
      
      const results = await storage.getCalculationResult(userId);
      
      if (results) {
        res.status(200).json(results);
      } else {
        res.status(404).json({ 
          success: false, 
          message: "No calculation results found" 
        });
      }
    } catch (error) {
      console.error("Error retrieving calculation results:", error);
      res.status(500).json({ 
        success: false, 
        message: "Error retrieving calculation results" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
