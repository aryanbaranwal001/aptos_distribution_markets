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
	marketData: Array<{ x: number; y: number }>;
	userProposalData: Array<{ x: number; y: number }>;
	differenceData: Array<{ x: number; y: number }>;
	onHover?: (value: number | null) => void;
	xAxisLabel?: string;
}

const NormalDistributionChart: React.FC<NormalDistributionChartProps> = ({
	marketData,
	userProposalData,
	differenceData,
	onHover,
	xAxisLabel,
}) => {
	const chartRef = useRef<ChartJS<"line">>(null);

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