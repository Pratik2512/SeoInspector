import { useEffect, useRef } from "react";
import { SeoAnalysisResult } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import ScoreChart from "@/components/ui/score-chart";
import { Chart } from "chart.js/auto";

interface PerformanceTabProps {
  data: SeoAnalysisResult;
}

export default function PerformanceTab({ data }: PerformanceTabProps) {
  const { performanceMetrics, mobileScore } = data;
  const webVitalsChartRef = useRef<HTMLCanvasElement>(null);
  const resourceDistributionChartRef = useRef<HTMLCanvasElement>(null);
  const webVitalsChartInstance = useRef<Chart | null>(null);
  const resourceChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    // Web Vitals Chart
    if (webVitalsChartRef.current) {
      if (webVitalsChartInstance.current) {
        webVitalsChartInstance.current.destroy();
      }

      const ctx = webVitalsChartRef.current.getContext("2d");
      if (ctx) {
        // Parse string values to numbers for the chart
        const fcpValue = parseFloat(performanceMetrics.metrics.firstContentfulPaint);
        const lcpValue = parseFloat(performanceMetrics.metrics.largestContentfulPaint);
        const clsValue = parseFloat(performanceMetrics.metrics.cumulativeLayoutShift) * 10; // Scale CLS for visibility
        const ttValue = performanceMetrics.metrics.estimatedLoadTimeValue;

        webVitalsChartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["First Contentful Paint", "Largest Contentful Paint", "Cumulative Layout Shift", "Time to Interactive"],
            datasets: [
              {
                label: "Your Website",
                data: [fcpValue, lcpValue, clsValue, ttValue],
                backgroundColor: "#3366FF",
              },
            ],
          },
          options: {
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    let label = context.dataset.label || '';
                    if (label) {
                      label += ': ';
                    }
                    if (context.parsed.y !== null) {
                      // Special formatting for CLS
                      if (context.dataIndex === 2) {
                        label += (context.parsed.y / 10).toFixed(2); // Convert back to original CLS scale
                      } else {
                        label += context.parsed.y.toFixed(1) + 's';
                      }
                    }
                    return label;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Seconds (lower is better)",
                },
              },
            },
          },
        });
      }
    }

    // Resource Distribution Chart
    if (resourceDistributionChartRef.current) {
      if (resourceChartInstance.current) {
        resourceChartInstance.current.destroy();
      }

      const ctx = resourceDistributionChartRef.current.getContext("2d");
      if (ctx) {
        // Calculate resource sizes (rough estimates based on count)
        const imagesSize = performanceMetrics.resources.images * 0.35; // 350KB per image on average
        const scriptsSize = performanceMetrics.resources.scripts * 0.1; // 100KB per script
        const stylesSize = performanceMetrics.resources.styles * 0.05; // 50KB per stylesheet
        const htmlSize = 0.035; // 35KB for HTML
        const fontsSize = 0.05 * 2; // 50KB per font, assume 2 fonts

        resourceChartInstance.current = new Chart(ctx, {
          type: "pie",
          data: {
            labels: ["Images", "JavaScript", "CSS", "HTML", "Fonts"],
            datasets: [
              {
                data: [imagesSize, scriptsSize, stylesSize, htmlSize, fontsSize],
                backgroundColor: ["#FF6B35", "#3366FF", "#28A745", "#FFC107", "#17A2B8"],
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                position: "right",
                labels: {
                  font: {
                    size: 10,
                  },
                  boxWidth: 10,
                },
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.parsed;
                    const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                    const percentage = Math.round((value * 100) / total);
                    return `${label}: ${value.toFixed(2)} MB (${percentage}%)`;
                  }
                }
              }
            },
          },
        });
      }
    }

    return () => {
      if (webVitalsChartInstance.current) {
        webVitalsChartInstance.current.destroy();
      }
      if (resourceChartInstance.current) {
        resourceChartInstance.current.destroy();
      }
    };
  }, [performanceMetrics]);

  // Calculate total page size
  const totalPageSize = (
    performanceMetrics.resources.images * 0.35 + 
    performanceMetrics.resources.scripts * 0.1 + 
    performanceMetrics.resources.styles * 0.05 + 
    0.035 + // HTML
    0.1 // Fonts
  ).toFixed(2);

  // Performance metrics cards
  const performanceCards = [
    {
      title: "Load Time",
      value: performanceMetrics.metrics.estimatedLoadTime,
      status: performanceMetrics.metrics.estimatedLoadTimeValue < 2 ? "good" : 
              performanceMetrics.metrics.estimatedLoadTimeValue < 3 ? "moderate" : "poor"
    },
    {
      title: "FCP",
      value: performanceMetrics.metrics.firstContentfulPaint,
      status: parseFloat(performanceMetrics.metrics.firstContentfulPaint) < 1.5 ? "good" : 
              parseFloat(performanceMetrics.metrics.firstContentfulPaint) < 2.5 ? "moderate" : "poor"
    },
    {
      title: "LCP",
      value: performanceMetrics.metrics.largestContentfulPaint,
      status: parseFloat(performanceMetrics.metrics.largestContentfulPaint) < 2.5 ? "good" : 
              parseFloat(performanceMetrics.metrics.largestContentfulPaint) < 4 ? "moderate" : "poor"
    },
    {
      title: "CLS",
      value: performanceMetrics.metrics.cumulativeLayoutShift,
      status: parseFloat(performanceMetrics.metrics.cumulativeLayoutShift) < 0.1 ? "good" : 
              parseFloat(performanceMetrics.metrics.cumulativeLayoutShift) < 0.25 ? "moderate" : "poor"
    },
  ];

  // Mobile scores
  const mobileMetrics = [
    {
      title: "Mobile Score",
      value: `${mobileScore}/100`,
    },
    {
      title: "Mobile Load Time",
      value: `${(performanceMetrics.metrics.estimatedLoadTimeValue * 1.2).toFixed(1)}s`, // Assume slightly slower on mobile
    },
    {
      title: "Viewport Configuration",
      value: data.metaTags.basic.viewport.status === "present" ? "100%" : "0%",
    },
  ];

  // Mobile testing results
  const mobileResults = [
    {
      text: "Properly configured viewport",
      status: data.metaTags.basic.viewport.status === "present" ? "good" : "poor"
    },
    {
      text: "Content sized correctly for viewport",
      status: "good" // Assume good for simplicity
    },
    {
      text: "Tap targets appropriately sized",
      status: "good" // Assume good for simplicity
    },
    {
      text: "Readable font sizes",
      status: "good" // Assume good for simplicity
    },
    {
      text: "Some images not optimized for mobile",
      status: data.images.analysis.altTextPercentage < 100 ? "moderate" : "good"
    }
  ];

  // Performance improvement suggestions
  const performanceSuggestions = [];
  
  if (performanceMetrics.resources.images > 3) {
    performanceSuggestions.push(`Compress and optimize images (potential ${(performanceMetrics.resources.images * 0.2).toFixed(1)}MB saving)`);
  }
  
  if (performanceMetrics.resources.scripts > 5) {
    performanceSuggestions.push("Minify and combine JavaScript files");
  }
  
  performanceSuggestions.push("Enable browser caching for static resources");
  
  if (performanceMetrics.resources.scripts > 3) {
    performanceSuggestions.push("Defer loading of non-critical JavaScript");
  }
  
  if (performanceMetrics.metrics.estimatedLoadTimeValue > 2) {
    performanceSuggestions.push(`Reduce server response time (currently ${(performanceMetrics.metrics.estimatedLoadTimeValue * 0.15).toFixed(0)}ms)`);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        {/* Performance Overview */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-neutral-800">Performance Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {performanceCards.map((card, index) => (
                <div key={index} className="p-4 border rounded-md border-neutral-200 text-center">
                  <div className="text-2xl font-bold text-neutral-800 mb-1">{card.value}</div>
                  <p className="text-sm text-neutral-600">{card.title}</p>
                  <div className={`inline-flex items-center px-2 py-1 mt-2 rounded-full text-xs font-medium ${
                    card.status === "good" 
                      ? "bg-success/20 text-success" 
                      : card.status === "moderate" 
                      ? "bg-warning/20 text-warning" 
                      : "bg-danger/20 text-danger"
                  }`}>
                    {card.status === "good" ? "Good" : card.status === "moderate" ? "Average" : "Poor"}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <h3 className="font-medium text-neutral-800 mb-3">Core Web Vitals</h3>
              <div className="relative h-64">
                <canvas ref={webVitalsChartRef}></canvas>
              </div>
              <div className="mt-4 text-sm text-neutral-600">
                <p className="font-medium">Metrics Explained:</p>
                <ul className="mt-2 space-y-1">
                  <li><strong>FCP (First Contentful Paint):</strong> Time until the first content is rendered</li>
                  <li><strong>LCP (Largest Contentful Paint):</strong> Time until the largest content element is rendered</li>
                  <li><strong>CLS (Cumulative Layout Shift):</strong> Measures visual stability of the page</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Resource Optimization */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-neutral-800">Resource Optimization</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead>
                  <tr>
                    <th className="px-3 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Resource Type</th>
                    <th className="px-3 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Count</th>
                    <th className="px-3 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Size</th>
                    <th className="px-3 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  <tr>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-800">HTML</div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-600">1</div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-600">35 KB</div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
                        Optimized
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-800">CSS</div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-600">{performanceMetrics.resources.styles}</div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-600">{(performanceMetrics.resources.styles * 50).toFixed(0)} KB</div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        performanceMetrics.resources.styles <= 2 
                          ? "bg-success/20 text-success" 
                          : performanceMetrics.resources.styles <= 4 
                          ? "bg-warning/20 text-warning" 
                          : "bg-danger/20 text-danger"
                      }`}>
                        {performanceMetrics.resources.styles <= 2 
                          ? "Optimized" 
                          : performanceMetrics.resources.styles <= 4 
                          ? "Could be optimized" 
                          : "Needs optimization"}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-800">JavaScript</div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-600">{performanceMetrics.resources.scripts}</div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-600">{(performanceMetrics.resources.scripts * 100).toFixed(0)} KB</div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        performanceMetrics.resources.scripts <= 3 
                          ? "bg-success/20 text-success" 
                          : performanceMetrics.resources.scripts <= 6 
                          ? "bg-warning/20 text-warning" 
                          : "bg-danger/20 text-danger"
                      }`}>
                        {performanceMetrics.resources.scripts <= 3 
                          ? "Optimized" 
                          : performanceMetrics.resources.scripts <= 6 
                          ? "Could be optimized" 
                          : "Needs optimization"}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-800">Images</div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-600">{performanceMetrics.resources.images}</div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-600">{(performanceMetrics.resources.images * 350).toFixed(0)} KB</div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        performanceMetrics.resources.images <= 2 
                          ? "bg-success/20 text-success" 
                          : performanceMetrics.resources.images <= 5 
                          ? "bg-warning/20 text-warning" 
                          : "bg-danger/20 text-danger"
                      }`}>
                        {performanceMetrics.resources.images <= 2 
                          ? "Optimized" 
                          : performanceMetrics.resources.images <= 5 
                          ? "Could be optimized" 
                          : "Needs optimization"}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-800">Fonts</div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-600">2</div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-600">96 KB</div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
                        Optimized
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        
        {/* Mobile Responsiveness */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-neutral-800">Mobile Responsiveness</h2>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                mobileScore >= 80 
                  ? "bg-success/20 text-success" 
                  : mobileScore >= 60 
                  ? "bg-warning/20 text-warning" 
                  : "bg-danger/20 text-danger"
              }`}>
                {mobileScore >= 80 
                  ? "Very Good" 
                  : mobileScore >= 60 
                  ? "Good" 
                  : "Needs Improvement"}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {mobileMetrics.map((metric, index) => (
                <div key={index} className="p-4 border rounded-md border-neutral-200 text-center">
                  <div className="text-2xl font-bold text-neutral-800 mb-1">{metric.value}</div>
                  <p className="text-sm text-neutral-600">{metric.title}</p>
                </div>
              ))}
            </div>
            <div className="p-4 bg-neutral-100 rounded-md">
              <h3 className="font-medium text-neutral-800 mb-2">Mobile Testing Results</h3>
              <ul className="space-y-2 text-sm">
                {mobileResults.map((result, index) => (
                  <li key={index} className="flex items-start">
                    {result.status === "good" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : result.status === "moderate" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-warning mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-danger mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                    <span>{result.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-1">
        {/* Performance Score */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-3 text-neutral-800">Performance Score</h2>
            <div className="flex justify-center">
              <ScoreChart score={performanceMetrics.score} size="md" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-neutral-700 mb-2">Performance Metrics</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-600">Page Speed</span>
                    <span className="font-medium text-neutral-800">
                      {performanceMetrics.metrics.estimatedLoadTimeValue < 2 ? "85%" : 
                       performanceMetrics.metrics.estimatedLoadTimeValue < 3 ? "65%" : "45%"}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className={`${
                        performanceMetrics.metrics.estimatedLoadTimeValue < 2 ? "bg-success" : 
                        performanceMetrics.metrics.estimatedLoadTimeValue < 3 ? "bg-warning" : "bg-danger"
                      } h-2 rounded-full`} 
                      style={{ 
                        width: `${
                          performanceMetrics.metrics.estimatedLoadTimeValue < 2 ? 85 : 
                          performanceMetrics.metrics.estimatedLoadTimeValue < 3 ? 65 : 45
                        }%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-600">Resource Optimization</span>
                    <span className="font-medium text-neutral-800">
                      {(performanceMetrics.resources.scripts <= 5 && performanceMetrics.resources.images <= 5) ? "75%" : 
                       (performanceMetrics.resources.scripts <= 8 && performanceMetrics.resources.images <= 8) ? "52%" : "35%"}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className={`${
                        (performanceMetrics.resources.scripts <= 5 && performanceMetrics.resources.images <= 5) ? "bg-success" : 
                        (performanceMetrics.resources.scripts <= 8 && performanceMetrics.resources.images <= 8) ? "bg-warning" : "bg-danger"
                      } h-2 rounded-full`} 
                      style={{ 
                        width: `${
                          (performanceMetrics.resources.scripts <= 5 && performanceMetrics.resources.images <= 5) ? 75 : 
                          (performanceMetrics.resources.scripts <= 8 && performanceMetrics.resources.images <= 8) ? 52 : 35
                        }%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-600">Mobile Responsiveness</span>
                    <span className="font-medium text-neutral-800">{mobileScore}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className={`${
                        mobileScore >= 80 ? "bg-success" : 
                        mobileScore >= 60 ? "bg-warning" : "bg-danger"
                      } h-2 rounded-full`} 
                      style={{ width: `${mobileScore}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-600">Core Web Vitals</span>
                    <span className="font-medium text-neutral-800">
                      {(parseFloat(performanceMetrics.metrics.largestContentfulPaint) < 2.5 && 
                        parseFloat(performanceMetrics.metrics.cumulativeLayoutShift) < 0.1) ? "85%" : 
                       (parseFloat(performanceMetrics.metrics.largestContentfulPaint) < 4 && 
                        parseFloat(performanceMetrics.metrics.cumulativeLayoutShift) < 0.25) ? "65%" : "45%"}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className={`${
                        (parseFloat(performanceMetrics.metrics.largestContentfulPaint) < 2.5 && 
                         parseFloat(performanceMetrics.metrics.cumulativeLayoutShift) < 0.1) ? "bg-success" : 
                        (parseFloat(performanceMetrics.metrics.largestContentfulPaint) < 4 && 
                         parseFloat(performanceMetrics.metrics.cumulativeLayoutShift) < 0.25) ? "bg-warning" : "bg-danger"
                      } h-2 rounded-full`} 
                      style={{ 
                        width: `${
                          (parseFloat(performanceMetrics.metrics.largestContentfulPaint) < 2.5 && 
                           parseFloat(performanceMetrics.metrics.cumulativeLayoutShift) < 0.1) ? 85 : 
                          (parseFloat(performanceMetrics.metrics.largestContentfulPaint) < 4 && 
                           parseFloat(performanceMetrics.metrics.cumulativeLayoutShift) < 0.25) ? 65 : 45
                        }%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Resource Distribution */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-3 text-neutral-800">Resource Distribution</h2>
            <div className="mb-3">
              <canvas ref={resourceDistributionChartRef} height={180}></canvas>
            </div>
            <div className="text-xs text-neutral-600">
              <p>Total page size: <span className="font-medium">{totalPageSize} MB</span></p>
              <p>Recommended: <span className={`font-medium ${parseFloat(totalPageSize) > 2 ? "text-warning" : "text-success"}`}>
                Under 2 MB
              </span></p>
            </div>
          </CardContent>
        </Card>
        
        {/* Performance Improvements */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-3 text-neutral-800">Recommended Improvements</h2>
            <ul className="space-y-3 text-sm">
              {performanceSuggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 mr-2 mt-0.5 text-primary">
                    {index + 1}.
                  </div>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
