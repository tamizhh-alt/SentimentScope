import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3, Users } from 'lucide-react';
import { AnalysisResult } from '../types';

interface StatisticsCardsProps {
  results: AnalysisResult[];
}

const StatisticsCards: React.FC<StatisticsCardsProps> = ({ results }) => {
  const totalAnalyses = results.length;
  const positiveCount = results.filter(r => r.results.sentiment === 'positive').length;
  const negativeCount = results.filter(r => r.results.sentiment === 'negative').length;
  const averageConfidence = results.length > 0 
    ? results.reduce((sum, r) => sum + r.results.confidence, 0) / results.length 
    : 0;

  const stats = [
    {
      title: 'Total Analyses',
      value: totalAnalyses.toLocaleString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: BarChart3,
      color: 'primary',
    },
    {
      title: 'Positive Sentiment',
      value: `${totalAnalyses > 0 ? Math.round((positiveCount / totalAnalyses) * 100) : 0}%`,
      change: '+5.3%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'secondary',
    },
    {
      title: 'Negative Sentiment',
      value: `${totalAnalyses > 0 ? Math.round((negativeCount / totalAnalyses) * 100) : 0}%`,
      change: '-2.1%',
      changeType: 'negative' as const,
      icon: TrendingDown,
      color: 'accent',
    },
    {
      title: 'Avg. Confidence',
      value: `${(averageConfidence * 100).toFixed(1)}%`,
      change: '+1.2%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'primary',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      primary: 'from-primary-600 to-primary-700',
      secondary: 'from-secondary-600 to-secondary-700',
      accent: 'from-accent-600 to-accent-700',
    };
    return colors[color as keyof typeof colors] || colors.primary;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 bg-gradient-to-r ${getColorClasses(stat.color)} rounded-lg flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                stat.changeType === 'positive' 
                  ? 'text-green-700 bg-green-100' 
                  : 'text-red-700 bg-red-100'
              }`}>
                {stat.change}
              </span>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default StatisticsCards;