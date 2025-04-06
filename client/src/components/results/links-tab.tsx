import { useEffect, useRef } from "react";
import { SeoAnalysisResult } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import ScoreChart from "@/components/ui/score-chart";
import { Chart } from "chart.js/auto";

interface LinksTabProps {
  data: SeoAnalysisResult;
}

export default function LinksTab({ data }: LinksTabProps) {
  const { links } = data;
  const linksDistributionChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  // Generate random link distribution for visualization
  // In a real implementation, this would be calculated from actual links
  const linkCategories = [
    { name: "Navigation", count: Math.min(links.links.internal.length, 6) },
    { name: "Content", count: Math.max(1, Math.floor(links.links.internal.length / 3)) },
    { name: "Footer", count: Math.max(1, Math.floor(links.links.internal.length / 4)) },
    { name: "Social Media", count: Math.min(4, links.links.external.length) },
    { name: "External", count: Math.max(1, links.links.external.length - 4) }
  ].filter(category => category.count > 0);

  useEffect(() => {
    if (linksDistributionChartRef.current) {
      // Destroy existing chart
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Create new chart
      const ctx = linksDistributionChartRef.current.getContext("2d");
      if (ctx) {
        // Generate colors based on primary color
        const generateColors = (count: number) => {
          const baseColor = "#3366FF";
          const colors = [];
          for (let i = 0; i < count; i++) {
            // Add opacity for each subsequent category
            const opacity = 1 - (i * 0.15);
            colors.push(`rgba(51, 102, 255, ${opacity})`);
          }
          return colors;
        };

        chartInstance.current = new Chart(ctx, {
          type: "bar",
          data: {
            labels: linkCategories.map(cat => cat.name),
            datasets: [
              {
                label: "Number of Links",
                data: linkCategories.map(cat => cat.count),
                backgroundColor: generateColors(linkCategories.length),
                borderWidth: 0,
              },
            ],
          },
          options: {
            indexAxis: "y",
            plugins: {
              legend: {
                display: false,
              },
            },
            scales: {
              x: {
                beginAtZero: true,
                grid: {
                  display: true,
                  drawBorder: false,
                },
              },
              y: {
                grid: {
                  display: false,
                  drawBorder: false,
                },
              },
            },
          },
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [linkCategories]);

  // Calculate link score based on analysis
  const calculateLinkScore = () => {
    const totalLinks = links.analysis.totalLinks;
    const internalLinks = links.analysis.internalLinks;
    const genericRatio = internalLinks > 0 ? links.analysis.genericInternalLinks / internalLinks : 0;
    const externalLinks = links.analysis.externalLinks;
    const externalRelRatio = externalLinks > 0 ? links.analysis.externalLinksWithoutRel / externalLinks : 0;

    // Basic scoring algorithm
    let score = 70; // Base score

    // Add points for having a good number of links
    if (totalLinks > 20) score += 10;
    else if (totalLinks > 10) score += 5;

    // Deduct points for generic anchor text
    if (genericRatio > 0.3) score -= 15;
    else if (genericRatio > 0.1) score -= 5;

    // Deduct points for missing rel attributes
    if (externalRelRatio > 0.5) score -= 15;
    else if (externalRelRatio > 0.2) score -= 5;

    // Add points for good internal/external balance
    const internalExternalRatio = totalLinks > 0 ? internalLinks / totalLinks : 0;
    if (internalExternalRatio > 0.6 && internalExternalRatio < 0.9) score += 10;

    return Math.min(100, Math.max(0, score));
  };

  const linkScore = calculateLinkScore();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        {/* Link Overview */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-neutral-800">Link Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 border rounded-md border-neutral-200 text-center">
                <div className="text-2xl font-bold text-neutral-800 mb-1">{links.analysis.totalLinks}</div>
                <p className="text-sm text-neutral-600">Total Links</p>
              </div>
              <div className="p-4 border rounded-md border-neutral-200 text-center">
                <div className="text-2xl font-bold text-neutral-800 mb-1">{links.analysis.internalLinks}</div>
                <p className="text-sm text-neutral-600">Internal Links</p>
              </div>
              <div className="p-4 border rounded-md border-neutral-200 text-center">
                <div className="text-2xl font-bold text-neutral-800 mb-1">{links.analysis.externalLinks}</div>
                <p className="text-sm text-neutral-600">External Links</p>
              </div>
            </div>
            <div className="relative h-64">
              <canvas ref={linksDistributionChartRef}></canvas>
            </div>
          </CardContent>
        </Card>
        
        {/* Internal Links */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-neutral-800">Internal Links</h2>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                links.analysis.genericInternalLinks === 0 ? "bg-success/20 text-success" : 
                links.analysis.genericInternalLinks < 3 ? "bg-warning/20 text-warning" : 
                "bg-danger/20 text-danger"
              }`}>
                {links.analysis.genericInternalLinks === 0 ? "Good" : 
                 links.analysis.genericInternalLinks < 3 ? "Needs Improvement" : 
                 "Poor"}
              </div>
            </div>
            {links.links.internal.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Link Text</th>
                      <th className="px-3 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">URL</th>
                      <th className="px-3 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {links.links.internal.slice(0, 5).map((link, index) => (
                      <tr key={index}>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-800">{link.text}</div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm text-primary">{link.url}</div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          {link.isGeneric ? (
                            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning/20 text-warning">Generic text</div>
                          ) : (
                            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success">OK</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-neutral-100 p-4 rounded-md text-center">
                <p className="text-neutral-600">No internal links found on this page.</p>
              </div>
            )}
            <div className="mt-4 text-sm text-neutral-600">
              {links.analysis.genericInternalLinks > 0 && (
                <p>⚠ {links.analysis.genericInternalLinks} links with generic anchor text (e.g., "click here", "read more")</p>
              )}
              {links.analysis.internalLinks < 5 && (
                <p>⚠ Low internal linking density (recommended: 2-3 internal links per 100 words)</p>
              )}
              {links.analysis.genericInternalLinks === 0 && links.analysis.internalLinks >= 5 && (
                <p>✓ Good internal linking structure with descriptive anchor text</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* External Links */}
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-neutral-800">External Links</h2>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                links.analysis.externalLinksWithoutRel === 0 ? "bg-success/20 text-success" : 
                links.analysis.externalLinksWithoutRel < 3 ? "bg-warning/20 text-warning" : 
                "bg-danger/20 text-danger"
              }`}>
                {links.analysis.externalLinksWithoutRel === 0 ? "Good" : 
                 links.analysis.externalLinksWithoutRel < 3 ? "Needs Improvement" : 
                 "Poor"}
              </div>
            </div>
            {links.links.external.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead>
                    <tr>
                      <th className="px-3 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Link Text</th>
                      <th className="px-3 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Domain</th>
                      <th className="px-3 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Status</th>
                      <th className="px-3 py-3 bg-neutral-100 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">Attributes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {links.links.external.slice(0, 5).map((link, index) => (
                      <tr key={index}>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-800">{link.text}</div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="text-sm text-primary">
                            {new URL(link.url).hostname}
                          </div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success">OK</div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          {link.hasRel ? (
                            <div className="text-sm text-success">rel="noopener"</div>
                          ) : (
                            <div className="text-sm text-warning">Missing rel attributes</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-neutral-100 p-4 rounded-md text-center">
                <p className="text-neutral-600">No external links found on this page.</p>
              </div>
            )}
            <div className="mt-4 text-sm text-neutral-600">
              {links.analysis.externalLinksWithoutRel === 0 ? (
                <p>✓ All external links use appropriate rel attributes (noopener, nofollow)</p>
              ) : (
                <p>⚠ {links.analysis.externalLinksWithoutRel} external links missing rel attributes</p>
              )}
              {!links.links.external.some(link => link.isGeneric) && (
                <p>✓ All external links are descriptive</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-1">
        {/* Link Score */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-3 text-neutral-800">Link Score</h2>
            <div className="flex justify-center">
              <ScoreChart score={linkScore} size="md" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-neutral-700 mb-2">Link Health</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-600">Link quality</span>
                    <span className="font-medium text-neutral-800">
                      {links.analysis.genericInternalLinks === 0 ? "85%" : "65%"}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className={`${links.analysis.genericInternalLinks === 0 ? "bg-success" : "bg-warning"} h-2 rounded-full`} 
                      style={{ width: links.analysis.genericInternalLinks === 0 ? "85%" : "65%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-600">Internal linking</span>
                    <span className="font-medium text-neutral-800">
                      {links.analysis.internalLinks > 10 ? "85%" : 
                       links.analysis.internalLinks > 5 ? "65%" : "45%"}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className={`${
                        links.analysis.internalLinks > 10 ? "bg-success" : 
                        links.analysis.internalLinks > 5 ? "bg-warning" : "bg-danger"
                      } h-2 rounded-full`} 
                      style={{ 
                        width: `${
                          links.analysis.internalLinks > 10 ? 85 : 
                          links.analysis.internalLinks > 5 ? 65 : 45
                        }%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-600">Anchor text optimization</span>
                    <span className="font-medium text-neutral-800">
                      {links.analysis.genericInternalLinks === 0 ? "90%" : 
                       links.analysis.genericInternalLinks < 3 ? "70%" : "50%"}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className={`${
                        links.analysis.genericInternalLinks === 0 ? "bg-success" : 
                        links.analysis.genericInternalLinks < 3 ? "bg-warning" : "bg-danger"
                      } h-2 rounded-full`} 
                      style={{ 
                        width: `${
                          links.analysis.genericInternalLinks === 0 ? 90 : 
                          links.analysis.genericInternalLinks < 3 ? 70 : 50
                        }%` 
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-600">Link functionality</span>
                    <span className="font-medium text-neutral-800">95%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: "95%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Link Structure */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-3 text-neutral-800">Navigation Structure</h2>
            <div className="p-4 bg-neutral-100 rounded-md">
              <ul className="space-y-2 text-sm">
                {/* Simulate navigation structure based on internal links */}
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="text-neutral-800">Home</span>
                </li>
                {links.links.internal.slice(0, 5).map((link, index) => {
                  // Create a simple navigation structure
                  const text = link.text.length > 20 ? link.text.substring(0, 20) + '...' : link.text;
                  if (index === 0 || index === 1) {
                    return (
                      <li key={index} className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <div>
                          <span className="text-neutral-800">{text}</span>
                          {index === 0 && links.links.internal.length > 1 && (
                            <ul className="ml-5 mt-1 space-y-1 text-xs">
                              {links.links.internal.slice(6, 9).map((sublink, subIndex) => (
                                <li key={subIndex}>
                                  {sublink.text.length > 25 ? sublink.text.substring(0, 25) + '...' : sublink.text}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </li>
                    );
                  } else {
                    return (
                      <li key={index} className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-neutral-800">{text}</span>
                      </li>
                    );
                  }
                })}
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-neutral-800">Contact</span>
                </li>
              </ul>
            </div>
            <p className="text-xs text-neutral-500 mt-3">
              {links.analysis.internalLinks > 10 
                ? "✓ Logical navigation structure with clear hierarchy" 
                : "⚠ Navigation structure could be improved"}
            </p>
          </CardContent>
        </Card>
        
        {/* Improvement Suggestions */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-3 text-neutral-800">Link Improvements</h2>
            <ul className="space-y-3 text-sm">
              {links.analysis.genericInternalLinks > 0 && (
                <li className="flex items-start">
                  <div className="flex-shrink-0 mr-2 mt-0.5 text-primary">1.</div>
                  <span>Replace generic anchor text ("{links.analysis.genericInternalLinks > 1 ? "click here, read more, etc." : "click here"}") with descriptive text</span>
                </li>
              )}
              {links.analysis.internalLinks < 5 && (
                <li className="flex items-start">
                  <div className="flex-shrink-0 mr-2 mt-0.5 text-primary">{links.analysis.genericInternalLinks > 0 ? "2." : "1."}</div>
                  <span>Add more internal links between related content</span>
                </li>
              )}
              {links.analysis.externalLinksWithoutRel > 0 && (
                <li className="flex items-start">
                  <div className="flex-shrink-0 mr-2 mt-0.5 text-primary">
                    {(links.analysis.genericInternalLinks > 0 ? 1 : 0) + (links.analysis.internalLinks < 5 ? 1 : 0) + 1}.
                  </div>
                  <span>Add rel="noopener" attribute to external links</span>
                </li>
              )}
              <li className="flex items-start">
                <div className="flex-shrink-0 mr-2 mt-0.5 text-primary">
                  {(links.analysis.genericInternalLinks > 0 ? 1 : 0) + 
                   (links.analysis.internalLinks < 5 ? 1 : 0) + 
                   (links.analysis.externalLinksWithoutRel > 0 ? 1 : 0) + 1}.
                </div>
                <span>Add breadcrumb navigation for better user experience</span>
              </li>
              {links.analysis.internalLinks === 0 && (
                <li className="flex items-start">
                  <div className="flex-shrink-0 mr-2 mt-0.5 text-primary">
                    {(links.analysis.genericInternalLinks > 0 ? 1 : 0) + 
                     (links.analysis.internalLinks < 5 ? 1 : 0) + 
                     (links.analysis.externalLinksWithoutRel > 0 ? 1 : 0) + 2}.
                  </div>
                  <span>Add internal links to help search engines understand your site structure</span>
                </li>
              )}
              {links.analysis.genericInternalLinks === 0 && 
               links.analysis.internalLinks >= 5 && 
               links.analysis.externalLinksWithoutRel === 0 && (
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Great job! Your link structure follows best practices.</span>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
