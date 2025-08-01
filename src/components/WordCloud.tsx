import React from 'react';
import { motion } from 'framer-motion';
import { Hash } from 'lucide-react';

const WordCloud: React.FC = () => {
  const words = [
    { text: 'excellent', size: 24, sentiment: 'positive' },
    { text: 'amazing', size: 20, sentiment: 'positive' },
    { text: 'terrible', size: 18, sentiment: 'negative' },
    { text: 'good', size: 22, sentiment: 'positive' },
    { text: 'bad', size: 16, sentiment: 'negative' },
    { text: 'great', size: 26, sentiment: 'positive' },
    { text: 'awful', size: 14, sentiment: 'negative' },
    { text: 'fantastic', size: 18, sentiment: 'positive' },
    { text: 'disappointing', size: 16, sentiment: 'negative' },
    { text: 'wonderful', size: 20, sentiment: 'positive' },
    { text: 'poor', size: 14, sentiment: 'negative' },
    { text: 'outstanding', size: 22, sentiment: 'positive' },
    { text: 'satisfactory', size: 16, sentiment: 'neutral' },
    { text: 'acceptable', size: 14, sentiment: 'neutral' },
    { text: 'average', size: 16, sentiment: 'neutral' },
  ];

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <motion.div
      className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 h-full"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-gradient-to-r from-accent-600 to-primary-600 rounded-lg flex items-center justify-center">
          <Hash className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Key Terms</h3>
      </div>

      <div className="relative h-80 flex flex-wrap items-center justify-center content-center gap-2 overflow-hidden">
        {words.map((word, index) => (
          <motion.span
            key={word.text}
            className={`font-medium cursor-pointer hover:scale-110 transition-transform ${getSentimentColor(word.sentiment)}`}
            style={{ fontSize: `${word.size}px` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.1,
              type: 'spring',
              stiffness: 200 
            }}
            whileHover={{ scale: 1.2 }}
          >
            {word.text}
          </motion.span>
        ))}
      </div>

      <div className="mt-4 flex justify-center space-x-6 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-600">Positive</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-600">Negative</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-gray-600">Neutral</span>
        </div>
      </div>
    </motion.div>
  );
};

export default WordCloud;