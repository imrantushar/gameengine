import React from "react";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler } from "chart.js";
import { __ } from '@wordpress/i18n';
import { Line } from "react-chartjs-2";
import BoxView from "@GFComponents/BoxView/BoxView";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

function Distribution({ chartData }) {
    // Fallback if data not ready
    const labels = chartData?.labels || [];
    const points = chartData?.points || [];
    const achievements = chartData?.achievements || [];
    const levels = chartData?.levels || [];

    const data = {
        labels,
        datasets: [
            {
                label: "Points",
                data: points,
                borderColor: "#F4C430",
                backgroundColor: "rgba(244, 196, 48, 0.25)",
                pointRadius: 3,
                borderWidth: 2,
                tension: 0.4,
                fill: true,
            },
            {
                label: "Achievements",
                data: achievements,
                borderColor: "#38B6FF",
                backgroundColor: "transparent",
                pointRadius: 3,
                borderWidth: 2,
                tension: 0.4,
                fill: false,
            },
            {
                label: "Levels",
                data: levels,
                borderColor: "#3CB371",
                backgroundColor: "transparent",
                pointRadius: 3,
                borderWidth: 2,
                tension: 0.4,
                fill: false,
            },
        ],
    };

    // ... (Options object remain mostly same, just ensure it works)
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: "top",
                align: "center",
                labels: {
                    usePointStyle: true,
                    pointStyle: "circle",
                    // ... your existing legend config
                }
            },
            tooltip: { enabled: true },
        },
        scales: {
            x: { grid: { display: false }, ticks: { font: { size: 11 } } },
            y: { beginAtZero: true, grid: { color: "#E8EDF2" } },
        },
    };

    return (
        <BoxView width='100%' title={__('Point Distribution Chart', 'gameengine')}>
            <Line data={data} options={options} />
        </BoxView>
    );
}

export default Distribution;
