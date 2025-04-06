import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SeoAnalysisResult, UrlForm } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export interface UseSeoAnalysisProps {
  initialUrl?: string;
  onSuccess?: (data: SeoAnalysisResult) => void;
  onError?: (error: Error) => void;
}

export function useSeoAnalysis({ initialUrl, onSuccess, onError }: UseSeoAnalysisProps = {}) {
  const [url, setUrl] = useState<string>(initialUrl || "");
  const { toast } = useToast();
  
  // Mutation for analyzing a URL
  const analyzeMutation = useMutation({
    mutationFn: async (formData: UrlForm) => {
      const response = await apiRequest("POST", "/api/analyze", formData);
      return response.json() as Promise<SeoAnalysisResult>;
    },
    onSuccess: (data) => {
      // Save the result to session storage for persistence across page refreshes
      sessionStorage.setItem("seoAnalysisResult", JSON.stringify(data));
      
      // Notify on successful analysis
      toast({
        title: "Analysis complete",
        description: `Successfully analyzed ${data.url}`,
      });
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (error: Error) => {
      // Notify on error
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze the URL. Please try again.",
        variant: "destructive",
      });
      
      // Call the onError callback if provided
      if (onError) {
        onError(error);
      }
    }
  });
  
  // Query for getting recent analyses
  const recentAnalysesQuery = useQuery({
    queryKey: ["/api/recent-analyses"],
    enabled: false, // Only fetch when explicitly requested
  });
  
  // Function to analyze a URL
  const analyzeUrl = (urlToAnalyze: string) => {
    setUrl(urlToAnalyze);
    analyzeMutation.mutate({ url: urlToAnalyze });
  };
  
  // Function to fetch recent analyses
  const fetchRecentAnalyses = () => {
    recentAnalysesQuery.refetch();
  };
  
  // Function to get saved analysis from session storage
  const getSavedAnalysis = (): SeoAnalysisResult | null => {
    const savedData = sessionStorage.getItem("seoAnalysisResult");
    if (savedData) {
      try {
        return JSON.parse(savedData) as SeoAnalysisResult;
      } catch (e) {
        console.error("Failed to parse saved SEO analysis:", e);
        return null;
      }
    }
    return null;
  };
  
  return {
    url,
    setUrl,
    analyzeUrl,
    fetchRecentAnalyses,
    getSavedAnalysis,
    isLoading: analyzeMutation.isPending,
    isError: analyzeMutation.isError,
    error: analyzeMutation.error,
    data: analyzeMutation.data,
    recentAnalyses: recentAnalysesQuery.data as SeoAnalysisResult[] | undefined,
    isLoadingRecentAnalyses: recentAnalysesQuery.isLoading,
  };
}
