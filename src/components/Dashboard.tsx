import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Filter, Download, RefreshCw } from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import SentimentTrend from './SentimentTrend';
import StatisticsCards from './StatisticsCards';
import WordCloud from './WordCloud';

const Dashboard: React.FC = () => {
  const { analysisResults } = useAnalysis();
  const [dateRange, setDateRange] = useState('7d');
  const [sentimentFilter, setSentimentFilter] = useState('all');

  const dateRanges = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
  ];

  const sentimentFilters = [
    { value: 'all', label: 'All Sentiments' },
    { value: 'positive', label: 'Positive Only' },
    { value: 'negative', label: 'Negative Only' },
    { value: 'neutral', label: 'Neutral Only' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive insights from your sentiment analysis data</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            >
              {dateRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            >
              {sentimentFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-2">
            <motion.button
              className="px-4 py-2 bg-white/60 backdrop-blur-sm text-gray-700 rounded-lg font-medium hover:bg-white/80 transition-all duration-200 border border-white/20 flex items-center space-x-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </motion.button>

            <motion.button
              className="px-4 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </motion.button>
          </div>
        </div>
      </div>

      <StatisticsCards results={analysisResults} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <SentimentTrend results={analysisResults} />
        </div>
        <div>
          <WordCloud />
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;