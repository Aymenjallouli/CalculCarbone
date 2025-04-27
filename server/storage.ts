import { 
  User, 
  InsertUser, 
  MerchandiseInput, 
  TransportInput, 
  EmissionResult,
  CalculationResult,
  InsertCalculationResult
} from "@shared/schema";
import { 
  calculateMerchandiseEmissions, 
  calculateTransportEmissions,
  calculateTotalEmissions 
} from "../client/src/lib/calculations";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Carbon calculator methods
  saveMerchandiseData(userId: number | null, data: MerchandiseInput): Promise<void>;
  saveTransportData(userId: number | null, data: TransportInput): Promise<void>;
  getCalculationResult(userId: number | null): Promise<EmissionResult | null>;
  saveCalculationResult(result: InsertCalculationResult): Promise<CalculationResult>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private merchandiseData: Map<number, MerchandiseInput>;
  private transportData: Map<number, TransportInput>;
  private results: Map<number, CalculationResult>;
  private sessionData: Map<string, {
    merchandise?: MerchandiseInput;
    transport?: TransportInput;
  }>;
  currentId: number;
  private resultId: number;

  constructor() {
    this.users = new Map();
    this.merchandiseData = new Map();
    this.transportData = new Map();
    this.results = new Map();
    this.sessionData = new Map();
    this.currentId = 1;
    this.resultId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Generate a session ID for non-authenticated users
  private getSessionId(userId: number | null): string {
    return userId ? `user-${userId}` : 'session-anonymous';
  }

  async saveMerchandiseData(userId: number | null, data: MerchandiseInput): Promise<void> {
    const sessionId = this.getSessionId(userId);
    
    if (userId) {
      // Store for authenticated user
      this.merchandiseData.set(userId, data);
    } else {
      // Store in session for anonymous user
      const sessionData = this.sessionData.get(sessionId) || {};
      this.sessionData.set(sessionId, {
        ...sessionData,
        merchandise: data
      });
    }
    
    // If we have both merchandise and transport data, calculate and save results
    await this.calculateAndSaveResults(userId);
  }

  async saveTransportData(userId: number | null, data: TransportInput): Promise<void> {
    const sessionId = this.getSessionId(userId);
    
    if (userId) {
      // Store for authenticated user
      this.transportData.set(userId, data);
    } else {
      // Store in session for anonymous user
      const sessionData = this.sessionData.get(sessionId) || {};
      this.sessionData.set(sessionId, {
        ...sessionData,
        transport: data
      });
    }
    
    // If we have both merchandise and transport data, calculate and save results
    await this.calculateAndSaveResults(userId);
  }

  private async calculateAndSaveResults(userId: number | null): Promise<void> {
    const sessionId = this.getSessionId(userId);
    
    let merchandiseData: MerchandiseInput | undefined;
    let transportData: TransportInput | undefined;
    
    if (userId) {
      // Get data for authenticated user
      merchandiseData = this.merchandiseData.get(userId);
      transportData = this.transportData.get(userId);
    } else {
      // Get data from session for anonymous user
      const sessionData = this.sessionData.get(sessionId);
      if (sessionData) {
        merchandiseData = sessionData.merchandise;
        transportData = sessionData.transport;
      }
    }
    
    // If we have both data sets, calculate results
    if (merchandiseData && transportData) {
      const merchandiseEmissions = calculateMerchandiseEmissions(merchandiseData);
      const transportEmissions = calculateTransportEmissions(transportData);
      const totalEmissions = calculateTotalEmissions(merchandiseEmissions, transportEmissions);
      
      // Save the calculation result
      await this.saveCalculationResult({
        userId: userId || null,
        merchandiseInput: merchandiseData,
        transportInput: transportData,
        results: totalEmissions,
        createdAt: new Date().toISOString()
      });
    }
  }

  async getCalculationResult(userId: number | null): Promise<EmissionResult | null> {
    const sessionId = this.getSessionId(userId);
    
    // For authenticated users
    if (userId) {
      // Find the result for this user
      const userResult = Array.from(this.results.values()).find(
        result => result.userId === userId
      );
      
      if (userResult) {
        return userResult.results;
      }
    } else {
      // For anonymous users, get data from session
      const sessionData = this.sessionData.get(sessionId);
      
      if (sessionData?.merchandise && sessionData?.transport) {
        const merchandiseEmissions = calculateMerchandiseEmissions(sessionData.merchandise);
        const transportEmissions = calculateTransportEmissions(sessionData.transport);
        return calculateTotalEmissions(merchandiseEmissions, transportEmissions);
      }
    }
    
    return null;
  }

  async saveCalculationResult(data: InsertCalculationResult): Promise<CalculationResult> {
    const id = this.resultId++;
    const result: CalculationResult = { ...data, id };
    this.results.set(id, result);
    return result;
  }
}

export const storage = new MemStorage();
