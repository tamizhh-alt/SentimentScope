import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download, Share, Eye } from 'lucide-react';
import SentimentCard from './SentimentCard';
import EmotionChart from './EmotionChart';
import { useAnalysis } from '../context/AnalysisContext';

interface ResultsSectionProps {
  onViewDashboard: () => void;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({ onViewDashboard }) => {
  const { analysisResults } = useAnalysis();
  const latestResult = analysisResults[analysisResults.length - 1];

  if (!latestResult) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No analysis results available.</p>
      </div>
    );
  }

  const handleExport = (format: 'pdf' | 'csv' | 'json') => {
    // Simulate export functionality
    console.log(`Exporting results as ${format}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Analysis Results</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Here are the insights from your sentiment analysis. Explore the detailed breakdown below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SentimentCard result={latestResult} />
        <EmotionChart emotions={latestResult.results.emotions} />
      </div>

      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Detailed Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {(latestResult.results.confidence * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Confidence Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary-600">
              {latestResult.type === 'text' ? '1' : 'Multiple'}
            </div>
            <div className="text-sm text-gray-600">Items Analyzed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-600">
              {new Date(latestResult.timestamp).toLocaleTimeString()}
            </div>
            <div className="text-sm text-gray-600">Analysis Time</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <motion.button
          onClick={onViewDashboard}
          className="flex-1 bg-gradient-to-r from-primary-600 to-accent-600 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 hover:shadow-lg transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <BarChart3 className="w-4 h-4" />
          <span>View Dashboard</span>
        </motion.button>

        <div className="flex space-x-2">
          {['pdf', 'csv', 'json'].map((format) => (
            <motion.button
              key={format}
              onClick={() => handleExport(format as 'pdf' | 'csv' | 'json')}
              className="px-4 py-3 bg-white/60 backdrop-blur-sm text-gray-700 rounded-lg font-medium hover:bg-white/80 transition-all duration-200 border border-white/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-4 h-4 inline mr-1" />
              {format.toUpperCase()}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ResultsSection;