'use client';

import React, { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface NormalDistributionChartProps {
  marketMean: number;
  marketStdDev: number;
  userMean: number;
  userStdDev: number;
}

// Normal distribution probability density function
const normalPDF = (x: number, mean: number, stdDev: number): number => {
  const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
  const exponent = -0.5 * Math.pow((x - mean) / stdDev, 2);
  return coefficient * Math.exp(exponent);
};

// Generate data points for the curve
const generateCurveData = (mean: number, stdDev: number, min: number, max: number, points: number = 200) => {
  const step = (max - min) / points;
  const data = [];
  
  for (let i = 0; i <= points; i++) {
    const x = min + i * step;
    const y = normalPDF(x, mean, stdDev);
    data.push({ x, y });
  }
  
  return data;
};

const NormalDistributionChart: React.FC<NormalDistributionChartProps> = ({
  marketMean,
  marketStdDev,
  userMean,
  userStdDev,
}) => {
  const chartRef = useRef<ChartJS<'line'>>(null);

  // Calculate the range for x-axis (show ±4 standard deviations from both means)
  const minX = Math.min(marketMean - 4 * marketStdDev, userMean - 4 * userStdDev);
  const maxX = Math.max(marketMean + 4 * marketStdDev, userMean + 4 * userStdDev);

  // Generate data for all three curves
  const marketData = generateCurveData(marketMean, marketStdDev, minX, maxX);
  const userProposalData = generateCurveData(userMean, userStdDev, minX, maxX);
  
  // Calculate difference curve (Your Proposal - Current Market)
  const differenceData = marketData.map((point, index) => ({
    x: point.x,
    y: userProposalData[index].y - point.y,
  }));

  const data = {
    datasets: [
      {
        label: 'Current Market',
        data: marketData,
        borderColor: 'rgb(34, 197, 94)', // Green
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: 'Your Proposal',
        data: userProposalData,
        borderColor: 'rgb(236, 72, 153)', // Pink
        backgroundColor: 'rgba(236, 72, 153, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: 'Difference (Proposal - Market)',
        data: differenceData,
        borderColor: 'rgb(59, 130, 246)', // Blue
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: 'origin',
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e5e7eb',
          font: {
            size: 12,
          },
          usePointStyle: true,
          pointStyle: 'line',
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: '#f9fafb',
        bodyColor: '#e5e7eb',
        borderColor: '#374151',
        borderWidth: 1,
        callbacks: {
          label: function(context: { dataset: { label?: string }; parsed: { y: number } }) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(4)}`;
          },
          title: function(context: Array<{ parsed: { x: number } }>) {
            return `Value: ${context[0].parsed.x.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'linear' as const,
        position: 'bottom' as const,
        title: {
          display: true,
          text: 'Electoral College Votes (ECV)',
          color: '#9ca3af',
          font: {
            size: 12,
          },
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 11,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Probability Density',
          color: '#9ca3af',
          font: {
            size: 12,
          },
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.3)',
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 11,
          },
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    elements: {
      line: {
        borderWidth: 2,
      },
    },
  };

  return (
    <div className="w-full h-full">
      <Line ref={chartRef} data={data} options={options} />
    </div>
  );
};

export default NormalDistributionChart;
