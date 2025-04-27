import { pgTable, text, serial, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Base tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Schema for merchandise inputs
export const merchandiseSchema = z.object({
  paper: z.number().min(0).default(0),
  notebook: z.number().min(0).default(0),
  textbook: z.number().min(0).default(0),
  computer: z.number().min(0).default(0),
  furniture: z.number().min(0).default(0),
});

// Type for merchandise inputs
export type MerchandiseInput = z.infer<typeof merchandiseSchema>;

// Schema for transport mode details
const transportModeSchema = z.object({
  distance: z.number().min(0).default(0),
  frequency: z.number().min(0).max(14).default(0),
  passengers: z.number().min(1).max(8).default(1),
});

// Schema for transport inputs
export const transportSchema = z.object({
  car: transportModeSchema,
  bus: transportModeSchema,
  train: transportModeSchema,
  bicycle: transportModeSchema,
  walking: transportModeSchema,
  schoolBus: transportModeSchema,
});

// Type for transport inputs
export type TransportInput = z.infer<typeof transportSchema>;

// Emission result types
export interface EmissionResult {
  merchandise: {
    totalEmissions: number;
    breakdown: Record<string, number>;
  };
  transport: {
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
