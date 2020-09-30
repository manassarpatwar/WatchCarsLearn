import { select, create } from "./utils";
import Chart from "chart.js";
Chart.defaults.global.defaultFontColor = "white";
Chart.defaults.global.defaultFontFamily =
    "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', Helvetica, Arial, sans-serif";
Chart.defaults.global.defaultFontStyle = 300;
Chart.defaults.global.elements.point.radius = 2;

const chart = new Chart(
    (() => {
        const el = create("canvas");
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
                text: "Best scores of each Species",
                fontStyle: 300,
                fontSize: 16,
            },
            legend: {
                display: true,
                position: "right",
                labels: {
                    boxWidth: 13,
                },
            },
            tooltips: {
                titleFontSize: 16,
                titleFontStyle: 300,
                bodyFontSize: 14,
                callbacks: {
                    title: ([tooltipItem]) => {
                        return `Gen ${tooltipItem.xLabel}`;
                    },
                    label: (tooltipItem, { datasets }) => {
                        const dataset = datasets[tooltipItem.datasetIndex];
                        return `Species ${dataset.id + 1}: Score ${tooltipItem.yLabel} Size ${
                            dataset.data[tooltipItem.index].size
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
                            fontSize: 16,
                        },
                        gridLines: {
                            display: true,
                            color: "#eee",
                            drawOnChartArea: false,
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
                            fontSize: 16,
                        },
                        gridLines: {
                            display: true,
                            color: "#eee",
                            drawOnChartArea: false,
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
            size: species.members.length,
        });
    }

    const min = chart.data.datasets.reduce(
        (m, dataset) => Math.min(m, dataset.data[0].x),
        Infinity
    );
    chart.data.labels.splice(0, min - chart.data.labels[0]);

    chart.update();
}
