import React from 'react';
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
} from 'chart.js';
import { Line } from 'react-chartjs-2';

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

export default function ForecastChart({ forecastData, unit = 'C' }) {
  if (!forecastData || !forecastData.daily || forecastData.daily.length === 0) {
    return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No forecast chart data available</div>;
  }

  const convertTemp = (temp) => {
    if (unit === 'F') {
      return Math.round(((temp * 9) / 5 + 32) * 10) / 10;
    }
    return temp;
  };

  const labels = forecastData.daily.map((d) => d.day);
  const maxTemps = forecastData.daily.map((d) => convertTemp(d.temp_max));
  const minTemps = forecastData.daily.map((d) => convertTemp(d.temp_min));
  const precipitation = forecastData.daily.map((d) => d.pop || 0);

  const data = {
    labels,
    datasets: [
      {
        label: `High Temp (°${unit})`,
        data: maxTemps,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.08)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#2563eb',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: `Low Temp (°${unit})`,
        data: minTemps,
        borderColor: '#64748b',
        backgroundColor: 'rgba(100, 116, 139, 0.05)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#64748b',
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#475569',
          font: { size: 12, weight: 500 },
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#ffffff',
        bodyColor: '#e2e8f0',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: '#64748b' },
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: {
          color: '#64748b',
          callback: (value) => `${value}°`,
        },
      },
    },
  };

  return (
    <div style={{ height: '280px', width: '100%', position: 'relative' }}>
      <Line data={data} options={options} />
    </div>
  );
}
