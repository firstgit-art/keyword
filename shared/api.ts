/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * AI Agent Analysis Request
 */
export interface AIAgentAnalysisRequest {
  userId: string;
  creatorProfile: {
    name: string;
    niche: string;
    platform: string;
    followers: number;
    engagementRate: number;
    monthlyViews: number;
    content: string;
    goals: string;
    challenges: string;
  };
  analysisType: "comprehensive" | "trend" | "monetization" | "competitive";
}

/**
 * Market Research Data
 */
export interface MarketResearchData {
  trends: string[];
  competitorAnalysis: {
    topCompetitors: Array<{
      name: string;
      followers: number;
      avgEngagement: number;
      monetizationStrategy: string;
    }>;
  };
  monetizationOpportunities: Array<{
    type: string;
    estimatedEarnings: string;
    requirements: string[];
  }>;
  industryInsights: string[];
}

/**
 * AI Agent Analysis Response
 */
export interface AIAgentAnalysisResponse {
  agentId: string;
  userId: string;
  analysis: {
    fameScore: number;
    marketPosition: string;
    keyInsights: string[];
    recommendations: string[];
    trendAnalysis: string;
    competitiveAdvantage: string;
    monetizationStrategy: string;
  };
  marketResearch: MarketResearchData;
  growthPlan: {
    nextMonth: string[];
    nextQuarter: string[];
    nextYear: string[];
  };
  pdfUrl?: string;
  generatedAt: string;
}

/**
 * Base API URL for all requests
 * Change this if API endpoint changes
 */
export const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.famechase.com/api"
    : "http://localhost:3000/api"; // Change localhost port if different

/**
 * Helper function to build full API URLs
 */
export function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}
