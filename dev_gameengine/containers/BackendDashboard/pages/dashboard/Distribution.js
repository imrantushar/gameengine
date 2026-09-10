import React from "react";
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { __ } from "@wordpress/i18n";
import { Line } from "react-chartjs-2";
import BoxView from "@GFComponents/BoxView/BoxView";
import { useThemeMode } from "@GFUtils/theme";

ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
    Filler
);

function Distribution({ chartData }) {
    // Chart.js paints to a canvas, so it cannot inherit the CSS tokens — the
    // grid and tick colours have to be handed to it per mode.
    const { isDark } = useThemeMode();
    const gridColor = isDark ? "#232A35" : "#E8EDF2";
    const tickColor = isDark ? "#A7B3C2" : "#575E6C";

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
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2,
                tension: 0.4,
                fill: true,
            },
            {
                label: "Achievements",
                data: achievements,
                borderColor: "#38B6FF",
                backgroundColor: "transparent",
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2,
                tension: 0.4,
                fill: false,
            },
            {
                label: "Levels",
                data: levels,
                borderColor: "#3CB371",
                backgroundColor: "transparent",
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2,
                tension: 0.4,
                fill: false,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: {
                top: 10,
                right: 16,
                bottom: 8,
                left: 8,
            },
        },
        plugins: {
            legend: {
                display: true,
                position: "top",
                align: "center",
                labels: {
                    usePointStyle: true,
                    pointStyle: "circle",
                    padding: 20,
                    boxWidth: 8,
                    boxHeight: 8,
                    color: tickColor,
                    font: {
                        size: 12,
                    },
                },
            },
            tooltip: {
                enabled: true,
                padding: 10,
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: tickColor,
                    font: {
                        size: 11,
                    },
                    padding: 10,
                },
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: gridColor,
                    drawBorder: false,
                },
                ticks: {
                    color: tickColor,
                    padding: 10,
                    font: {
                        size: 11,
                    },
                },
            },
        },
    };

    return (
        <BoxView width="100%" p="0 16px 16px 16px" title={__("Point Distribution Chart", "gameengine")}>
            <div
                style={{
                    height: "420px",
                }}
            >
                <Line data={data} options={options} />
            </div>
        </BoxView>
    );
}

export default Distribution;
