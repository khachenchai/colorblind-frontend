'use client';

import { Scatter } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

type Props = {
    centroids: number[][]; // Array of [u, v]
};

export default function UVChart({ centroids }: Props) {
    const data = {
        datasets: [
            {
                label: 'Centroids (u,v)',
                data: centroids.map(([u, v]) => ({ x: u, y: v })),
                backgroundColor: 'red',
                pointStyle: 'rectRot',
                pointRadius: 4,
            },
        ],
    };

    const options = {
        maintainAspectRatio: true,
        aspectRatio: 1, // ทำให้สูง=กว้าง
        scales: {
            x: {
                min: 0,
                max: 0.6,
                title: {
                    display: true,
                    text: 'u',
                },
            },
            y: {
                min: 0,
                max: 0.6,
                title: {
                    display: true,
                    text: 'v',
                },
            },
        },
    };

    return <Scatter data={data} options={options} />;
}
