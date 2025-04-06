import { SeoAnalysisResult } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import ScoreChart from "@/components/ui/score-chart";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface MetaTagsTabProps {
  data: SeoAnalysisResult;
}

export default function MetaTagsTab({ data }: MetaTagsTabProps) {
  const { metaTags } = data;

  const getStatusBadge = (status: string) => {
    if (status === "good" || status === "present") {
      return (
        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
          Optimized
        </div>
      );
    } else if (status === "too_short" || status === "too_long") {
      return (
        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning/20 text-warning">
          Needs Improvement
        </div>
      );
    } else {
      return (
        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-danger/20 text-danger">
          Missing
        </div>
      );
    }
  };

  const getTagRecommendation = (tag: string, status: string, length?: number) => {
    if (tag === "title") {
      if (status === "good") return <span className="text-success">Good length (50-60 characters ideal)</span>;
      if (status === "too_short") return <span className="text-warning">Too short (50-60 characters ideal)</span>;
      if (status === "too_long") return <span className="text-warning">Too long (50-60 characters ideal)</span>;
      return <span className="text-danger">Missing title tag</span>;
    }

    if (tag === "description") {
      if (status === "good") return <span className="text-success">Good length (120-155 characters ideal)</span>;
      if (status === "too_short") return <span className="text-warning">Too short (120-155 characters ideal)</span>;
      if (status === "too_long") return <span className="text-warning">Too long (120-155 characters ideal)</span>;
      return <span className="text-danger">Missing meta description</span>;
    }

    if (status === "present" || status === "good") {
      return <span className="text-success">{`${tag.charAt(0).toUpperCase() + tag.slice(1)} properly defined`}</span>;
    }

    return <span className="text-danger">{`Missing ${tag}`}</span>;
  };

  // Calculate tag distribution
  const essentialTags = [
    metaTags.basic.title.status !== "missing",
    metaTags.basic.description.status !== "missing",
    metaTags.basic.canonical.status === "present",
    metaTags.basic.viewport.status === "present",
  ];

  const socialTags = [
    metaTags.openGraph.title.status === "present",
    metaTags.openGraph.description.status === "present",
    metaTags.openGraph.url.status === "present",
    metaTags.openGraph.image.status === "present",
    metaTags.openGraph.type.status === "present",
    metaTags.twitter.card.status === "present",
    metaTags.twitter.image.status === "present",
  ];

  const technicalTags = [
    metaTags.basic.robots.status === "present",
    metaTags.basic.canonical.status === "present",
    metaTags.basic.viewport.status === "present",
  ];

  const essentialCount = essentialTags.filter(Boolean).length;
  const socialCount = socialTags.filter(Boolean).length;
  const technicalCount = technicalTags.filter(Boolean).length;

  // Improvement suggestions
  const suggestions = [];

  if (metaTags.openGraph.image.status !== "present") {
    suggestions.push("Add Open Graph image tag for better social media sharing");
  }

  if (metaTags.twitter.card.status !== "present") {
    suggestions.push("Implement Twitter Card meta tags");
  }

  if (metaTags.basic.description.status === "too_short") {
    suggestions.push("Extend meta description to 120-155 characters");
  }

  if (metaTags.basic.robots.status !== "present") {
    suggestions.push("Add meta robots tag to control indexing behavior");
  }

  if (!metaTags.basic.title.content?.includes("lang=")) {
    suggestions.push("Include language meta tag for international SEO");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        {/* Essential Meta Tags */}
        <Card className="mb-6">
          <CardContent className="pt-6 px-6 pb-6">
            <h2 className="text-xl font-semibold mb-4 text-neutral-800">Essential Meta Tags</h2>
            <div className="space-y-4">
              {/* Title Tag */}
              <div className="p-3 border rounded-md border-neutral-200">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-neutral-800">Title Tag</h3>
                  {getStatusBadge(metaTags.basic.title.status)}
                </div>
                <div className="bg-neutral-100 p-3 rounded text-sm font-mono overflow-x-auto">
                  {metaTags.basic.title.content 
                    ? `<title>${metaTags.basic.title.content}</title>` 
                    : "<title>Missing title tag</title>"}
                </div>
                <div className="flex mt-2 text-sm">
                  <div className="mr-4">
                    <span className="text-neutral-600">Length:</span>
                    <span className="font-medium text-neutral-800 ml-1">
                      {metaTags.basic.title.length} characters
                    </span>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Recommendation: {getTagRecommendation("title", metaTags.basic.title.status)}
                </p>
              </div>

              {/* Meta Description */}
              <div className="p-3 border rounded-md border-neutral-200">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-neutral-800">Meta Description</h3>
                  {getStatusBadge(metaTags.basic.description.status)}
                </div>
                <div className="bg-neutral-100 p-3 rounded text-sm font-mono overflow-x-auto">
                  {metaTags.basic.description.content
                    ? `<meta name="description" content="${metaTags.basic.description.content}">`
                    : '<meta name="description" content=""> <!-- Missing description -->'}
                </div>
                <div className="flex mt-2 text-sm">
                  <div className="mr-4">
                    <span className="text-neutral-600">Length:</span>
                    <span className="font-medium text-neutral-800 ml-1">
                      {metaTags.basic.description.length} characters
                    </span>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Recommendation: {getTagRecommendation("description", metaTags.basic.description.status)}
                </p>
              </div>

              {/* Canonical URL */}
              <div className="p-3 border rounded-md border-neutral-200">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-neutral-800">Canonical URL</h3>
                  {getStatusBadge(metaTags.basic.canonical.status)}
                </div>
                <div className="bg-neutral-100 p-3 rounded text-sm font-mono overflow-x-auto">
                  {metaTags.basic.canonical.content
                    ? `<link rel="canonical" href="${metaTags.basic.canonical.content}">`
                    : '<link rel="canonical" href=""> <!-- Missing canonical -->'}
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Recommendation: {getTagRecommendation("canonical", metaTags.basic.canonical.status)}
                </p>
              </div>

              {/* Viewport */}
              <div className="p-3 border rounded-md border-neutral-200">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-neutral-800">Viewport</h3>
                  {getStatusBadge(metaTags.basic.viewport.status)}
                </div>
                <div className="bg-neutral-100 p-3 rounded text-sm font-mono overflow-x-auto">
                  {metaTags.basic.viewport.content
                    ? `<meta name="viewport" content="${metaTags.basic.viewport.content}">`
                    : '<meta name="viewport" content=""> <!-- Missing viewport -->'}
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Recommendation: {getTagRecommendation("viewport", metaTags.basic.viewport.status)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Tags */}
        <Card>
          <CardContent className="pt-6 px-6 pb-6">
            <h2 className="text-xl font-semibold mb-4 text-neutral-800">Social Media Tags</h2>
            <div className="space-y-4">
              {/* Open Graph */}
              <div className="p-3 border rounded-md border-neutral-200">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-neutral-800">Open Graph</h3>
                  {socialCount >= 5 ? (
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
                      Complete
                    </div>
                  ) : socialCount >= 3 ? (
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning/20 text-warning">
                      Incomplete
                    </div>
                  ) : (
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-danger/20 text-danger">
                      Missing
                    </div>
                  )}
                </div>
                <div className="bg-neutral-100 p-3 rounded text-sm font-mono mb-2 overflow-x-auto">
                  {metaTags.openGraph.title.content && (
                    <div>{`<meta property="og:title" content="${metaTags.openGraph.title.content}">`}</div>
                  )}
                  {metaTags.openGraph.description.content && (
                    <div>{`<meta property="og:description" content="${metaTags.openGraph.description.content}">`}</div>
                  )}
                  {metaTags.openGraph.url.content && (
                    <div>{`<meta property="og:url" content="${metaTags.openGraph.url.content}">`}</div>
                  )}
                  {metaTags.openGraph.image.content && (
                    <div>{`<meta property="og:image" content="${metaTags.openGraph.image.content}">`}</div>
                  )}
                  {metaTags.openGraph.type.content && (
                    <div>{`<meta property="og:type" content="${metaTags.openGraph.type.content}">`}</div>
                  )}
                  {!metaTags.openGraph.title.content && 
                   !metaTags.openGraph.description.content && 
                   !metaTags.openGraph.url.content && 
                   !metaTags.openGraph.image.content && 
                   !metaTags.openGraph.type.content && (
                    <div>{"<!-- No Open Graph tags found -->"}</div>
                  )}
                </div>
                {(!metaTags.openGraph.image.content || !metaTags.openGraph.type.content) && (
                  <div className="bg-neutral-200 p-2 rounded text-xs text-danger">
                    Missing: {!metaTags.openGraph.image.content && "og:image"}{" "}
                    {!metaTags.openGraph.image.content && !metaTags.openGraph.type.content && ", "}
                    {!metaTags.openGraph.type.content && "og:type"}
                  </div>
                )}
                <p className="text-xs text-neutral-500 mt-2">
                  Recommendation:{" "}
                  {socialCount >= 5 ? (
                    <span className="text-success">Open Graph tags are well implemented</span>
                  ) : (
                    <span className="text-warning">Add missing Open Graph tags for better sharing on Facebook and other platforms</span>
                  )}
                </p>
              </div>

              {/* Twitter Card */}
              <div className="p-3 border rounded-md border-neutral-200">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-neutral-800">Twitter Card</h3>
                  {metaTags.twitter.card.status === "present" ? (
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
                      Present
                    </div>
                  ) : (
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-danger/20 text-danger">
                      Missing
                    </div>
                  )}
                </div>
                {metaTags.twitter.card.content ? (
                  <div className="bg-neutral-100 p-3 rounded text-sm font-mono mb-2 overflow-x-auto">
                    <div>{`<meta name="twitter:card" content="${metaTags.twitter.card.content}">`}</div>
                    {metaTags.twitter.title.content && (
                      <div>{`<meta name="twitter:title" content="${metaTags.twitter.title.content}">`}</div>
                    )}
                    {metaTags.twitter.description.content && (
                      <div>{`<meta name="twitter:description" content="${metaTags.twitter.description.content}">`}</div>
                    )}
                    {metaTags.twitter.image.content && (
                      <div>{`<meta name="twitter:image" content="${metaTags.twitter.image.content}">`}</div>
                    )}
                  </div>
                ) : (
                  <div className="bg-neutral-200 p-3 rounded text-sm text-danger">
                    No Twitter Card meta tags found.
                  </div>
                )}
                <p className="text-xs text-neutral-500 mt-2">
                  Recommendation:{" "}
                  {metaTags.twitter.card.status === "present" ? (
                    <span className="text-success">Twitter Card is implemented correctly</span>
                  ) : (
                    <span className="text-danger">Add Twitter Card tags to improve appearance when shared on Twitter</span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-1">
        {/* Meta Tags Score */}
        <Card className="mb-6">
          <CardContent className="pt-6 px-6 pb-6">
            <h2 className="text-lg font-semibold mb-3 text-neutral-800">Meta Tags Score</h2>
            <div className="flex justify-center">
              <ScoreChart score={metaTags.score} size="md" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-neutral-700 mb-2">Tag Distribution</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-600">Essential tags</span>
                    <span className="font-medium text-neutral-800">{essentialCount}/4</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className={`${
                        essentialCount === 4 ? "bg-success" : essentialCount >= 2 ? "bg-warning" : "bg-danger"
                      } h-2 rounded-full`}
                      style={{ width: `${(essentialCount / 4) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-600">Social media tags</span>
                    <span className="font-medium text-neutral-800">{socialCount}/7</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className={`${
                        socialCount >= 5 ? "bg-success" : socialCount >= 3 ? "bg-warning" : "bg-danger"
                      } h-2 rounded-full`}
                      style={{ width: `${(socialCount / 7) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-600">Technical SEO tags</span>
                    <span className="font-medium text-neutral-800">{technicalCount}/3</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className={`${
                        technicalCount === 3 ? "bg-success" : technicalCount >= 2 ? "bg-success" : "bg-warning"
                      } h-2 rounded-full`}
                      style={{ width: `${(technicalCount / 3) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Improvement Suggestions */}
        <Card>
          <CardContent className="pt-6 px-6 pb-6">
            <h2 className="text-lg font-semibold mb-3 text-neutral-800">Improvement Suggestions</h2>
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
                  <span>Great job! Your meta tags are well optimized.</span>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
