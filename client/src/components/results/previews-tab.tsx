import { SeoAnalysisResult } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface PreviewsTabProps {
  data: SeoAnalysisResult;
}

export default function PreviewsTab({ data }: PreviewsTabProps) {
  const { metaTags } = data;

  // Format URL for display
  const formatDisplayUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return `${urlObj.hostname}${urlObj.pathname === "/" ? "" : urlObj.pathname}`;
    } catch (e) {
      return url;
    }
  };

  // Google SERP preview
  const googleTitle = metaTags.basic.title.content || "No title tag found";
  const googleDescription = metaTags.basic.description.content || "No meta description found. Search engines will try to find relevant text from your page content to display here.";
  const googleUrl = formatDisplayUrl(data.url);

  // Social preview data
  const ogTitle = metaTags.openGraph.title.content || metaTags.basic.title.content || "No title found";
  const ogDescription = metaTags.openGraph.description.content || metaTags.basic.description.content || "No description found";
  const ogImage = metaTags.openGraph.image.content || "";

  const twitterTitle = metaTags.twitter.title.content || metaTags.openGraph.title.content || metaTags.basic.title.content || "No title found";
  const twitterDescription = metaTags.twitter.description.content || metaTags.openGraph.description.content || metaTags.basic.description.content || "No description found";
  const twitterImage = metaTags.twitter.image.content || metaTags.openGraph.image.content || "";

  // Mobile responsiveness
  const hasViewport = metaTags.basic.viewport.status === "present";
  const mobileScore = data.mobileScore;

  // Preview improvement suggestions
  const suggestions = {
    google: [] as string[],
    social: [] as string[],
    mobile: [] as string[]
  };

  // Google SERP suggestions
  if (metaTags.basic.title.status !== "good") {
    suggestions.google.push(metaTags.basic.title.status === "too_short" 
      ? "Extend title tag to 50-60 characters to maximize SERP real estate" 
      : metaTags.basic.title.status === "too_long" 
      ? "Shorten title tag to 50-60 characters to ensure full visibility in SERPs" 
      : "Add a descriptive title tag");
  }

  if (metaTags.basic.description.status !== "good") {
    suggestions.google.push(metaTags.basic.description.status === "too_short" 
      ? "Extend meta description to 155-160 characters to maximize SERP real estate" 
      : metaTags.basic.description.status === "too_long" 
      ? "Shorten meta description to 155-160 characters for optimal display" 
      : "Add a compelling meta description");
  }

  suggestions.google.push("Include primary keyword at beginning of meta description");
  suggestions.google.push("Add structured data markup to enable rich snippets in search results");

  // Social media suggestions
  if (!metaTags.openGraph.image.content) {
    suggestions.social.push("Add Facebook Open Graph image tag (1200×630px recommended)");
  }

  if (metaTags.twitter.card.status !== "present") {
    suggestions.social.push("Implement Twitter Card meta tags (summary_large_image type)");
  }

  suggestions.social.push("Create dedicated social sharing image with text overlay");
  suggestions.social.push("Extend social descriptions to be more compelling (2-3 sentences)");

  if (!metaTags.openGraph.type.content) {
    suggestions.social.push("Add og:type meta tag (website)");
  }

  // Mobile suggestions
  if (!hasViewport) {
    suggestions.mobile.push("Add proper viewport meta tag for mobile optimization");
  }

  suggestions.mobile.push("Increase spacing between tap targets in navigation");
  suggestions.mobile.push("Optimize hero image specifically for mobile");

  return (
    <>
      {/* Google SERP Preview */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-neutral-800">Google Search Results Preview</h2>
          <div className="mb-6 p-6 border border-neutral-200 rounded-md">
            <div className="mb-1 text-sm text-neutral-600">{googleUrl}</div>
            <div className="text-xl text-blue-700 font-medium mb-1">{googleTitle}</div>
            <div className="text-sm text-neutral-700">{googleDescription}</div>
          </div>
          <div className="flex justify-between items-center p-3 border rounded-md border-neutral-200">
            <h3 className="font-medium text-neutral-800">SERP Analysis</h3>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              (metaTags.basic.title.status === "good" && metaTags.basic.description.status === "good") 
                ? "bg-success/20 text-success" 
                : (metaTags.basic.title.status !== "missing" && metaTags.basic.description.status !== "missing") 
                ? "bg-warning/20 text-warning" 
                : "bg-danger/20 text-danger"
            }`}>
              {(metaTags.basic.title.status === "good" && metaTags.basic.description.status === "good") 
                ? "Good" 
                : (metaTags.basic.title.status !== "missing" && metaTags.basic.description.status !== "missing") 
                ? "Needs Improvement" 
                : "Poor"}
            </div>
          </div>
          <div className="mt-4 text-sm">
            <p className="text-neutral-600">
              {metaTags.basic.title.status !== "missing" 
                ? "✓ Title appears in search results" 
                : "❌ Missing title tag"}
            </p>
            <p className="text-neutral-600">
              {metaTags.basic.description.status === "good" 
                ? "✓ Meta description is well-formatted" 
                : metaTags.basic.description.status === "too_short" 
                ? "⚠ Meta description is too short (could be more descriptive)" 
                : metaTags.basic.description.status === "too_long" 
                ? "⚠ Meta description is too long (may be truncated in search results)" 
                : "❌ Missing meta description"}
            </p>
            <p className="text-neutral-600">✓ URL structure is clean and readable</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Social Preview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Facebook Preview */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-neutral-800">Facebook Preview</h2>
            <div className="mb-4 border border-neutral-300 rounded-md overflow-hidden">
              <div className={`${ogImage ? "bg-neutral-800" : "bg-neutral-200"} h-48 flex items-center justify-center text-neutral-500`}>
                {ogImage ? (
                  <img 
                    src={ogImage} 
                    alt="Open Graph preview" 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      e.currentTarget.src = ""; 
                      e.currentTarget.parentElement!.classList.add("bg-neutral-200");
                      e.currentTarget.parentElement!.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-neutral-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Missing or invalid og:image</span>
                      `;
                    }}
                  />
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-neutral-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Missing og:image</span>
                  </>
                )}
              </div>
              <div className="p-3">
                <div className="text-sm text-neutral-500 mb-1">{googleUrl}</div>
                <div className="text-base font-medium text-neutral-800 mb-1">{ogTitle}</div>
                <div className="text-sm text-neutral-600">{ogDescription}</div>
              </div>
            </div>
            <div className="flex justify-between items-center p-3 border rounded-md border-neutral-200">
              <h3 className="font-medium text-neutral-800">Facebook Preview Analysis</h3>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                (metaTags.openGraph.title.status === "present" && 
                metaTags.openGraph.description.status === "present" && 
                metaTags.openGraph.image.status === "present") 
                  ? "bg-success/20 text-success" 
                  : (metaTags.openGraph.title.status === "present" || 
                     metaTags.openGraph.description.status === "present") 
                  ? "bg-warning/20 text-warning" 
                  : "bg-danger/20 text-danger"
              }`}>
                {(metaTags.openGraph.title.status === "present" && 
                metaTags.openGraph.description.status === "present" && 
                metaTags.openGraph.image.status === "present") 
                  ? "Complete" 
                  : (metaTags.openGraph.title.status === "present" || 
                     metaTags.openGraph.description.status === "present") 
                  ? "Incomplete" 
                  : "Missing"}
              </div>
            </div>
            <div className="mt-4 text-sm">
              {!metaTags.openGraph.image.content && (
                <p className="text-neutral-600">⚠ Missing og:image (required for optimal sharing)</p>
              )}
              {(metaTags.openGraph.title.status === "present" || metaTags.basic.title.content) && (
                <p className="text-neutral-600">✓ Title is present</p>
              )}
              {(metaTags.openGraph.description.status === "present" || metaTags.basic.description.content) && (
                <p className="text-neutral-600">
                  {(metaTags.openGraph.description.content || metaTags.basic.description.content || "").length < 100 
                    ? "⚠ Description too short for optimal display" 
                    : "✓ Description is present and well-formatted"}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Twitter Preview */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-neutral-800">Twitter Preview</h2>
            <div className="mb-4 border border-neutral-300 rounded-md overflow-hidden">
              {metaTags.twitter.card.status === "present" ? (
                <>
                  <div className={`${twitterImage ? "bg-neutral-800" : "bg-neutral-200"} h-48 flex items-center justify-center text-neutral-500`}>
                    {twitterImage ? (
                      <img 
                        src={twitterImage} 
                        alt="Twitter Card preview" 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.currentTarget.src = ""; 
                          e.currentTarget.parentElement!.classList.add("bg-neutral-200");
                          e.currentTarget.parentElement!.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-neutral-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Invalid Twitter image</span>
                          `;
                        }}
                      />
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-neutral-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Missing Twitter image</span>
                      </>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="text-base font-medium text-neutral-800 mb-1">{twitterTitle}</div>
                    <div className="text-sm text-neutral-600">{twitterDescription}</div>
                    <div className="text-sm text-neutral-500 mt-1">{googleUrl}</div>
                  </div>
                </>
              ) : (
                <div className="bg-neutral-200 h-48 flex flex-col items-center justify-center text-neutral-500 p-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-neutral-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-center">Twitter Card Not Implemented</span>
                  <p className="text-xs text-center mt-2">Without Twitter Card metadata, your content will appear as a simple link when shared.</p>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center p-3 border rounded-md border-neutral-200">
              <h3 className="font-medium text-neutral-800">Twitter Preview Analysis</h3>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                metaTags.twitter.card.status === "present" 
                  ? "bg-success/20 text-success" 
                  : "bg-danger/20 text-danger"
              }`}>
                {metaTags.twitter.card.status === "present" 
                  ? "Implemented" 
                  : "Not Implemented"}
              </div>
            </div>
            <div className="mt-4 text-sm">
              {metaTags.twitter.card.status !== "present" ? (
                <>
                  <p className="text-neutral-600">❌ Twitter Card meta tags are not implemented</p>
                  <p className="text-neutral-600">❌ Without Twitter Card, shares will have no image or formatted content</p>
                  <p className="text-neutral-600">❌ Twitter will fall back to basic URL sharing</p>
                </>
              ) : (
                <>
                  <p className="text-neutral-600">✓ Twitter Card meta tags are implemented</p>
                  {!metaTags.twitter.image.content && (
                    <p className="text-neutral-600">⚠ Missing Twitter image for better visibility</p>
                  )}
                  <p className="text-neutral-600">
                    {metaTags.twitter.card.content === "summary_large_image" 
                      ? "✓ Using optimal card type (summary_large_image)" 
                      : "⚠ Consider using 'summary_large_image' card type for better visibility"}
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Mobile Preview */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-neutral-800">Mobile Preview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex justify-center">
              <div className="w-64 border-8 border-black rounded-3xl overflow-hidden relative" style={{ height: 500 }}>
                <div className="bg-white h-full overflow-hidden">
                  {/* Mobile mockup content */}
                  <div className="h-6 bg-neutral-800 flex items-center justify-between px-4">
                    <div className="text-white text-xs">12:30</div>
                    <div className="flex items-center space-x-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                      </svg>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10V4a2 2 0 00-2-2H5a2 2 0 00-2 2v6m18 0v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6m18 0H3" />
                      </svg>
                    </div>
                  </div>
                  <div className="p-2">
                    <div className="h-8 bg-white flex items-center rounded-full border border-neutral-300 mb-2 px-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-neutral-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <div className="text-xs text-neutral-400">{googleUrl}</div>
                    </div>
                    <div className="bg-neutral-200 h-24 rounded mb-2"></div>
                    <div className="bg-neutral-800 text-white text-xs py-1 px-2 rounded mb-2 w-24">Our Services</div>
                    <div className="space-y-1 mb-2">
                      <div className="h-3 bg-neutral-300 rounded w-full"></div>
                      <div className="h-3 bg-neutral-300 rounded w-5/6"></div>
                      <div className="h-3 bg-neutral-300 rounded w-4/6"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="h-16 bg-neutral-200 rounded"></div>
                      <div className="h-16 bg-neutral-200 rounded"></div>
                    </div>
                    <div className="bg-neutral-800 text-white text-xs py-1 px-2 rounded mb-2 w-24">Our Work</div>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="h-24 bg-neutral-200 rounded"></div>
                      <div className="h-24 bg-neutral-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center p-3 border rounded-md border-neutral-200 mb-4">
                <h3 className="font-medium text-neutral-800">Mobile Usability Analysis</h3>
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  mobileScore >= 80 
                    ? "bg-success/20 text-success" 
                    : mobileScore >= 60 
                    ? "bg-warning/20 text-warning" 
                    : "bg-danger/20 text-danger"
                }`}>
                  {mobileScore >= 80 
                    ? "Good" 
                    : mobileScore >= 60 
                    ? "Fair" 
                    : "Poor"}
                </div>
              </div>
              <div className="text-sm space-y-3">
                <p><strong>Viewport Configuration:</strong> {hasViewport ? "Properly configured for mobile devices." : "Missing viewport meta tag - critical for mobile optimization!"}</p>
                <p><strong>Font Sizes:</strong> All text is readable without zooming (minimum 16px body text).</p>
                <p><strong>Tap Targets:</strong> Most interactive elements are properly sized for touch (min 44×44px).</p>
                <p><strong>Content Width:</strong> Content is sized to viewport, no horizontal scrolling required.</p>
                <p><strong>Performance:</strong> Page loads within {hasViewport ? "acceptable" : "suboptimal"} time on mobile ({(data.performanceMetrics.metrics.estimatedLoadTimeValue * 1.2).toFixed(1)}s).</p>
                <p><strong>Areas for Improvement:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  {!hasViewport && (
                    <li className="text-danger">Add viewport meta tag (critical)</li>
                  )}
                  <li>Some tap targets are too close together</li>
                  {data.images.analysis.totalImages > 0 && data.images.analysis.altTextPercentage < 100 && (
                    <li>Images should be optimized further for mobile</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Preview Improvement Suggestions */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-neutral-800">Preview & Sharing Improvement Suggestions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 text-sm">
              <h3 className="font-medium text-neutral-700">Google Search Preview</h3>
              <ul className="space-y-2">
                {suggestions.google.slice(0, 3).map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 mr-2 mt-0.5 text-primary">
                      {index + 1}.
                    </div>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
              
              <h3 className="font-medium text-neutral-700 mt-5">Mobile Experience</h3>
              <ul className="space-y-2">
                {suggestions.mobile.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 mr-2 mt-0.5 text-primary">
                      {index + 1}.
                    </div>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-3 text-sm">
              <h3 className="font-medium text-neutral-700">Social Media Sharing</h3>
              <ul className="space-y-2">
                {suggestions.social.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 mr-2 mt-0.5 text-primary">
                      {index + 1}.
                    </div>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
