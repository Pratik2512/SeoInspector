export interface SeoAnalysisResult {
  id: number;
  url: string;
  title: string;
  description: string;
  seoScore: number;
  metaTagsScore: number;
  contentScore: number;
  linksScore: number;
  performanceScore: number;
  mobileScore: number;
  metaTags: {
    basic: {
      title: { content: string; status: string; length: number };
      description: { content: string; status: string; length: number };
      canonical: { content: string; status: string };
      viewport: { content: string; status: string };
      robots: { content: string; status: string };
    };
    openGraph: {
      title: { content: string; status: string };
      description: { content: string; status: string };
      url: { content: string; status: string };
      image: { content: string; status: string };
      type: { content: string; status: string };
    };
    twitter: {
      card: { content: string; status: string };
      title: { content: string; status: string };
      description: { content: string; status: string };
      image: { content: string; status: string };
    };
    score: number;
  };
  headings: {
    headings: Record<string, { text: string; count: number }[]>;
    analysis: {
      h1Count: number;
      hasProperH1: boolean;
      hasLogicalStructure: boolean;
      status: string;
    };
  };
  links: {
    links: {
      internal: { text: string; url: string; isGeneric: boolean }[];
      external: { text: string; url: string; hasRel: boolean }[];
    };
    analysis: {
      totalLinks: number;
      internalLinks: number;
      externalLinks: number;
      genericInternalLinks: number;
      externalLinksWithoutRel: number;
      status: string;
    };
  };
  images: {
    images: { src: string; alt: string; hasAlt: boolean; size: string | null }[];
    analysis: {
      totalImages: number;
      imagesWithAlt: number;
      missingAltCount: number;
      altTextPercentage: number;
      status: string;
    };
  };
  performanceMetrics: {
    resources: {
      scripts: number;
      styles: number;
      images: number;
      iframes: number;
      total: number;
    };
    metrics: {
      estimatedLoadTime: string;
      estimatedLoadTimeValue: number;
      firstContentfulPaint: string;
      largestContentfulPaint: string;
      cumulativeLayoutShift: string;
    };
    score: number;
  };
  contentAnalysis: {
    metrics: {
      wordCount: number;
      paragraphCount: number;
      readabilityScore: number;
      avgWordsPerSentence: string;
    };
    score: number;
  };
  criticalIssues: Array<{
    type: string;
    severity: string;
    title: string;
    description: string;
  }>;
  strengths: Array<{
    type: string;
    title: string;
    description: string;
  }>;
  improvementAreas: Array<{
    type: string;
    title: string;
    description: string;
  }>;
  createdAt?: Date;
}

export interface UrlForm {
  url: string;
}

export type TabType = 'overview' | 'meta-tags' | 'content' | 'links' | 'speed' | 'previews';

export interface MetricCard {
  title: string;
  value: string | number;
  description: string;
  status: 'good' | 'moderate' | 'poor';
  percentage: number;
}

export interface StatusBadgeProps {
  status: 'good' | 'moderate' | 'poor';
  text?: string;
}

export interface SeverityLevel {
  icon: string;
  color: string;
}

export type SeverityType = 'critical' | 'warning' | 'info';

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string | string[];
    borderColor?: string;
    borderWidth?: number;
    [key: string]: any;
  }[];
}
