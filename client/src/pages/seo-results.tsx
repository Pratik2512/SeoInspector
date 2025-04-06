import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import UrlForm from "@/components/url-form";
import LoadingState from "@/components/loading-state";
import TabNavigation from "@/components/ui/tab-navigation";
import OverviewTab from "@/components/results/overview-tab";
import MetaTagsTab from "@/components/results/meta-tags-tab";
import ContentTab from "@/components/results/content-tab";
import LinksTab from "@/components/results/links-tab";
import PerformanceTab from "@/components/results/performance-tab";
import PreviewsTab from "@/components/results/previews-tab";
import { SeoAnalysisResult, TabType } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const SeoResults = () => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SeoAnalysisResult | null>(null);
  const { toast } = useToast();

  // Load results from sessionStorage on mount
  useEffect(() => {
    const savedResults = sessionStorage.getItem("seoAnalysisResult");
    if (savedResults) {
      try {
        const parsedResults = JSON.parse(savedResults);
        setResults(parsedResults);
      } catch (e) {
        console.error("Failed to parse saved results:", e);
        setLocation("/");
      }
    } else {
      // No results found, redirect to home
      setLocation("/");
    }
  }, [setLocation]);

  const analyzeMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/analyze", { url });
      return response.json();
    },
    onSuccess: (data) => {
      setIsLoading(false);
      setResults(data);
      // Update sessionStorage
      sessionStorage.setItem("seoAnalysisResult", JSON.stringify(data));
    },
    onError: (error) => {
      setIsLoading(false);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze the URL. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleAnalyze = (url: string) => {
    setIsLoading(true);
    analyzeMutation.mutate(url);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  // Show loading state if no results or currently analyzing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-100">
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center justify-between">
              <div className="flex items-center">
                <svg className="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <h1 className="text-xl font-bold ml-2 text-neutral-800">SEO Inspector</h1>
              </div>
              <div className="mt-3 md:mt-0 w-full md:w-auto flex-grow md:ml-4">
                <UrlForm onSubmit={handleAnalyze} initialUrl={results?.url || ""} />
              </div>
            </div>
          </div>
        </header>
        <LoadingState />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="p-8 bg-white rounded shadow-md">
          <h2 className="text-xl font-semibold mb-4">No results found</h2>
          <p className="mb-4">Please return to the home page to analyze a URL.</p>
          <button 
            onClick={() => setLocation("/")}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition duration-150"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <h1 className="text-xl font-bold ml-2 text-neutral-800">SEO Inspector</h1>
            </div>
            <div className="mt-3 md:mt-0 w-full md:w-auto flex-grow md:ml-4">
              <UrlForm onSubmit={handleAnalyze} initialUrl={results.url} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <TabNavigation 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
        />

        {/* Tab Content */}
        {activeTab === "overview" && <OverviewTab data={results} />}
        {activeTab === "meta-tags" && <MetaTagsTab data={results} />}
        {activeTab === "content" && <ContentTab data={results} />}
        {activeTab === "links" && <LinksTab data={results} />}
        {activeTab === "speed" && <PerformanceTab data={results} />}
        {activeTab === "previews" && <PreviewsTab data={results} />}
      </main>
    </div>
  );
};

export default SeoResults;
