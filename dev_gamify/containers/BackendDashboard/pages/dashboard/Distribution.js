import React from "react";
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler } from "chart.js";
import { __ } from '@wordpress/i18n';
import { Line } from "react-chartjs-2";
import { Box } from "@chakra-ui/react";
import GFLabel from "@GFComponents/Labels/GFLabel";

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
                borderColor: "#F4C430", // Matched your custom color
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
        <Box p={6} w='100%' background="var(--gamify-background)" borderRadius="4px">
            <GFLabel type="title" fontWeight="600" fontSize="xl" mb='4' label={__(`Point Distribution Chart`, 'gamify')} />
            <Box w="100%" h="320px">
                <Line data={data} options={options} />
            </Box>
        </Box>
    );
}

export default Distribution;