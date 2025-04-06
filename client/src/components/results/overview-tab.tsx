import { useEffect, useRef } from "react";
import { SeoAnalysisResult, MetricCard } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import ScoreChart from "@/components/ui/score-chart";
import { Chart } from "chart.js/auto";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface OverviewTabProps {
  data: SeoAnalysisResult;
}

export default function OverviewTab({ data }: OverviewTabProps) {
  const categoryChartRef = useRef<HTMLCanvasElement>(null);
  const categoryChartInstance = useRef<Chart | null>(null);

  // Prepare metrics for display
  const getMetricStatus = (score: number) => {
    if (score >= 80) return "good";
    if (score >= 60) return "moderate";
    return "poor";
  };

  const metrics: MetricCard[] = [
    {
      title: "Meta Tags",
      value: `${data.metaTagsScore}/100`,
      description: "Essential tags present",
      status: getMetricStatus(data.metaTagsScore),
      percentage: data.metaTagsScore,
    },
    {
      title: "Page Speed",
      value: data.performanceMetrics.metrics.estimatedLoadTime,
      description: "Load time",
      status: getMetricStatus(data.performanceScore),
      percentage: data.performanceScore,
    },
    {
      title: "Mobile",
      value: `${data.mobileScore}/100`,
      description: "Mobile friendliness",
      status: getMetricStatus(data.mobileScore),
      percentage: data.mobileScore,
    },
    {
      title: "Content",
      value: `${data.contentScore}/100`,
      description: "Content quality",
      status: getMetricStatus(data.contentScore),
      percentage: data.contentScore,
    },
  ];

  useEffect(() => {
    if (categoryChartRef.current) {
      // Destroy existing chart
      if (categoryChartInstance.current) {
        categoryChartInstance.current.destroy();
      }

      // Create new chart
      const ctx = categoryChartRef.current.getContext("2d");
      if (ctx) {
        categoryChartInstance.current = new Chart(ctx, {
          type: "radar",
          data: {
            labels: ["Meta Tags", "Content", "Links", "Speed", "Mobile", "Images"],
            datasets: [
              {
                label: "Your Website",
                data: [
                  data.metaTagsScore,
                  data.contentScore,
                  data.linksScore,
                  data.performanceScore,
                  data.mobileScore,
                  data.images.analysis.altTextPercentage,
                ],
                backgroundColor: "rgba(51, 102, 255, 0.2)",
                borderColor: "#3366FF",
                borderWidth: 2,
                pointBackgroundColor: "#3366FF",
              },
              {
                label: "Industry Average",
                data: [65, 70, 60, 68, 75, 72],
                backgroundColor: "rgba(170, 170, 170, 0.2)",
                borderColor: "#aaaaaa",
                borderWidth: 2,
                pointBackgroundColor: "#aaaaaa",
              },
            ],
          },
          options: {
            scales: {
              r: {
                beginAtZero: true,
                max: 100,
                ticks: {
                  stepSize: 20,
                },
              },
            },
          },
        });
      }
    }

    return () => {
      if (categoryChartInstance.current) {
        categoryChartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div>
      {/* SEO Score */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center">
            <div className="w-full md:w-1/3 flex justify-center mb-4 md:mb-0">
              <ScoreChart score={data.seoScore} size="lg" label="SEO Score" />
            </div>
            <div className="w-full md:w-2/3">
              <h2 className="text-xl font-semibold mb-2 text-neutral-800">Overall SEO Performance</h2>
              <p className="text-neutral-600 mb-4">
                {data.seoScore >= 80
                  ? "Your website has good SEO practices, with only minor improvements needed."
                  : data.seoScore >= 60
                  ? "Your website has decent SEO practices, but there are several opportunities to improve performance and visibility."
                  : "Your website needs significant SEO improvements to increase visibility and performance."}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-100 p-4 rounded">
                  <h3 className="text-sm font-medium text-neutral-700">Strengths</h3>
                  <ul className="mt-2 text-sm text-neutral-600 space-y-1">
                    {data.strengths.slice(0, 3).map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="text-success mt-0.5 mr-2 h-4 w-4" />
                        <span>{strength.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-neutral-100 p-4 rounded">
                  <h3 className="text-sm font-medium text-neutral-700">Improvement Areas</h3>
                  <ul className="mt-2 text-sm text-neutral-600 space-y-1">
                    {data.improvementAreas.slice(0, 3).map((area, index) => (
                      <li key={index} className="flex items-start">
                        <AlertCircle className="text-warning mt-0.5 mr-2 h-4 w-4" />
                        <span>{area.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* At-a-Glance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-neutral-700">{metric.title}</h3>
                <div 
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    metric.status === "good" 
                      ? "bg-success/20 text-success" 
                      : metric.status === "moderate" 
                      ? "bg-warning/20 text-warning" 
                      : "bg-danger/20 text-danger"
                  }`}
                >
                  {metric.status === "good" ? "Good" : metric.status === "moderate" ? "Moderate" : "Poor"}
                </div>
              </div>
              <div className="text-2xl font-bold text-neutral-800 mb-1">{metric.value}</div>
              <p className="text-sm text-neutral-600">{metric.description}</p>
              <div className="mt-2 w-full bg-neutral-200 rounded-full h-2">
                <div 
                  className={`${
                    metric.status === "good" 
                      ? "bg-success" 
                      : metric.status === "moderate" 
                      ? "bg-warning" 
                      : "bg-danger"
                  } h-2 rounded-full`} 
                  style={{ width: `${metric.percentage}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Critical Issues */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-neutral-800">Critical Issues to Fix</h2>
          <div className="space-y-4">
            {data.criticalIssues.length > 0 ? (
              data.criticalIssues.map((issue, index) => (
                <div key={index} className={`border-l-4 ${issue.severity === 'critical' ? 'border-danger' : 'border-warning'} pl-4 py-1`}>
                  <h3 className="font-medium text-neutral-800">{issue.title}</h3>
                  <p className="text-sm text-neutral-600 mt-1">{issue.description}</p>
                </div>
              ))
            ) : (
              <div className="border-l-4 border-success pl-4 py-1">
                <h3 className="font-medium text-neutral-800">No critical issues found</h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Great job! We didn't find any critical SEO issues on your website.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-neutral-800">Performance by Category</h2>
          <div className="w-full">
            <canvas ref={categoryChartRef} height={250}></canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
