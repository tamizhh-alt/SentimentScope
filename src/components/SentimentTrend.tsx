import React from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
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
import { AnalysisResult } from '../types';

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

interface SentimentTrendProps {
  results: AnalysisResult[];
}

const SentimentTrend: React.FC<SentimentTrendProps> = ({ results }) => {
  // Generate sample trend data for the chart
  const generateTrendData = () => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const positiveData = Array.from({ length: 7 }, () => Math.random() * 40 + 40);
    const negativeData = Array.from({ length: 7 }, () => Math.random() * 30 + 10);
    const neutralData = Array.from({ length: 7 }, () => Math.random() * 30 + 20);

    return { days, positiveData, negativeData, neutralData };
  };

  const { days, positiveData, negativeData, neutralData } = generateTrendData();

  const data = {
    labels: days,
    datasets: [
      {
        label: 'Positive',
        data: positiveData,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
      {
        label: 'Negative',
        data: negativeData,
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#EF4444',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
      {
        label: 'Neutral',
        data: neutralData,
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: '#F59E0B',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
          },
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
          },
          callback: (value: any) => `${value}%`,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <motion.div
      className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Sentiment Trend</h3>
        <div className="text-sm text-gray-600">Last 7 days</div>
      </div>
      
      <div className="h-80">
        <Line data={data} options={options} />
      </div>
    </motion.div>
  );
};

export default SentimentTrend;