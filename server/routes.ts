import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { urlSchema } from "@shared/schema";
import axios from "axios";
import * as cheerio from "cheerio";
import { z } from "zod";
import { ZodError } from "zod-validation-error";

// Function to extract and analyze meta tags from a webpage
function extractMetaTags(html: string, url: string) {
  const $ = cheerio.load(html);
  
  // Extract basic meta information
  const title = $('title').text() || '';
  const metaDescription = $('meta[name="description"]').attr('content') || '';
  const canonicalUrl = $('link[rel="canonical"]').attr('href') || '';
  const viewport = $('meta[name="viewport"]').attr('content') || '';
  
  // Extract Open Graph meta tags
  const ogTitle = $('meta[property="og:title"]').attr('content') || '';
  const ogDescription = $('meta[property="og:description"]').attr('content') || '';
  const ogUrl = $('meta[property="og:url"]').attr('content') || '';
  const ogImage = $('meta[property="og:image"]').attr('content') || '';
  const ogType = $('meta[property="og:type"]').attr('content') || '';
  
  // Extract Twitter Card meta tags
  const twitterCard = $('meta[name="twitter:card"]').attr('content') || '';
  const twitterTitle = $('meta[name="twitter:title"]').attr('content') || '';
  const twitterDescription = $('meta[name="twitter:description"]').attr('content') || '';
  const twitterImage = $('meta[name="twitter:image"]').attr('content') || '';
  
  // Extract robots meta tag
  const robots = $('meta[name="robots"]').attr('content') || '';
  
  // Analyze meta tags
  const metaTagsScore = calculateMetaTagsScore(title, metaDescription, canonicalUrl, viewport, ogTitle, ogDescription, ogImage, twitterCard);
  
  // Compile all meta tags
  const metaTags = {
    basic: {
      title: {
        content: title,
        status: title.length > 0 ? (title.length > 70 ? 'too_long' : (title.length < 30 ? 'too_short' : 'good')) : 'missing',
        length: title.length
      },
      description: {
        content: metaDescription,
        status: metaDescription.length > 0 ? (metaDescription.length > 160 ? 'too_long' : (metaDescription.length < 120 ? 'too_short' : 'good')) : 'missing',
        length: metaDescription.length
      },
      canonical: {
        content: canonicalUrl,
        status: canonicalUrl ? 'present' : 'missing'
      },
      viewport: {
        content: viewport,
        status: viewport ? 'present' : 'missing'
      },
      robots: {
        content: robots,
        status: robots ? 'present' : 'missing'
      }
    },
    openGraph: {
      title: {
        content: ogTitle,
        status: ogTitle ? 'present' : 'missing'
      },
      description: {
        content: ogDescription,
        status: ogDescription ? 'present' : 'missing'
      },
      url: {
        content: ogUrl,
        status: ogUrl ? 'present' : 'missing'
      },
      image: {
        content: ogImage,
        status: ogImage ? 'present' : 'missing'
      },
      type: {
        content: ogType,
        status: ogType ? 'present' : 'missing'
      }
    },
    twitter: {
      card: {
        content: twitterCard,
        status: twitterCard ? 'present' : 'missing'
      },
      title: {
        content: twitterTitle,
        status: twitterTitle ? 'present' : 'missing'
      },
      description: {
        content: twitterDescription,
        status: twitterDescription ? 'present' : 'missing'
      },
      image: {
        content: twitterImage,
        status: twitterImage ? 'present' : 'missing'
      }
    },
    score: metaTagsScore
  };
  
  return metaTags;
}

function calculateMetaTagsScore(title: string, description: string, canonical: string, viewport: string, ogTitle: string, ogDescription: string, ogImage: string, twitterCard: string) {
  let score = 0;
  let maxScore = 100;
  
  // Title - 20 points max
  if (title) {
    score += 10; // Title exists
    if (title.length >= 30 && title.length <= 70) {
      score += 10; // Title has optimal length
    } else if (title.length > 0) {
      score += 5; // Title exists but isn't optimal length
    }
  }
  
  // Description - 20 points max
  if (description) {
    score += 10; // Description exists
    if (description.length >= 120 && description.length <= 160) {
      score += 10; // Description has optimal length
    } else if (description.length > 0) {
      score += 5; // Description exists but isn't optimal length
    }
  }
  
  // Canonical - 10 points
  if (canonical) score += 10;
  
  // Viewport - 10 points
  if (viewport) score += 10;
  
  // Open Graph - 20 points max
  if (ogTitle) score += 5;
  if (ogDescription) score += 5;
  if (ogImage) score += 10;
  
  // Twitter Card - 20 points max
  if (twitterCard) score += 10;
  if (twitterCard && (twitterCard === 'summary' || twitterCard === 'summary_large_image')) {
    score += 10; // Optimal Twitter card type
  }
  
  // Calculate final percentage
  return Math.round((score / maxScore) * 100);
}

// Function to extract and analyze headings
function extractHeadings(html: string) {
  const $ = cheerio.load(html);
  
  const headingTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const headings: Record<string, { text: string; count: number }[]> = {};
  
  headingTags.forEach(tag => {
    headings[tag] = [];
    $(tag).each((i, el) => {
      const text = $(el).text().trim();
      headings[tag].push({ text, count: 1 });
    });
  });
  
  // Analyze heading structure
  const h1Count = headings.h1.length;
  const hasLogicalStructure = checkLogicalHeadingStructure(headings);
  
  const headingAnalysis = {
    headings,
    analysis: {
      h1Count,
      hasProperH1: h1Count === 1,
      hasLogicalStructure,
      status: calculateHeadingStatus(h1Count, hasLogicalStructure)
    }
  };
  
  return headingAnalysis;
}

function checkLogicalHeadingStructure(headings: Record<string, { text: string; count: number }[]>) {
  // Basic check: H1 should be followed by H2, then H3, etc. without skipping levels
  // This is a simplified check - a real implementation would be more sophisticated
  if (headings.h1.length !== 1) return false;
  if (headings.h2.length === 0 && (headings.h3.length > 0 || headings.h4.length > 0)) return false;
  if (headings.h3.length > 0 && headings.h2.length === 0) return false;
  
  return true;
}

function calculateHeadingStatus(h1Count: number, hasLogicalStructure: boolean) {
  if (h1Count === 1 && hasLogicalStructure) return 'good';
  if (h1Count === 1 || hasLogicalStructure) return 'needs_improvement';
  return 'poor';
}

// Function to extract and analyze images
function extractImages(html: string, url: string) {
  const $ = cheerio.load(html);
  
  const images: { src: string; alt: string; hasAlt: boolean; size: string | null }[] = [];
  
  $('img').each((i, el) => {
    const src = $(el).attr('src') || '';
    const alt = $(el).attr('alt') || '';
    const hasAlt = alt.length > 0;
    
    // Resolve relative URLs
    const fullSrc = src.startsWith('http') ? src : new URL(src, url).href;
    
    images.push({
      src: fullSrc,
      alt,
      hasAlt,
      size: null // Size would normally be determined by requesting the image, but we'll skip that for simplicity
    });
  });
  
  // Calculate image analysis
  const totalImages = images.length;
  const imagesWithAlt = images.filter(img => img.hasAlt).length;
  const missingAltCount = totalImages - imagesWithAlt;
  
  const imageAnalysis = {
    images,
    analysis: {
      totalImages,
      imagesWithAlt,
      missingAltCount,
      altTextPercentage: totalImages > 0 ? Math.round((imagesWithAlt / totalImages) * 100) : 100,
      status: calculateImageStatus(totalImages, missingAltCount)
    }
  };
  
  return imageAnalysis;
}

function calculateImageStatus(totalImages: number, missingAltCount: number) {
  if (totalImages === 0 || missingAltCount === 0) return 'good';
  if (missingAltCount / totalImages < 0.2) return 'needs_improvement';
  return 'poor';
}

// Function to extract and analyze links
function extractLinks(html: string, url: string) {
  const $ = cheerio.load(html);
  const baseUrl = new URL(url).origin;
  
  const internalLinks: { text: string; url: string; isGeneric: boolean }[] = [];
  const externalLinks: { text: string; url: string; hasRel: boolean }[] = [];
  
  $('a').each((i, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().trim();
    const rel = $(el).attr('rel') || '';
    const isGeneric = isGenericLinkText(text);
    
    // Skip empty or javascript links
    if (!href || href.startsWith('javascript:') || href === '#') return;
    
    // Resolve the full URL
    let fullUrl: string;
    try {
      fullUrl = href.startsWith('http') ? href : new URL(href, url).href;
    } catch (e) {
      // Invalid URL, skip
      return;
    }
    
    // Check if internal or external
    if (fullUrl.startsWith(baseUrl)) {
      internalLinks.push({ text, url: fullUrl, isGeneric });
    } else {
      externalLinks.push({ text, url: fullUrl, hasRel: rel.includes('noopener') || rel.includes('noreferrer') });
    }
  });
  
  // Calculate link analysis
  const totalLinks = internalLinks.length + externalLinks.length;
  const genericInternalLinks = internalLinks.filter(link => link.isGeneric).length;
  const externalLinksWithoutRel = externalLinks.filter(link => !link.hasRel).length;
  
  const linkAnalysis = {
    links: {
      internal: internalLinks,
      external: externalLinks
    },
    analysis: {
      totalLinks,
      internalLinks: internalLinks.length,
      externalLinks: externalLinks.length,
      genericInternalLinks,
      externalLinksWithoutRel,
      status: calculateLinkStatus(internalLinks.length, genericInternalLinks, externalLinks.length, externalLinksWithoutRel)
    }
  };
  
  return linkAnalysis;
}

function isGenericLinkText(text: string) {
  const genericTexts = ['click here', 'read more', 'learn more', 'more info', 'details', 'here'];
  return genericTexts.some(generic => text.toLowerCase().includes(generic));
}

function calculateLinkStatus(internalCount: number, genericInternalCount: number, externalCount: number, externalWithoutRelCount: number) {
  if (internalCount === 0) return 'poor'; // No internal links is bad
  
  // If more than 20% of internal links have generic text, or more than 20% of external links don't have rel attributes
  const genericRatio = internalCount > 0 ? genericInternalCount / internalCount : 0;
  const missingRelRatio = externalCount > 0 ? externalWithoutRelCount / externalCount : 0;
  
  if (genericRatio > 0.2 || missingRelRatio > 0.2) return 'needs_improvement';
  return 'good';
}

// Function to estimate performance
function estimatePerformance(html: string) {
  const $ = cheerio.load(html);
  
  // Count resources by type
  const scriptCount = $('script').length;
  const cssCount = $('link[rel="stylesheet"]').length;
  const imageCount = $('img').length;
  const iframeCount = $('iframe').length;
  
  // Very simple performance estimate based on resource counts
  // In a real implementation, you would use tools like Lighthouse or PageSpeed Insights
  const totalResources = scriptCount + cssCount + imageCount + iframeCount;
  
  // Estimate load time (very rough estimation)
  const baseLoadTime = 0.5; // 500ms base
  const resourceLoadTime = totalResources * 0.1; // 100ms per resource
  const estimatedLoadTime = parseFloat((baseLoadTime + resourceLoadTime).toFixed(1));
  
  const performanceScore = calculatePerformanceScore(totalResources, estimatedLoadTime, scriptCount);
  
  const performanceAnalysis = {
    resources: {
      scripts: scriptCount,
      styles: cssCount,
      images: imageCount,
      iframes: iframeCount,
      total: totalResources
    },
    metrics: {
      estimatedLoadTime: `${estimatedLoadTime}s`,
      estimatedLoadTimeValue: estimatedLoadTime,
      firstContentfulPaint: `${(estimatedLoadTime * 0.6).toFixed(1)}s`, // Simplified estimate
      largestContentfulPaint: `${(estimatedLoadTime * 0.8).toFixed(1)}s`, // Simplified estimate
      cumulativeLayoutShift: "0.12" // Placeholder value
    },
    score: performanceScore
  };
  
  return performanceAnalysis;
}

function calculatePerformanceScore(totalResources: number, loadTime: number, scriptCount: number) {
  // Basic performance score calculation
  // These thresholds are arbitrary for this example
  let score = 100;
  
  // Penalize for high resource count
  if (totalResources > 50) score -= 30;
  else if (totalResources > 30) score -= 20;
  else if (totalResources > 15) score -= 10;
  
  // Penalize for load time
  if (loadTime > 3) score -= 30;
  else if (loadTime > 2) score -= 15;
  else if (loadTime > 1) score -= 5;
  
  // Penalize for script count
  if (scriptCount > 15) score -= 15;
  else if (scriptCount > 10) score -= 10;
  else if (scriptCount > 5) score -= 5;
  
  return Math.max(0, Math.min(100, score));
}

// Function to check mobile friendliness
function checkMobileFriendliness(html: string) {
  const $ = cheerio.load(html);
  
  // Check for viewport meta tag
  const hasViewport = $('meta[name="viewport"]').length > 0;
  
  // Check for responsive design indicators
  const hasMediaQueries = $('style').text().includes('@media');
  const htmlClass = $('html').attr('class') || '';
  const bodyClass = $('body').attr('class') || '';
  const hasResponsiveClasses = htmlClass.includes('responsive') || bodyClass.includes('responsive');
  
  // Calculate mobile score
  const mobileScore = calculateMobileScore(hasViewport, hasMediaQueries, hasResponsiveClasses);
  
  const mobileAnalysis = {
    features: {
      hasViewport,
      hasMediaQueries,
      hasResponsiveIndicators: hasResponsiveClasses
    },
    score: mobileScore
  };
  
  return mobileAnalysis;
}

function calculateMobileScore(hasViewport: boolean, hasMediaQueries: boolean, hasResponsiveClasses: boolean) {
  let score = 0;
  
  // Viewport is essential for mobile-friendly pages
  if (hasViewport) score += 50;
  
  // Media queries indicate responsive design
  if (hasMediaQueries) score += 25;
  
  // Responsive classes suggest framework usage
  if (hasResponsiveClasses) score += 25;
  
  // If no responsive indicators but has viewport, give some credit
  if (!hasMediaQueries && !hasResponsiveClasses && hasViewport) score += 20;
  
  return score;
}

// Function to analyze content
function analyzeContent(html: string) {
  const $ = cheerio.load(html);
  
  // Extract all text content
  const rawText = $('body').text();
  const cleanText = rawText.replace(/\s+/g, ' ').trim();
  
  // Simple content analysis
  const wordCount = cleanText.split(/\s+/).length;
  const paragraphCount = $('p').length;
  
  // Calculate readability (simplified)
  const sentenceCount = cleanText.split(/[.!?]+/).length;
  const avgWordsPerSentence = wordCount / (sentenceCount || 1);
  
  // A very simplified readability score (lower is better)
  const readabilityScore = Math.min(100, Math.max(0, 100 - Math.abs(avgWordsPerSentence - 15) * 3));
  
  const contentScore = calculateContentScore(wordCount, paragraphCount, readabilityScore);
  
  const contentAnalysis = {
    metrics: {
      wordCount,
      paragraphCount,
      readabilityScore,
      avgWordsPerSentence: avgWordsPerSentence.toFixed(1)
    },
    score: contentScore
  };
  
  return contentAnalysis;
}

function calculateContentScore(wordCount: number, paragraphCount: number, readabilityScore: number) {
  let score = 0;
  
  // Word count scoring
  if (wordCount > 1000) score += 30;
  else if (wordCount > 500) score += 20;
  else if (wordCount > 300) score += 10;
  
  // Paragraph count and structure
  if (paragraphCount > 0 && wordCount / paragraphCount < 150) score += 20;
  else if (paragraphCount > 0) score += 10;
  
  // Readability
  score += readabilityScore * 0.5; // Max 50 points for readability
  
  return Math.min(100, score);
}

// Main SEO analysis function
async function analyzeSEO(url: string) {
  try {
    // Fetch the webpage
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEOInspectorBot/1.0)'
      },
      timeout: 10000
    });
    
    const html = response.data;
    
    // Extract and analyze different aspects
    const metaTags = extractMetaTags(html, url);
    const headings = extractHeadings(html);
    const images = extractImages(html, url);
    const links = extractLinks(html, url);
    const performance = estimatePerformance(html);
    const mobile = checkMobileFriendliness(html);
    const content = analyzeContent(html);
    
    // Calculate overall SEO score
    const overallScore = calculateOverallScore(
      metaTags.score,
      headings.analysis.hasProperH1 ? 100 : 50,
      images.analysis.altTextPercentage,
      links.analysis.status === 'good' ? 80 : (links.analysis.status === 'needs_improvement' ? 60 : 40),
      performance.score,
      mobile.score,
      content.score
    );
    
    // Identify critical issues
    const criticalIssues = identifyCriticalIssues(metaTags, headings, images, links, performance);
    
    // Identify strengths and improvement areas
    const strengths = identifyStrengths(metaTags, headings, images, links, performance, mobile, content);
    const improvementAreas = identifyImprovementAreas(metaTags, headings, images, links, performance, mobile, content);
    
    // Create final analysis object
    const analysis = {
      url,
      title: metaTags.basic.title.content || "",
      description: metaTags.basic.description.content || "",
      seoScore: overallScore,
      metaTagsScore: metaTags.score,
      contentScore: content.score, 
      linksScore: links.analysis.status === 'good' ? 80 : (links.analysis.status === 'needs_improvement' ? 60 : 40),
      performanceScore: performance.score,
      mobileScore: mobile.score,
      metaTags,
      headings,
      links,
      images,
      performanceMetrics: performance,
      contentAnalysis: content,
      criticalIssues,
      strengths,
      improvementAreas
    };
    
    return analysis;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error(`Request timeout for URL: ${url}`);
      }
      throw new Error(`Failed to fetch URL (${error.response?.status || 'unknown status'}): ${url}`);
    }
    throw error;
  }
}

function calculateOverallScore(
  metaTagsScore: number,
  headingsScore: number,
  imagesScore: number,
  linksScore: number,
  performanceScore: number,
  mobileScore: number,
  contentScore: number
) {
  // Weight each component
  const weights = {
    metaTags: 0.2,
    headings: 0.1,
    images: 0.1,
    links: 0.15,
    performance: 0.2,
    mobile: 0.15,
    content: 0.1
  };
  
  // Calculate weighted score
  const weightedScore = 
    metaTagsScore * weights.metaTags +
    headingsScore * weights.headings +
    imagesScore * weights.images +
    linksScore * weights.links +
    performanceScore * weights.performance +
    mobileScore * weights.mobile +
    contentScore * weights.content;
  
  return Math.round(weightedScore);
}

function identifyCriticalIssues(metaTags: any, headings: any, images: any, links: any, performance: any) {
  const issues = [];
  
  // Check for missing critical meta tags
  if (!metaTags.basic.title.content) {
    issues.push({
      type: 'meta',
      severity: 'critical',
      title: 'Missing title tag',
      description: 'The title tag is essential for search engines to understand page content.'
    });
  }
  
  if (!metaTags.basic.description.content) {
    issues.push({
      type: 'meta',
      severity: 'critical',
      title: 'Missing meta description',
      description: 'The meta description helps search engines understand your page and can improve click-through rates.'
    });
  }
  
  // Check for missing H1
  if (headings.analysis.h1Count === 0) {
    issues.push({
      type: 'heading',
      severity: 'critical',
      title: 'Missing H1 heading',
      description: 'H1 is a critical element for SEO and should represent the main topic of your page.'
    });
  } else if (headings.analysis.h1Count > 1) {
    issues.push({
      type: 'heading',
      severity: 'warning',
      title: 'Multiple H1 headings',
      description: 'Pages should only have one H1 heading to clearly indicate the main topic.'
    });
  }
  
  // Check for images without alt text
  if (images.analysis.missingAltCount > 0) {
    issues.push({
      type: 'image',
      severity: 'critical',
      title: `Missing alt text on ${images.analysis.missingAltCount} images`,
      description: 'Alt text is essential for accessibility and image SEO.'
    });
  }
  
  // Check for performance issues
  if (performance.score < 50) {
    issues.push({
      type: 'performance',
      severity: 'critical',
      title: 'Slow page performance',
      description: 'Page performance is poor, which can negatively impact user experience and SEO.'
    });
  } else if (performance.metrics.estimatedLoadTimeValue > 3) {
    issues.push({
      type: 'performance',
      severity: 'warning',
      title: 'Slow loading resources',
      description: `Page takes approximately ${performance.metrics.estimatedLoadTime} to load, which may affect user experience.`
    });
  }
  
  return issues;
}

function identifyStrengths(metaTags: any, headings: any, images: any, links: any, performance: any, mobile: any, content: any) {
  const strengths = [];
  
  // Good meta tags
  if (metaTags.score >= 80) {
    strengths.push({
      type: 'meta',
      title: 'Good meta tag implementation',
      description: 'Essential meta tags are well-implemented.'
    });
  } else if (metaTags.basic.title.status === 'good') {
    strengths.push({
      type: 'meta',
      title: 'Proper title tag',
      description: 'The title tag is well-formatted and of optimal length.'
    });
  }
  
  // Good heading structure
  if (headings.analysis.hasProperH1 && headings.analysis.hasLogicalStructure) {
    strengths.push({
      type: 'heading',
      title: 'Proper heading structure',
      description: 'The page has a single H1 and a logical heading hierarchy.'
    });
  }
  
  // Good images
  if (images.analysis.altTextPercentage >= 90) {
    strengths.push({
      type: 'image',
      title: 'Proper image alt text',
      description: 'Most images have descriptive alt text, which is great for accessibility and SEO.'
    });
  }
  
  // Good links
  if (links.analysis.status === 'good') {
    strengths.push({
      type: 'link',
      title: 'Good link structure',
      description: 'Links use descriptive text and external links have proper rel attributes.'
    });
  }
  
  // Good performance
  if (performance.score >= 80) {
    strengths.push({
      type: 'performance',
      title: 'Good page performance',
      description: 'The page loads quickly and efficiently.'
    });
  }
  
  // Good mobile-friendliness
  if (mobile.score >= 80) {
    strengths.push({
      type: 'mobile',
      title: 'Mobile responsive design',
      description: 'The page is well-optimized for mobile devices.'
    });
  }
  
  // Good content
  if (content.score >= 80) {
    strengths.push({
      type: 'content',
      title: 'High-quality content',
      description: 'The content is substantial and well-structured.'
    });
  }
  
  return strengths;
}

function identifyImprovementAreas(metaTags: any, headings: any, images: any, links: any, performance: any, mobile: any, content: any) {
  const improvements = [];
  
  // Meta tag improvements
  if (!metaTags.openGraph.image.content) {
    improvements.push({
      type: 'meta',
      title: 'Add Open Graph image',
      description: 'Add og:image tag for better social media sharing.'
    });
  }
  
  if (metaTags.twitter.card.status === 'missing') {
    improvements.push({
      type: 'meta',
      title: 'Add Twitter Card tags',
      description: 'Implement Twitter Card meta tags for better Twitter sharing.'
    });
  }
  
  // Image improvements
  if (images.analysis.missingAltCount > 0) {
    improvements.push({
      type: 'image',
      title: 'Add missing alt text',
      description: `Add descriptive alt text to ${images.analysis.missingAltCount} images.`
    });
  }
  
  // Link improvements
  if (links.analysis.genericInternalLinks > 0) {
    improvements.push({
      type: 'link',
      title: 'Improve anchor text',
      description: `Replace generic anchor text (like "click here") with descriptive text for ${links.analysis.genericInternalLinks} links.`
    });
  }
  
  // Performance improvements
  if (performance.score < 80) {
    improvements.push({
      type: 'performance',
      title: 'Optimize page load speed',
      description: 'Reduce resource size and number to improve page loading time.'
    });
  }
  
  // Mobile improvements
  if (mobile.score < 80) {
    improvements.push({
      type: 'mobile',
      title: 'Improve mobile friendliness',
      description: 'Enhance the responsive design for better mobile experience.'
    });
  }
  
  // Content improvements
  if (content.metrics.wordCount < 300) {
    improvements.push({
      type: 'content',
      title: 'Add more content',
      description: 'Increase content length to at least 300 words for better search visibility.'
    });
  }
  
  return improvements;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create API route for SEO analysis
  app.post('/api/analyze', async (req, res, next) => {
    try {
      const { url } = req.body;
      
      // Validate URL
      try {
        urlSchema.parse({ url });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ 
            message: "Invalid URL format. Please enter a valid URL including http:// or https://."
          });
        }
      }
      
      // Check if we already have an analysis for this URL
      const existingAnalysis = await storage.getSeoAnalysisByUrl(url);
      
      if (existingAnalysis) {
        return res.json(existingAnalysis);
      }
      
      // Perform SEO analysis
      const analysis = await analyzeSEO(url);
      
      // Save analysis to storage
      const savedAnalysis = await storage.saveSeoAnalysis(analysis);
      
      res.json(savedAnalysis);
    } catch (error) {
      let message = "An error occurred analyzing the URL";
      
      if (error instanceof Error) {
        message = error.message;
      }
      
      res.status(500).json({ message });
    }
  });
  
  // Get recent analyses
  app.get('/api/recent-analyses', async (req, res) => {
    try {
      const recentAnalyses = await storage.getRecentSeoAnalyses(5);
      res.json(recentAnalyses);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve recent analyses" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
