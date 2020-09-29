import { select } from "./utils";
import Chart from "chart.js";

const chart = new Chart(
    (() => {
        const el = document.createElement("canvas");
        select("#chart").appendChild(el);
        return el;
    })(),
    {
        type: "line",
        data: {
            labels: [],
            datasets: [],
        },
        options: {
            maintainAspectRatio: false,
            title: {
                display: true,
                text: "Best Fitness of each Species",
            },
            legend: {
                display: true,
                position: "right",
                labels: {
                    boxWidth: 10,
                },
            },
            tooltips: {
                callbacks: {
                    title: ([tooltipItem]) => {
                        return `Gen ${tooltipItem.xLabel}`;
                    },
                    label: (tooltipItem, { datasets }) => {
                        return `Species ${datasets[tooltipItem.datasetIndex].id + 1}: Score ${
                            tooltipItem.yLabel
                        }`;
                    },
                },
            },
            scales: {
                xAxes: [
                    {
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: "Generation",
                        },
                    },
                ],
                yAxes: [
                    {
                        display: true,
                        ticks: {
                            beginAtZero: true, // minimum value will be 0.
                        },
                        scaleLabel: {
                            display: true,
                            labelString: "Score",
                        },
                    },
                ],
            },
        },
    }
);

export default function updateChart(pop) {
    for (const species of pop.species) {
        if (!chart.data.datasets.some(d => d.id === species.id)) {
            const [r, g, b] = species.color;
            chart.data.datasets.push({
                label: `S${species.id + 1}`,
                backgroundColor: `rgba(${r},${g},${b}, 1)`,
                borderColor: `rgba(${r},${g},${b}, 1)`,
                data: [],
                fill: false,
                id: species.id,
            });
            chart.update();
        }
    }
    chart.data.labels.push(pop.generation);

    for (let i = 0; i < chart.data.datasets.length; i++) {
        const dataset = chart.data.datasets[i];
        const species = pop.species.find(s => s.id === dataset.id);
        if (!species) {
            chart.data.datasets.splice(i, 1);
            chart.update();
            i--;
            continue;
        }
        dataset.data.push({
            x: pop.generation,
            y: species.bestFitness,
        });
    }

    const min = chart.data.datasets.reduce(
        (m, dataset) => Math.min(m, dataset.data[0].x),
        Infinity
    );
    chart.data.labels.splice(0, min - chart.data.labels[0]);

    chart.update();
}
