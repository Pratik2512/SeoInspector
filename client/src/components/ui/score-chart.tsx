import { useEffect, useRef } from "react";
import { Chart, ChartConfiguration } from "chart.js";

interface ScoreChartProps {
  score: number;
  size?: "sm" | "md" | "lg";
  label?: string;
  color?: string;
}

export default function ScoreChart({ 
  score, 
  size = "md", 
  label, 
  color = "#3366FF" 
}: ScoreChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  const sizeMap = {
    sm: { canvasSize: 100, textSize: "text-xl" },
    md: { canvasSize: 160, textSize: "text-3xl" },
    lg: { canvasSize: 200, textSize: "text-4xl" },
  };

  const { canvasSize, textSize } = sizeMap[size];

  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Create new chart
      const ctx = chartRef.current.getContext("2d");
      if (ctx) {
        const config: ChartConfiguration = {
          type: "doughnut",
          data: {
            datasets: [
              {
                data: [score, 100 - score],
                backgroundColor: [color, "#f5f5f5"],
                borderWidth: 0,
                // @ts-ignore
                cutout: "75%",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              tooltip: {
                enabled: false,
              },
              legend: {
                display: false,
              },
            },
          },
        };

        chartInstance.current = new Chart(ctx, config);
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [score, color]);

  return (
    <div className="relative" style={{ width: canvasSize, height: canvasSize }}>
      <canvas ref={chartRef} />
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className={`font-bold ${textSize} text-primary`}>
          {score}%
        </span>
        {label && <span className="text-sm text-neutral-600">{label}</span>}
      </div>
    </div>
  );
}
