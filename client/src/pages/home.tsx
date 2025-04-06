import { useState } from "react";
import UrlForm from "@/components/url-form";
import EmptyState from "@/components/empty-state";
import LoadingState from "@/components/loading-state";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const Home = () => {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const analyzeMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/analyze", { url });
      return response.json();
    },
    onSuccess: (data) => {
      setIsLoading(false);
      // Store the result in sessionStorage to persist across page navigation
      sessionStorage.setItem("seoAnalysisResult", JSON.stringify(data));
      // Navigate to results page
      setLocation("/results");
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
              <UrlForm onSubmit={handleAnalyze} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {isLoading ? (
          <LoadingState />
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
};

export default Home;
