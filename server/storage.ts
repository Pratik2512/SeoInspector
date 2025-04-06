import { seoAnalyses, type SeoAnalysis, type InsertSeoAnalysis, type User, type InsertUser, users } from "@shared/schema";

// Storage interface extending the original
export interface IStorage {
  // Original user methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // SEO Analysis methods
  saveSeoAnalysis(analysis: InsertSeoAnalysis): Promise<SeoAnalysis>;
  getSeoAnalysisByUrl(url: string): Promise<SeoAnalysis | undefined>;
  getRecentSeoAnalyses(limit: number): Promise<SeoAnalysis[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private seoAnalyses: Map<number, SeoAnalysis>;
  private userCurrentId: number;
  private seoAnalysisCurrentId: number;

  constructor() {
    this.users = new Map();
    this.seoAnalyses = new Map();
    this.userCurrentId = 1;
    this.seoAnalysisCurrentId = 1;
  }

  // Original user methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // SEO Analysis methods
  async saveSeoAnalysis(analysis: InsertSeoAnalysis): Promise<SeoAnalysis> {
    const id = this.seoAnalysisCurrentId++;
    const now = new Date();
    const seoAnalysis: SeoAnalysis = { 
      ...analysis, 
      id, 
      createdAt: now
    };
    this.seoAnalyses.set(id, seoAnalysis);
    return seoAnalysis;
  }

  async getSeoAnalysisByUrl(url: string): Promise<SeoAnalysis | undefined> {
    return Array.from(this.seoAnalyses.values()).find(
      (analysis) => analysis.url === url,
    );
  }

  async getRecentSeoAnalyses(limit: number): Promise<SeoAnalysis[]> {
    return Array.from(this.seoAnalyses.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }
}

export const storage = new MemStorage();
