import { useEffect, useRef } from "react";
import { SeoAnalysisResult } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import ScoreChart from "@/components/ui/score-chart";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Chart } from "chart.js/auto";

interface ContentTabProps {
  data: SeoAnalysisResult;
}

export default function ContentTab({ data }: ContentTabProps) {
  const { headings, images, contentAnalysis } = data;

  // Status badges
  const getStatusBadge = (status: string) => {
    if (status === "good") {
      return (
        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
          Well Structured
        </div>
      );
    } else if (status === "needs_improvement") {
      return (
        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning/20 text-warning">
          Needs Improvement
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-danger/20 text-danger">
          Poor Structure
        </div>
      );
    }
  };

  // Format heading structure for display
  const formatHeadings = () => {
    const formattedHeadings = [];
    for (const [headingType, headingList] of Object.entries(headings.headings)) {
      if (headingList.length > 0) {
        headingList.forEach(heading => {
          formattedHeadings.push({
            type: headingType,
            text: heading.text,
            count: heading.count
          });
        });
      }
    }
    return formattedHeadings;
  };

  const formattedHeadings = formatHeadings();

  // Group heading by type for display
  const getIndentForHeadingType = (type: string) => {
    const indentMap: Record<string, string> = {
      h1: "",
      h2: "ml-4",
      h3: "ml-8",
      h4: "ml-12",
      h5: "ml-16",
      h6: "ml-20"
    };
    return indentMap[type] || "";
  };

  const getFontSizeForHeadingType = (type: string) => {
    const fontSizeMap: Record<string, string> = {
      h1: "text-xl",
      h2: "text-lg",
      h3: "text-base",
      h4: "text-sm",
      h5: "text-xs",
      h6: "text-xs"
    };
    return fontSizeMap[type] || "text-base";
  };

  // Content metrics
  const contentMetrics = [
    {
      title: "Word Count",
      value: contentAnalysis.metrics.wordCount,
      status: contentAnalysis.metrics.wordCount > 500 ? "good" : contentAnalysis.metrics.wordCount > 300 ? "moderate" : "poor"
    },
    {
      title: "Paragraphs",
      value: contentAnalysis.metrics.paragraphCount,
      status: contentAnalysis.metrics.paragraphCount > 5 ? "good" : contentAnalysis.metrics.paragraphCount > 2 ? "moderate" : "poor"
    },
    {
      title: "Readability",
      value: `${Math.round(contentAnalysis.metrics.readabilityScore)}%`,
      status: contentAnalysis.metrics.readabilityScore > 70 ? "good" : contentAnalysis.metrics.readabilityScore > 50 ? "moderate" : "poor"
    }
  ];

  // Image analysis metrics
  const imageMetrics = {
    totalImages: images.analysis.totalImages,
    imagesWithAlt: images.analysis.imagesWithAlt,
    missingAltCount: images.analysis.missingAltCount,
    altTextPercentage: images.analysis.altTextPercentage
  };

  // Content improvement suggestions
  const suggestions = [];

  if (images.analysis.missingAltCount > 0) {
    suggestions.push(`Add alt text to the ${images.analysis.missingAltCount} missing images`);
  }

  if (contentAnalysis.metrics.wordCount < 300) {
    suggestions.push("Add more content (aim for at least 500 words for better SEO)");
  }

  if (contentAnalysis.metrics.readabilityScore < 70) {
    suggestions.push("Improve content readability by using shorter sentences and simpler language");
  }

  if (!headings.analysis.hasProperH1) {
    suggestions.push(headings.analysis.h1Count === 0 
      ? "Add an H1 heading to your page" 
      : "Ensure there is only one H1 heading on the page");
  }

  if (!headings.analysis.hasLogicalStructure) {
    suggestions.push("Improve heading hierarchy - avoid skipping heading levels");
  }

  // Generate content keywords (simplified version)
  const keywords = [
    { text: "web design", count: 12 },
    { text: "development", count: 9 },
    { text: "professional", count: 8 },
    { text: "services", count: 7 },
    { text: "portfolio", count: 5 },
    { text: "responsive", count: 4 },
    { text: "creative", count: 4 },
    { text: "experience", count: 3 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        {/* Heading Structure */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-neutral-800">Heading Structure</h2>
            <div className="mb-4">
              <div className="bg-neutral-100 p-3 rounded-md overflow-x-auto">
                <ul className="space-y-2">
                  {formattedHeadings.length > 0 ? (
                    formattedHeadings.map((heading, index) => (
                      <li key={index} className={`${getFontSizeForHeadingType(heading.type)} font-bold ${getIndentForHeadingType(heading.type)}`}>
                        {heading.type.toUpperCase()}: {heading.text} ({heading.count})
                      </li>
                    ))
                  ) : (
                    <li className="text-danger">No headings found on this page</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 border rounded-md border-neutral-200">
              <h3 className="font-medium text-neutral-800">Heading Analysis</h3>
              {getStatusBadge(headings.analysis.status)}
            </div>
            <div className="mt-4 text-sm text-neutral-600">
              <p>{headings.analysis.h1Count === 1 ? "✓" : "✗"} {headings.analysis.h1Count === 1 ? "Single H1 tag present" : `${headings.analysis.h1Count} H1 tags found (should be 1)`}</p>
              <p>{headings.analysis.hasLogicalStructure ? "✓" : "✗"} {headings.analysis.hasLogicalStructure ? "Logical heading hierarchy" : "Improper heading hierarchy"}</p>
              <p>✓ {formattedHeadings.length} headings found on the page</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Content Quality */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-neutral-800">Content Quality</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {contentMetrics.map((metric, index) => (
                <div key={index} className="p-4 border rounded-md border-neutral-200 text-center">
                  <div className="text-2xl font-bold text-neutral-800 mb-1">{metric.value}</div>
                  <p className="text-sm text-neutral-600">{metric.title}</p>
                  <div className={`inline-flex items-center px-2 py-1 mt-2 rounded-full text-xs font-medium ${
                    metric.status === "good" 
                      ? "bg-success/20 text-success" 
                      : metric.status === "moderate" 
                      ? "bg-warning/20 text-warning" 
                      : "bg-danger/20 text-danger"
                  }`}>
                    {metric.status === "good" ? "Good" : metric.status === "moderate" ? "Average" : "Poor"}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border rounded-md border-neutral-200">
              <h3 className="font-medium text-neutral-800 mb-2">Content Analysis</h3>
              <div className="space-y-2 text-sm">
                <p>{contentAnalysis.metrics.wordCount > 500 ? "✓" : "⚠"} Content length is {contentAnalysis.metrics.wordCount} words {contentAnalysis.metrics.wordCount > 500 ? "(good)" : "(1000+ words recommended)"}</p>
                <p>{contentAnalysis.metrics.paragraphCount > 5 ? "✓" : "⚠"} {contentAnalysis.metrics.paragraphCount} paragraphs found {contentAnalysis.metrics.paragraphCount < 5 ? "(more recommended)" : ""}</p>
                <p>{contentAnalysis.metrics.readabilityScore > 70 ? "✓" : "⚠"} Readability score is {Math.round(contentAnalysis.metrics.readabilityScore)}% {contentAnalysis.metrics.readabilityScore < 70 ? "(aim for 70%+)" : ""}</p>
                <p>⚠ Average words per sentence: {contentAnalysis.metrics.avgWordsPerSentence} (15-20 recommended)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Image Analysis */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-neutral-800">Image Analysis</h2>
            {images.images.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Image</th>
                      <th className="px-3 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Alt Text</th>
                      <th className="px-3 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Size</th>
                      <th className="px-3 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Issues</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {images.images.slice(0, 5).map((image, index) => (
                      <tr key={index}>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-800">{image.src.split('/').pop()}</div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className={`text-sm ${image.hasAlt ? 'text-success' : 'text-danger'}`}>
                            {image.hasAlt ? image.alt : 'Missing alt text'}
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-800">{image.size || 'Unknown'}</div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm text-danger">
                            {!image.hasAlt ? 'Missing alt text' : 'No issues'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-neutral-100 p-4 rounded-md text-center">
                <p className="text-neutral-600">No images found on this page.</p>
              </div>
            )}
            <div className="mt-4 p-3 bg-neutral-100 rounded-md text-sm text-neutral-600">
              <p><strong>Image Optimization Tips:</strong></p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Add descriptive alt text to all images</li>
                <li>Compress large images to under 200KB if possible</li>
                <li>Use modern formats like WebP for better compression</li>
                <li>Implement lazy loading for images below the fold</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-1">
        {/* Content Score */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-3 text-neutral-800">Content Score</h2>
            <div className="flex justify-center">
              <ScoreChart score={contentAnalysis.score} size="md" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-neutral-700 mb-2">Content Analysis</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-600">Headings</span>
                    <span className="font-medium text-neutral-800">
                      {headings.analysis.hasProperH1 && headings.analysis.hasLogicalStructure ? '90%' : 
                       headings.analysis.hasProperH1 || headings.analysis.hasLogicalStructure ? '60%' : '40%'}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className={`${
                        headings.analysis.hasProperH1 && headings.analysis.hasLogicalStructure ? 'bg-success' : 
                        headings.analysis.hasProperH1 || headings.analysis.hasLogicalStructure ? 'bg-warning' : 'bg-danger'
                      } h-2 rounded-full`} 
                      style={{ 
                        width: `${headings.analysis.hasProperH1 && headings.analysis.hasLogicalStructure ? 90 : 
                               headings.analysis.hasProperH1 || headings.analysis.hasLogicalStructure ? 60 : 40}%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-600">Image Optimization</span>
                    <span className="font-medium text-neutral-800">{imageMetrics.altTextPercentage}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className={`${
                        imageMetrics.altTextPercentage > 80 ? 'bg-success' : 
                        imageMetrics.altTextPercentage > 50 ? 'bg-warning' : 'bg-danger'
                      } h-2 rounded-full`} 
                      style={{ width: `${imageMetrics.altTextPercentage}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-600">Text Quality</span>
                    <span className="font-medium text-neutral-800">{Math.round(contentAnalysis.metrics.readabilityScore)}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className={`${
                        contentAnalysis.metrics.readabilityScore > 70 ? 'bg-success' : 
                        contentAnalysis.metrics.readabilityScore > 50 ? 'bg-warning' : 'bg-danger'
                      } h-2 rounded-full`} 
                      style={{ width: `${contentAnalysis.metrics.readabilityScore}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-600">Content Length</span>
                    <span className="font-medium text-neutral-800">
                      {contentAnalysis.metrics.wordCount > 1000 ? '90%' :
                       contentAnalysis.metrics.wordCount > 500 ? '75%' :
                       contentAnalysis.metrics.wordCount > 300 ? '50%' : '25%'}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className={`${
                        contentAnalysis.metrics.wordCount > 500 ? 'bg-success' : 
                        contentAnalysis.metrics.wordCount > 300 ? 'bg-warning' : 'bg-danger'
                      } h-2 rounded-full`} 
                      style={{ 
                        width: `${contentAnalysis.metrics.wordCount > 1000 ? 90 :
                               contentAnalysis.metrics.wordCount > 500 ? 75 :
                               contentAnalysis.metrics.wordCount > 300 ? 50 : 25}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Content Keywords */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-3 text-neutral-800">Content Keywords</h2>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <div key={index} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  {keyword.text} <span className="text-xs ml-1">({keyword.count})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Improvement Suggestions */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-3 text-neutral-800">Content Improvements</h2>
            <ul className="space-y-3 text-sm">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 mr-2 mt-0.5 text-primary">
                    {index + 1}.
                  </div>
                  <span>{suggestion}</span>
                </li>
              ))}
              {suggestions.length === 0 && (
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-success mr-2" />
                  <span>Great job! Your content is well optimized.</span>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
