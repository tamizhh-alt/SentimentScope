import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, CheckCircle } from 'lucide-react';
import { AnalysisResult } from '../types';

interface SentimentCardProps {
  result: AnalysisResult;
}

const SentimentCard: React.FC<SentimentCardProps> = ({ result }) => {
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return TrendingUp;
      case 'negative':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-100';
      case 'negative':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const Icon = getSentimentIcon(result.results.sentiment);
  const colorClass = getSentimentColor(result.results.sentiment);

  return (
    <motion.div
      className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Sentiment Analysis</h3>
        <CheckCircle className="w-5 h-5 text-green-500" />
      </div>

      <div className="text-center mb-6">
        <motion.div
          className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${colorClass} mb-4`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <Icon className="w-8 h-8" />
        </motion.div>
        
        <h4 className="text-2xl font-bold text-gray-900 capitalize mb-2">
          {result.results.sentiment}
        </h4>
        
        <div className="text-3xl font-bold text-primary-600 mb-2">
          {(result.results.confidence * 100).toFixed(1)}%
        </div>
        
        <p className="text-sm text-gray-600">Confidence Score</p>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Analysis Type:</span>
          <span className="text-sm font-medium text-gray-900 capitalize">{result.type}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Processed At:</span>
          <span className="text-sm font-medium text-gray-900">
            {new Date(result.timestamp).toLocaleString()}
          </span>
        </div>
        
        <div className="pt-3 border-t border-gray-200">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-primary-600 to-accent-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${result.results.confidence * 100}%` }}
              transition={{ delay: 0.5, duration: 1 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SentimentCard;