"use client";

import React, { useRef } from "react";
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
	ChartEvent,
	ActiveElement,
} from "chart.js";
import { Line } from "react-chartjs-2";

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
	onHover?: (value: number | null) => void;
	xAxisLabel?: string;
}

// Normal distribution probability density function
const normalPDF = (x: number, mean: number, stdDev: number): number => {
	if (stdDev <= 0) return 0;
	const sigma = Math.abs(stdDev);
	const coefficient = 1 / (sigma * Math.sqrt(2 * Math.PI));
	const exponent = -0.5 * Math.pow((x - mean) / sigma, 2);
	return coefficient * Math.exp(exponent);
};

// Lambda calculation used to scale the pdf: λ = sqrt(2 * |σ| * sqrt(pi))
const calculateLambda = (stdDev: number): number => {
	const sigma = Math.abs(stdDev);
	return Math.sqrt(2 * sigma * Math.sqrt(Math.PI));
};

// Generate data points for λ * pdf curve
const generateScaledCurveData = (
	mean: number,
	stdDev: number,
	lambda: number,
	min: number,
	max: number,
	points: number = 200
) => {
	const step = (max - min) / points;
	const data: Array<{ x: number; y: number }> = [];

	for (let i = 0; i <= points; i++) {
		const x = min + i * step;
		const y = lambda * normalPDF(x, mean, stdDev);
		data.push({ x, y });
	}

	return data;
};

const NormalDistributionChart: React.FC<NormalDistributionChartProps> = ({
	marketMean,
	marketStdDev,
	userMean,
	userStdDev,
	onHover,
	xAxisLabel,
}) => {
	const chartRef = useRef<ChartJS<"line">>(null);

	// Calculate the range for x-axis (show ±4 standard deviations from both means)
	const minX = Math.min(
		marketMean - 4 * Math.abs(marketStdDev),
		userMean - 4 * Math.abs(userStdDev)
	);
	const maxX = Math.max(
		marketMean + 4 * Math.abs(marketStdDev),
		userMean + 4 * Math.abs(userStdDev)
	);

	// Compute λ for market and user
	const lambdaMarket = calculateLambda(marketStdDev);
	const lambdaUser = calculateLambda(userStdDev);

	// Generate data for λ * pdf curves
	const marketData = generateScaledCurveData(
		marketMean,
		marketStdDev,
		lambdaMarket,
		minX,
		maxX
	);
	const userProposalData = generateScaledCurveData(
		userMean,
		userStdDev,
		lambdaUser,
		minX,
		maxX
	);

	// Calculate difference curve (λ_g·g(x) − λ_f·f(x))
	const differenceData = marketData.map((point, index) => ({
		x: point.x,
		y: userProposalData[index].y - point.y,
	}));

	const data = {
		datasets: [
			{
				label: "Current Market (λ·pdf)",
				data: marketData,
				borderColor: "rgb(34, 197, 94)", // Green
				backgroundColor: "rgba(34, 197, 94, 0.1)",
				borderWidth: 2,
				fill: false,
				tension: 0.4,
				pointRadius: 0,
				pointHoverRadius: 4,
			},
			{
				label: "Your Proposal (λ·pdf)",
				data: userProposalData,
				borderColor: "rgb(236, 72, 153)", // Pink
				backgroundColor: "rgba(236, 72, 153, 0.1)",
				borderWidth: 2,
				fill: false,
				tension: 0.4,
				pointRadius: 0,
				pointHoverRadius: 4,
			},
			{
				label: "Difference (λg·g(x) − λf·f(x))",
				data: differenceData,
				borderColor: "rgb(59, 130, 246)", // Blue
				backgroundColor: "rgba(59, 130, 246, 0.1)",
				borderWidth: 2,
				fill: "origin",
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
				position: "top" as const,
				labels: {
					color: "#e5e7eb",
					font: {
						size: 12,
					},
					usePointStyle: true,
					pointStyle: "line",
				},
			},
			tooltip: {
				mode: "index" as const,
				intersect: false,
				backgroundColor: "rgba(17, 24, 39, 0.9)",
				titleColor: "#f9fafb",
				bodyColor: "#e5e7eb",
				borderColor: "#374151",
				borderWidth: 1,
				callbacks: {
					label: function (context: {
						dataset: { label?: string };
						parsed: { y: number };
					}) {
						const label = context.dataset.label || "";
						const value = context.parsed.y;
						return `${label}: ${value.toFixed(4)}`;
					},
					title: function (
						context: Array<{ parsed: { x: number } }>
					) {
						return `${context[0].parsed.x.toFixed(2)}`;
					},
				},
			},
		},
		scales: {
			x: {
				type: "linear" as const,
				position: "bottom" as const,
				title: {
					display: true,
					text: xAxisLabel || "Value",
					color: "#9ca3af",
					font: {
						size: 12,
					},
				},
				grid: {
					color: "rgba(75, 85, 99, 0.3)",
				},
				ticks: {
					color: "#9ca3af",
					font: {
						size: 11,
					},
				},
			},
			y: {
				title: {
					display: true,
					text: "Scaled Density (λ·pdf)",
					color: "#9ca3af",
					font: {
						size: 12,
					},
				},
				grid: {
					color: "rgba(75, 85, 99, 0.3)",
				},
				ticks: {
					color: "#9ca3af",
					font: {
						size: 11,
					},
				},
			},
		},
		interaction: {
			mode: "index" as const,
			intersect: false,
		},
		onHover: (event: ChartEvent, elements: ActiveElement[]) => {
			if (onHover) {
				if (elements.length > 0) {
					const chart = chartRef.current;
					if (chart && event.native) {
						const rect = chart.canvas.getBoundingClientRect();
						const x =
							(event.native as MouseEvent).clientX - rect.left;
						const dataX = chart.scales.x.getValueForPixel(x);
						onHover(typeof dataX === "number" ? dataX : null);
					}
				} else {
					onHover(null);
				}
			}
		},
		elements: {
			line: {
				borderWidth: 2,
			},
		},
		animation: {
			duration: 0,
		},
		transitions: {
			active: {
				animation: {
					duration: 0,
				},
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
