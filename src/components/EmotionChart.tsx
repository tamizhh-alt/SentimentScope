import React from 'react';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface EmotionChartProps {
  emotions: Record<string, number>;
}

const EmotionChart: React.FC<EmotionChartProps> = ({ emotions }) => {
  const emotionColors = {
    joy: '#10B981',
    anger: '#EF4444',
    sadness: '#3B82F6',
    fear: '#8B5CF6',
    surprise: '#F59E0B',
    disgust: '#6B7280',
  };

  const data = {
    labels: Object.keys(emotions).map(emotion => 
      emotion.charAt(0).toUpperCase() + emotion.slice(1)
    ),
    datasets: [
      {
        label: 'Emotion Intensity',
        data: Object.values(emotions),
        backgroundColor: Object.keys(emotions).map(emotion => emotionColors[emotion as keyof typeof emotionColors]),
        borderColor: Object.keys(emotions).map(emotion => emotionColors[emotion as keyof typeof emotionColors]),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => {
            return `${context.label}: ${(context.parsed.y * 100).toFixed(1)}%`;
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
        max: 1,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 12,
          },
          callback: (value: any) => `${(value * 100).toFixed(0)}%`,
        },
      },
    },
  };

  return (
    <motion.div
      className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Emotion Analysis</h3>
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-2">
        {Object.entries(emotions).map(([emotion, value]) => (
          <div key={emotion} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: emotionColors[emotion as keyof typeof emotionColors] }}
              />
              <span className="text-gray-700 capitalize">{emotion}</span>
            </div>
            <span className="font-medium text-gray-900">
              {(value * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default EmotionChart;