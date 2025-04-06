import { pgTable, text, serial, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model (keeping original schema for reference)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// SEO Analysis models
export const seoAnalyses = pgTable("seo_analyses", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title"),
  description: text("description"),
  seoScore: integer("seo_score"),
  metaTagsScore: integer("meta_tags_score"),
  contentScore: integer("content_score"),
  linksScore: integer("links_score"),
  performanceScore: integer("performance_score"),
  mobileScore: integer("mobile_score"),
  metaTags: jsonb("meta_tags"),
  headings: jsonb("headings"),
  links: jsonb("links"),
  images: jsonb("images"),
  performanceMetrics: jsonb("performance_metrics"),
  contentAnalysis: jsonb("content_analysis"),
  criticalIssues: jsonb("critical_issues"),
  strengths: jsonb("strengths"),
  improvementAreas: jsonb("improvement_areas"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSeoAnalysisSchema = createInsertSchema(seoAnalyses).pick({
  url: true,
  title: true,
  description: true,
  seoScore: true,
  metaTagsScore: true,
  contentScore: true,
  linksScore: true,
  performanceScore: true,
  mobileScore: true,
  metaTags: true,
  headings: true,
  links: true,
  images: true,
  performanceMetrics: true,
  contentAnalysis: true,
  criticalIssues: true,
  strengths: true,
  improvementAreas: true,
});

export type InsertSeoAnalysis = z.infer<typeof insertSeoAnalysisSchema>;
export type SeoAnalysis = typeof seoAnalyses.$inferSelect;

// URL validation schema
export const urlSchema = z.object({
  url: z.string().url().min(1, "URL is required"),
});

export type UrlInput = z.infer<typeof urlSchema>;
