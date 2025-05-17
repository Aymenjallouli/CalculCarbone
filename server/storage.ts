import { 
  User, 
  InsertUser, 
  MerchandiseInput, 
  TransportInput, 
  EventInput,
  StudyTripInput,
  RestaurationType,
  EmissionResult,
  CalculationResult,
  InsertCalculationResult
} from "@shared/schema";
import { 
  calculateMerchandiseEmissions, 
  calculateTransportEmissions,
  calculateEventEmissions,
  calculateStudyTripEmissions,
  calculateRestaurantEmissions,
  calculateTotalEmissions 
} from "../client/src/lib/calculations";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Carbon calculator methods
  saveMerchandiseData(userId: number | null, data: MerchandiseInput): Promise<void>;
  saveTransportData(userId: number | null, data: TransportInput): Promise<void>;
  saveRestaurantData(userId: number | null, data: RestaurationType): Promise<void>;
  saveEventData(userId: number | null, data: EventInput): Promise<void>;
  saveStudyTripData(userId: number | null, data: StudyTripInput): Promise<void>;
  getCalculationResult(userId: number | null): Promise<EmissionResult | null>;
  saveCalculationResult(result: InsertCalculationResult): Promise<CalculationResult>;
  
  // User calculation history
  getUserCalculationHistory(userId: number): Promise<CalculationResult[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private merchandiseData: Map<number, MerchandiseInput>;
  private transportData: Map<number, TransportInput>;
  private restaurantData: Map<number, RestaurationType>;
  private eventData: Map<number, EventInput>;
  private studyTripData: Map<number, StudyTripInput>;
  private results: Map<number, CalculationResult>;
  private sessionData: Map<string, {
    merchandise?: MerchandiseInput;
    transport?: TransportInput;
    restaurant?: RestaurationType;
    event?: EventInput;
    studyTrip?: StudyTripInput;
  }>;
  currentId: number;
  private resultId: number;

  constructor() {
    this.users = new Map();
    this.merchandiseData = new Map();
    this.transportData = new Map();
    this.restaurantData = new Map();
    this.eventData = new Map();
    this.studyTripData = new Map();
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
    console.log('DEBUG - saveMerchandiseData - User ID:', userId, 'Session ID:', sessionId);
    
    if (userId) {
      // Store for authenticated user
      this.merchandiseData.set(userId, data);
      console.log('DEBUG - Merchandise data saved for authenticated user');
    } else {
      // Store in session for anonymous user
      const sessionData = this.sessionData.get(sessionId) || {};
      this.sessionData.set(sessionId, {
        ...sessionData,
        merchandise: data
      });
      console.log('DEBUG - Merchandise data saved in session', 
                 'Session data size:', Object.keys(this.sessionData).length);
    }
    
    // If we have both merchandise and transport data, calculate and save results
    await this.calculateAndSaveResults(userId);
  }

  async saveTransportData(userId: number | null, data: TransportInput): Promise<void> {
    const sessionId = this.getSessionId(userId);
    console.log('DEBUG - saveTransportData - User ID:', userId, 'Session ID:', sessionId);
    
    if (userId) {
      // Store for authenticated user
      this.transportData.set(userId, data);
      console.log('DEBUG - Transport data saved for authenticated user');
    } else {
      // Store in session for anonymous user
      const sessionData = this.sessionData.get(sessionId) || {};
      this.sessionData.set(sessionId, {
        ...sessionData,
        transport: data
      });
      console.log('DEBUG - Transport data saved in session',
                 'Session data size:', Object.keys(this.sessionData).length,
                 'Session now has merchandise:', sessionData.merchandise ? 'Yes' : 'No');
    }
    
    // If we have both merchandise and transport data, calculate and save results
    await this.calculateAndSaveResults(userId);
  }
  
  async saveRestaurantData(userId: number | null, data: RestaurationType): Promise<void> {
    const sessionId = this.getSessionId(userId);
    console.log('DEBUG - saveRestaurantData - User ID:', userId, 'Session ID:', sessionId);
    
    if (userId) {
      // Store for authenticated user
      this.restaurantData.set(userId, data);
      console.log('DEBUG - Restaurant data saved for authenticated user');
    } else {
      // Store in session for anonymous user
      const sessionData = this.sessionData.get(sessionId) || {};
      this.sessionData.set(sessionId, {
        ...sessionData,
        restaurant: data
      });
      console.log('DEBUG - Restaurant data saved in session',
                 'Session data size:', Object.keys(this.sessionData).length,
                 'Session now has merchandise:', sessionData.merchandise ? 'Yes' : 'No',
                 'Session now has transport:', sessionData.transport ? 'Yes' : 'No');
    }
    
    // If we have both merchandise and transport data, calculate and save results
    await this.calculateAndSaveResults(userId);
  }
  
  async saveEventData(userId: number | null, data: EventInput): Promise<void> {
    const sessionId = this.getSessionId(userId);
    
    if (userId) {
      // Store for authenticated user
      this.eventData.set(userId, data);
    } else {
      // Store in session for anonymous user
      const sessionData = this.sessionData.get(sessionId) || {};
      this.sessionData.set(sessionId, {
        ...sessionData,
        event: data
      });
    }
    
    // Recalculate results with the new data
    await this.calculateAndSaveResults(userId);
  }
  
  async saveStudyTripData(userId: number | null, data: StudyTripInput): Promise<void> {
    const sessionId = this.getSessionId(userId);
    
    if (userId) {
      // Store for authenticated user
      this.studyTripData.set(userId, data);
    } else {
      // Store in session for anonymous user
      const sessionData = this.sessionData.get(sessionId) || {};
      this.sessionData.set(sessionId, {
        ...sessionData,
        studyTrip: data
      });
    }
    
    // Recalculate results with the new data
    await this.calculateAndSaveResults(userId);
  }

  private async calculateAndSaveResults(userId: number | null): Promise<void> {
    const sessionId = this.getSessionId(userId);
    
    let merchandiseData: MerchandiseInput | undefined;
    let transportData: TransportInput | undefined;
    let restaurantData: RestaurationType | undefined;
    let eventData: EventInput | undefined;
    let studyTripData: StudyTripInput | undefined;
    
    if (userId) {
      // Get data for authenticated user
      merchandiseData = this.merchandiseData.get(userId);
      transportData = this.transportData.get(userId);
      restaurantData = this.restaurantData.get(userId);
      eventData = this.eventData.get(userId);
      studyTripData = this.studyTripData.get(userId);
    } else {
      // Get data from session for anonymous user
      const sessionData = this.sessionData.get(sessionId);
      if (sessionData) {
        merchandiseData = sessionData.merchandise;
        transportData = sessionData.transport;
        restaurantData = sessionData.restaurant;
        eventData = sessionData.event;
        studyTripData = sessionData.studyTrip;
      }
    }
    
    // If we have at least the base data sets, calculate results
    if (merchandiseData && transportData) {
      const merchandiseEmissions = calculateMerchandiseEmissions(merchandiseData);
      const transportEmissions = calculateTransportEmissions(transportData);
      
      // Calculate optional restaurant emissions if available
      const restaurantEmissions = restaurantData ? calculateRestaurantEmissions(restaurantData) : undefined;
      
      // Calculate optional event emissions if available
      const eventEmissions = eventData ? calculateEventEmissions(eventData) : undefined;
      
      // Calculate optional study trip emissions if available
      const studyTripEmissions = studyTripData ? calculateStudyTripEmissions(studyTripData) : undefined;
      
      // Calculate total emissions from all available sources
      const totalEmissions = calculateTotalEmissions(
        merchandiseEmissions, 
        transportEmissions, 
        eventEmissions, 
        studyTripEmissions,
        restaurantEmissions
      );
      
      // Save the calculation result
      await this.saveCalculationResult({
        userId: userId !== null ? userId : null,
        merchandiseInput: merchandiseData,
        transportInput: transportData,
        restaurationInput: restaurantData || null,
        eventInput: eventData || null,
        studyTripInput: studyTripData || null,
        results: totalEmissions,
        createdAt: new Date().toISOString()
      });
    }
  }

  async getCalculationResult(userId: number | null): Promise<EmissionResult | null> {
    const sessionId = this.getSessionId(userId);
    console.log('DEBUG - getCalculationResult - User ID:', userId, 'Session ID:', sessionId);
    
    // For authenticated users
    if (userId) {
      // Find the result for this user
      const userResult = Array.from(this.results.values()).find(
        result => result.userId === userId
      );
      
      console.log('DEBUG - Authenticated user result found:', userResult ? 'Yes' : 'No');
      
      if (userResult) {
        return userResult.results;
      }
    } else {
      // For anonymous users, get data from session
      const sessionData = this.sessionData.get(sessionId);
      console.log('DEBUG - Session data found:', sessionData ? 'Yes' : 'No', 
                  'Has merchandise:', sessionData?.merchandise ? 'Yes' : 'No',
                  'Has transport:', sessionData?.transport ? 'Yes' : 'No',
                  'Has restaurant:', sessionData?.restaurant ? 'Yes' : 'No');
      
      if (sessionData?.merchandise && sessionData?.transport) {
        console.log('DEBUG - Recalculating emissions from session data');
        const merchandiseEmissions = calculateMerchandiseEmissions(sessionData.merchandise);
        const transportEmissions = calculateTransportEmissions(sessionData.transport);
        
        // Calculate optional restaurant emissions if available
        const restaurantEmissions = sessionData.restaurant
          ? calculateRestaurantEmissions(sessionData.restaurant) 
          : undefined;
        
        // Calculate optional event emissions if available
        const eventEmissions = sessionData.event
          ? calculateEventEmissions(sessionData.event) 
          : undefined;
          
        // Calculate optional study trip emissions if available
        const studyTripEmissions = sessionData.studyTrip
          ? calculateStudyTripEmissions(sessionData.studyTrip)
          : undefined;
          
        const results = calculateTotalEmissions(
          merchandiseEmissions, 
          transportEmissions, 
          eventEmissions, 
          studyTripEmissions,
          restaurantEmissions
        );
        
        console.log('DEBUG - Calculated total emissions from session:', results.totalEmissions);
        return results;
      }
    }
    
    return null;
  }

  async saveCalculationResult(data: InsertCalculationResult): Promise<CalculationResult> {
    const id = this.resultId++;
    // Ensure results and userId are provided and not null/undefined
    const sanitizedData = {
      ...data,
      userId: data.userId ?? null,
      results: data.results ?? {
        merchandise: { totalEmissions: 0, breakdown: {} },
        transport: { totalEmissions: 0, breakdown: {} },
        totalEmissions: 0
      },
      merchandiseInput: data.merchandiseInput ?? null,
      transportInput: data.transportInput ?? null,
      eventInput: data.eventInput ?? null,
      studyTripInput: data.studyTripInput ?? null,
      createdAt: data.createdAt ?? new Date().toISOString()
    };
    
    // Fix for the type issue: cast to proper type
    const result = {
      ...sanitizedData,
      id
    } as CalculationResult;
    this.results.set(id, result);
    return result;
  }
  
  async getUserCalculationHistory(userId: number): Promise<CalculationResult[]> {
    // Filter results to get only those for this user, sorted by creation date (newest first)
    return Array.from(this.results.values())
      .filter(result => result.userId === userId)
      .sort((a, b) => {
        // Sort by date, most recent first
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
  }
}

export const storage = new MemStorage();
