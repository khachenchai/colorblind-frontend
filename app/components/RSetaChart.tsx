"use client";
import { Scatter } from "react-chartjs-2";
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);



type RSeta = {
    r: number;
    seta: number;
};

type Props = {
    type: "prota" | "deutera" | "trita";
    data: RSeta[];
};

export default function RSetaScatterChart({ type, data }: Props) {
    const confusion_points = {
        prota: { r: 0.678, seta: 0.501 },
        deutera: { r: -1.217, seta: 0.782 },
        trita: { r: 0.257, seta: 0.0 },
    };

    const chartData = {
        datasets: [
            {
                label: `${type} (r, seta)`,
                data: data.map((point) => ({
                    x: point.r,
                    y: point.seta,
                })),
                backgroundColor:
                    type === "prota"
                        ? "rgba(255, 99, 132, 0.8)"
                        : type === "deutera"
                            ? "rgba(54, 162, 235, 0.8)"
                            : "rgba(255, 206, 86, 0.8)",
                pointRadius: 3,
            },
            {
                label: "Confusion Point",
                data: [
                    {
                        x: confusion_points[type].r,
                        y: confusion_points[type].seta,
                    },
                ],
                backgroundColor: "rgba(0, 255, 0, 0.8)", // เขียว
                pointRadius: 4,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: "linear" as const,
                position: "bottom" as const,
                title: {
                    display: true,
                    text: "r",
                },
            },
            y: {
                title: {
                    display: true,
                    text: "seta",
                },
            },
        },
    };

    return (
        <div className="p-2 border rounded shadow h-96">
            <h4 className="font-semibold mb-2 capitalize">กราฟจุด {type}</h4>
            <Scatter data={chartData} options={options} />
        </div>
    );
}
