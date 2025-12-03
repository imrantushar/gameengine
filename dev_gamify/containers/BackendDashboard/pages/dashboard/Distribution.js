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
import { __ } from '@wordpress/i18n';
import { Line } from "react-chartjs-2";
import { Box, Text } from "@chakra-ui/react";
import GFLabel from "@GFComponents/Labels/GFLabel";

ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
    Filler
);

function Distribution() {
    const labels = [
        "29 May, 25",
        "29 May, 25",
        "29 May, 25",
        "29 May, 25",
        "29 May, 25",
        "29 May, 25",
        "29 May, 25",
        "29 May, 25",
    ];

    const data = {
        labels,
        datasets: [
            {
                label: "Points",
                data: [1.2, 1.8, 2.9, 3.4, 1.6, 2.1, 3.3, 3.9],
                borderColor: "#39A7FF",
                backgroundColor: "rgba(57, 167, 255, 0.25)",
                pointRadius: 0,
                borderWidth: 2,
                tension: 0.4,
                fill: true,
            },
            {
                label: "Achievements",
                data: [1, 1, 1, 1, 1, 1, 1, 1], 
                borderColor: "#4DB8FF",
                backgroundColor: "transparent",
                pointRadius: 0,
                borderWidth: 2,
                tension: 0.4,
                fill: false,
            },
            {
                label: "Levels",
                data: [1, 1, 1, 1, 1, 1, 1, 1], 
                borderColor: "#3CB371",
                backgroundColor: "transparent",
                pointRadius: 0,
                borderWidth: 2,
                tension: 0.4,
                fill: false,
            },
        ],
    };

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
                    boxWidth: 12,
                    font: { size: 12 },

                    generateLabels(chart) {
                        const defaultLabels = ChartJS.defaults.plugins.legend.labels.generateLabels(chart);

                        const customColors = {
                            "Points": "#F4C430",
                            "Achievements": "#38B6FF",
                            "Levels": "#3CB371",
                        };

                        return defaultLabels.map(label => ({
                            ...label,
                            fillStyle: customColors[label.text] || label.fillStyle,
                            strokeStyle: customColors[label.text] || label.strokeStyle,
                            pointStyle: "circle",
                            yOffset: 30,
                            text: " " + label.text
                        }));
                    }
                }




            },

            tooltip: {
                enabled: true,
            },
        },

        scales: {
            x: {
                ticks: {
                    color: "#98A0A6",
                    font: { size: 11 },
                },
                grid: { display: false },
            },
            y: {
                min: 0,
                max: 5,
                ticks: {
                    color: "#98A0A6",
                    font: { size: 11 },
                },
                grid: {
                    color: "#E8EDF2",
                    drawBorder: false,
                },
            },
        },
    };

    return (
        <Box p={6} w='100%' background="var( --gamify-background)" borderRadius="4px">
            <GFLabel
                type="title"
                fontWeight="600"
                fontSize="xl"
                mb='4'
                label={__(`Point Distribution Chart`, 'gamify')}
            />
            <Box w="100%" h="320px">
                <Line data={data} options={options} />
            </Box>
        </Box>
    );
}

export default Distribution;
